# PG Finder - Frontend Redesign Brief for Next.js

## Design Questions & Answers for UI/UX Team

---

## 1️⃣ Core Purpose (One Sentence)

**"A conversational AI-powered marketplace where tenants find the perfect paying guest (PG) accommodations through natural chat-based discovery, and PG owners list their properties to reach qualified renters."**

---

## 2️⃣ Target Users

### Primary Users
- **Tenants/Students** (Age 18-30)
  - Looking for PG accommodations in Hyderabad
  - Prefer convenience over complex filtering
  - Want personalized recommendations
  - First-time renters who don't know what they need

- **PG Owners/Managers** (Age 30-60)
  - Want to list their properties easily
  - Need to reach qualified tenants quickly
  - Want to manage listings and see analytics
  - May use mobile or desktop

### Secondary Users
- **Admin/Platform Manager**
  - Manages PG listings and activations
  - Monitors platform analytics
  - Tracks visitor behavior
  - Manages reviews and disputes

### User Segments NOT Targeted
- ❌ Real estate agents (competing product)
- ❌ Luxury apartment seekers (premium properties)
- ❌ Commercial property managers

---

## 3️⃣ ALL Pages/Views in the Application

### A. Public Pages (No Auth Required)
1. **Landing Page** (Not yet built, needed for marketing)
   - Hero section: "Find Your Perfect PG in Minutes"
   - Quick value proposition
   - CTA: "Start Searching" / "List Your PG"
   - Maybe features overview, testimonials

### B. Authentication Pages
2. **Login Page**
   - Email & password fields
   - "Sign Up" link
   - Remember me (optional)
   - Forgot password (future feature)

3. **Signup Page**
   - Email field
   - Password field
   - Optional: Name & Phone
   - "I'm registering as" radio: Tenant / PG Owner
   - Terms & conditions checkbox

### C. Tenant-Specific Pages
4. **Find a PG** (Main page after login)
   - Left side: Chat interface (60% width)
   - Right side: Map + Recommendations (40% width)
   - Navigation sidebar

5. **PG Details Page** (From clicking a recommendation)
   - Full PG information (58 fields)
   - Photo gallery (future)
   - Reviews & ratings section
   - Booking/Contact button
   - Save to favorites button

6. **Favorites/Saved PGs**
   - List of bookmarked PGs
   - Quick view cards
   - Bulk actions (email, compare)

### D. PG Owner Pages
7. **List Your PG** (Registration Form)
   - Multi-step form (or long single form)
   - Section 1: Basic info (name, area, address)
   - Section 2: Pricing (8 room types)
   - Section 3: Amenities (checkboxes)
   - Section 4: Rules (visitors, cooking, pets)
   - Section 5: Description & photos
   - Preview & submit

8. **Manage My Listings**
   - Table/cards of owner's PGs
   - Edit, activate, deactivate buttons
   - View inquiries/interest
   - View reviews for each PG

### E. Analytics Pages
9. **Analytics Dashboard** (Public)
   - Platform statistics
   - Top-rated PGs
   - Popular areas
   - Trends

10. **Admin Analytics** (Admin-only)
    - Visitor tracking
    - User signup trends
    - PG registration trends
    - Review activity
    - Export reports

### F. Other Pages
11. **User Profile**
    - Edit profile info
    - Change password
    - View my activity
    - Download data (GDPR)

12. **Admin Panel**
    - PG management (activate/deactivate)
    - User management (suspend, delete)
    - Review moderation
    - Visitor analytics
    - System settings

### G. Utility Pages
13. **About Page**
    - Company info
    - How it works
    - Contact us

14. **Terms & Conditions**

15. **Privacy Policy**

### Summary: **12-15 total pages** (7 active, 8 future/admin)

---

## 4️⃣ Chat/Agent Interface Details

### Type & Structure
- ✅ **Single Chat Thread** (not multi-session in UI, but session-based in backend)
- ✅ **One Thread Per User Session** (when they click "Find a PG")
- ✅ **Persistent Within Session** (cleared only when user logs out or starts fresh)
- ❌ **NOT Multi-thread** (no "start new search" - just one continuous conversation)

### What Gets Shown to User
- ✅ **Final Answers Only** (polished text responses)
- ❌ **NO Tool Calls Visible** (JSON actions hidden from user)
- ❌ **NO Thinking Steps** (no "searching database...", no intermediate thinking)
- ❌ **NO Function Execution** (no "calling search_pgs with filters...")

