require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);

// Optional JWT: sets req.user for protected routes below
app.use(authMiddleware.authOptional);
app.use('/api/admin', authMiddleware.requireAuth, authMiddleware.requireAdmin, adminRoutes);
app.use('/api/history', authMiddleware.requireAuth, historyRoutes);

// Subscription status (auth required) — for post-login redirect and dashboard "Your plan"
const { getHasActiveSubscription, getActiveSubscriptionWithPlan } = require('./db');
app.get('/api/subscription/status', authMiddleware.requireAuth, async (req, res) => {
  try {
    const hasActiveSubscription = await getHasActiveSubscription(req.user.userId);
    const currentPlan = hasActiveSubscription ? await getActiveSubscriptionWithPlan(req.user.userId) : null;
    res.json({ hasActiveSubscription, currentPlan });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to get subscription status' });
  }
});

// Public: tool config (for analysis type selector – which tools are enabled)
const { getToolConfigs, getPricingTiersPublic } = require('./db');
app.get('/api/tools', async (req, res) => {
  try {
    const list = await getToolConfigs();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load tools' });
  }
});

// Public: pricing tiers (for pricing page – show admin-configured prices on cards)
app.get('/api/pricing', async (req, res) => {
  try {
    const list = await getPricingTiersPublic();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load pricing' });
  }
});

// Report download: stub (implement with object storage when reports are persisted)
app.get('/api/reports/download/:snapshotId', (req, res) => {
  res.status(501).send('Report download not yet implemented; connect object storage and stream by doc_object_key.');
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use((err, req, res) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ThesisAnalyzer API listening on http://localhost:${PORT}`);
});
