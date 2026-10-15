# PG Finder Agent — Complete Specification
> VSCode agent reference doc. Read fully before writing any code.

---

## Project Overview

A two-sided web app:
- **PG Owners** fill an onboarding form → their PG is stored in DB
- **Tenants** chat with an AI agent → get matching PGs based on requirements + location

**Stack:** Python · FastAPI · LangGraph · Gemini 1.5 Flash · SQLite · Streamlit · Folium · OpenStreetMap Nominatim

**All free. No paid APIs.**

---

## Project Structure

```
pg-agent/
├── backend/
│   ├── main.py          # FastAPI app, all endpoints
│   ├── agent.py         # LangGraph agent, session memory
│   ├── tools.py         # All 4 agent tools
│   ├── database.py      # SQLite schema + all DB operations
│   ├── geocoding.py     # Address → lat/lng via Nominatim (free OSM)
│   └── models.py        # Pydantic request/response models
├── frontend/
│   └── app.py           # Streamlit UI — chat + map + PG cards + owner form
├── scripts/
│   └── seed.py          # Insert 10 sample Hyderabad PGs for testing
├── .env.example         # GOOGLE_API_KEY=your_key_here
├── requirements.txt
└── README.md
```

---

## Database Schema — SQLite (`pg_agent.db`)

### Table: `pg_listings`

```sql
CREATE TABLE IF NOT EXISTS pg_listings (
    id                  TEXT PRIMARY KEY,        -- slug: "green-valley-pg-ameerpet"
    owner_name          TEXT NOT NULL,
    pg_name             TEXT NOT NULL,
    phone               TEXT NOT NULL,
    address             TEXT NOT NULL,           -- full street address
    area                TEXT NOT NULL,           -- neighbourhood: "Ameerpet", "KPHB"
    city                TEXT NOT NULL DEFAULT 'Hyderabad',
    latitude            REAL,                    -- geocoded from address
    longitude           REAL,                    -- geocoded from address

    -- Room types and pricing (NULL = not available)
    rent_single_ac      INTEGER,                 -- single room with AC
    rent_single_nonac   INTEGER,                 -- single room without AC
    rent_double_ac      INTEGER,                 -- 2-sharing with AC
    rent_double_nonac   INTEGER,                 -- 2-sharing without AC
    rent_triple_ac      INTEGER,                 -- 3-sharing with AC
    rent_triple_nonac   INTEGER,                 -- 3-sharing without AC
    rent_four_ac        INTEGER,                 -- 4-sharing with AC
    rent_four_nonac     INTEGER,                 -- 4-sharing without AC

    -- Advance / deposit
    advance_months      INTEGER NOT NULL DEFAULT 2,   -- number of months rent as advance
    advance_fixed       INTEGER,                       -- fixed advance amount if not month-based
    advance_note        TEXT,                          -- e.g. "2 months refundable"

    -- Electricity / current bill
    electricity         TEXT NOT NULL,           -- "included", "extra_actual", "extra_fixed"
    electricity_fixed   INTEGER,                 -- monthly fixed amount if extra_fixed
    electricity_note    TEXT,                    -- e.g. "shared equally among occupants"

    -- Availability
    rooms_available     INTEGER NOT NULL DEFAULT 0,
    total_rooms         INTEGER NOT NULL,
    gender              TEXT NOT NULL,           -- "male", "female", "any"

    -- Food
    food_included       INTEGER NOT NULL DEFAULT 0,   -- boolean 0/1
    food_type           TEXT,                          -- "veg", "nonveg", "both", NULL
    food_note           TEXT,                          -- e.g. "breakfast and dinner"

    -- Amenities (boolean 0/1)
    wifi                INTEGER NOT NULL DEFAULT 0,
    ac_available        INTEGER NOT NULL DEFAULT 0,    -- true if ANY AC room exists
    parking             INTEGER NOT NULL DEFAULT 0,
    laundry             INTEGER NOT NULL DEFAULT 0,
    gym                 INTEGER NOT NULL DEFAULT 0,
    hot_water           INTEGER NOT NULL DEFAULT 1,
    attached_bathroom   INTEGER NOT NULL DEFAULT 0,
    cctv                INTEGER NOT NULL DEFAULT 0,

    -- Rules
    curfew_time         TEXT,                    -- "10:00 PM", "No curfew"
    visitors_allowed    INTEGER NOT NULL DEFAULT 0,
    cooking_allowed     INTEGER NOT NULL DEFAULT 0,
    pets_allowed        INTEGER NOT NULL DEFAULT 0,

    -- Meta
    description         TEXT,                    -- owner's free text description
    nearby_landmarks    TEXT,                    -- "Near JNTU metro, 500m from bus stop"
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active           INTEGER NOT NULL DEFAULT 1
);
```

