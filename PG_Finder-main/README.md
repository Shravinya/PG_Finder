# 🏠 PG Finder - AI-Powered Accommodation Search

**Find the perfect paying guest accommodation in Hyderabad instantly.**

An intelligent two-sided marketplace powered by conversational AI:
- **Tenants** 🧑‍💼: Chat naturally to find PGs matching your budget, location, and preferences
- **Owners** 🏢: Register your PG in 2 minutes with detailed pricing and amenities

---

## 🎯 Why PG Finder?

| Feature | Traditional Sites | PG Finder |
|---------|------------------|-----------|
| **Search Experience** | Scroll through 100s of listings | Chat naturally with AI |
| **Filters** | Rigid checkboxes | Smart conversation-based search |
| **Pricing Details** | AC/Non-AC prices scattered | Clear breakdown per room type |
| **Location** | Address-only | See on interactive map |
| **Electricity Terms** | Usually hidden | Explicit for every PG |

---

## 🚀 Quick Start

### For Users (Tenants)

1. **Open the app:**
   ```bash
   cd frontend && streamlit run app.py
   ```
   App runs on `http://localhost:8501`

2. **Find a PG:**
   - Click "Find a PG"
   - Chat with PG Buddy: "I need a PG in Gachibowli, ₹5k-10k budget, male, with WiFi"
   - See results on the map and list
   - ❤️ Bookmark favorites

3. **Quick Filters:**
   - Use sidebar filters (Area, Budget, AC, WiFi, Food)
   - Or chat naturally for personalized results

### For Owners (PG Managers)

1. **Register your PG:**
   - Click "List Your PG"
   - Fill in basic info (name, address, contact)
   - Add room-wise pricing (Single/Double/Triple/4-Sharing × AC/Non-AC)
   - Specify advance, electricity terms
   - Add amenities and rules

2. **Your PG appears:**
   - Instantly searchable by tenants
   - Show on map with all details
   - Featured in natural chat results

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10+
- `pip`

### Step 1: Clone & Install
```bash
git clone https://github.com/YOUR/pg-finder.git
cd pg-finder
pip install -r requirements.txt
```

### Step 2: Configure API
```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
# Get free key: https://openrouter.ai
```

### Step 3: Seed Sample Data
```bash
python scripts/seed.py
```
This creates 10 sample PGs in Hyderabad for testing.

### Step 4: Run Backend (Terminal 1)
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
Backend runs on `http://localhost:8000`

### Step 5: Run Frontend (Terminal 2)
```bash
cd frontend
python -m streamlit run app.py
```
Frontend runs on `http://localhost:8501`

---

## 📊 Tech Stack

**Backend:**
- `FastAPI` - RESTful API with 7 endpoints
- `SQLite` - Local database (auto-initialized)
- `LangGraph` - Agent tools (search, filter, details, pricing)
- `OpenRouter API` - Conversational LLM (free tier available)

**Frontend:**
- `Streamlit` - 2-page interactive UI
- `Folium` - Interactive map integration
- `OpenStreetMap Nominatim` - Free geocoding (no API key)

**Geocoding:**
- `Haversine distance` - Calculate nearby PGs (pure Python)
- `Nominatim API` - Convert address → lat/lng

---

## 📁 Project Structure

```
pg-finder/
├── backend/
│   ├── main.py                 # FastAPI app (7 endpoints)
│   ├── agent.py                # Conversational agent
│   ├── tools.py                # 4 search tools
│   ├── database.py             # SQLite operations
│   ├── geocoding.py            # Address-to-coords
│   └── models.py               # Pydantic schemas
├── frontend/
│   └── app.py                  # Streamlit UI (2 pages)
├── scripts/
│   └── seed.py                 # Sample data (10 PGs)
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🔧 API Endpoints

### Health & Sessions
- `GET /` - Health check
- `GET /new-session` - Create new chat session

### Chat
- `POST /chat` - Send message to AI agent
  - Input: `message`, `session_id`, optional: `user_lat`, `user_lon`
  - Output: AI response with PG recommendations

### PG Management
- `POST /pg/register` - Register a new PG
- `GET /pg/list` - Get all active PGs
- `GET /pg/{pg_id}` - Get single PG details
- `DELETE /session/{session_id}` - Clear chat history

---

## 💬 Conversation Examples

### Example 1: Budget Search
```
User: "Hi, I'm looking for a PG in Gachibowli"
Bot:  "Nice! What's your budget range and gender preference?"
User: "Male PG, around ₹7000/month"
Bot:  [Executes search_pgs with filters]
      "Found 3 PGs! Here are the best matches..."
