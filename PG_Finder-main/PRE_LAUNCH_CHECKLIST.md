# PG Finder — Pre-Launch Checklist & Analysis

> **Status:** 🚧 Pre-Launch | **Audience:** Internal | **Last Updated:** May 22, 2026
>
> This document catalogs every flaw, missing feature, and improvement needed before PG Finder can go to market. Organized by severity.

---

## 🔴 CRITICAL — Blocks Launch Entirely

These issues will cause the product to break or be unusable for real users.

### 1. Frontend-Backend API Mismatch (MAJOR BLOCKER)

The frontend (`frontend_react/src/lib/api.ts`) calls endpoints that **do not exist** on the backend.

| Frontend Calls | Backend Has (Actual) |
|---|---|
| `GET /pgs` | → `GET /pg/list` |
| `GET /pgs/{id}` | → `GET /pg/{pg_id}` |
| `POST /pgs` | → `POST /pg/register` |
| `POST /reviews` | → `POST /review` |
| `GET /analytics/{type}` | → `GET /stats` |
| `GET /admin/stats` | → `GET /admin/visitors` |

**Fix:** Either rename all backend endpoints to match frontend expectations, or update the API client to use correct paths. The frontend API client was written for a different API convention than what the backend exposes — this is the single biggest bug.

### 2. Chat Results Never Reach the Frontend

In `frontend_react/src/app/chat/page.tsx`, the `results` state is initialized as `[]` and **never populated**. The agent searches PGs and returns text recommendations, but:

- No mechanism extracts structured PG data from the chat response
- No mechanism calls `/pg/list` or `/pg/{pg_id}` to load PG cards
- The right panel always shows "Start chatting to see personalized recommendations"
- The `results.map()` loop on line 243 never executes

**Fix:** After the agent returns a response, parse PG IDs from the response text, then fetch details via `GET /pg/{pg_id}` for each mentioned PG. Or better, add a backend endpoint that returns structured PG recommendations alongside the chat text.

### 3. PG Detail Page Uses Mock Data

`frontend_react/src/app/pg/[id]/page.tsx` renders a hardcoded mock PG object (line 10–54). It does not call `apiClient.getPGDetails(pgId)`. The page ID from the URL is ignored entirely.

**Fix:** Fetch PG details from `GET /pg/{pg_id}` using the URL param `params.id`, render real data. Also fetch reviews from `GET /reviews/{pg_id}` and rating from `GET /rating/{pg_id}`.

### 4. Map Not Implemented

The chat results panel shows a "Map coming soon" placeholder (`frontend_react/src/app/chat/page.tsx:229`). For a location-first product, this is a core feature gap.

**Fix:** Integrate Leaflet or Google Maps. Plot PG markers using coordinates from the database. Show user's location if shared.

### 5. In-Memory Session Store Resets on Restart

`backend/agent.py` stores chat sessions in a Python dict (`session_store = {}`). Every server restart wipes all active chat conversations.

**Fix:** Migrate sessions to the SQLite database or use Redis. Add a background task to clean up stale sessions.

### 6. API Key Committed in .env

`.env` contains a live `OPENROUTER_API_KEY` that has been committed to git (`git log` will expose it). This is a security incident waiting to happen — anyone with repo access can use this key.

**Fix:** Immediately:
1. Rotate the API key on OpenRouter
2. Add `.env` to `.gitignore` (verify it's already there)
3. Remove `.env` from git history or accept the exposure
4. Use `.env.example` as the template

---

## 🟠 HIGH — Must Fix Before Marketing to Real Users

These issues won't crash the app but will destroy user trust and adoption.

### 7. JWT Secret Key Hardcoded Fallback

`backend/auth.py:10`:
```python
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production-pg-finder-2026")
```

If a production server doesn't set `JWT_SECRET_KEY`, this fallback is used. Anyone who reads this code can forge JWTs and impersonate any user (including admin).

**Fix:** Remove the hardcoded fallback. Make `JWT_SECRET_KEY` required at startup. Generate a strong random key for production.

### 8. CORS Allows All Origins

`backend/main.py:28-34`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # DANGER
    ...
)
```

In production, this allows any website to make API calls from a user's browser. Set specific origins for your frontend domain(s).

### 9. No Rate Limiting

Every endpoint can be spammed:
- `/auth/login` — brute force attack vector
- `/chat` — expensive AI API calls, potential cost drain
- `/pg/{pg_id}/contact` — fake lead generation
- `/admin/visitors` — if auth is bypassed, data exposure

**Fix:** Add `slowapi` or `fastapi-limiter` middleware. Set aggressive limits on auth and chat endpoints.

### 10. "List Your PG" Has No Self-Service Form

`frontend_react/src/app/list/page.tsx` is entirely a CTA page with a phone number. There is no way for PG owners to self-register. This means:
- Every new listing requires a phone call
- PG owners on the fence cannot convert
- The backend has a fully functional `/pg/register` endpoint — the frontend just doesn't use it

**Fix:** Build a proper multi-step PG registration form in React that posts to `/pg/register`.

### 11. Admin Dashboard Uses Mock Data

`frontend_react/src/app/admin/dashboard/page.tsx:31-52` hardcodes 2 mock PGs. The `loadPGs()` function has a comment `// Fetch all PGs from backend` but never does.

