# ThesisAnalyzer REST API

Base URL: `http://localhost:4000` (or `API_URL` in frontend).

All responses use the **exact data structures** the frontend expects (AuthContext `User`, admin pricing/tools, history list/detail).

---

## Auth

### POST /api/auth/login

**Body:** `{ "username": string, "password": string }`

**Response 200:** `{ "user": User, "token": string }`

- `user`: `{ userId, username, email, role, authMethod }` (frontend `User` shape).
- Special: `username: "Admin"`, `password: "Admin12345"` returns admin user (created in DB if missing).

**401:** `{ "error": "Invalid username or password" }`

---

### POST /api/auth/register

**Body:** `{ "username": string, "email": string, "password": string, "role"?: "PERSONAL" | "RESEARCHER" | "INSTITUTIONAL" }`

**Response 201:** `{ "user": User, "token": string }`

**409:** `{ "error": "Username or email already exists" }`

---

### GET /api/auth/me

**Headers:** `Authorization: Bearer <token>`

**Response 200:** `User` (same shape as above).

**401:** `{ "error": "Unauthorized" }` or `{ "error": "User not found" }`

---

## Public

### GET /api/tools

**No auth.** Returns which tools are enabled (for analysis type selector).

**Response 200:** `Array<{ id: string, name: string, enabled: boolean }>`

---

## Admin (require Auth + role ADMIN)

**Headers:** `Authorization: Bearer <token>`

### GET /api/admin/pricing

**Response 200:** `Array<{ tier: string, price: string, currency: string }>`

Example: `[{ "tier": "Personal (per session)", "price": "9.99", "currency": "USD" }, ...]`

---

### PUT /api/admin/pricing

**Body:** `Array<{ tier: string, price: string, currency: string }>`

**Response 200:** same array (updated from DB).

---

### GET /api/admin/tools

**Response 200:** `Array<{ id: string, name: string, enabled: boolean }>`

Example: `[{ "id": "statistical", "name": "Statistical Analysis", "enabled": true }, ...]`

---

### PUT /api/admin/tools

**Body:** `Array<{ id: string, name: string, enabled: boolean }>`

**Response 200:** same array (updated from DB).

---

### GET /api/admin/revenue

**Response 200:** `{ totalRevenue: string, sessionsCount: number, activeSubscriptions: number }`

Example: `{ "totalRevenue": "2450.00", "sessionsCount": 156, "activeSubscriptions": 23 }`

---

## History (require Auth)

**Headers:** `Authorization: Bearer <token>`

### GET /api/history

**Response 200:** `Array<{ id, userId, title?, toolCode?, testType?, createdAt }>`

---

### GET /api/history/:id

**Response 200:** `{ id, userId, title?, toolCode?, testType?, metadataJson, outputsJson, interpretationJson, createdAt, reportDownloadUrl? }`

**404:** `{ "error": "Snapshot not found" }`

---

### DELETE /api/history/:id

**Response 204:** no body.

**404:** `{ "error": "Snapshot not found" }`

---

## Frontend integration

1. **Login/Register:** Call `POST /api/auth/login` or `POST /api/auth/register`, store `token` (e.g. localStorage or cookie) and set `user` in AuthContext.
2. **Authenticated requests:** Send `Authorization: Bearer <token>` on every request to `/api/admin/*` and `/api/history/*`.
3. **Admin page:** GET `/api/admin/pricing`, GET `/api/admin/tools`, GET `/api/admin/revenue`; PUT to save pricing/tools.
4. **History page:** GET `/api/history` for list; GET `/api/history/:id` for detail; DELETE for removal.