```

### Example 2: Location-Based
```
User: "Show me PGs near the tech park"
Bot:  [Uses find_nearby_pgs tool]
      "3 PGs within 3km: Tech Residency (200m), Gachibowli Elite (1.2km)..."
```

### Example 3: Pricing Details
```
User: "Tell me about the costs for Gachibowli Elite?"
Bot:  [Executes get_pricing_summary]
      "💰 Single AC: ₹10,000  |  Double AC: ₹9,000"
      "Advance: 2 months  |  Electricity: ₹1,000/month"
```

---

## 🎨 Features

### Tenant Features
✅ Natural language search  
✅ Interactive map with PG markers  
✅ ❤️ Save favorite PGs  
✅ Quick sidebar filters  
✅ Detailed pricing breakdown  
✅ Electricity & advance terms  
✅ Multi-turn conversation memory  
✅ Leave reviews & ratings (⭐⭐⭐⭐⭐)  
✅ View reviews from other tenants  
✅ Filter by ratings on analytics dashboard  

### Owner Features
✅ Quick 2-minute registration  
✅ Room-wise pricing (AC/Non-AC)  
✅ Advance payment terms  
✅ Electricity cost transparency  
✅ Amenities & rules listing  
✅ Auto-geocoding of address  
✅ Instant visibility to tenants  
✅ Monitor ratings & reviews  
✅ Track on analytics dashboard  

### Platform Features
✅ AI-powered conversational search  
✅ Platform analytics & statistics  
✅ Top-rated PGs ranking  
✅ Area popularity insights  
✅ Price range tracking  
✅ User reviews & ratings system  

---

## 📖 Documentation

- **[START.md](START.md)** - 5-minute quick start guide
- **[SPEC.md](SPEC.md)** - Complete technical specification
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[TESTING.md](TESTING.md)** - Complete testing scenarios
- **[test_app.py](test_app.py)** - Automated test suite

---

## 📊 Database Schema

### pg_listings (58 columns)
- **Core**: id, owner_name, pg_name, phone, address, area, city
- **Coordinates**: latitude, longitude
- **Pricing**: rent_single_ac, rent_single_nonac, rent_double_ac, etc. (8 room types)
- **Advance**: advance_months, advance_fixed, advance_note
- **Electricity**: electricity, electricity_fixed, electricity_note
- **Availability**: rooms_available, total_rooms, gender
- **Food**: food_included, food_type, food_note
- **Amenities**: wifi, ac_available, parking, laundry, gym, hot_water, attached_bathroom, cctv
- **Rules**: curfew_time, visitors_allowed, cooking_allowed, pets_allowed
- **Meta**: description, nearby_landmarks, created_at, is_active

---

## 🛠️ Future Enhancements

- [x] ✅ Ratings & reviews from tenants
- [x] ✅ Platform analytics & statistics
- [ ] Owner verification & trust score
- [ ] Multi-city expansion (Delhi, Bangalore, etc.)
- [ ] Mobile app (React Native)
- [ ] Email notifications for new listings
- [ ] Payment integration for premium listings
- [ ] Admin dashboard with user management

---

## 📝 License

Open source. Use freely for learning & commercial purposes.

---

## 🤝 Contributing

Found a bug? Have suggestions? Submit an issue or PR!

---

## 📧 Support

Questions? Reach out to:
- 📍 Issues: GitHub Issues
- 💬 Chat: In-app support

Happy finding! 🏠

├── scripts/
│   └── seed.py        # Sample data
├── SPEC.md            # Full technical specification
└── requirements.txt
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/new-session` | Get session ID |
| POST | `/chat` | Send message to agent |
| POST | `/pg/register` | Register new PG |
| GET | `/pg/list` | All active PGs |
| GET | `/pg/{id}` | Single PG details |
| DELETE | `/session/{id}` | Clear chat history |