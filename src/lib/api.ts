/**
 * REST API client for ThesisAnalyzer backend.
 * Data shapes match AuthContext User, admin pricing/tools, history list/detail.
 * Set NEXT_PUBLIC_API_URL (e.g. http://localhost:4000) to use the backend.
 */

const API_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL ?? '') : process.env.NEXT_PUBLIC_API_URL ?? '';

export type UserRole = 'PERSONAL' | 'RESEARCHER' | 'INSTITUTIONAL' | 'ADMIN';

export interface ApiUser {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  authMethod: 'email' | 'github' | 'apple' | 'manual';
}

export interface AuthLoginResponse {
  user: ApiUser;
  token: string;
}

export interface PricingItem {
  tier: string;
  price: string;
  currency: string;
}

export interface ToolItem {
  id: string;
  name: string;
  enabled: boolean;
}

export interface RevenueMetrics {
  totalRevenue: string;
  sessionsCount: number;
  activeSubscriptions: number;
}

export interface HistoryListItem {
  id: string;
  userId: string;
  title?: string;
  toolCode?: string;
  testType?: string;
  createdAt: string;
}

export interface HistoryDetailItem extends HistoryListItem {
  metadataJson: Record<string, unknown>;
  outputsJson: Record<string, unknown>;
  interpretationJson: Record<string, unknown>;
  reportDownloadUrl?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('thesisAnalyzer_token');
}

function headers(includeAuth = false): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const t = getToken();
    if (t) (h as Record<string, string>)['Authorization'] = `Bearer ${t}`;
  }
  return h;
}

export function isApiEnabled(): boolean {
  return Boolean(API_URL);
}

// --- Auth ---

export async function apiLogin(username: string, password: string): Promise<AuthLoginResponse | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (typeof window !== 'undefined' && data.token) localStorage.setItem('thesisAnalyzer_token', data.token);
  return data as AuthLoginResponse;
}

export async function apiRegister(
  username: string,
  email: string,
  password: string,
  role: UserRole = 'PERSONAL'
): Promise<AuthLoginResponse | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify({ username, email, password, role }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (typeof window !== 'undefined' && data.token) localStorage.setItem('thesisAnalyzer_token', data.token);
  return data as AuthLoginResponse;
}

export async function apiMe(): Promise<ApiUser | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/auth/me`, { headers: headers(true) });
  if (!res.ok) return null;
  return res.json() as Promise<ApiUser>;
}

export interface SubscriptionStatusResponse {
  hasActiveSubscription: boolean;
  currentPlan: { planCode: string; planName: string } | null;
}

/** Subscription status for post-login redirect and dashboard "Your plan". */
export async function apiGetSubscriptionStatus(): Promise<SubscriptionStatusResponse | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/subscription/status`, { headers: headers(true) });
  if (!res.ok) return null;
  return res.json() as Promise<SubscriptionStatusResponse>;
}

// --- Admin ---

export async function apiGetPricing(): Promise<PricingItem[] | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/admin/pricing`, { headers: headers(true) });
  if (!res.ok) return null;
  return res.json() as Promise<PricingItem[]>;
}

export async function apiPutPricing(items: PricingItem[]): Promise<PricingItem[] | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/admin/pricing`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify(items),
  });
  if (!res.ok) return null;
  return res.json() as Promise<PricingItem[]>;
}

/** Public: pricing tiers for pricing page (no auth). Same shape as admin pricing. */
export async function apiGetPricingPublic(): Promise<PricingItem[] | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/pricing`);
  if (!res.ok) return null;
  return res.json() as Promise<PricingItem[]>;
}

/** Public: which tools are enabled (for analysis type selector). No auth. */
export async function apiGetToolsPublic(): Promise<ToolItem[] | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/tools`);
  if (!res.ok) return null;
  return res.json() as Promise<ToolItem[]>;
}

export async function apiGetTools(): Promise<ToolItem[] | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/admin/tools`, { headers: headers(true) });
  if (!res.ok) return null;
  return res.json() as Promise<ToolItem[]>;
}

export async function apiPutTools(items: ToolItem[]): Promise<ToolItem[] | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/admin/tools`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify(items),
  });
  if (!res.ok) return null;
  return res.json() as Promise<ToolItem[]>;
}

export async function apiGetRevenue(): Promise<RevenueMetrics | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/admin/revenue`, { headers: headers(true) });
  if (!res.ok) return null;
  return res.json() as Promise<RevenueMetrics>;
}

export interface AdminUserItem {
  id: string;
  email: string | null;
  username: string;
  role: string;
  status: string;
  createdAt: string;
}

export async function apiGetAdminUsers(): Promise<AdminUserItem[] | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/admin/users`, { headers: headers(true) });
  if (!res.ok) return null;
  return res.json() as Promise<AdminUserItem[]>;
}

// --- History ---

export async function apiGetHistory(): Promise<HistoryListItem[] | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/history`, { headers: headers(true) });
  if (!res.ok) return null;
  return res.json() as Promise<HistoryListItem[]>;
}

export async function apiGetHistoryDetail(id: string): Promise<HistoryDetailItem | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/history/${encodeURIComponent(id)}`, { headers: headers(true) });
  if (!res.ok) return null;
  return res.json() as Promise<HistoryDetailItem>;
}

export async function apiDeleteHistory(id: string): Promise<boolean> {
  if (!API_URL) return false;
  const res = await fetch(`${API_URL}/api/history/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headers(true),
  });
  return res.status === 204;
}

/** Clear stored token (call on logout when using API). */
export function apiClearToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem('thesisAnalyzer_token');
}