**Why Hidden?** 
- Better UX: Feels like talking to a human, not a robot
- Non-technical users get confused by technical details
- Faster perceived response (no loading states between steps)

### Input Types
- ✅ **Text Input Only** (main interface)
- ❌ **NO Voice Input** (can add later)
- ❌ **NO File Uploads** (can add later for PG photos)
- ❌ **NO Image Recognition** (can add later)

### Output Types
- ✅ **Text Messages** (agent responses with emojis)
- ✅ **PG Cards/Results** (structured recommendations shown separately)
- ✅ **Map** (locations marked)
- ✅ **Reviews** (star ratings + comments)
- ❌ **NO Code Blocks** (not a developer tool)
- ❌ **NO Tables** (results shown as cards)
- ❌ **NO Charts** (except in analytics)

### Agent Behavior
```
Flow:
1. Agent greets: "Hi! What's your name?"
2. User answers: "John"
3. Agent asks Q2: "Which area?"
4. User answers: "Gachibowli"
5. Agent asks Q3: "Budget?"
6. User answers: "8000"
... (continues through 6 questions)
7. Agent: "Great! Let me search..." [SEARCHES BACKEND]
8. Agent: "Found perfect PGs for you!"
9. Results appear on right side with cards
10. User clicks card to see details OR asks follow-ups
```

### Key UX Elements
- ✅ Message bubbles (user on right, agent on left)
- ✅ Typing indicators ("PG Buddy is typing...")
- ✅ Emoji usage (makes it friendly)
- ✅ Clear question format (Q2: "Which area?")
- ✅ Context maintained (remembers earlier answers)
- ✅ Scrollable chat history
- ✅ Suggested quick-reply buttons (optional, not in current version)

---

## 5️⃣ Current Streamlit UI Layout & Description

### **Find a PG Page (Main Page After Login)**

```
┌─────────────────────────────────────────────────────────┐
│  🏠 PG Finder                                   [Profile] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  LEFT SIDE (60%)          │  RIGHT SIDE (40%)           │
│                           │                             │
│  💬 Chat with PG Buddy    │  🗺️ View on Map             │
│  ┌─────────────────────┐  │  ┌──────────────────────┐  │
│  │ Agent: "Hi! I'm PG  │  │  │                      │  │
│  │ Buddy. What's your  │  │  │   [MAP]              │  │
│  │ name?"              │  │  │                      │  │
│  │                     │  │  └──────────────────────┘  │
│  │ User: "John"        │  │                             │
│  │                     │  │  📋 Recommendations         │
│  │ Agent: "Nice, John! │  │  ┌──────────────────────┐  │
│  │ Which area?"        │  │  │ 🏢 Green Valley PG   │  │
│  │                     │  │  │ 📍 Gachibowli        │  │
│  │ User: "Gachibowli"  │  │  │ 💰 8000/month        │  │
│  │                     │  │  │ ⭐ 4.5 (12 reviews)  │  │
│  │ Agent: "Budget?"    │  │  │ 📶 WiFi • ❄️ AC      │  │
│  │                     │  │  └──────────────────────┘  │
│  │ User: "8000"        │  │                             │
│  │                     │  │  [More PG Cards...]         │
│  │ [Scrollable...]     │  │                             │
│  └─────────────────────┘  │                             │
│                           │                             │
│  📝 Your answer...        │                             │
│  [Text Input Field]───────┤                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Components Breakdown

#### Left Side - Chat Interface (60% width)
- **Header:** "💬 Chat with PG Buddy"
- **Chat Container:** 
  - Scrollable message list
  - Max height: 500px
  - Border around it
  - Messages styled as bubbles
  - Agent (left, light background)
  - User (right, blue background)
- **Input Field:** 
  - Text input at bottom
  - Placeholder: "Your answer..."
  - Auto-focus
  - Send on Enter or button click

#### Right Side - Map + Recommendations (40% width)
- **Map Section:**
  - Title: "🗺️ View on Map"
  - Folium map embedded
  - Shows Hyderabad center (generic)
  - Blue marker for "Your location"
  - Zoom level: 12
  - Size: 500px width, 350px height

- **Recommendations Section:**
  - Title: "📋 Recommendations"
  - Shows only AFTER user starts chatting
  - Displays top 3 matching PGs
  - Each as collapsible card (expandable)

#### Card Details (For Each PG)
```
🏢 Green Valley PG - Ameerpet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Phone: 9876543210
📍 Address: 123 MG Road, Ameerpet
👥 Gender: Male
🛏️ Rooms Available: 3

