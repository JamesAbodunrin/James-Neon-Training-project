const express = require('express');
const router = express.Router();
const { findUserByLogin, createUser, getUserById } = require('../db');
const { requireAuth, signToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../email');

/** POST /api/auth/login — body: { username, password }. Returns { user, token } (user shape matches frontend). */
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const user = await findUserByLogin(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = signToken({ userId: user.userId, email: user.email, role: user.role });
  res.json({ user, token });
});

/** POST /api/auth/register — body: { username, email, password, role }. Returns { user, token }. */
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password required' });
  }
  const user = await createUser(username, email, password, role || 'PERSONAL');
  if (!user) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }
  sendWelcomeEmail(email, username).catch((err) => console.error('[auth] welcome email failed:', err));
  const token = signToken({ userId: user.userId, email: user.email, role: user.role });
  res.status(201).json({ user, token });
});

/** GET /api/auth/me — returns current user (exact frontend User shape). */
router.get('/me', requireAuth, async (req, res) => {
  const full = await getUserById(req.user.userId);
  if (!full) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json(full);
});

module.exports = router;
