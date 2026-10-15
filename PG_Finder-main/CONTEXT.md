# PG Finder - Complete Project Context

## 📋 Project Overview

**PG Finder** is a two-sided marketplace for finding and listing paying guest (PG) accommodations in Hyderabad. It features an AI-powered chatbot that guides users through a structured Q&A process to find perfect PG matches.

**Type:** Web Application (Marketplace)
**Tech Stack:** FastAPI (Backend) + Next.js/React (Frontend) + SQLite (Database)
**AI:** OpenRouter API (OpenAI GPT-4o-mini via OpenRouter)
**Current Status:** 🚧 Pre-Launch — Needs fixes before production

---

## 🏗️ Architecture

### Backend (FastAPI - Port 8000)
- **File:** `backend/main.py`
- **Purpose:** REST API with 20+ endpoints
- **Key Features:**
  - JWT authentication (email/password with bcrypt)
  - Chat endpoint with AI agent (OpenRouter)
  - PG search, list, register, update operations
  - Review system (5-star + 4 subcategories)
  - Admin panel endpoints (PG management, visitor analytics)
  - Visitor tracking middleware
  - Contact tracking (key monetization metric)

### Frontend (Next.js/React)
- **Directory:** `frontend_react/`
- **Purpose:** User interface (Next.js 14, TypeScript, Tailwind CSS)
- **Pages:**
  1. **Landing Page** - Hero, How It Works, Features, CTA
  2. **Login/Signup** - Email/password authentication
  3. **Find a PG** (Chat) - AI chatbot + PG recommendations panel
  4. **List Your PG** - Call-to-action page (phone-based onboarding)
  5. **PG Detail** - PG profile with amenities, reviews, contact
  6. **Admin Dashboard** - PG management, stats manager, updates

### Database (SQLite)
- **File:** `backend/pg_agent.db` (NOT `hostel_finder.db`)
- **Tables:**
  1. `pg_listings` - 58 columns (all PG details)
  2. `users` - Authentication & profiles
  3. `reviews` - 5-star + 4 subcategories
  4. `sessions` - Chat session tracking
  5. `visitors` - Analytics data
  6. `pg_contacts` - Contact intent tracking (monetization key)

### AI Agent
- **File:** `backend/agent.py`
- **Model:** `openai/gpt-4o-mini` via OpenRouter (configured via `OPENROUTER_MODEL`)
- **Features:**
  - Natural conversation flow (not rigid 6-question checklist)
  - Tool calling (4 tools for search/details/nearby/pricing)
  - Session memory (30 messages per session, in-memory)
  - Conversational and helpful tone with personalized recommendations

---

## 🎯 Chat Flow (Core Feature)

### Conversation Approach (NOT rigid 6 questions)
The agent uses a NATURAL conversation flow:
- Asks questions contextually, one at a time
- Infers area from office/college name
- Searches early with partial info, refines later
- Minimum requirements: area + budget + gender and also other eminities

### Search & Recommend
Once agent gathers enough info:
1. Agent calls `search_pgs` tool with filters
2. Database returns matching PGs
3. Agent formats top 3 recommendations with personalized WHY
4. Each recommendation includes: name, rating, area, price, amenities

### Session Management
- Each user gets unique `session_id` via `/new-session` endpoint
- Agent stores conversation history (max 30 messages, in-memory)
- **WARNING:** Sessions reset on server restart (in-memory store)

---

## 🔑 Key Endpoints

### Authentication
- `POST /auth/signup` - Register new user (email, password, optional: name, phone)
- `POST /auth/login` - Login (returns JWT token)
- `GET /auth/me` - Get current user profile

### Chat
- `GET /new-session` - Create chat session (returns session_id + greeting)
- `POST /chat` - Send message to agent (returns response)
- `DELETE /session/{session_id}` - Clear session memory

### PG Operations
- `GET /pg/list` - Get all active PGs
- `GET /pg/{pg_id}` - Get PG details
- `POST /pg/register` - Register new PG (auto-geocodes address)
- `POST /pg/{pg_id}/contact` - Track contact intent (monetization!)
- `GET /pg/{pg_id}/contacts` - Admin: Contact count for a PG

