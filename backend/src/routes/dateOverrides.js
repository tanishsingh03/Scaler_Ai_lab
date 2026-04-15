const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const DEFAULT_USERNAME = 'aitanish';

// GET /api/date-overrides — Get all date overrides for the admin
router.get('/', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: DEFAULT_USERNAME } });
    if (!user) return res.status(404).json({ error: 'Admin user not found' });

    const overrides = await prisma.dateOverride.findMany({
      where: { userId: user.id },
      orderBy: { date: 'asc' },
    });

    res.json(overrides);
  } catch (err) {
    next(err);
  }
});

// POST /api/date-overrides — Create or update a date-specific override
router.post('/', async (req, res, next) => {
  try {
    const { date, isUnavailable = false, startTime, endTime } = req.body;

    if (!date) return res.status(400).json({ error: 'date (YYYY-MM-DD) is required' });
    if (!isUnavailable && (!startTime || !endTime)) {
      return res.status(400).json({ error: 'startTime and endTime required for available override' });
    }

    const user = await prisma.user.findUnique({ where: { username: DEFAULT_USERNAME } });
    if (!user) return res.status(404).json({ error: 'Admin user not found' });

    // Upsert — update if exists, create if not
    const override = await prisma.dateOverride.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {
        isUnavailable,
        startTime: isUnavailable ? null : startTime,
        endTime: isUnavailable ? null : endTime,
      },
      create: {
        userId: user.id,
        date,
        isUnavailable,
        startTime: isUnavailable ? null : startTime,
        endTime: isUnavailable ? null : endTime,
      },
    });

    res.status(201).json(override);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/date-overrides/:id — Remove a date override
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.dateOverride.delete({ where: { id: req.params.id } });
    res.json({ message: 'Date override removed' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Override not found' });
    next(err);
  }
});

module.exports = router;