💰 Pricing:
├─ Single AC: ₹8000
├─ Single Non-AC: ₹6000
├─ Double AC: ₹12000
└─ Double Non-AC: ₹10000

📶 Amenities:
📶 WiFi • ❄️ AC • 🚗 Parking • 🧺 Laundry

⚡ Advance: 2 months
💡 Electricity: Included

📝 About:
"Beautiful, spacious rooms with good ventilation..."

[❤️ Save] [👁️ Details] [💬 Reviews]
```

### Navigation Sidebar (Not Visible in Screenshot, But Exists)
```
🏠 PG Finder
────────────────
🔍 Find a PG          ← Current page
📝 List Your PG
📊 Analytics
🔐 Login / [Your Name]
```

### Key UI Characteristics (Streamlit)
- **Color Scheme:** Streamlit default (blue primary)
- **Typography:** System fonts (no custom fonts)
- **Responsiveness:** Very limited, designed for desktop
- **Mobile:** Poor mobile experience
- **Emojis:** Heavy use (friendly, but looks casual)
- **Styling:** Minimal, functional
- **Layout:** Sidebar + main content
- **State Management:** Streamlit session_state

---

## 6️⃣ Backend API Endpoints

### Base URL: `http://localhost:8000`

### Authentication Endpoints
```
POST /auth/signup
├─ Request: { email, password, name?, phone? }
├─ Response (201): { access_token, token_type, user }
└─ Status: ✅ Working

POST /auth/login
├─ Request: { email, password }
├─ Response (200): { access_token, token_type, user }
└─ Status: ✅ Working
```

### Chat Endpoints
```
GET /new-session
├─ Request: (no body)
├─ Response (200): { session_id: "uuid" }
└─ Status: ✅ Working

POST /chat
├─ Request: { message, session_id, user_lat?, user_lon? }
├─ Response (200): { response: "text", session_id }
├─ Timeout: 40s
└─ Status: ✅ Working
```

### PG Listing Endpoints
```
GET /pg/list
├─ Request: (no params)
├─ Response (200): { pgs: [...], total: N }
└─ Status: ✅ Working

GET /pg/{pg_id}
├─ Request: pg_id in path
├─ Response (200): { pg_name, area, pricing, ... all 58 fields }
└─ Status: ✅ Working

POST /pg/register
├─ Request: { owner_name, pg_name, area, pricing, amenities, ... }
├─ Response (201): { id, pg_name, ... }
├─ Authorization: Requires JWT token
└─ Status: ✅ Working

POST /admin/pg
├─ Request: { pg_id, is_active: boolean }
├─ Response (200): { message: "updated" }
├─ Authorization: Admin token required
└─ Status: ✅ Working
```

### Review Endpoints
```
POST /review
├─ Request: { pg_id, tenant_name, rating, cleanliness, maintenance, owner_behavior, value_for_money, comment }
├─ Response (201): { id, message }
├─ Authorization: Optional (can be anonymous)
└─ Status: ✅ Working

GET /reviews/{pg_id}
├─ Request: pg_id in path
├─ Response (200): { reviews: [ { tenant_name, rating, comment, ... } ] }
└─ Status: ✅ Working

GET /rating/{pg_id}
├─ Request: pg_id in path
├─ Response (200): { overall_rating, count, avg_cleanliness, ... }
└─ Status: ✅ Working
```

### Analytics Endpoints
```
GET /stats
├─ Request: (no auth)
├─ Response (200): { total_pgs, total_users, avg_rating, ... }
└─ Status: ✅ Working

GET /top-rated
├─ Request: (no auth)
├─ Response (200): { pgs: [ top 10 PGs by rating ] }
└─ Status: ✅ Working

GET /admin/visitors
├─ Request: (no params)
├─ Response (200): { stats: { total_visitors, today, this_week }, recent: [...] }
├─ Authorization: Admin token required
└─ Status: ✅ Working
```

### Health Check
```
GET /
├─ Response (200): { status: "running" }
└─ Status: ✅ Working
```

### Total: 15 endpoints all working ✅

---

## 7️⃣ Authentication System

### Type: **Email + Password with JWT**

### Flow
```
1. User enters email & password on signup
2. Backend hashes password with bcrypt
3. User record created in database
4. User can immediately login
5. On login, JWT token issued
6. Token sent with every request (Authorization header)
7. Token validates user identity
```

