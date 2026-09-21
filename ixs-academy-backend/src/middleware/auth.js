const jwt = require('jsonwebtoken');

/**
 * Requires a valid "Authorization: Bearer <token>" header, issued by
 * POST /api/v1/auth/login. On success, attaches the decoded payload
 * ({ id, email }) to req.admin for downstream handlers.
 */
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized — invalid or expired token' });
  }
};
