// Central error handler — catches all errors passed via next(err)
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  // Prisma known request errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