### Implementation Details
- **Hashing:** bcrypt (library: passlib[bcrypt]==1.7.4)
- **Tokens:** JWT (library: python-jose[cryptography]==3.3.0)
- **Secret Key:** Stored in .env file
- **Token Expiry:** Configurable (not yet implemented, infinite)
- **Session Storage:** Streamlit session_state on frontend

### Login Page (Current)
```
┌─────────────────────────────┐
│        🏠 PG Finder         │
│                             │
│  Find your perfect PG       │
│                             │
│ ◉ Login   ○ Sign Up        │
│                             │
│ Email: [____________]       │
│ Password: [____________]    │
│                             │
│ [🔓 Login Button]          │
│                             │
│ No account? [Sign Up]      │
└─────────────────────────────┘
```

### Signup Page (Current)
```
┌─────────────────────────────┐
│        🏠 PG Finder         │
│                             │
│  Create your account        │
│                             │
│ ○ Login   ◉ Sign Up        │
│                             │
│ Email: [____________]       │
│ Password: [____________]    │
│                             │
│ [✅ Create Account]         │
│                             │
│ Already have account?       │
│ [Login]                     │
└─────────────────────────────┘
```

### Auth State (Streamlit)
```python
st.session_state = {
    'token': 'eyJhbGc...',  # JWT token
    'user': {
        'id': 1,
        'email': 'user@example.com',
        'name': 'John',
        'phone': '9876543210',
        'role': 'tenant'  # or 'admin'
    }
}
```

---

## 8️⃣ Top 3 Most Important User Actions

### 1. **Search for PG via Chat** (60% of user time)
- User logs in
- Goes to "Find a PG"
- Has conversation with PG Buddy
- Answers 6 questions
- Sees personalized recommendations
- Clicks on PGs to see details
- **Why Critical:** This is the core value - finding PG through conversation

### 2. **View PG Details & Reviews** (20% of user time)
- Click on a PG recommendation
- See full details (all 58 fields)
- Read reviews and ratings
- See amenities and pricing clearly
- Save to favorites
- Contact owner (future)
- **Why Critical:** Decision-making point, need full information

### 3. **List a PG** (15% of user time for owners)
- Click "List Your PG"
- Fill out 58-field form
- Add photos (future)
- Set pricing for 8 room types
- Specify amenities & rules
- Get it live
- **Why Critical:** Revenue side of marketplace, needs to be easy

### 4. (Bonus) **Leave Reviews** (5% of user time)
- Click "Leave Review" on PG card
- Rate 5 stars + 4 subcategories (cleanliness, maintenance, owner behavior, value)
- Write comment
- Submit
- **Why Critical:** Community trust, helps future renters

---

## 9️⃣ Features to Highlight on Landing Page

### Hero Section
- **Headline:** "Find Your Perfect PG in Minutes, Not Days"
- **Subheading:** "Just chat with our AI. No complex forms. No endless scrolling."
- **CTA Buttons:** 
  - "Start Searching Now" (for tenants)
  - "List Your PG" (for owners)

### Value Propositions (3-4 key points)
```
✨ AI-Powered Search
   "Answer 6 simple questions, get perfect matches"
   
⚡ Fast & Easy
   "No filtering, no complexity. Just conversation."
   
🏠 Trusted Community
   "Verified reviews from real tenants"
   
💬 Real People
   "Chat with our assistant, find your home"
```

### Social Proof
- Number of PGs listed
- Number of happy users
- Average rating of PGs
- Testimonials from users

### How It Works (3-step flow)
```
1️⃣ CHAT
   "Tell us what you need"
   [Screenshot of chat]

2️⃣ DISCOVER
   "Get personalized recommendations"
   [Screenshot of PG cards]

3️⃣ CONNECT
   "Contact owners and move in"
   [Screenshot of details page]
```

### Secondary CTA Areas
- "Browse All PGs" (explore without searching)
- "See Top-Rated PGs"
- "Learn More About How It Works"

### Trust Elements
- "1000+ PGs Listed" (stat)
- "5000+ Happy Users" (stat)
- "Average Rating: 4.5/5" (stat)
- User testimonial quotes
- Press mentions (future)

---

## 🔟 Core Value Proposition - What Makes This Different

