/**
 * Shared types aligned with ERD and PRD (source of truth).
 */

export type UserRole = 'PERSONAL' | 'RESEARCHER' | 'INSTITUTIONAL' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  institutionId?: string | null;
  status?: 'ACTIVE' | 'SUSPENDED';
}

/** For auth context (client); extends with authMethod for login source. */
export interface AuthUser extends User {
  userId: string;
  authMethod: 'email' | 'github' | 'apple' | 'manual';
}

/** Plan codes per PRD/ERD. */
export type PlanCode = 'PERSONAL_SESSION' | 'RESEARCHER_SUB' | 'INSTITUTIONAL';

/** Analysis snapshot (outputs only; no raw data). */
export interface AnalysisSnapshot {
  id: string;
  userId: string;
  title?: string;
  toolCode: string;
  testType?: string;
  metadataJson: Record<string, unknown>;
  outputsJson: Record<string, unknown>;
  interpretationJson: Record<string, unknown>;
  createdAt: string;
}
