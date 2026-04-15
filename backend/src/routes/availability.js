const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const DEFAULT_USERNAME = 'aitanish';

// GET /api/availability — Get admin's full availability schedule
router.get('/', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: DEFAULT_USERNAME } });
    if (!user) return res.status(404).json({ error: 'Admin user not found. Run the seed script.' });

    const availability = await prisma.availability.findMany({
      where: { userId: user.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    // Build a full 7-day structure (0=Sun ... 6=Sat) — disabled days have empty slots
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const full = DAYS.map((day, index) => {
      const slot = availability.find((a) => a.dayOfWeek === index);
      return {
        day,
        dayOfWeek: index,
        enabled: !!slot,
        startTime: slot?.startTime || '09:00',
        endTime: slot?.endTime || '17:00',
        id: slot?.id || null,
      };
    });

    res.json({ timezone: user.timezone, schedule: full });
  } catch (err) {
    next(err);
  }
});

// PUT /api/availability — Replace the full availability schedule
router.put('/', async (req, res, next) => {
  try {
    const { schedule, timezone } = req.body;
    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ error: 'schedule array is required' });
    }

    const user = await prisma.user.findUnique({ where: { username: DEFAULT_USERNAME } });
    if (!user) return res.status(404).json({ error: 'Admin user not found' });

    // Update timezone on user
    if (timezone) {
      await prisma.user.update({ where: { id: user.id }, data: { timezone } });
    }

    // Delete all existing availability for this user
    await prisma.availability.deleteMany({ where: { userId: user.id } });

    // Recreate only enabled days
    const enabledSlots = schedule.filter((s) => s.enabled);
    if (enabledSlots.length > 0) {
      await prisma.availability.createMany({
        data: enabledSlots.map((s) => ({
          userId: user.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      });
    }

    res.json({ message: 'Availability updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