### **The Problem:**
Traditional PG search is broken:
- ❌ Endless scrolling through static listings
- ❌ Complex filter options users don't understand
- ❌ Need to fill out long forms just to search
- ❌ Can't ask questions about specific needs
- ❌ No personalization, same results for everyone
- ❌ Difficult for first-time renters

### **The Solution - PG Finder's Difference:**

#### 1. **AI-Powered Conversational Search** (Unique)
- Not a traditional search engine
- Feel like talking to a knowledgeable friend
- Agent understands context across entire conversation
- Can follow-up and refine
- **Competitors:** None doing this for PGs yet

#### 2. **Zero Learning Curve**
- No filters to figure out
- No complex UI to learn
- Just answers natural questions
- Works for tech-savvy and non-tech users equally
- **Competitors:** Traditional sites have steep UX

#### 3. **Structured Discovery Process**
- 6-question flow ensures we capture all needs
- Not relying on user to remember what matters
- Covers: budget, area, gender, amenities, rules, preferences
- Results are highly relevant because full picture understood
- **Competitors:** Basic filters miss context

#### 4. **Speed of Discovery**
- Find perfect matches in 2-3 minutes
- Not 30+ minutes scrolling
- Recommendations appear instantly after questions
- Fast path from awareness → decision
- **Competitors:** Zillow, 99acres take 20+ mins

#### 5. **Community Trust (Reviews)**
- 5-star rating + 4 subcategories (cleanliness, maintenance, owner behavior, value)
- Not just overall rating
- Helps tenants make better decisions
- Helps owners improve
- **Competitors:** Generic reviews not specific to PGs

#### 6. **Ease for Owners**
- List PG in minutes, not hours
- 58 fields but guided form
- No tech skills needed
- Instant visibility to potential tenants
- **Competitors:** Real estate sites require technical knowledge

#### 7. **Mobile-First (Future)**
- Currently desktop-focused
- Mobile version will revolutionize casual browsing
- Voice input (future) for hands-free searching
- **Competitors:** Most PG sites not mobile-optimized

### **Target Market Advantage:**
- **Primary:** Students & young professionals (age 18-30)
  - Tech-savvy
  - Value convenience
  - First-time renters (need guidance)
  - Prefer chat over forms
  
- **Secondary:** PG owners
  - Easy listing
  - Reach qualified tenants
  - Community feedback through reviews

### **Why It Wins:**
```
Traditional Sites          vs        PG Finder
─────────────────────────────────────────────────
100+ filters              →    Just answer 6 questions
30+ mins to decide        →    2-3 mins to find match
Confusing UX              →    Feels like talking to friend
Generic listings          →    AI-ranked recommendations
No context                →    Full conversation context
Static search             →    Dynamic agent interaction
Complex for owners        →    Easy PG registration
No guidance               →    Structured Q&A process
```

### **Market Opportunity:**
- **Hyderabad PG Market:** ~50,000 active PGs
- **Annual Renters:** ~200,000 students/young professionals
- **Addressable Market:** Everyone searching for PGs
- **Growth:** AI adoption in property search (emerging)
- **Timeline:** Pre-market for AI-based PG discovery (2026)

---

## Summary Table for Design Team

| Aspect | Details |
|--------|---------|
| **App Type** | AI-Powered Marketplace |
| **Primary Use** | Conversational PG search |
| **Pages** | 12-15 (7 active, rest future) |
| **Chat Type** | Single thread, 6-question flow |
| **Main Output** | PG recommendation cards |
| **Auth** | Email/password + JWT |
| **Target Users** | Tenants (18-30), PG Owners |
| **Tech Stack (Current)** | FastAPI + Streamlit + SQLite |
| **Tech Stack (Target)** | FastAPI + Next.js + PostgreSQL |
| **API Endpoints** | 15 (all working) |
| **Key Differentiator** | AI chat instead of filters |
| **Design Priority** | Mobile-friendly, clean, modern |

---

## Recommended Next Steps for UI Design

1. **Create Wireframes** for all 12 pages
2. **Design Chat UI** - Most important, focus here first
3. **Build Component Library** (buttons, cards, inputs, etc.)
4. **Create Responsive Layouts** for mobile + desktop
5. **Design Transitions** and micro-interactions
6. **Create Design System** (colors, typography, spacing)
7. **Get user feedback** on chat interface prototype
8. **Iterate** based on actual user testing

---

**Last Updated:** May 19, 2026  
**For:** UI/UX Design Team - PG Finder Next.js Redesign  
**Status:** ✅ Complete & Ready for Design Phase
