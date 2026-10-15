import sqlite3
import os
from typing import Optional


DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(DB_DIR, "pg_agent.db")


def _get_conn() -> sqlite3.Connection:
    """Return a connection with row_factory set."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create tables if they don't exist."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pg_listings (
            id                  TEXT PRIMARY KEY,
            owner_name          TEXT NOT NULL,
            pg_name             TEXT NOT NULL,
            phone               TEXT NOT NULL,
            address             TEXT NOT NULL,
            area                TEXT NOT NULL,
            city                TEXT NOT NULL DEFAULT 'Hyderabad',
            latitude            REAL,
            longitude           REAL,

            rent_single_ac      INTEGER,
            rent_single_nonac   INTEGER,
            rent_double_ac      INTEGER,
            rent_double_nonac   INTEGER,
            rent_triple_ac      INTEGER,
            rent_triple_nonac   INTEGER,
            rent_four_ac        INTEGER,
            rent_four_nonac     INTEGER,

            advance_months      INTEGER NOT NULL DEFAULT 2,
            advance_fixed       INTEGER,
            advance_note        TEXT,

            electricity         TEXT NOT NULL,
            electricity_fixed   INTEGER,
            electricity_note    TEXT,

            rooms_available     INTEGER NOT NULL DEFAULT 0,
            total_rooms         INTEGER NOT NULL,
            gender              TEXT NOT NULL,

            food_included       INTEGER NOT NULL DEFAULT 0,
            food_type           TEXT,
            food_note           TEXT,

            wifi                INTEGER NOT NULL DEFAULT 0,
            ac_available        INTEGER NOT NULL DEFAULT 0,
            parking             INTEGER NOT NULL DEFAULT 0,
            laundry             INTEGER NOT NULL DEFAULT 0,
            gym                 INTEGER NOT NULL DEFAULT 0,
            hot_water           INTEGER NOT NULL DEFAULT 1,
            attached_bathroom   INTEGER NOT NULL DEFAULT 0,
            cctv                INTEGER NOT NULL DEFAULT 0,

            curfew_time         TEXT,
            visitors_allowed    INTEGER NOT NULL DEFAULT 0,
            cooking_allowed     INTEGER NOT NULL DEFAULT 0,
            pets_allowed        INTEGER NOT NULL DEFAULT 0,

            description         TEXT,
            nearby_landmarks    TEXT,
            created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active           INTEGER NOT NULL DEFAULT 1
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id      TEXT PRIMARY KEY,
            messages        TEXT DEFAULT '[]',
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Add messages column if upgrading from old schema
    try:
        cursor.execute("ALTER TABLE sessions ADD COLUMN messages TEXT DEFAULT '[]'")
    except sqlite3.OperationalError:
        pass  # Column already exists

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            pg_id           TEXT NOT NULL,
            tenant_name     TEXT NOT NULL,
            rating          INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment         TEXT,
            cleanliness     INTEGER CHECK(cleanliness >= 1 AND cleanliness <= 5),
            maintenance     INTEGER CHECK(maintenance >= 1 AND maintenance <= 5),
            owner_behavior  INTEGER CHECK(owner_behavior >= 1 AND owner_behavior <= 5),
            value_for_money INTEGER CHECK(value_for_money >= 1 AND value_for_money <= 5),
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pg_id) REFERENCES pg_listings(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            email           TEXT UNIQUE NOT NULL,
            password_hash   TEXT NOT NULL,
            name            TEXT NOT NULL,
            phone           TEXT,
            role            TEXT NOT NULL DEFAULT 'tenant',
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login      TIMESTAMP,
            is_active       INTEGER NOT NULL DEFAULT 1
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS visitors (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            page_url        TEXT NOT NULL,
            user_id         INTEGER,
            ip_address      TEXT,
            device_type     TEXT,
            referrer        TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # FIX: Track which PGs a student contacts — needed for conversion tracking
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pg_contacts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id  TEXT NOT NULL,
            pg_id       TEXT NOT NULL,
            contacted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pg_id) REFERENCES pg_listings(id)
        )
    """)

    conn.commit()
    conn.close()
    _seed_admin()