**Fix:** Call `GET /pg/list` for PGs, `GET /admin/visitors` for stats, and `GET /admin/users` for user management. Same issue in `stats-manager` and `updates` pages.

### 12. No Error Tracking

No Sentry, no logging framework, no error reporting. When issues occur in production, you'll have no visibility.

**Fix:** Add Sentry to both frontend and backend. Add structured logging to backend.

### 13. No Loading States on Auth Pages

When the user clicks "Log in" or "Create account", the button shows text changes but there's no spinner, no progress indicator, and the form remains interactive.

**Fix:** Add spinner/disabled state during API calls.

### 14. Chat Greeting Not Displayed

`frontend_react/src/app/chat/page.tsx:55-62`:
```typescript
const sendInitialGreeting = async () => {
    // Greeting is now included in getNewSession response
    // This function is no longer needed, but kept for backward compatibility
}
```

The `/new-session` endpoint DOES return a greeting, but the frontend never displays it. The chat starts empty with "Your matches appear here" placeholder instead of the greeting message.

**Fix:** When `getNewSession()` returns, push the `greeting` into the messages store.

### 15. Quick Reply Buttons Don't Send

In `chat/page.tsx:81-83`:
```typescript
const handleQuickReply = (text: string) => {
    setInputValue(text)
}
```

The quick reply buttons only set the input field value — they don't actually send the message. The user must click Send after selecting a quick reply.

**Fix:** Have `handleQuickReply` immediately send the message after setting the value.

### 16. Session Lost on Page Refresh

Chat history is stored in Zustand (in-memory) and in the backend (in-memory dict). Refreshing the page or closing the tab loses the entire conversation. Auth state (stored in localStorage) survives, but chat does not.

**Fix:** Persist messages to localStorage or restore from backend session history.

---

## 🟡 MEDIUM — Important for UX and Trust

### 17. No 404 / Error Pages

All pages return generic Next.js error screens. There's no custom 404, 500, or "Something went wrong" page.

### 18. Hardcoded URLs Throughout

`frontend_react/src/lib/api.ts:3`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

This uses env var (good), but any hardcoded reference to `localhost` in production code will break. Also, `.env` has `BACKEND_URL=http://localhost:8000` but the frontend uses `NEXT_PUBLIC_API_URL`.

### 19. `require()` in ESM Module Context

`frontend_react/src/lib/store.ts:72`:
```typescript
const { apiClient } = require('@/lib/api')
```

This uses CommonJS `require()` in a TypeScript/ESM project. This works in Next.js but is inconsistent and may break in future updates or stricter environments.

### 20. No Database Migration System

Schema changes require manually dropping and recreating tables. With SQLite, there's no Alembic or similar migration framework.

### 21. No SEO Structured Data

The landing page has basic `<meta>` tags and OpenGraph, but there's no:
- Schema.org JSON-LD (LocalBusiness, Product)
- Breadcrumb structured data
- FAQ schema
- Sitemap (a `sitemap.ts` file exists but may not be fully configured)

### 22. No PWA / Service Worker

No `manifest.json`, no service worker, no offline support. For a product targeting mobile-first users in India, PWA support is important for engagement.

---

## 🟢 LOW — Polish / Nice-to-Have Pre-Launch

### 23. No Tests for Frontend
Only backend tests exist (`test_app.py`, `test_models.py`). The React frontend has zero tests.

