const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/questions?eventTypeId=... — Get all questions for an event type
router.get('/', async (req, res, next) => {
  try {
    const { eventTypeId } = req.query;
    if (!eventTypeId) return res.status(400).json({ error: 'eventTypeId is required' });

    const questions = await prisma.question.findMany({
      where: { eventTypeId },
      orderBy: { order: 'asc' },
    });

    res.json(questions);
  } catch (err) {
    next(err);
  }
});

// POST /api/questions — Create a custom question for an event type
router.post('/', async (req, res, next) => {
  try {
    const { eventTypeId, label, type = 'TEXT', required = false, order = 0 } = req.body;

    if (!eventTypeId || !label) {
      return res.status(400).json({ error: 'eventTypeId and label are required' });
    }

    const question = await prisma.question.create({
      data: { eventTypeId, label, type, required, order: parseInt(order) },
    });

    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
});

// PUT /api/questions/:id — Update a question
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, type, required, order } = req.body;

    const updated = await prisma.question.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(type !== undefined && { type }),
        ...(required !== undefined && { required }),
        ...(order !== undefined && { order: parseInt(order) }),
      },
    });

    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Question not found' });
    next(err);
  }
});

// DELETE /api/questions/:id — Delete a question
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Question not found' });
    next(err);
  }
});

// PUT /api/questions/reorder — Reorder all questions for an event type
router.put('/reorder', async (req, res, next) => {
  try {
    const { questions } = req.body; // [{ id, order }]
    if (!Array.isArray(questions)) return res.status(400).json({ error: 'questions array required' });

    await Promise.all(
      questions.map(q => prisma.question.update({ where: { id: q.id }, data: { order: q.order } }))
    );

    res.json({ message: 'Questions reordered' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
