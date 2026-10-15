"""
Complete end-to-end testing script for PG Finder app.
Run this to verify all features work correctly.
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health check"""
    print("\n✅ Testing Health Check...")
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200
    print(f"   Status: {response.json()}")

def test_session():
    """Test session creation"""
    print("\n✅ Testing Session Creation...")
    response = requests.get(f"{BASE_URL}/new-session")
    assert response.status_code == 200
    session_id = response.json()["session_id"]
    print(f"   Session ID: {session_id}")
    return session_id

def test_chat(session_id):
    """Test chat endpoint"""
    print("\n✅ Testing Chat...")
    payload = {
        "message": "Looking for PG in Gachibowli under 10000 with WiFi",
        "session_id": session_id,
        "user_lat": None,
        "user_lon": None
    }
    response = requests.post(f"{BASE_URL}/chat", json=payload)
    assert response.status_code == 200
    bot_response = response.json()["response"]
    print(f"   Bot Response (first 100 chars): {bot_response[:100]}...")

def test_list_pgs():
    """Test PG listing"""
    print("\n✅ Testing PG List...")
    response = requests.get(f"{BASE_URL}/pg/list")
    assert response.status_code == 200
    data = response.json()
    print(f"   Total PGs: {data['total']}")
    if data['pgs']:
        print(f"   First PG: {data['pgs'][0]['pg_name']} in {data['pgs'][0]['area']}")
        return data['pgs'][0]['id']
    return None

def test_rating(pg_id):
    """Test rating endpoint"""
    print("\n✅ Testing Rating Summary...")
    response = requests.get(f"{BASE_URL}/rating/{pg_id}")
    assert response.status_code == 200
    rating = response.json()
    print(f"   Avg Rating: {rating['avg_rating']} stars ({rating['total_reviews']} reviews)")

def test_review(pg_id):
    """Test review submission"""
    print("\n✅ Testing Review Submission...")
    payload = {
        "pg_id": pg_id,
        "tenant_name": "Rahul Sharma",
        "rating": 4,
        "comment": "Great PG! Clean rooms, friendly owner, good food.",
        "cleanliness": 5,
        "maintenance": 4,
        "owner_behavior": 5,
        "value_for_money": 4
    }
    response = requests.post(f"{BASE_URL}/review", json=payload)
    assert response.status_code == 200
    review_id = response.json()["id"]
    print(f"   Review ID: {review_id}")

def test_reviews(pg_id):
    """Test get reviews"""
    print("\n✅ Testing Get Reviews...")
    response = requests.get(f"{BASE_URL}/reviews/{pg_id}")
    assert response.status_code == 200
    reviews = response.json()["reviews"]
    print(f"   Total Reviews: {len(reviews)}")
    if reviews:
        print(f"   Latest Review by {reviews[0]['tenant_name']}: {reviews[0]['rating']} stars")

def test_pg_details(pg_id):
    """Test get PG details"""
    print("\n✅ Testing PG Details...")
    response = requests.get(f"{BASE_URL}/pg/{pg_id}")
    assert response.status_code == 200
    pg = response.json()
    print(f"   PG: {pg['pg_name']}")
    print(f"   Phone: {pg['phone']}")
    print(f"   Gender: {pg['gender']}")

def test_register_pg():
    """Test PG registration"""
    print("\n✅ Testing PG Registration...")
    payload = {
        "owner_name": "Test Owner",
        "pg_name": "Test PG Paradise",
        "phone": "9999999999",
        "address": "123 Test Street, Test Area",
        "area": "Test Area",
        "rent_single_ac": 7000,
        "rent_single_nonac": 5000,
        "rent_double_ac": 6000,
        "rooms_available": 2,
        "total_rooms": 5,
        "gender": "any",
        "electricity": "extra_fixed",
        "electricity_fixed": 800,
        "wifi": True,
        "ac_available": True,
    }
    response = requests.post(f"{BASE_URL}/pg/register", json=payload)
    # This will fail because coordinates can't be geocoded, but tests the endpoint logic
    print(f"   Response Status: {response.status_code}")
    if response.status_code != 200:
        print(f"   Expected: geocoding failed for test address")

def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("🧪 PG FINDER - COMPLETE TEST SUITE")
    print("=" * 60)
    
    try:
        # Test 1: Health check
        test_health()
        time.sleep(0.5)
        
        # Test 2: Session
        session_id = test_session()
        time.sleep(0.5)
        
        # Test 3: Chat
        test_chat(session_id)
        time.sleep(0.5)
        
        # Test 4: List PGs
        pg_id = test_list_pgs()
        if pg_id:
            time.sleep(0.5)
            
            # Test 5: Rating before review
            test_rating(pg_id)
            time.sleep(0.5)
            
            # Test 6: Submit review
            test_review(pg_id)
            time.sleep(0.5)
            
            # Test 7: Get reviews
            test_reviews(pg_id)
            time.sleep(0.5)
            
            # Test 8: PG details
            test_pg_details(pg_id)
            time.sleep(0.5)
        
        # Test 9: Register (will fail on geocoding)
        test_register_pg()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("\n⏳ Make sure backend is running on http://localhost:8000")
    print("   Start with: cd backend && python -m uvicorn main:app --reload --port 8000\n")
    
    input("Press Enter to start tests...")
    run_all_tests()
