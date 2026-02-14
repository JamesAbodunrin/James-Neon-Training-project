const express = require('express');
const router = express.Router();
const {
  getPricingTiers,
  upsertPricingTiers,
  getToolConfigs,
  upsertToolConfigs,
  getRevenueMetrics,
  getUsersList,
} = require('../db');
// Auth applied at app level: requireAuth + requireAdmin for /api/admin

/** GET /api/admin/pricing — [{ tier, price, currency }] (frontend shape). */
router.get('/pricing', async (req, res) => {
  try {
    const list = await getPricingTiers(req.user.userId);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load pricing' });
  }
});

/** PUT /api/admin/pricing — body: [{ tier, price, currency }]. */
router.put('/pricing', async (req, res) => {
  const body = req.body;
  const list = Array.isArray(body) ? body : body?.pricing;
  if (!list || !Array.isArray(list)) {
    return res.status(400).json({ error: 'Expected array of { tier, price, currency }' });
  }
  try {
    const updated = await upsertPricingTiers(req.user.userId, list);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to save pricing' });
  }
});

/** GET /api/admin/tools — [{ id, name, enabled }] (frontend shape). */
router.get('/tools', async (req, res) => {
  try {
    const list = await getToolConfigs();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load tools' });
  }
});

/** PUT /api/admin/tools — body: [{ id, name, enabled }]. */
router.put('/tools', async (req, res) => {
  const body = req.body;
  const list = Array.isArray(body) ? body : body?.tools;
  if (!list || !Array.isArray(list)) {
    return res.status(400).json({ error: 'Expected array of { id, name, enabled }' });
  }
  try {
    const updated = await upsertToolConfigs(req.user.userId, list);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to save tools' });
  }
});

/** GET /api/admin/revenue — { totalRevenue, sessionsCount, activeSubscriptions } (frontend shape). */
router.get('/revenue', async (req, res) => {
  try {
    const metrics = await getRevenueMetrics();
    res.json(metrics);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load revenue' });
  }
});

/** GET /api/admin/users — list of users with email, username, role, status. */
router.get('/users', async (req, res) => {
  try {
    const list = await getUsersList();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load users' });
  }
});

module.exports = router;
