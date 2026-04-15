const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dayjs = require('dayjs');

const router = express.Router();
const prisma = new PrismaClient();

const DEFAULT_USERNAME = 'aitanish';

// ------------------------------------------------------------------
// Helper: Generate time slots for a given date based on availability
// ------------------------------------------------------------------
function generateSlots(startTime, endTime, durationMinutes, bufferAfter) {
  const slots = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  const step = durationMinutes + bufferAfter;

  while (current + durationMinutes <= end) {
    const hh = String(Math.floor(current / 60)).padStart(2, '0');
    const mm = String(current % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
    current += step;
  }
  return slots;
}

// ------------------------------------------------------------------
// GET /api/bookings — Get all bookings for admin (with tab filter)
// ------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const { filter } = req.query; // 'upcoming' | 'past' | undefined (all)

    const user = await prisma.user.findUnique({ where: { username: DEFAULT_USERNAME } });
    if (!user) return res.status(404).json({ error: 'Admin user not found. Run the seed script.' });

    // Get all eventType ids belonging to this admin
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const eventTypeIds = eventTypes.map((et) => et.id);

    const now = new Date();
    let dateFilter = {};
    if (filter === 'upcoming') dateFilter = { startTime: { gte: now } };
    if (filter === 'past') dateFilter = { startTime: { lt: now } };

    const bookings = await prisma.booking.findMany({
      where: {
        eventTypeId: { in: eventTypeIds },
        status: 'SCHEDULED',
        ...dateFilter,
      },
      include: {
        eventType: { select: { title: true, duration: true, slug: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------------
// GET /api/bookings/slots?eventTypeId=...&date=YYYY-MM-DD
// Returns available (non-booked) time slots for a given event + date
// ------------------------------------------------------------------
router.get('/slots', async (req, res, next) => {
  try {
    const { eventTypeId, date } = req.query;
    if (!eventTypeId || !date) {
      return res.status(400).json({ error: 'eventTypeId and date are required' });
    }

    const eventType = await prisma.eventType.findUnique({ where: { id: eventTypeId } });
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    // Find availability for this day of the week
    const dayOfWeek = dayjs(date).day(); // 0=Sun, 1=Mon...
    const avail = await prisma.availability.findFirst({
      where: { userId: eventType.userId, dayOfWeek },
    });

    if (!avail) {
      return res.json({ slots: [], message: 'No availability on this day' });
    }

    // Generate all possible slots
    const allSlots = generateSlots(
      avail.startTime,
      avail.endTime,
      eventType.duration,
      eventType.bufferAfter
    );

    // Find existing bookings on this date
    const dayStart = dayjs(date).startOf('day').toDate();
    const dayEnd = dayjs(date).endOf('day').toDate();

    const existingBookings = await prisma.booking.findMany({
      where: {
        eventTypeId,
        status: 'SCHEDULED',
        startTime: { gte: dayStart, lte: dayEnd },
      },
      select: { startTime: true },
    });

    const bookedTimes = new Set(
      existingBookings.map((b) => dayjs(b.startTime).format('HH:mm'))
    );

    // Filter out already booked slots
    const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    res.json({ slots: availableSlots, date, dayOfWeek });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------------
// POST /api/bookings — Create a new booking (with double-booking check)
// ------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const { eventTypeId, inviteeName, inviteeEmail, date, time, notes, guestEmails } = req.body;

    if (!eventTypeId || !inviteeName || !inviteeEmail || !date || !time) {
      return res.status(400).json({ error: 'eventTypeId, inviteeName, inviteeEmail, date, and time are required' });
    }

    const eventType = await prisma.eventType.findUnique({ where: { id: eventTypeId } });
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    // Parse start + end times
    const [hour, minute] = time.split(':').map(Number);
    const startTime = dayjs(date).hour(hour).minute(minute).second(0).millisecond(0).toDate();
    const endTime = dayjs(startTime)
      .add(eventType.duration, 'minute')
      .toDate();

    // --- DOUBLE-BOOKING PREVENTION ---
    const conflict = await prisma.booking.findFirst({
      where: {
        eventTypeId,
        status: 'SCHEDULED',
        OR: [
          { startTime: { gte: startTime, lt: endTime } },
          { endTime: { gt: startTime, lte: endTime } },
          { startTime: { lte: startTime }, endTime: { gte: endTime } },
        ],
      },
    });

    if (conflict) {
      return res.status(409).json({ error: 'This time slot is already booked. Please select another time.' });
    }

    const booking = await prisma.booking.create({
      data: {
        eventTypeId,
        inviteeName,
        inviteeEmail,
        notes: notes || null,
        guestEmails: guestEmails || null,
        startTime,
        endTime,
        status: 'SCHEDULED',
      },
      include: {
        eventType: { select: { title: true, duration: true } },
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------------
// PATCH /api/bookings/:id/cancel — Cancel a booking
// ------------------------------------------------------------------
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'CANCELED') {
      return res.status(400).json({ error: 'Booking is already canceled' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELED' },
    });

    res.json({ message: 'Booking canceled successfully', booking: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
