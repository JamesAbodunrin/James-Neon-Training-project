-- ThesisAnalyzer – Initial schema (PostgreSQL)
-- Aligned with docs/ERD.md and frontend (src/types, AuthContext, admin, analysisEngine).
-- Run manually or via: psql $DATABASE_URL -f prisma/migrations/0_init_schema.sql

-- ========== Enums ==========
CREATE TYPE user_role AS ENUM ('PERSONAL', 'RESEARCHER', 'INSTITUTIONAL', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');
CREATE TYPE payment_kind AS ENUM ('PERSONAL_SESSION', 'SUBSCRIPTION', 'INSTITUTION_SEATS');
CREATE TYPE payment_status AS ENUM ('INITIATED', 'SUCCEEDED', 'FAILED', 'CANCELED');
CREATE TYPE account_context AS ENUM ('PERSONAL', 'RESEARCHER', 'INSTITUTIONAL');
CREATE TYPE session_status AS ENUM ('CREATED', 'PAID', 'UPLOADED', 'EXECUTED', 'REPORTED', 'EXPIRED', 'ABORTED');
CREATE TYPE file_type AS ENUM ('CSV', 'XLSX');
CREATE TYPE job_mode AS ENUM ('PREDEFINED', 'ADVANCED');
CREATE TYPE sandbox_validation_status AS ENUM ('PASSED', 'BLOCKED');
CREATE TYPE job_status AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMED_OUT');
CREATE TYPE billing_period AS ENUM ('ONE_TIME', 'MONTHLY', 'YEARLY');
CREATE TYPE subscription_provider AS ENUM ('STRIPE', 'PAYSTACK', 'OTHER');

-- ========== 1. Core ==========
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username TEXT,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  institution_id UUID REFERENCES institutions(id),
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  seat_limit INT NOT NULL CHECK (seat_limit >= 0),
  retention_days INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from users to institutions after institutions exists
ALTER TABLE users ADD CONSTRAINT users_institution_id_fkey
  FOREIGN KEY (institution_id) REFERENCES institutions(id);

CREATE TABLE institution_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  assigned_by_admin_id UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

-- ========== 2. Billing ==========
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  allow_advanced_mode BOOLEAN NOT NULL DEFAULT false,
  max_dataset_mb INT NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  status subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  provider subscription_provider,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX subscriptions_user_active ON subscriptions(user_id)
  WHERE status = 'ACTIVE';

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  kind payment_kind NOT NULL,
  amount_minor INT NOT NULL,
  currency CHAR(3) NOT NULL,
  status payment_status NOT NULL,
  provider TEXT,
  provider_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX payments_user_created ON payments(user_id, created_at DESC);
CREATE INDEX payments_status ON payments(status);

-- ========== 3. Analysis lifecycle ==========
CREATE TABLE analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  account_context account_context NOT NULL,
  status session_status NOT NULL,
  paid_payment_id UUID REFERENCES payments(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dataset_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES analysis_sessions(id),
  original_filename TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_size_bytes INT NOT NULL,
  ephemeral_object_key TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES analysis_sessions(id),
  mode job_mode NOT NULL,
  tool_code TEXT,
  case_sensitive BOOLEAN NOT NULL DEFAULT false,
  parameters_json JSONB NOT NULL,
  python_code TEXT,
  sandbox_validation_status sandbox_validation_status,
  status job_status NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  runtime_ms INT,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX analysis_jobs_session_created ON analysis_jobs(session_id, created_at DESC);
CREATE INDEX analysis_jobs_status ON analysis_jobs(status);

-- ========== 4. Snapshot + report + history ==========
CREATE TABLE analysis_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id UUID NOT NULL REFERENCES analysis_sessions(id),
  analysis_job_id UUID NOT NULL UNIQUE REFERENCES analysis_jobs(id),
  title TEXT,
  metadata_json JSONB NOT NULL,
  outputs_json JSONB NOT NULL,
  interpretation_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX analysis_snapshots_user_created ON analysis_snapshots(user_id, created_at DESC);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL UNIQUE REFERENCES analysis_snapshots(id),
  doc_object_key TEXT NOT NULL,
  doc_mime_type TEXT NOT NULL DEFAULT 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  generated_at TIMESTAMPTZ NOT NULL,
  downloaded_count INT NOT NULL DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ
);

CREATE TABLE history_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  snapshot_id UUID NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL,
  reason TEXT
);

-- ========== 5. Admin config + audit ==========
CREATE TABLE tool_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_code TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL,
  config_json JSONB,
  updated_by_admin_id UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_code TEXT NOT NULL UNIQUE,
  amount_minor INT NOT NULL,
  currency CHAR(3) NOT NULL,
  billing_period billing_period NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_by_admin_id UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_action_created ON audit_logs(action, created_at DESC);
CREATE INDEX audit_logs_actor_created ON audit_logs(actor_user_id, created_at DESC);
</think>
Reordering the SQL so we create `institutions` before `users`:
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace