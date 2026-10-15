import requests
import time
import math
from typing import Optional


def geocode_address(address: str, city: str = "Hyderabad") -> Optional[tuple[float, float]]:
    """
    Convert address string to (latitude, longitude) using Nominatim (free, no key needed).
    Set User-Agent header to "pg-agent-app/1.0".
    Add 1 second sleep between calls to respect Nominatim rate limit.
    Return None if not found.
    """
    time.sleep(1)
    
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{address}, {city}",
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "pg-agent-app/1.0"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        results = response.json()
        
        if results:
            lat = float(results[0]["lat"])
            lon = float(results[0]["lon"])
            return (lat, lon)
        return None
    except Exception as e:
        print(f"Geocoding error for '{address}': {e}")
        return None


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance in kilometers between two coordinates using the Haversine formula.
    Pure Python, no external libraries.
    """
    R = 6371.0
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    
    distance = R * c
    return distance


def sort_pgs_by_distance(pgs: list[dict], user_lat: float, user_lon: float) -> list[dict]:
    """
    Add 'distance_km' field to each PG dict, sort by distance ascending.
    Skip PGs where latitude or longitude is None.
    """
    pgs_with_distance = []
    
    for pg in pgs:
        if pg.get("latitude") is not None and pg.get("longitude") is not None:
            distance = haversine_distance(user_lat, user_lon, pg["latitude"], pg["longitude"])
            pg["distance_km"] = round(distance, 2)
            pgs_with_distance.append(pg)
    
    pgs_with_distance.sort(key=lambda x: x["distance_km"])
    return pgs_with_distance