def _seed_admin() -> None:
    """Seed hardcoded admin account if it doesn't exist."""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    admin_email = os.getenv("ADMIN_EMAIL", "sanjaybukka28@gmail.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "BukkaSandhyaRani2409")

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
    if cursor.fetchone() is None:
        password_hash = pwd_context.hash(admin_password)
        cursor.execute("""
            INSERT INTO users (email, password_hash, name, phone, role, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        """, (admin_email, password_hash, "Admin", None, "admin"))
        conn.commit()
        print(f"✓ Admin account created: {admin_email}")
    conn.close()


def _generate_slug(pg_name: str, area: str) -> str:
    """Generate a URL-friendly slug from PG name and area."""
    slug = f"{pg_name}-{area}".lower().replace(" ", "-").replace("_", "-")
    slug = "".join(c if c.isalnum() or c == "-" else "" for c in slug)
    slug = "-".join(word for word in slug.split("-") if word)
    return slug


def insert_pg(pg: dict) -> str:
    """
    Insert a PG listing. Return the generated id.
    FIX: Handle slug collisions by appending a counter suffix.
    Without this, inserting two PGs with the same name+area crashes with UNIQUE constraint error.
    """
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    base_slug = _generate_slug(pg["pg_name"], pg["area"])
    pg_id = base_slug
    counter = 1
    while True:
        cursor.execute("SELECT id FROM pg_listings WHERE id = ?", (pg_id,))
        if not cursor.fetchone():
            break
        pg_id = f"{base_slug}-{counter}"
        counter += 1

    cursor.execute("""
        INSERT INTO pg_listings (
            id, owner_name, pg_name, phone, address, area, city,
            latitude, longitude,
            rent_single_ac, rent_single_nonac, rent_double_ac, rent_double_nonac,
            rent_triple_ac, rent_triple_nonac, rent_four_ac, rent_four_nonac,
            advance_months, advance_fixed, advance_note,
            electricity, electricity_fixed, electricity_note,
            rooms_available, total_rooms, gender,
            food_included, food_type, food_note,
            wifi, ac_available, parking, laundry, gym, hot_water, attached_bathroom, cctv,
            curfew_time, visitors_allowed, cooking_allowed, pets_allowed,
            description, nearby_landmarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        pg_id, pg.get("owner_name"), pg.get("pg_name"), pg.get("phone"),
        pg.get("address"), pg.get("area"), pg.get("city", "Hyderabad"),
        pg.get("latitude"), pg.get("longitude"),
        pg.get("rent_single_ac"), pg.get("rent_single_nonac"),
        pg.get("rent_double_ac"), pg.get("rent_double_nonac"),
        pg.get("rent_triple_ac"), pg.get("rent_triple_nonac"),
        pg.get("rent_four_ac"), pg.get("rent_four_nonac"),
        pg.get("advance_months", 2), pg.get("advance_fixed"), pg.get("advance_note"),
        pg.get("electricity"), pg.get("electricity_fixed"), pg.get("electricity_note"),
        pg.get("rooms_available", 0), pg.get("total_rooms"),
        pg.get("gender"),
        1 if pg.get("food_included") else 0, pg.get("food_type"), pg.get("food_note"),
        1 if pg.get("wifi") else 0, 1 if pg.get("ac_available") else 0,
        1 if pg.get("parking") else 0, 1 if pg.get("laundry") else 0,
        1 if pg.get("gym") else 0, 1 if pg.get("hot_water", True) else 0,
        1 if pg.get("attached_bathroom") else 0, 1 if pg.get("cctv") else 0,
        pg.get("curfew_time"), 1 if pg.get("visitors_allowed") else 0,
        1 if pg.get("cooking_allowed") else 0, 1 if pg.get("pets_allowed") else 0,
        pg.get("description"), pg.get("nearby_landmarks")
    ))

    conn.commit()
    conn.close()
    return pg_id


def get_all_active_pgs() -> list[dict]:
    """
    Return all active PG listings.
    FIX: Removed duplicate definition (was defined twice — lines 216 and 475).
    The second one didn't filter by is_active=1, which meant inactive/deleted PGs
    could show up in search results and stats.
    """
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pg_listings WHERE is_active = 1 ORDER BY pg_name")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def search_pgs(filters: dict) -> list[dict]:
    """
    Search PGs with filters.
    FIX 1: Gender filter now handles case-insensitive matching.
            Agent sends 'Male'/'Female', DB may store 'male'/'female'/'Male'/'Female'/'Any'/'any'.
    FIX 2: Added support for 'amenities' list key from agent
            (agent sends {"amenities": ["wifi", "ac", "parking"]} but old code ignored this key entirely).
    FIX 3: Added 'min_rent' filter support.
    """
    conn = _get_conn()
    cursor = conn.cursor()

    query = "SELECT * FROM pg_listings WHERE is_active = 1"
    params = []

    # FIX: case-insensitive gender matching
    if filters.get("gender"):
        gender = filters["gender"].lower()
        if gender not in ("any", ""):
            query += " AND (LOWER(gender) = ? OR LOWER(gender) = 'any')"
            params.append(gender)

    if filters.get("max_rent"):
        max_rent = filters["max_rent"]
        query += """ AND (
            (rent_single_ac IS NOT NULL AND rent_single_ac <= ?) OR
            (rent_single_nonac IS NOT NULL AND rent_single_nonac <= ?) OR
            (rent_double_ac IS NOT NULL AND rent_double_ac <= ?) OR
            (rent_double_nonac IS NOT NULL AND rent_double_nonac <= ?) OR
            (rent_triple_ac IS NOT NULL AND rent_triple_ac <= ?) OR
            (rent_triple_nonac IS NOT NULL AND rent_triple_nonac <= ?) OR
            (rent_four_ac IS NOT NULL AND rent_four_ac <= ?) OR
            (rent_four_nonac IS NOT NULL AND rent_four_nonac <= ?)
        )"""
        params.extend([max_rent] * 8)

    if filters.get("food_type"):
        query += " AND (LOWER(food_type) = LOWER(?) OR LOWER(food_type) = 'both') AND food_included = 1"
        params.append(filters["food_type"])

    if filters.get("area"):
        query += " AND LOWER(area) LIKE LOWER(?)"
        params.append(f"%{filters['area']}%")

    if filters.get("room_type"):
        room_type = filters["room_type"].lower()
        if room_type == "single":
            query += " AND (rent_single_ac IS NOT NULL OR rent_single_nonac IS NOT NULL)"
        elif room_type == "double":
            query += " AND (rent_double_ac IS NOT NULL OR rent_double_nonac IS NOT NULL)"
        elif room_type == "triple":
            query += " AND (rent_triple_ac IS NOT NULL OR rent_triple_nonac IS NOT NULL)"
        elif room_type in ("four", "4"):
            query += " AND (rent_four_ac IS NOT NULL OR rent_four_nonac IS NOT NULL)"

    # FIX: Handle 'amenities' list ["wifi", "ac", "parking", "laundry", "gym",
    #      "hot_water", "attached_bathroom", "cctv", "food"]
    amenities = filters.get("amenities", [])
    amenity_col_map = {
        "wifi": "wifi",
        "ac": "ac_available",
        "parking": "parking",
        "laundry": "laundry",
        "gym": "gym",
        "hot_water": "hot_water",
        "attached_bathroom": "attached_bathroom",
        "cctv": "cctv",
        "food": "food_included",
    }
    for amenity in amenities:
        col = amenity_col_map.get(amenity.lower())
        if col:
            query += f" AND {col} = 1"

    # Also handle individual boolean amenity keys (backward compat)
    for amenity, col in amenity_col_map.items():
        if filters.get(amenity) is True and amenity not in amenities:
            query += f" AND {col} = 1"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_pg_by_id(pg_id: str) -> Optional[dict]:
    """Return single PG by id."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pg_listings WHERE id = ?", (pg_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_pg_details_text(pg_id: str) -> str:
    """Return a formatted text summary of a PG for the agent to read."""
    pg = get_pg_by_id(pg_id)
    if not pg:
        return f"PG with ID '{pg_id}' not found."

    details = f"""PG Name: {pg['pg_name']}
Owner: {pg['owner_name']}
Phone: {pg['phone']}
Address: {pg['address']}, {pg['area']}, {pg['city']}

ROOMS & PRICING:"""

    rooms = []
    for label, key in [
        ("Single AC", "rent_single_ac"), ("Single Non-AC", "rent_single_nonac"),
        ("Double AC", "rent_double_ac"), ("Double Non-AC", "rent_double_nonac"),
        ("Triple AC", "rent_triple_ac"), ("Triple Non-AC", "rent_triple_nonac"),
        ("Four-sharing AC", "rent_four_ac"), ("Four-sharing Non-AC", "rent_four_nonac"),
    ]:
        if pg.get(key):
            rooms.append(f"  • {label}: ₹{pg[key]}/month")
    details += "\n" + ("\n".join(rooms) if rooms else "  • Pricing not available")

    details += f"\n\nAVAILABILITY:\n  • {pg['rooms_available']} of {pg['total_rooms']} rooms available\n  • For: {pg['gender']}"

    details += "\n\nADVANCE:\n"
    if pg.get("advance_fixed"):
        details += f"  • Fixed: ₹{pg['advance_fixed']}"
    else:
        details += f"  • {pg['advance_months']} months rent"
    if pg.get("advance_note"):
        details += f"\n  • Note: {pg['advance_note']}"

    elec = pg.get("electricity", "")
    if elec == "included":
        details += "\n\nELECTRICITY:\n  • ✅ Included in rent"
    elif elec == "extra_fixed":
        details += f"\n\nELECTRICITY:\n  • ⚡ Extra (₹{pg.get('electricity_fixed', '?')}/month fixed)"
    else:
        details += "\n\nELECTRICITY:\n  • ⚡ Extra (actual usage, split among occupants)"
    if pg.get("electricity_note"):
        details += f"\n  • Note: {pg['electricity_note']}"

    amenities = []
    for label, key in [
        ("WiFi", "wifi"), ("AC", "ac_available"), ("Parking", "parking"),
        ("Laundry", "laundry"), ("Gym", "gym"), ("Hot Water", "hot_water"),
        ("Attached Bathroom", "attached_bathroom"), ("CCTV", "cctv"),
    ]:
        if pg.get(key):
            amenities.append(label)
    details += "\n\nAMENITIES:\n  • " + (", ".join(amenities) if amenities else "Basic only")

    if pg.get("food_included"):
        details += f"\n\nFOOD:\n  • Included ({pg.get('food_type') or 'type not specified'})"
        if pg.get("food_note"):
            details += f"\n  • {pg['food_note']}"

    details += "\n\nRULES:"
    details += f"\n  • Curfew: {pg['curfew_time'] if pg.get('curfew_time') else 'None'}"
    details += f"\n  • Visitors: {'Allowed' if pg.get('visitors_allowed') else 'Not allowed'}"
    details += f"\n  • Cooking: {'Allowed' if pg.get('cooking_allowed') else 'Not allowed'}"
    details += f"\n  • Pets: {'Allowed' if pg.get('pets_allowed') else 'Not allowed'}"

    if pg.get("description"):
        details += f"\n\nDESCRIPTION:\n  {pg['description']}"
    if pg.get("nearby_landmarks"):
        details += f"\n\nNEARBY:\n  {pg['nearby_landmarks']}"

    return details.strip()


def add_review(pg_id: str, tenant_name: str, rating: int, comment: str = None,
               cleanliness: int = None, maintenance: int = None,
               owner_behavior: int = None, value_for_money: int = None) -> int:
    """Add a review for a PG. Return review id."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reviews (pg_id, tenant_name, rating, comment, cleanliness, maintenance, owner_behavior, value_for_money)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (pg_id, tenant_name, rating, comment, cleanliness, maintenance, owner_behavior, value_for_money))
    conn.commit()
    review_id = cursor.lastrowid
    conn.close()
    return review_id


def get_reviews(pg_id: str) -> list[dict]:
    """Get all reviews for a PG."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reviews WHERE pg_id = ? ORDER BY created_at DESC", (pg_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_pg_rating_summary(pg_id: str) -> dict:
    """Get average rating and count for a PG."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            ROUND(AVG(rating), 1), COUNT(*),
            ROUND(AVG(cleanliness), 1), ROUND(AVG(maintenance), 1),
            ROUND(AVG(owner_behavior), 1), ROUND(AVG(value_for_money), 1)
        FROM reviews WHERE pg_id = ?
    """, (pg_id,))
    row = cursor.fetchone()
    conn.close()

    if row and row[1] > 0:
        return {
            "avg_rating": row[0] or 0,
            "total_reviews": row[1],
            "avg_cleanliness": row[2] or 0,
            "avg_maintenance": row[3] or 0,
            "avg_owner_behavior": row[4] or 0,
            "avg_value_for_money": row[5] or 0,
        }
    return {"avg_rating": 0, "total_reviews": 0, "avg_cleanliness": 0,
            "avg_maintenance": 0, "avg_owner_behavior": 0, "avg_value_for_money": 0}


# ==================== USER AUTHENTICATION ====================

def create_user(email: str, password_hash: str, name: str = None, phone: str = None, role: str = "tenant") -> int:
    """Create a new user."""
    conn = _get_conn()
    cursor = conn.cursor()
    user_name = name or email.split("@")[0]
    cursor.execute("""
        INSERT INTO users (email, password_hash, name, phone, role, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
    """, (email, password_hash, user_name, phone, role))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return user_id


def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? AND is_active = 1", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id) -> Optional[dict]:
    """Get user by ID. Accepts int or str."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ? AND is_active = 1", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_last_login(user_id: int) -> None:
    """Update user's last login timestamp."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()


def get_all_users() -> list:
    """Get all users (admin only)."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, name, phone, role, created_at, last_login FROM users ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


# ==================== CONTACT TRACKING ====================

def log_pg_contact(session_id: str, pg_id: str) -> None:
    """
    Record that a student clicked 'Contact' on a PG.
    This is the key metric for proving value to PG owners.
    """
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO pg_contacts (session_id, pg_id) VALUES (?, ?)
    """, (session_id, pg_id))
    conn.commit()
    conn.close()


def get_pg_contact_count(pg_id: str) -> int:
    """Return number of student contacts for a PG (for owner dashboard)."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM pg_contacts WHERE pg_id = ?", (pg_id,))
    count = cursor.fetchone()[0]
    conn.close()
    return count


# ==================== VISITOR TRACKING ====================

def log_visitor(page_url: str, user_id=None, ip_address: str = None,
                device_type: str = None, referrer: str = None) -> int:
    """Log a site visitor."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO visitors (page_url, user_id, ip_address, device_type, referrer)
        VALUES (?, ?, ?, ?, ?)
    """, (page_url, user_id, ip_address, device_type, referrer))
    conn.commit()
    visitor_id = cursor.lastrowid
    conn.close()
    return visitor_id


def get_visitor_stats() -> dict:
    """Get visitor analytics."""
    conn = _get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM visitors")
    total_visitors = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT ip_address) FROM visitors")
    unique_visitors = cursor.fetchone()[0]

    cursor.execute("""
        SELECT page_url, COUNT(*) as count
        FROM visitors GROUP BY page_url ORDER BY count DESC LIMIT 10
    """)
    pages = [{"page": row[0], "count": row[1]} for row in cursor.fetchall()]

    cursor.execute("SELECT device_type, COUNT(*) as count FROM visitors GROUP BY device_type")
    devices = [{"device": row[0] or "Unknown", "count": row[1]} for row in cursor.fetchall()]

    cursor.execute("SELECT COUNT(*) FROM visitors WHERE DATE(timestamp) = DATE('now')")
    today_visitors = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM visitors WHERE user_id IS NOT NULL")
    logged_in = cursor.fetchone()[0]

    conn.close()
    return {
        "total_visitors": total_visitors,
        "unique_visitors": unique_visitors,
        "today_visitors": today_visitors,
        "logged_in_visitors": logged_in,
        "anonymous_visitors": total_visitors - logged_in,
        "top_pages": pages,
        "devices": devices,
    }


def get_recent_visitors(limit: int = 20) -> list:
    """Get recent visitors with user info if available."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT v.*, u.name, u.email
        FROM visitors v
        LEFT JOIN users u ON v.user_id = u.id
        ORDER BY v.timestamp DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


# ==================== SESSION PERSISTENCE ====================

import json as _json

def save_session_messages(session_id: str, messages: list) -> None:
    """Save chat messages for a session to the database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO sessions (session_id, messages, last_active)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(session_id) DO UPDATE SET
            messages = ?,
            last_active = CURRENT_TIMESTAMP
    """, (session_id, _json.dumps(messages), _json.dumps(messages)))
    conn.commit()
    conn.close()


def load_session_messages(session_id: str) -> list:
    """Load chat messages for a session from the database."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT messages FROM sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    if row and row["messages"]:
        try:
            return _json.loads(row["messages"])
        except (_json.JSONDecodeError, TypeError):
            return []
    return []


def delete_session_messages(session_id: str) -> None:
    """Delete a session from the database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()