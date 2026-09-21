// Centralized error handler. Any error passed to next(err) — including
// ones thrown inside asyncHandler-wrapped controllers — ends up here.
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma: record not found (e.g. update/delete on a missing id)
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }

  // Prisma: unique constraint violation (e.g. duplicate email)
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists`,
    });
  }

  // Multer file-size / file-type errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error',
  });
};
