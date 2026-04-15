const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Default admin user ID (single user assumption per assignment)
const DEFAULT_USERNAME = 'aitanish';

// GET /api/event-types — List all event types for the default user
router.get('/', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: DEFAULT_USERNAME } });
    if (!user) return res.status(404).json({ error: 'Admin user not found. Run the seed script.' });

    const eventTypes = await prisma.eventType.findMany({
      where: { userId: user.id, active: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json(eventTypes);
  } catch (err) {
    next(err);
  }
});

// GET /api/event-types/:username/:slug — Public: Get event type by slug
router.get('/:username/:slug', async (req, res, next) => {
  try {
    const { username, slug } = req.params;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const eventType = await prisma.eventType.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
      include: { user: { select: { name: true, username: true, timezone: true } } },
    });

    if (!eventType || !eventType.active) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    res.json(eventType);
  } catch (err) {
    next(err);
  }
});

// POST /api/event-types — Create a new event type
router.post('/', async (req, res, next) => {
  try {
    const { title, slug, duration, description, bufferBefore = 0, bufferAfter = 0 } = req.body;

    if (!title || !slug || !duration) {
      return res.status(400).json({ error: 'title, slug, and duration are required' });
    }

    const user = await prisma.user.findUnique({ where: { username: DEFAULT_USERNAME } });
    if (!user) return res.status(404).json({ error: 'Admin user not found. Run the seed script.' });

    const eventType = await prisma.eventType.create({
      data: {
        userId: user.id,
        title,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        duration: parseInt(duration),
        description,
        bufferBefore: parseInt(bufferBefore),
        bufferAfter: parseInt(bufferAfter),
      },
    });

    res.status(201).json(eventType);
  } catch (err) {
    // Unique slug conflict
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'An event type with this slug already exists.' });
    }
    next(err);
  }
});

// PUT /api/event-types/:id — Update an event type
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, duration, description, bufferBefore, bufferAfter } = req.body;

    const updated = await prisma.eventType.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug: slug.toLowerCase().replace(/\s+/g, '-') }),
        ...(duration && { duration: parseInt(duration) }),
        ...(description !== undefined && { description }),
        ...(bufferBefore !== undefined && { bufferBefore: parseInt(bufferBefore) }),
        ...(bufferAfter !== undefined && { bufferAfter: parseInt(bufferAfter) }),
      },
    });

    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Event type not found' });
    next(err);
  }
});

// DELETE /api/event-types/:id — Soft delete (mark inactive)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.eventType.update({
      where: { id },
      data: { active: false },
    });

    res.json({ message: 'Event type deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Event type not found' });
    next(err);
  }
});

module.exports = router;
