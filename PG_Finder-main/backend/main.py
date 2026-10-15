import os
import sqlite3
from uuid import uuid4
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, Request, Header
from fastapi.middleware.cors import CORSMiddleware

from database import (
    init_db, insert_pg, get_all_active_pgs, get_pg_by_id, search_pgs,
    add_review, get_reviews, get_pg_rating_summary,
    create_user, get_user_by_email, get_user_by_id, update_last_login,
    get_all_users, log_visitor, get_visitor_stats, get_recent_visitors,
    log_pg_contact, get_pg_contact_count,
)
from geocoding import geocode_address
from models import (
    PGCreateRequest, ChatRequest, ChatResponse, PGListResponse,
    ReviewRequest, ReviewResponse, RatingSummary, UserSignupRequest,
    UserLoginRequest, TokenResponse, UserResponse, VisitorStats,
)
from agent import chat, clear_session, get_greeting
from auth import hash_password, verify_password, create_access_token, verify_token

load_dotenv()

app = FastAPI(title="PG Buddy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────
# VISITOR TRACKING MIDDLEWARE
# ─────────────────────────────────────────────────────────────
@app.middleware("http")
async def visitor_tracking_middleware(request: Request, call_next):
    skip_paths = {"/", "/docs", "/openapi.json", "/redoc", "/favicon.ico"}
    if request.url.path not in skip_paths:
        try:
            user_id = None
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1]
                payload = verify_token(token)
                if payload:
                    user_id = payload.get("sub")

            log_visitor(
                page_url=str(request.url.path),
                user_id=user_id,
                ip_address=request.client.host if request.client else None,
                device_type=request.headers.get("user-agent", "")[:100],
                referrer=request.headers.get("referer"),
            )
        except Exception:
            pass  # Never let tracking break a request

    return await call_next(request)


