# SQL / ORM queries (Prisma) — reference

These match the logic in `server/db.js`. Raw SQL equivalents are below for reference.

---

## Auth

### Find user by login (username or email) + verify password

**Prisma (db.js):**
```js
const user = await prisma.user.findFirst({
  where: {
    OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    status: 'ACTIVE',
  },
});
// then bcrypt.compare(passwordPlain, user.passwordHash)
```

**SQL:**
```sql
SELECT id, email, username, password_hash, role, status
FROM users
WHERE (email = $1 OR username = $2) AND status = 'ACTIVE'
LIMIT 1;
```

### Create user (signup)

**Prisma:**
```js
const user = await prisma.user.create({
  data: { email, username, passwordHash, role },
});
```

**SQL:**
```sql
INSERT INTO users (id, email, username, password_hash, role, status, created_at, updated_at)
VALUES (gen_random_uuid(), $1, $2, $3, $4::user_role, 'ACTIVE', now(), now())
RETURNING id, email, username, role, created_at, updated_at;
```

### Get user by id (for GET /api/auth/me)

**Prisma:**
```js
const user = await prisma.user.findUnique({ where: { id } });
```

**SQL:**
```sql
SELECT id, email, username, role, status FROM users WHERE id = $1;
```

---

## Admin: pricing

### Get all active pricing tiers

**Prisma:**
```js
const rows = await prisma.pricingTier.findMany({
  where: { active: true },
  orderBy: { tierCode: 'asc' },
});
// map to { tier, price: (amountMinor/100).toFixed(2), currency }
```

**SQL:**
```sql
SELECT tier_code, amount_minor, currency
FROM pricing_tiers
WHERE active = true
ORDER BY tier_code;
```

### Upsert pricing tier

**Prisma:**
```js
await prisma.pricingTier.upsert({
  where: { tierCode },
  create: { tierCode, amountMinor, currency, billingPeriod, updatedByAdminId },
  update: { amountMinor, currency, updatedByAdminId },
});
```

**SQL:**
```sql
INSERT INTO pricing_tiers (id, tier_code, amount_minor, currency, billing_period, active, updated_by_admin_id, updated_at)
VALUES (gen_random_uuid(), $1, $2, $3, $4::billing_period, true, $5, now())
ON CONFLICT (tier_code) DO UPDATE SET
  amount_minor = EXCLUDED.amount_minor,
  currency = EXCLUDED.currency,
  updated_by_admin_id = EXCLUDED.updated_by_admin_id,
  updated_at = now();
```

---

## Admin: tools

### Get tool configs (all known tool_codes)

**Prisma:**
```js
const rows = await prisma.toolConfig.findMany({
  where: { toolCode: { in: TOOL_IDS } },
});
```

**SQL:**
```sql
SELECT tool_code, enabled
FROM tool_configs
WHERE tool_code IN ('statistical', 'regression', 'correlation', 'clustering', 'time-series', 'text-analysis');
```

### Upsert tool config

**Prisma:**
```js
await prisma.toolConfig.upsert({
  where: { toolCode: item.id },
  create: { toolCode: item.id, enabled: item.enabled, updatedByAdminId },
  update: { enabled: item.enabled, updatedByAdminId },
});
```

**SQL:**
```sql
INSERT INTO tool_configs (id, tool_code, enabled, updated_by_admin_id, updated_at)
VALUES (gen_random_uuid(), $1, $2, $3, now())
ON CONFLICT (tool_code) DO UPDATE SET enabled = EXCLUDED.enabled, updated_by_admin_id = EXCLUDED.updated_by_admin_id, updated_at = now();
```

---

## Admin: revenue

**Prisma:**
```js
const [paymentsAgg, sessionsCount, activeSubs] = await Promise.all([
  prisma.payment.aggregate({ where: { status: 'SUCCEEDED' }, _sum: { amountMinor: true } }),
  prisma.analysisSession.count(),
  prisma.subscription.count({ where: { status: 'ACTIVE' } }),
]);
```

**SQL:**
```sql
-- Total revenue (SUCCEEDED payments)
SELECT COALESCE(SUM(amount_minor), 0) AS total_minor FROM payments WHERE status = 'SUCCEEDED';

-- Sessions count
SELECT COUNT(*) FROM analysis_sessions;

-- Active subscriptions
SELECT COUNT(*) FROM subscriptions WHERE status = 'ACTIVE';
```

---

## History: snapshot list

**Prisma:**
```js
const rows = await prisma.analysisSnapshot.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  include: { job: { select: { toolCode: true } } },
});
```

**SQL:**
```sql
SELECT s.id, s.user_id, s.title, s.metadata_json, s.created_at, j.tool_code
FROM analysis_snapshots s
LEFT JOIN analysis_jobs j ON j.id = s.analysis_job_id
WHERE s.user_id = $1
ORDER BY s.created_at DESC;
```

---

## History: snapshot by id (detail)

**Prisma:**
```js
const row = await prisma.analysisSnapshot.findFirst({
  where: { id: snapshotId, userId },
  include: { report: true, job: { select: { toolCode: true } } },
});
```

**SQL:**
```sql
SELECT s.*, r.doc_object_key
FROM analysis_snapshots s
LEFT JOIN reports r ON r.snapshot_id = s.id
LEFT JOIN analysis_jobs j ON j.id = s.analysis_job_id
WHERE s.id = $1 AND s.user_id = $2;
```

---

## History: delete snapshot

**Prisma (transaction):**
```js
await prisma.$transaction([
  prisma.report.deleteMany({ where: { snapshotId } }),
  prisma.historyDeletion.create({ data: { userId, snapshotId, deletedAt: new Date() } }),
  prisma.analysisSnapshot.delete({ where: { id: snapshotId } }),
]);
```

**SQL:**
```sql
BEGIN;
DELETE FROM reports WHERE snapshot_id = $1;
INSERT INTO history_deletions (id, user_id, snapshot_id, deleted_at) VALUES (gen_random_uuid(), $2, $1, now());
DELETE FROM analysis_snapshots WHERE id = $1;
COMMIT;
```
