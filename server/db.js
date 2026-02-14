/**
 * Prisma client singleton and shared query helpers.
 * SQL/ORM queries for ThesisAnalyzer API (matches frontend data structures).
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ADMIN_USER_ID = 'Admin';
const ADMIN_PASSWORD = 'Admin12345';

/** Map DB User to frontend User shape: { userId, username, email, role, authMethod } */
function toApiUser(row) {
  if (!row) return null;
  return {
    userId: row.id,
    username: row.username ?? row.email?.split('@')[0] ?? 'User',
    email: row.email,
    role: row.role,
    authMethod: row.authMethod ?? 'manual',
  };
}

/** Auth: find user by username or email and verify password (bcrypt). Returns API user or null. */
async function findUserByLogin(usernameOrEmail, passwordPlain) {
  if (usernameOrEmail === ADMIN_USER_ID && passwordPlain === ADMIN_PASSWORD) {
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'admin@thesisanalyzer.local',
          username: 'Admin',
          passwordHash: await require('bcryptjs').hash(ADMIN_PASSWORD, 10),
          role: 'ADMIN',
        },
      });
    }
    return toApiUser({ ...admin, authMethod: 'manual' });
  }
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      status: 'ACTIVE',
    },
  });
  if (!user) return null;
  const ok = await require('bcryptjs').compare(passwordPlain, user.passwordHash);
  return ok ? toApiUser({ ...user, authMethod: 'manual' }) : null;
}

/** Auth: create user (signup). Returns API user or null if email/username taken. */
async function createUser(username, email, passwordPlain, role) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) return null;
  const passwordHash = await require('bcryptjs').hash(passwordPlain, 10);
  const user = await prisma.user.create({
    data: { email, username, passwordHash, role },
  });
  return toApiUser({ ...user, authMethod: 'manual' });
}

/** Auth: get user by id for GET /api/auth/me */
async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toApiUser({ ...user, authMethod: 'manual' }) : null;
}

// --- Admin: pricing (frontend shape: { tier, price, currency }[]) ---

const TIER_CODE_TO_LABEL = {
  PERSONAL_SESSION: 'Personal (per session)',
  RESEARCHER_SUB: 'Researcher (monthly)',
  INSTITUTION_SEATS: 'Institutional (per seat)',
};

/** GET pricing: all active pricing_tiers, map to { tier, price, currency }. */
async function getPricingTiers() {
  return getPricingTiersPublic();
}

/** Public: same shape for pricing page (no auth). */
async function getPricingTiersPublic() {
  const rows = await prisma.pricingTier.findMany({
    where: { active: true },
    orderBy: { tierCode: 'asc' },
  });
  if (rows.length > 0) {
    return rows.map((r) => ({
      tier: TIER_CODE_TO_LABEL[r.tierCode] ?? r.tierCode,
      price: (r.amountMinor / 100).toFixed(2),
      currency: r.currency,
    }));
  }
  return [
    { tier: TIER_CODE_TO_LABEL.PERSONAL_SESSION, price: '9.99', currency: 'USD' },
    { tier: TIER_CODE_TO_LABEL.RESEARCHER_SUB, price: '29.99', currency: 'USD' },
    { tier: TIER_CODE_TO_LABEL.INSTITUTION_SEATS, price: '199.00', currency: 'USD' },
  ];
}

/** PUT pricing: upsert tiers from [{ tier, price, currency }]. tier matched by label or order. */
async function upsertPricingTiers(adminId, items) {
  const codes = ['PERSONAL_SESSION', 'RESEARCHER_SUB', 'INSTITUTION_SEATS'];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const tierCode = codes[i] ?? item.tier?.replace(/\s*\(.*\)/, '').toUpperCase().replace(/\s/g, '_') || `TIER_${i}`;
    const amountMinor = Math.round(parseFloat(String(item.price).replace(/,/g, '')) * 100);
    await prisma.pricingTier.upsert({
      where: { tierCode },
      create: {
        tierCode,
        amountMinor: amountMinor || 0,
        currency: item.currency || 'USD',
        billingPeriod: tierCode === 'PERSONAL_SESSION' ? 'ONE_TIME' : tierCode === 'RESEARCHER_SUB' ? 'MONTHLY' : 'ONE_TIME',
        updatedByAdminId: adminId,
      },
      update: { amountMinor: amountMinor || 0, currency: item.currency || 'USD', updatedByAdminId: adminId },
    });
  }
  return getPricingTiers(adminId);
}

// --- Admin: tools (frontend shape: { id, name, enabled }[]) ---

const TOOL_IDS = ['statistical', 'regression', 'correlation', 'clustering', 'time-series', 'text-analysis'];
const TOOL_NAMES = {
  statistical: 'Statistical Analysis',
  regression: 'Regression Analysis',
  correlation: 'Correlation Analysis',
  clustering: 'Clustering Analysis',
  'time-series': 'Time Series Analysis',
  'text-analysis': 'Text Analysis',
};

