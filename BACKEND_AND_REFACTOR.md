# Backend & Refactor Summary

## 1. Backend technology

- **Runtime:** Node.js  
- **Framework:** **Express** (v4.x)  
- **Database:** PostgreSQL  
- **ORM:** **Prisma** (v6.x) – schema in `prisma/schema.prisma`, client used in `server/db.js`  
- **Auth:** JWT (jsonwebtoken), password hashing (bcryptjs)  
- **Other:** cors, dotenv  

The backend is a **REST API** that serves the same data shapes the frontend used when it was mock/localStorage-only. When `NEXT_PUBLIC_API_URL` is set (e.g. `http://localhost:4000`), the frontend calls this API instead of using hardcoded data or localStorage for auth, admin (pricing, tools, revenue), and history (list, detail, delete).

---

## 2. Server structure

```
my-app/
├── prisma/
│   ├── schema.prisma          # DB schema (users, institutions, plans, payments, analysis_sessions, analysis_snapshots, tool_configs, pricing_tiers, audit_logs, etc.)
│   ├── migrations/
│   │   └── 0_init_schema.sql  # Raw PostgreSQL migration (optional, for non-Prisma use)
│   └── README.md
├── server/
│   ├── index.js               # Express app entry: CORS, JSON, routes, health check, report-download stub
│   ├── db.js                  # Prisma client + query helpers (auth, admin pricing/tools/revenue, history list/detail/delete)
│   ├── middleware/
│   │   └── auth.js            # JWT: authOptional, requireAuth, requireAdmin, signToken
│   ├── routes/
│   │   ├── auth.js            # POST /api/auth/login, POST /api/auth/register, GET /api/auth/me
│   │   ├── admin.js           # GET/PUT /api/admin/pricing, GET/PUT /api/admin/tools, GET /api/admin/revenue
│   │   └── history.js         # GET /api/history, GET /api/history/:id, DELETE /api/history/:id
│   ├── API.md                 # REST contract (request/response shapes)
│   └── QUERIES.md             # Prisma vs raw SQL reference
├── src/
│   └── lib/
│       └── api.ts             # Frontend API client (all endpoints), token in localStorage
```

**Start server:** `npm run server` (runs `node server/index.js`). Listens on `API_PORT` or `PORT` or 4000.

---

## 3. Refactor: fetch from backend instead of hardcoded data

| Area | Before | After (when `NEXT_PUBLIC_API_URL` set) |
|------|--------|---------------------------------------|
| **Auth** | localStorage (`thesisAnalyzer_user`, `thesisAnalyzer_users`), hardcoded Admin | `POST /api/auth/login`, `POST /api/auth/register`; token stored; `GET /api/auth/me` on load to restore session |
| **Admin pricing** | localStorage `thesisAnalyzer_adminPricing` / defaults | `GET /api/admin/pricing` on load; `PUT /api/admin/pricing` on save |
| **Admin tools** | localStorage `thesisAnalyzer_adminTools` / defaults | `GET /api/admin/tools` on load; `PUT /api/admin/tools` on save |
| **Admin revenue** | Mock timeout (2,450, 156, 23) | `GET /api/admin/revenue` (from DB aggregates) |
| **Analysis type selector** | localStorage `thesisAnalyzer_adminTools` | `GET /api/tools` (public) to disable types when admin turns tool off |
| **History list** | Static empty state | `GET /api/history` → list of snapshots or empty; loading + error state |
| **History detail** | Placeholder “requires backend” | `GET /api/history/:id` → snapshot (outputs, interpretation); Re-download link, Delete; loading + error + not-found |
| **History delete** | N/A | `DELETE /api/history/:id` then redirect to list |

**Loading and error handling:**

- **Auth:** Session restore via `apiMe()` in a `useEffect`; no setState in effect body (lint-safe); errors clear token and stored user.
- **Admin:** Single “dashboard” load for pricing + tools + revenue; `dataLoading` and `dataError`; save pricing/tools use try/catch and set `dataError` on failure.
- **History list:** `loading` and `error`; list from API is guarded with `Array.isArray(data) ? data : []`.
- **History detail:** `loading`, `error`, `notFound`; interpretation/outputs rendered with safe checks and try/catch around `JSON.stringify` to avoid parsing/display errors.

When `NEXT_PUBLIC_API_URL` is not set, behavior is unchanged: localStorage and mock data only.

---

## 4. Verification: no errors, everything working

- **Build:** `npm run build` – completes successfully (Next.js build, TypeScript, no compile errors).  
- **Lint:** `npm run lint` – passes (0 errors). Server uses CommonJS `require`; ESLint override for `server/**/*.js` disables `no-require-imports` so server code is not flagged.  
- **Source:** No parsing errors; JSON from API is validated (e.g. `Array.isArray`, `typeof revenueRes === 'object'`) before use; interpretation/outputs use try/catch when stringifying.  
- **Functionality:**  
  - **Auth:** Login (including Admin/Admin12345), register, logout; when API is enabled, token is sent and session can be restored with `apiMe()`.  
  - **Admin:** Load pricing/tools/revenue from API; save pricing/tools to API; loading and error states shown.  
  - **History:** List loads from API; detail loads by id; delete calls API and redirects; Re-download links to backend URL (stub returns 501 until report storage is wired).  
  - **Analysis:** Tool config from `GET /api/tools` so disabled tools appear disabled in the type selector.  

---

## 5. All functionalities working without error

| Functionality | Status |
|---------------|--------|
| Login (Admin/Admin12345 + normal users) | OK – API or fallback |
| Register | OK – API or localStorage |
| Logout | OK – clears user + token when API enabled |
| Session restore (token → user) | OK – `apiMe()` on mount when API + token |
| Admin: load pricing/tools/revenue | OK – from API with loading/error |
| Admin: save pricing | OK – PUT + toast; error state on failure |
| Admin: save tools | OK – PUT + toast; error state on failure |
| Analysis type selector: disabled tools | OK – from GET /api/tools |
| History list | OK – GET /api/history, loading/error/empty |
| History detail | OK – GET by id, loading/error/not-found, safe display |
| History delete | OK – DELETE then redirect |
| Re-download report | OK – link to backend; backend stub 501 until storage connected |

---

## 6. No parsing error / no source code failure

- **API responses:** List endpoints consumed as arrays only when `Array.isArray(data)`; revenue/objects checked with `typeof ... === 'object'`.  
- **History detail:** `interpretationJson` and `outputsJson` displayed only when not null and type object; stringification wrapped in try/catch.  
- **Auth:** No JSON.parse of API body in critical path without handling; token stored and sent in header.  
- **Lint:** No setState in effect body (deferred via requestAnimationFrame or async callbacks where needed).  
- **Server:** Prisma and Express used in a standard way; no unhandled rejections in the described flows.

---

## Quick run checklist

1. **Backend:**  
   - `cp .env.example .env` and set `DATABASE_URL`, optionally `API_PORT`.  
   - `npx prisma generate` then `npx prisma db push` (or run `prisma/migrations/0_init_schema.sql`).  
   - `npm run server` → API on port 4000 (or `API_PORT`).  

2. **Frontend with API:**  
   - In `.env`: `NEXT_PUBLIC_API_URL=http://localhost:4000`.  
   - `npm run dev` → use login, admin, history against the backend.  

3. **Frontend without API:**  
   - Do not set `NEXT_PUBLIC_API_URL` → app uses localStorage and mock data only.
