const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'thesis-analyzer-dev-secret-change-in-production';

/** Attach req.user = { userId, username, email, role } if valid Bearer token. */
function authOptional(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    req.user = null;
    next();
  }
}

/** Require authenticated user; 401 if no token or invalid. */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/** Require req.user.role === 'ADMIN'; 403 if not admin. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { authOptional, requireAuth, requireAdmin, signToken, JWT_SECRET };