### Reviews & Ratings
- `POST /review` - Submit review (5-star + 4 subcategories)
- `GET /reviews/{pg_id}` - Get reviews for PG
- `GET /rating/{pg_id}` - Get rating summary

### Analytics
- `GET /stats` - Platform statistics (public, top areas, price range)
- `GET /top-rated` - Top rated PGs
- `GET /admin/visitors` - Visitor analytics (admin-only)
- `GET /admin/recent-visitors` - Recent visitors (admin-only)
- `GET /admin/users` - All users (admin-only)

### Admin
- `POST /admin/pg` - Add PG directly (admin-only)
- `DELETE /admin/pg/{pg_id}` - Deactivate PG (admin-only)

---

## 👤 User Roles

### Tenant (Regular User)
- Can search PGs via chat
- Can submit reviews
- Can bookmark favorite PGs
- Access to public analytics

### Admin
- **Account:** `sanjaybukka28@gmail.com` / `BukkaSandhyaRani2409`
- **Account:** `pg_finder@gmail.com` / `Ammu@720`
- Can add/deactivate PG listings
- Can view visitor analytics
- Can view all users
- Can manage platform stats

---

## 📁 Project Structure

```
Hostel_Finder/
├── backend/
│   ├── main.py           # FastAPI app + 20+ endpoints
│   ├── database.py       # SQLite operations (6 tables)
│   ├── models.py         # Pydantic schemas
│   ├── auth.py           # JWT + bcrypt password hashing
│   ├── agent.py          # AI chatbot logic (OpenRouter)
│   ├── tools.py          # 4 LangChain tools
│   ├── geocoding.py      # Address → coordinates (OSM Nominatim)
│   └── pg_agent.db       # SQLite database
│
├── frontend_react/       # ← IMPORTANT: This is the actual frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── chat/page.tsx         # AI Chat + PG recommendations
│   │   │   ├── login/page.tsx        # Login
│   │   │   ├── signup/page.tsx       # Signup
│   │   │   ├── list/page.tsx         # List Your PG (phone-based)
│   │   │   ├── pg/[id]/page.tsx      # PG detail page
│   │   │   └── admin/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── add-pg/page.tsx
│   │   │       ├── stats-manager/page.tsx
│   │   │       ├── updates/page.tsx
│   │   │       └── login/page.tsx
│   │   ├── components/
│   │   │   ├── layout/   # Navbar, Footer
│   │   │   ├── landing/  # HeroSection, HowItWorks, Features, CTA
│   │   │   └── common/   # AnnouncementBanner
│   │   └── lib/
│   │       ├── api.ts    # API client (axios)
│   │       ├── store.ts  # Zustand stores (auth, chat, PG)
│   │       └── imageUtils.ts
│   ├── package.json      # Next.js 14, React 18, Tailwind, Zustand, Framer Motion
│   └── tailwind.config.ts
│
├── scripts/
│   └── seed.py           # Insert sample PGs for testing
│
├── .env                  # Environment variables
├── requirements.txt
├── SPEC.md              # Original specification (outdated)
└── CONTEXT.md           # This file (updated)
```

---

## 🚀 How to Run

### Prerequisites
- Python 3.8+
- Node.js 18+
- `.env` file configured with `OPENROUTER_API_KEY`

