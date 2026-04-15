const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventTypesRouter = require('./routes/eventTypes');
const availabilityRouter = require('./routes/availability');
const bookingsRouter = require('./routes/bookings');
const questionsRouter = require('./routes/questions');
const dateOverridesRouter = require('./routes/dateOverrides');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    // and allow all other origins dynamically to fix Vercel CORS issues
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MeetSync API is running 🚀' });
});

// Routes
app.use('/api/event-types', eventTypesRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/date-overrides', dateOverridesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API docs available at http://localhost:${PORT}/api/health`);
});