### Table: `sessions`

```sql
CREATE TABLE IF NOT EXISTS sessions (
    session_id      TEXT PRIMARY KEY,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Backend: `database.py`

Implement these functions:

```python
def init_db() -> None
    # Create tables if not exist. Call on app startup.

def insert_pg(pg: dict) -> str
    # Insert a PG listing. Generate slug from pg_name + area.
    # Return the generated id.

def get_all_active_pgs() -> list[dict]
    # Return all rows where is_active=1

def search_pgs(filters: dict) -> list[dict]
    # Filter by: gender, max_rent, food_type, wifi, ac_available, area (case-insensitive)
    # All filters optional. Return matching rows as list of dicts.

def get_pg_by_id(pg_id: str) -> dict | None
    # Return single PG by id

def get_pg_details_text(pg_id: str) -> str
    # Return a formatted text summary of a PG for the agent to read
    # Include all pricing, amenities, rules, electricity, advance info
```

---

## Backend: `geocoding.py`

```python
def geocode_address(address: str, city: str = "Hyderabad") -> tuple[float, float] | None:
    """
    Convert address string to (latitude, longitude) using Nominatim (free, no key needed).
    URL: https://nominatim.openstreetmap.org/search
    Params: q="{address}, {city}", format=json, limit=1
    IMPORTANT: Set User-Agent header to "pg-agent-app/1.0"
    Return None if not found.
    Add 1 second sleep between calls to respect Nominatim rate limit.
    """

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance in kilometers between two coordinates.
    Use the Haversine formula. Pure Python, no external libraries.
    """

def sort_pgs_by_distance(pgs: list[dict], user_lat: float, user_lon: float) -> list[dict]:
    """
    Add 'distance_km' field to each PG dict, sort by distance ascending.
    Skip PGs where latitude or longitude is None.
    """
```

---

## Backend: `tools.py`

Four LangGraph tools. All decorated with `@tool`.

### Tool 1: `search_pgs_tool`
```
Name: search_pgs
Description: Search for PGs based on tenant requirements.
             Use when tenant mentions area, budget, gender, food preference, or amenities.
Input: JSON string with optional keys:
       area (str), max_rent (int), gender (male/female/any),
       food_type (veg/nonveg/both), wifi (bool), ac (bool),
       room_type (single/double/triple/four)
Output: Formatted text listing up to 5 matching PGs with key details.
        Include: pg name, area, price range, available rooms, key amenities.
        If no results: say so and list available areas.
```

### Tool 2: `get_pg_details_tool`
```
Name: get_pg_details
Description: Get complete details of a specific PG.
             Use when tenant asks about a specific PG or wants more info.
Input: pg_id (string)
Output: Full formatted details including all pricing tiers, advance terms,
        electricity terms, amenities, rules, contact.
```

### Tool 3: `nearby_pgs_tool`
```
Name: find_nearby_pgs
Description: Find PGs near a given location.
             Use when tenant shares coordinates or asks for PGs near a place.
Input: JSON string with keys: latitude (float), longitude (float), radius_km (float, default 3.0)
Output: PGs within radius sorted by distance, with distance shown in km.
```

### Tool 4: `get_pricing_summary_tool`
```
Name: get_pricing_summary
Description: Get a clear pricing breakdown for a PG including all room types,
             advance payment, and electricity terms.
             Use when tenant asks about cost, price, advance, deposit, or electricity bill.
Input: pg_id (string)
Output: Structured pricing text covering:
        - All available room types (single/double/triple/four) with AC and non-AC prices
        - Advance: X months or fixed amount + refund policy
        - Electricity: included or extra (with fixed amount if applicable)
        - Minimum monthly cost estimate
```

---

## Backend: `agent.py`

```python
# LangGraph agent with in-memory session store
# State: AgentState with messages: Annotated[list, add_messages]
# Nodes: agent_node, tool_node (ToolNode from langgraph.prebuilt)
# Edges: entry → agent → conditional (tools_condition) → tools → agent → END

SYSTEM_PROMPT = """You are a helpful PG finder assistant for Hyderabad.
Help tenants find paying guest accommodations based on their requirements.

