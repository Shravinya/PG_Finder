from pydantic import BaseModel


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

    electricity: str
    electricity_fixed: int | None = None
    electricity_note: str | None = None

    rooms_available: int
    total_rooms: int
    gender: str

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
    user_lat: float | None = None
    user_lon: float | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    recommendations: list[str] = []


class PGListResponse(BaseModel):
    pgs: list[dict]
    total: int


class ReviewRequest(BaseModel):
    pg_id: str
    tenant_name: str
    rating: int  # 1-5
    comment: str | None = None
    cleanliness: int | None = None  # 1-5
    maintenance: int | None = None  # 1-5
    owner_behavior: int | None = None  # 1-5
    value_for_money: int | None = None  # 1-5


class ReviewResponse(BaseModel):
    id: int
    pg_id: str
    tenant_name: str
    rating: int
    comment: str | None
    cleanliness: int | None
    maintenance: int | None
    owner_behavior: int | None
    value_for_money: int | None
    created_at: str


class RatingSummary(BaseModel):
    avg_rating: float
    total_reviews: int
    avg_cleanliness: float
    avg_maintenance: float
    avg_owner_behavior: float
    avg_value_for_money: float


# ==================== AUTHENTICATION ====================

class UserSignupRequest(BaseModel):
    email: str
    password: str
    name: str | None = None
    phone: str | None = None


class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: str | None
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class AdminUser(BaseModel):
    id: int
    email: str
    name: str
    phone: str | None
    role: str
    created_at: str
    last_login: str | None


# ==================== VISITOR TRACKING ====================

class VisitorStats(BaseModel):
    total_visitors: int
    unique_visitors: int
    today_visitors: int
    logged_in_visitors: int
    anonymous_visitors: int
    top_pages: list
    devices: list


class RecentVisitor(BaseModel):
    timestamp: str
    page_url: str
    ip_address: str | None
    device_type: str | None
    name: str | None
    email: str | None