/** GET tools: all tool_configs for known tool_codes, default enabled if missing. */
async function getToolConfigs() {
  const rows = await prisma.toolConfig.findMany({
    where: { toolCode: { in: TOOL_IDS } },
  });
  const byCode = Object.fromEntries(rows.map((r) => [r.toolCode, r.enabled]));
  return TOOL_IDS.map((id) => ({
    id,
    name: TOOL_NAMES[id] ?? id,
    enabled: byCode[id] ?? true,
  }));
}

/** PUT tools: update enabled by id (tool_code). Creates rows if missing. */
async function upsertToolConfigs(adminId, items) {
  for (const item of items) {
    await prisma.toolConfig.upsert({
      where: { toolCode: item.id },
      create: { toolCode: item.id, enabled: item.enabled, updatedByAdminId: adminId },
      update: { enabled: item.enabled, updatedByAdminId: adminId },
    });
  }
  return getToolConfigs();
}

/** GET revenue: aggregate from payments (SUCCEEDED) and subscriptions (ACTIVE). */
async function getRevenueMetrics() {
  const [paymentsAgg, sessionsCount, activeSubs] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'SUCCEEDED' },
      _sum: { amountMinor: true },
    }),
    prisma.analysisSession.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
  ]);
  const totalMinor = paymentsAgg._sum?.amountMinor ?? 0;
  return {
    totalRevenue: (totalMinor / 100).toFixed(2),
    sessionsCount,
    activeSubscriptions: activeSubs,
  };
}

// --- History: snapshots (frontend list: id, title?, toolCode?, testType?, createdAt; detail: + outputsJson, interpretationJson, metadataJson) ---

/** GET history list: analysis_snapshots for user_id, ordered by created_at desc. */
async function getSnapshotList(userId) {
  const rows = await prisma.analysisSnapshot.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { job: { select: { toolCode: true } } },
  });
  return rows.map((r) => {
    const meta = (r.metadataJson && typeof r.metadataJson === 'object') ? r.metadataJson : {};
    return {
      id: r.id,
      userId: r.userId,
      title: r.title ?? undefined,
      toolCode: r.job?.toolCode ?? meta.toolCode ?? undefined,
      testType: meta.testType ?? undefined,
      createdAt: r.createdAt.toISOString(),
    };
  });
}

/** GET history/:id: full snapshot for owner. */
async function getSnapshotById(snapshotId, userId) {
  const row = await prisma.analysisSnapshot.findFirst({
    where: { id: snapshotId, userId },
    include: { report: true, job: { select: { toolCode: true } } },
  });
  if (!row) return null;
  const meta = (row.metadataJson && typeof row.metadataJson === 'object') ? row.metadataJson : {};
  return {
    id: row.id,
    userId: row.userId,
    title: row.title ?? undefined,
    toolCode: row.job?.toolCode ?? meta.toolCode ?? undefined,
    testType: meta.testType ?? undefined,
    metadataJson: row.metadataJson,
    outputsJson: row.outputsJson,
    interpretationJson: row.interpretationJson,
    createdAt: row.createdAt.toISOString(),
    reportDownloadUrl: row.report?.docObjectKey ? `/api/reports/download/${row.id}` : undefined,
  };
}

/** DELETE history/:id: delete snapshot (and report), log history_deletions. */
async function deleteSnapshot(snapshotId, userId) {
  const snap = await prisma.analysisSnapshot.findFirst({
    where: { id: snapshotId, userId },
    include: { report: true },
  });
  if (!snap) return false;
  await prisma.$transaction([
    prisma.report.deleteMany({ where: { snapshotId } }),
    prisma.historyDeletion.create({
      data: { userId, snapshotId, deletedAt: new Date() },
    }),
    prisma.analysisSnapshot.delete({ where: { id: snapshotId } }),
  ]);
  return true;
}

/** Returns true if user has at least one ACTIVE subscription (for redirect-after-login flow). */
async function getHasActiveSubscription(userId) {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
  });
  return Boolean(sub);
}

/** Get user's active subscription with plan details for dashboard display. Returns { planCode, planName } or null. */
async function getActiveSubscriptionWithPlan(userId) {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
  });
  if (!sub?.plan) return null;
  const label = TIER_CODE_TO_LABEL[sub.plan.code];
  return {
    planCode: sub.plan.code,
    planName: label || sub.plan.name || sub.plan.code,
  };
}

/** Admin: list all users with email, username, role, status (active/inactive). */
async function getUsersList() {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, username: true, role: true, status: true, createdAt: true },
  });
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    username: r.username ?? r.email?.split('@')[0] ?? '',
    role: r.role,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

module.exports = {
  prisma,
  toApiUser,
  findUserByLogin,
  createUser,
  getUserById,
  getPricingTiers,
  getPricingTiersPublic,
  upsertPricingTiers,
  getToolConfigs,
  upsertToolConfigs,
  getRevenueMetrics,
  getSnapshotList,
  getSnapshotById,
  deleteSnapshot,
  getUsersList,
  getHasActiveSubscription,
  getActiveSubscriptionWithPlan,
};