### 24. No CI/CD Pipeline
No GitHub Actions, no automated testing, no deployment workflow.

### 25. Admin Credentials in Environment Fallback
`backend/database.py:152-153`:
```python
admin_email = os.getenv("ADMIN_EMAIL", "sanjaybukka28@gmail.com")
admin_password = os.getenv("ADMIN_PASSWORD", "BukkaSandhyaRani2409")
```
Default admin credentials are exposed in source code.

### 26. No Phone/Email Verification
Users can sign up with any email without verification. Fake accounts are trivial to create.

### 27. Visitor Tracking Logs Everything
The visitor middleware logs every request except a few skip paths. This could be data-heavy in production. Also, IP addresses are stored without anonymization (GDPR concern).

### 28. No Password Strength Validation
Signup accepts any password length. No minimum length, no complexity requirements.

### 29. No Search Pagination
`GET /pg/list` returns all active PGs at once. With 1,200+ PGs, this becomes slow and wasteful.

### 30. No Sort/Filter on PG Listing
The `/pg/list` endpoint returns PGs alphabetically by name with no sort options (price, rating, date, etc.).

### 31. Hardcoded Phone Number
The "List Your PG" page hardcodes `+91 7981366747`. This should be configurable via environment variable.

---

## 📊 Architecture Health Check

### What Works Well
- ✅ Backend API is well-structured with clear separation of concerns
- ✅ AI agent system prompt is well-designed for natural conversation
- ✅ Database schema is comprehensive with 58 PG fields
- ✅ Geocoding with OSM Nominatim is functional (free, no API key needed)
- ✅ JWT auth with bcrypt password hashing
- ✅ Contact tracking for monetization metrics
- ✅ Visitor analytics for usage insights

### What Needs Rework
- ❌ Frontend API client path mapping (completely broken)
- ❌ Chat results integration (results never displayed)
- ❌ PG detail page (completely disconnected from backend)
- ❌ Admin dashboard (all mock data)
- ❌ No self-service PG registration form
- ❌ Map integration (not started)

### What Should Be Replaced
- ⚠️ SQLite → PostgreSQL (for production scaling)
- ⚠️ In-memory sessions → Redis or DB-backed
- ⚠️ Hardcoded secrets → Environment variables with validation
- ⚠️ CORS `*` → Specific origins

---

## 🚀 Launch Recommendation

### T-7 Days (Minimum Viable Launch)
1. **Fix API path mismatch** in `api.ts` — 1 hour
2. **Display chat greeting** from `/new-session` response — 30 min
3. **Make quick reply buttons send** — 15 min
4. **Set `JWT_SECRET_KEY` in production env** — 5 min
5. **Remove `.env` from git** and rotate API key — 30 min
6. **Restrict CORS origins** — 10 min
7. **Remove admin credentials from source** — 15 min

### T-14 Days (Beta Ready)
8. Build PG detail page to fetch real data from backend
9. Build PG registration form
10. Connect admin dashboard to real APIs
11. Add rate limiting to auth + chat endpoints
12. Display chat results in the right panel
13. Add error tracking (Sentry)
14. Add 404/error pages

### T-30 Days (Public Launch)
15. Replace SQLite with PostgreSQL
16. Add database migrations (Alembic)
17. Implement map with PG markers
18. Add PWA support
19. Set up CI/CD
20. Add loading states everywhere
21. Add phone/email verification
22. Add SEO structured data
23. Configure proper logging

---

## 📁 Files Referenced

| File | Issue |
|---|---|
| `frontend_react/src/lib/api.ts` | Wrong endpoint paths |
| `frontend_react/src/app/chat/page.tsx` | Results never populated, greeting not displayed, quick replies don't send |
| `frontend_react/src/app/pg/[id]/page.tsx` | Mock data only |
| `frontend_react/src/app/list/page.tsx` | No registration form |
| `frontend_react/src/app/admin/dashboard/page.tsx` | Mock data only |
| `frontend_react/src/lib/store.ts:72` | `require()` in ESM |
| `backend/auth.py:10` | Hardcoded JWT secret |
| `backend/database.py:152-153` | Hardcoded admin credentials |
| `backend/main.py:28-34` | CORS `*` |
| `backend/agent.py` | In-memory session store |
| `.env` | API key committed |

---

*Generated by codebase analysis. Update as fixes are completed.*
