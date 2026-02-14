# Database schema (ThesisAnalyzer)

Schema is aligned with **docs/ERD.md** and frontend data in **src/** (types, AuthContext, admin page, analysis engine).

## Options

### 1. Prisma (recommended for Next.js)

1. Install Prisma:
   ```bash
   npm install prisma @prisma/client --save-dev
   ```
2. Set `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/thesisanalyzer"
   ```
3. Generate client and sync schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   Or create a migration:
   ```bash
   npx prisma migrate dev --name init
   ```

### 2. Raw SQL (PostgreSQL)

Run the standalone migration manually:

```bash
psql "$DATABASE_URL" -f prisma/migrations/0_init_schema.sql
```

Use this if you are not using Prisma (e.g. raw pg client, another ORM).

## Frontend ↔ schema mapping

| Frontend (src) | DB / Prisma |
|----------------|-------------|
| `User` (AuthContext): userId, username, email, role, authMethod | `User`: id, username, email, passwordHash, role; authMethod is app/session only |
| `thesisAnalyzer_adminPricing`: tier, price, currency | `PricingTier`: tierCode, amountMinor, currency, billingPeriod |
| `thesisAnalyzer_adminTools`: id, name, enabled | `ToolConfig`: toolCode, enabled (id → tool_code) |
| `AnalysisResult` (analysisEngine): tables, interpretation_json, chartData, etc. | `AnalysisSnapshot.outputsJson` + `interpretationJson`; `AnalysisJob.parametersJson` |
| `AnalysisSnapshot` (types/index.ts) | `AnalysisSnapshot` model + `Report` for .doc reference |

## Notes

- **No raw dataset storage:** Only `dataset_uploads` metadata + `ephemeral_object_key`; purge after session.
- **history_deletions.snapshot_id** has no FK so deletions can be logged after snapshot is removed (GDPR).
- **subscriptions:** Partial unique `(user_id) WHERE status = 'ACTIVE'` in SQL; enforce in app with Prisma.
