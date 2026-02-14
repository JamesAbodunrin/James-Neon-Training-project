const express = require('express');
const router = express.Router();
const { getSnapshotList, getSnapshotById, deleteSnapshot } = require('../db');
// Auth applied at app level: requireAuth for /api/history

/** GET /api/history — list of snapshots (frontend list shape: id, userId, title?, toolCode?, testType?, createdAt). */
router.get('/', async (req, res) => {
  try {
    const list = await getSnapshotList(req.user.userId);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load history' });
  }
});

/** GET /api/history/:id — full snapshot (outputsJson, interpretationJson, metadataJson, reportDownloadUrl). */
router.get('/:id', async (req, res) => {
  const snapshot = await getSnapshotById(req.params.id, req.user.userId);
  if (!snapshot) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }
  res.json(snapshot);
});

/** DELETE /api/history/:id — delete snapshot and log deletion. */
router.delete('/:id', async (req, res) => {
  const ok = await deleteSnapshot(req.params.id, req.user.userId);
  if (!ok) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }
  res.status(204).send();
});

module.exports = router;