RULES:
1. Always use search_pgs tool when tenant mentions location, budget, or preferences.
2. Use get_pg_details when they ask about a specific PG.
3. Use find_nearby_pgs when tenant shares their location coordinates.
4. Use get_pricing_summary when asked about cost, advance, deposit, or electricity.
5. Be concise. Give top 3 results max unless asked for more.
6. Always mention: price range, advance required, electricity terms when showing results.
7. Remember conversation context — if they said 'budget 6k' earlier, keep that filter.
8. Never make up PG details. Only use what tools return.
9. If no PGs match, suggest relaxing one filter at a time.
"""

# Session store: dict[session_id, list[messages]]
# Keep last 20 messages per session to avoid token overflow
# Export: chat(user_message: str, session_id: str) -> str
# Export: clear_session(session_id: str) -> None
```

LLM config:
```python
ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.environ["GOOGLE_API_KEY"],
    temperature=0.2,
)
```

---

## Backend: `models.py`

```python
# Pydantic v2 models

class PGCreateRequest(BaseModel):
    owner_name: str
    pg_name: str
    phone: str
    address: str
    area: str
    city: str = "Hyderabad"

    rent_single_ac: int | None = None
    rent_single_nonac: int | None = None
    rent_double_ac: int | None = None
    rent_double_nonac: int | None = None
    rent_triple_ac: int | None = None
    rent_triple_nonac: int | None = None
    rent_four_ac: int | None = None
    rent_four_nonac: int | None = None

    advance_months: int = 2
    advance_fixed: int | None = None
    advance_note: str | None = None

    electricity: str  # "included" | "extra_actual" | "extra_fixed"
    electricity_fixed: int | None = None
    electricity_note: str | None = None

    rooms_available: int
    total_rooms: int
    gender: str  # "male" | "female" | "any"

    food_included: bool = False
    food_type: str | None = None
    food_note: str | None = None

    wifi: bool = False
    ac_available: bool = False
    parking: bool = False
    laundry: bool = False
    gym: bool = False
    hot_water: bool = True
    attached_bathroom: bool = False
    cctv: bool = False

    curfew_time: str | None = None
    visitors_allowed: bool = False
    cooking_allowed: bool = False
    pets_allowed: bool = False

    description: str | None = None
    nearby_landmarks: str | None = None


class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_lat: float | None = None   # optional: tenant's location
    user_lon: float | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class PGListResponse(BaseModel):
    pgs: list[dict]
    total: int
```

---

## Backend: `main.py`

FastAPI app. Endpoints:

```
GET  /                          → health check {"status": "running"}
GET  /new-session               → {"session_id": uuid4()}
POST /chat                      → ChatRequest → ChatResponse
POST /pg/register               → PGCreateRequest → {"id": pg_id, "message": "..."}
GET  /pg/list                   → list all active PGs (for map display)
GET  /pg/{pg_id}                → single PG details
DELETE /session/{session_id}    → clear session memory
```

CORS: allow all origins.
Call `init_db()` on startup via `@app.on_event("startup")`.
Geocode address automatically in `/pg/register` before saving.

---

## Frontend: `frontend/app.py`

Single Streamlit app with two pages via `st.sidebar` radio:
- **"Find a PG"** — tenant chat interface
- **"List Your PG"** — owner onboarding form

### Find a PG page

Layout:
```
Left column (60%): Chat interface
Right column (40%): Map + PG cards
```

Chat interface:
- `st.session_state` stores: `session_id`, `messages`, `pg_results`
- On first load: call `GET /new-session` to get session_id
- Display chat history with `st.chat_message`
- `st.chat_input` for user input
- On submit: POST to `/chat`, display response
- Show "Share my location" button — use `st.button` + inject JS via `st.components.v1.html` to get browser geolocation coords, store in session state

Map (right column):
- Use `folium` + `streamlit_folium`
- Center on Hyderabad (17.3850, 78.4867) by default
- If tenant shared location: add blue marker for their position
- Add red markers for each PG result
- Popup on each marker: PG name, price range, phone

PG cards below map:
- For each result: show name, area, price range, rooms available, key amenities as chips

### List Your PG page

Streamlit form with all fields from `PGCreateRequest`.
Group fields into sections with `st.expander`:
- Basic Info (name, owner, phone, address, area)
- Room Types & Pricing (table-like layout with AC/non-AC columns)
- Advance & Electricity
- Availability & Gender
- Food
- Amenities (checkboxes in 3 columns)
- Rules
- Additional Info

On submit: POST to `/pg/register`, show success with generated link.

---

## scripts/seed.py

Insert 10 realistic Hyderabad PGs covering:
- Areas: Ameerpet, KPHB, Madhapur, Gachibowli, Kondapur, Kukatpally, Miyapur, Hitech City
- Mix of: male/female/any, veg/nonveg, various price ranges (4k–15k)
- Mix of: electricity included/extra, different advance terms
- All with realistic lat/lng (hardcode these, don't geocode in seed)

---

## requirements.txt

```
fastapi==0.111.0
uvicorn==0.30.1
langchain==0.2.6
langchain-google-genai==1.0.7
langchain-core==0.2.11
langgraph==0.1.19
pydantic==2.7.4
streamlit==1.36.0
folium==0.17.0
streamlit-folium==0.20.0
requests==2.32.3
python-dotenv==1.0.1
```

---

## .env.example

```
GOOGLE_API_KEY=your_gemini_api_key_here
BACKEND_URL=http://localhost:8000
```

Get free Gemini API key: https://aistudio.google.com/app/apikey

---

## How to Run Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set env vars
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# 3. Seed database
cd backend
python ../scripts/seed.py

# 4. Start backend (from /backend)
uvicorn main:app --reload --port 8000

# 5. Start frontend (new terminal, from /frontend)
streamlit run app.py
```

---

## Electricity Field Logic

The `electricity` field has 3 values:
- `"included"` → rent includes electricity, no extra charge
- `"extra_actual"` → tenant pays actual usage (EB bill split)
- `"extra_fixed"` → tenant pays a fixed monthly amount (`electricity_fixed`)

When displaying to tenant, format as:
- included → "✅ Electricity included in rent"
- extra_actual → "⚡ Electricity extra (actual usage)"
- extra_fixed → "⚡ Electricity extra (₹{electricity_fixed}/month fixed)"

---

## Advance Payment Logic

Display advance as:
- If `advance_months` set: "Advance: {advance_months} months rent = ₹{advance_months × monthly_rent}"
- If `advance_fixed` set: "Advance: ₹{advance_fixed} fixed"
- Always append `advance_note` if present

---

## Pricing Display Logic (for tools and UI)

When showing prices to tenant, always show a table:

```
Room Type     | Non-AC      | AC
Single        | ₹5,000/mo   | ₹7,000/mo
2-Sharing     | ₹3,500/mo   | ₹5,000/mo
3-Sharing     | ₹2,800/mo   | ₹4,000/mo
4-Sharing     | N/A         | N/A
```

Show "N/A" for unavailable types. Never show rows where both AC and non-AC are NULL.

---

## Slug Generation

```python
import re
def generate_slug(pg_name: str, area: str) -> str:
    base = f"{pg_name}-{area}".lower()
    slug = re.sub(r'[^a-z0-9]+', '-', base).strip('-')
    return slug  # e.g. "green-valley-pg-ameerpet"
```

If slug already exists in DB, append `-2`, `-3`, etc.

---

## Error Handling Rules

1. If geocoding fails: save PG with `latitude=NULL, longitude=NULL`. Don't block registration.
2. If agent throws: return `"Sorry, I had trouble processing that. Please try again."` — never expose stack traces to frontend.
3. If no PGs found in search: return helpful message listing available areas and price ranges.
4. All DB operations in try/except, log errors.

---

## Key Constraints

- SQLite file path: `backend/pg_agent.db`
- Nominatim rate limit: max 1 request/second — add `time.sleep(1)` between geocode calls
- Gemini free tier: 1500 requests/day — one agent call may use 2-4 requests (tool calls)
- Session memory: in-memory dict, resets on server restart — acceptable for now
- No authentication required for this version