# ─────────────────────────────────────────────────────────────
# AUTH HELPERS
# ─────────────────────────────────────────────────────────────
def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_admin_user(authorization: str = Header(None)) -> dict:
    user = get_current_user(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


# ─────────────────────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    init_db()


# ─────────────────────────────────────────────────────────────
# HEALTH & SESSION
# ─────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "running", "service": "PG Buddy API"}


@app.get("/new-session")
def new_session():
    """Create a new chat session and return the opening greeting."""
    session_id = str(uuid4())
    greeting = get_greeting(session_id)
    return {"session_id": session_id, "greeting": greeting}


# ─────────────────────────────────────────────────────────────
# AUTHENTICATION
# ─────────────────────────────────────────────────────────────
@app.post("/auth/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(request: UserSignupRequest):
    if get_user_by_email(request.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = create_user(
        email=request.email,
        password_hash=hash_password(request.password),
        name=request.name,
        phone=request.phone,
        role="tenant",
    )
    user = get_user_by_id(user_id)
    return {
        "access_token": create_access_token({"sub": str(user_id)}),
        "token_type": "bearer",
        "user": UserResponse(id=user["id"], email=user["email"], name=user["name"],
                             phone=user["phone"], role=user["role"]),
    }


@app.post("/auth/login", response_model=TokenResponse)
def login(request: UserLoginRequest):
    user = get_user_by_email(request.email)
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    update_last_login(user["id"])
    return {
        "access_token": create_access_token({"sub": str(user["id"])}),
        "token_type": "bearer",
        "user": UserResponse(id=user["id"], email=user["email"], name=user["name"],
                             phone=user["phone"], role=user["role"]),
    }


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**{k: current_user[k] for k in ["id", "email", "name", "phone", "role"]})


# ─────────────────────────────────────────────────────────────
# CHAT
# ─────────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    result = chat(request.message, request.session_id)
    return ChatResponse(
        response=result["response"],
        session_id=request.session_id,
        recommendations=result.get("recommendations", []),
    )


@app.delete("/session/{session_id}")
def delete_session(session_id: str):
    clear_session(session_id)
    return {"message": f"Session {session_id} cleared"}


# ─────────────────────────────────────────────────────────────
# PG CONTACT TRACKING
# This is the key metric — tells you how many students contacted each PG.
# Use this data when charging PG owners.
# ─────────────────────────────────────────────────────────────
@app.post("/pg/{pg_id}/contact")
def record_pg_contact(pg_id: str, request: ChatRequest):
    """
    Call this when a student clicks 'Contact this PG' in the chat.
    Tracks intent — your proof of value when monetizing.
    """
    pg = get_pg_by_id(pg_id)
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    log_pg_contact(session_id=request.session_id, pg_id=pg_id)
    return {
        "pg_name": pg["pg_name"],
        "phone": pg["phone"],
        "message": "Contact recorded"
    }


@app.get("/pg/{pg_id}/contacts")
def get_contact_count(pg_id: str, admin: dict = Depends(get_admin_user)):
    """Admin: how many students contacted this PG."""
    return {"pg_id": pg_id, "contact_count": get_pg_contact_count(pg_id)}


# ─────────────────────────────────────────────────────────────
# PG LISTINGS
# ─────────────────────────────────────────────────────────────
@app.post("/pg/register")
def register_pg(pg_data: PGCreateRequest):
    pg_dict = pg_data.model_dump()
    coords = geocode_address(pg_dict["address"], pg_dict.get("city", "Hyderabad"))
    if coords:
        pg_dict["latitude"], pg_dict["longitude"] = coords
    pg_id = insert_pg(pg_dict)
    return {
        "id": pg_id,
        "message": f"PG '{pg_data.pg_name}' registered successfully!",
        "coordinates": coords,
    }


@app.get("/pg/list", response_model=PGListResponse)
def list_pgs():
    pgs = get_all_active_pgs()
    return PGListResponse(pgs=pgs, total=len(pgs))


@app.get("/pg/{pg_id}")
def get_pg(pg_id: str):
    pg = get_pg_by_id(pg_id)
    if not pg:
        raise HTTPException(status_code=404, detail=f"PG '{pg_id}' not found")
    return pg


# ─────────────────────────────────────────────────────────────
# REVIEWS & RATINGS
# ─────────────────────────────────────────────────────────────
@app.post("/review")
def post_review(review_data: ReviewRequest):
    review_id = add_review(
        pg_id=review_data.pg_id,
        tenant_name=review_data.tenant_name,
        rating=review_data.rating,
        comment=review_data.comment,
        cleanliness=review_data.cleanliness,
        maintenance=review_data.maintenance,
        owner_behavior=review_data.owner_behavior,
        value_for_money=review_data.value_for_money,
    )
    return {"id": review_id, "message": "Review posted!"}


@app.get("/reviews/{pg_id}")
def get_pg_reviews(pg_id: str):
    return {"pg_id": pg_id, "reviews": get_reviews(pg_id)}


@app.get("/rating/{pg_id}", response_model=RatingSummary)
def get_rating(pg_id: str):
    return get_pg_rating_summary(pg_id)


# ─────────────────────────────────────────────────────────────
# ADMIN
# ─────────────────────────────────────────────────────────────
@app.post("/admin/pg")
def admin_add_pg(pg_data: dict, admin: dict = Depends(get_admin_user)):
    pg_id = insert_pg(pg_data)
    return {"id": pg_id, "message": "PG added"}


@app.delete("/admin/pg/{pg_id}")
def admin_delete_pg(pg_id: str, admin: dict = Depends(get_admin_user)):
    from database import DB_FILE
    conn = sqlite3.connect(DB_FILE)
    conn.execute("UPDATE pg_listings SET is_active = 0 WHERE id = ?", (pg_id,))
    conn.commit()
    conn.close()
    return {"message": f"PG {pg_id} deactivated"}


@app.get("/admin/visitors", response_model=VisitorStats)
def admin_get_visitors(admin: dict = Depends(get_admin_user)):
    return get_visitor_stats()


@app.get("/admin/recent-visitors")
def admin_get_recent_visitors(limit: int = 20, admin: dict = Depends(get_admin_user)):
    return {"visitors": get_recent_visitors(limit)}


@app.get("/admin/users")
def admin_get_users(admin: dict = Depends(get_admin_user)):
    return {"users": get_all_users()}


# ─────────────────────────────────────────────────────────────
# STATS (public)
# ─────────────────────────────────────────────────────────────
@app.get("/stats")
def get_stats():
    pgs = get_all_active_pgs()
    area_counts: dict[str, int] = {}
    for pg in pgs:
        area_counts[pg["area"]] = area_counts.get(pg["area"], 0) + 1

    top_areas = sorted(area_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    prices = [
        p for pg in pgs
        for p in [pg.get("rent_single_nonac"), pg.get("rent_double_nonac")]
        if p
    ]

    return {
        "total_pgs": len(pgs),
        "total_areas": len(area_counts),
        "top_areas": [{"area": a, "count": c} for a, c in top_areas],
        "price_range": {"min": min(prices, default=0), "max": max(prices, default=0)},
    }


@app.get("/top-rated")
def get_top_rated(limit: int = 5):
    pgs = get_all_active_pgs()
    rated = []
    for pg in pgs:
        r = get_pg_rating_summary(pg["id"])
        if r["total_reviews"] > 0:
            rated.append({"id": pg["id"], "name": pg["pg_name"], "area": pg["area"],
                          "rating": r["avg_rating"], "reviews": r["total_reviews"]})
    rated.sort(key=lambda x: x["rating"], reverse=True)
    return {"top_rated": rated[:limit]}