### Setup Backend
```bash
cd backend
pip install -r ../requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Setup Frontend
```bash
cd frontend_react
npm install
npm run dev
```

### Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 📚 Dependencies

### Backend
- fastapi==0.111.0, uvicorn==0.30.1, pydantic==2.7.4
- langgraph==0.1.19, langchain-core==0.2.11
- python-jose[cryptography]==3.3.0, passlib[bcrypt]==1.7.4
- bcrypt==4.1.2, python-dotenv==1.0.1, requests==2.32.3

### Frontend
- next@^14.0.0, react@^18.2.0, typescript@^5.2.0
- axios@^1.6.0, zustand@^4.4.0, framer-motion@^10.16.0
- lucide-react@^0.292.0, react-hot-toast@^2.4.1
- tailwindcss@^3.3.0, date-fns@^2.30.0

### API
- OpenRouter (default: `openai/gpt-4o-mini`, configurable)

---

## 🌍 Environment Configuration

**File:** `.env` (project root)

```env
OPENROUTER_API_KEY=sk-or-v1-xxxx...
OPENROUTER_MODEL=openrouter/free
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o-mini
BACKEND_URL=http://localhost:8000
```

### Getting OpenRouter API Key
1. Go to https://openrouter.ai/keys
2. Create account or login
3. Copy your API key
4. Paste into `.env` file

**Without this key, the chatbot will not work!**

---

## 💾 Database Schema (6 Tables)

### Core Tables
- `pg_listings` - 58 columns (all PG details)
- `users` - Auth + profiles (id, email, password_hash, name, phone, role, timestamps)
- `reviews` - 5-star + cleanliness, maintenance, owner_behavior, value_for_money
- `sessions` - Chat session tracking (session_id, created_at, last_active)
- `visitors` - Analytics (page_url, user_id, ip_address, device_type, referrer)
- `pg_contacts` - Monetization metric (session_id, pg_id, contacted_at)

---

## ⚠️ Known Issues & Pre-Launch Gaps

### Critical (Blocks Launch)
1. **Frontend-Backend API Mismatch** - Frontend calls `/pgs`, `/pgs/{id}`, `/reviews` (POST), `/analytics/{type}`, `/admin/stats` — none exist in backend
2. **Chat Results Never Displayed** - `results` state in chat page is always empty; agent's search results never reach frontend
3. **Map Not Implemented** - Shows "Map coming soon" placeholder
4. **PG Detail Page Uses Mock Data** - Not connected to backend API
5. **In-Memory Sessions** - Reset on every server restart

### High Priority
6. **No PG Registration Form** - "List Your PG" is phone-based only (no self-service form)
7. **Admin Dashboard Uses Mock Data** - Not connected to backend
8. **No Error Tracking** - No Sentry or error monitoring
9. **JWT Secret Key Hardcoded** - `"your-secret-key-change-in-production-pg-finder-2026"`
10. **No Rate Limiting** - Any endpoint can be spammed
11. **API Key in .env Committed** - Exposed in repository
12. **CORS Allows All Origins** (`*`)

### Medium Priority
13. **No Loading States on Auth Pages** - User sees no feedback during requests
14. **No 404/Error Pages** - Server errors show generic messages
15. **Session Lost on Refresh** - No persistence for chat or auth
16. **Chat Greeting Not Displayed** - `sendInitialGreeting` is empty function
17. **Quick Reply Buttons Don't Send** - Only set input value, need click Send
18. **No Database Migrations** - Schema changes require manual table drops

### Low Priority
19. **No Tests for Frontend** - Only backend tests exist
20. **No CI/CD Configuration**
21. **`require()` in ESM Context** - `store.ts` uses CommonJS `require()`
22. **Hardcoded URLs** - `http://localhost:8000` throughout codebase
23. **No SEO Structured Data** - No schema.org JSON-LD on any page
24. **No PWA/Service Worker** - No mobile app-like experience

---

## 🔧 Common Development Tasks

### Adding a New PG Field
1. Update database schema in `backend/database.py` (CREATE TABLE)
2. Update `PGCreateRequest` in `backend/models.py`
3. Update form in the frontend registration page
4. Update display in PG detail page

### Modifying Agent Behavior
1. Edit `SYSTEM_PROMPT` in `backend/agent.py`
2. Restart backend to test

### Fixing Frontend-Backend Connection
1. Ensure `BACKEND_URL` in `.env` matches actual backend
2. Check `api.ts` uses correct endpoint paths
3. Verify CORS is configured on backend

---

## 🎯 Quick Start for New Session

1. **Read this file** - You're already doing it! ✅
2. **Check .env** - Verify `OPENROUTER_API_KEY` is set
3. **Start backend** - `cd backend && python -m uvicorn main:app --reload --port 8000`
4. **Start frontend** - `cd frontend_react && npm run dev`
5. **Test login** - Use admin account or create new one
6. **Test chat** - Go to "Find a PG", chat with AI
7. **Check results** - (Note: this may not show PGs yet — see pre-launch checklist)

---

## 📅 Last Updated
May 22, 2026
