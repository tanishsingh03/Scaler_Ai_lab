const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dayjs = require('dayjs');
const { sendBookingConfirmation, sendCancellationEmail, sendRescheduleConfirmation } = require('../services/email');

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

    const eventTypes = await prisma.eventType.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const eventTypeIds = eventTypes.map(et => et.id);

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
        answers: { include: { question: { select: { label: true } } } },
      },
      orderBy: { startTime: 'asc' },
    });

    // Auto-fix any older bookings (like seeded ones) that might have a null rescheduleToken
    const crypto = require('crypto');
    for (let b of bookings) {
      if (!b.rescheduleToken) {
        b.rescheduleToken = crypto.randomUUID();
        await prisma.booking.update({
          where: { id: b.id },
          data: { rescheduleToken: b.rescheduleToken },
        });
      }
    }

    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------------
// GET /api/bookings/slots?eventTypeId=...&date=YYYY-MM-DD
// Returns available (non-booked) time slots — respects DateOverrides
// ------------------------------------------------------------------
router.get('/slots', async (req, res, next) => {
  try {
    const { eventTypeId, date } = req.query;
    if (!eventTypeId || !date) {
      return res.status(400).json({ error: 'eventTypeId and date are required' });
    }

    const eventType = await prisma.eventType.findUnique({ where: { id: eventTypeId } });
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    // 1. Check for a DateOverride first
    const override = await prisma.dateOverride.findUnique({
      where: { userId_date: { userId: eventType.userId, date } },
    });

    if (override) {
      if (override.isUnavailable) {
        return res.json({ slots: [], message: 'Host is unavailable on this date' });
      }
      // Use override hours
      const allSlots = generateSlots(override.startTime, override.endTime, eventType.duration, eventType.bufferAfter);
      const dayStart = dayjs(date).startOf('day').toDate();
      const dayEnd = dayjs(date).endOf('day').toDate();
      const existingBookings = await prisma.booking.findMany({
        where: { eventTypeId, status: 'SCHEDULED', startTime: { gte: dayStart, lte: dayEnd } },
        select: { startTime: true },
      });
      const bookedTimes = new Set(existingBookings.map(b => dayjs(b.startTime).format('HH:mm')));
      return res.json({ slots: allSlots.filter(s => !bookedTimes.has(s)), date, isOverride: true });
    }

    // 2. Fall back to regular weekly availability
    const dayOfWeek = dayjs(date).day();
    const avail = await prisma.availability.findFirst({
      where: { userId: eventType.userId, dayOfWeek },
    });

    if (!avail) {
      return res.json({ slots: [], message: 'No availability on this day' });
    }

    const allSlots = generateSlots(avail.startTime, avail.endTime, eventType.duration, eventType.bufferAfter);

    const dayStart = dayjs(date).startOf('day').toDate();
    const dayEnd = dayjs(date).endOf('day').toDate();
    const existingBookings = await prisma.booking.findMany({
      where: { eventTypeId, status: 'SCHEDULED', startTime: { gte: dayStart, lte: dayEnd } },
      select: { startTime: true },
    });

    const bookedTimes = new Set(existingBookings.map(b => dayjs(b.startTime).format('HH:mm')));
    const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));

    res.json({ slots: availableSlots, date, dayOfWeek });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------------
// GET /api/bookings/reschedule/:token — Get booking by reschedule token
// ------------------------------------------------------------------
router.get('/reschedule/:token', async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { rescheduleToken: req.params.token },
      include: {
        eventType: {
          select: { 
            id: true, 
            title: true, 
            duration: true, 
            slug: true, 
            bufferAfter: true,
            user: { select: { name: true, username: true, timezone: true } }
          },
        },
      },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found or invalid token' });
    if (booking.status === 'CANCELED') return res.status(400).json({ error: 'Cannot reschedule a canceled booking' });

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------------
// POST /api/bookings — Create a new booking (with double-booking check)
// ------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const { eventTypeId, inviteeName, inviteeEmail, date, time, notes, guestEmails, answers = [] } = req.body;

    if (!eventTypeId || !inviteeName || !inviteeEmail || !date || !time) {
      return res.status(400).json({ error: 'eventTypeId, inviteeName, inviteeEmail, date, and time are required' });
    }

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { user: { select: { name: true, username: true } } },
    });
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    const [hour, minute] = time.split(':').map(Number);
    const startTime = dayjs(date).hour(hour).minute(minute).second(0).millisecond(0).toDate();
    const endTime = dayjs(startTime).add(eventType.duration, 'minute').toDate();

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
        // Save custom question answers
        answers: answers.length > 0 ? {
          create: answers.map(a => ({
            questionId: a.questionId,
            answer: a.answer,
          })),
        } : undefined,
      },
      include: {
        eventType: { select: { title: true, duration: true } },
        answers: { include: { question: { select: { label: true } } } },
      },
    });

    // Send confirmation email (non-blocking)
    sendBookingConfirmation(booking).catch(console.error);

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------------
// PATCH /api/bookings/:id/reschedule — Reschedule a booking
// ------------------------------------------------------------------
router.patch('/:id/reschedule', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) return res.status(400).json({ error: 'date and time are required' });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { eventType: { select: { duration: true, title: true } } },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'CANCELED') return res.status(400).json({ error: 'Cannot reschedule a canceled booking' });

    const [hour, minute] = time.split(':').map(Number);
    const newStart = dayjs(date).hour(hour).minute(minute).second(0).millisecond(0).toDate();
    const newEnd = dayjs(newStart).add(booking.eventType.duration, 'minute').toDate();

    // Check conflicts (excluding the current booking)
    const conflict = await prisma.booking.findFirst({
      where: {
        eventTypeId: booking.eventTypeId,
        status: 'SCHEDULED',
        id: { not: id },
        OR: [
          { startTime: { gte: newStart, lt: newEnd } },
          { endTime: { gt: newStart, lte: newEnd } },
          { startTime: { lte: newStart }, endTime: { gte: newEnd } },
        ],
      },
    });

    if (conflict) return res.status(409).json({ error: 'That time slot is already booked. Please pick another time.' });

    const updated = await prisma.booking.update({
      where: { id },
      data: { startTime: newStart, endTime: newEnd },
      include: {
        eventType: { select: { title: true, duration: true } },
      },
    });

    // Send reschedule email (non-blocking)
    sendRescheduleConfirmation(updated).catch(console.error);

    res.json({ message: 'Booking rescheduled successfully', booking: updated });
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { eventType: { select: { title: true, duration: true } } },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'CANCELED') {
      return res.status(400).json({ error: 'Booking is already canceled' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELED' },
      include: { eventType: { select: { title: true, duration: true } } },
    });

    // Send cancellation email (non-blocking)
    sendCancellationEmail(updated).catch(console.error);

    res.json({ message: 'Booking canceled successfully', booking: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
