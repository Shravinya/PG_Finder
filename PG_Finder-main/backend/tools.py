import json
from langchain_core.tools import tool
from database import search_pgs, get_pg_by_id, get_all_active_pgs, get_pg_details_text
from geocoding import sort_pgs_by_distance


@tool
def search_pgs_tool(filters_json: str) -> str:
    """
    Search for PGs based on tenant requirements.
    Use when tenant mentions area, budget, gender, food preference, or amenities.

    Input: JSON string with optional keys:
           area (str), max_rent (int), gender (Male/Female/Any),
           room_type (single/double/triple/four),
           amenities (list of: wifi, ac, parking, laundry, gym, hot_water, attached_bathroom, cctv, food)
    Output: Formatted text listing up to 5 matching PGs with key details.
    """
    try:
        filters = json.loads(filters_json)
    except (json.JSONDecodeError, TypeError):
        return "Error: Could not parse search filters."

    results = search_pgs(filters)

    if not results:
        # Give the LLM useful context so it can respond helpfully
        all_pgs = get_all_active_pgs()
        areas = sorted(set(pg["area"] for pg in all_pgs))
        return (
            f"No PGs found matching those criteria.\n"
            f"Available areas: {', '.join(areas) if areas else 'None yet'}\n"
            "Try relaxing the filters (e.g. higher budget, different area, fewer amenities)."
        )

    top = results[:5]
    output = f"Found {len(results)} matching PG(s). Top {len(top)}:\n\n"

    for i, pg in enumerate(top, 1):
        # Build price summary — show cheapest available option clearly
        prices = []
        for label, key in [
            ("Single Non-AC", "rent_single_nonac"), ("Single AC", "rent_single_ac"),
            ("Double Non-AC", "rent_double_nonac"), ("Double AC", "rent_double_ac"),
            ("Triple Non-AC", "rent_triple_nonac"), ("Triple AC", "rent_triple_ac"),
            ("4-Share Non-AC", "rent_four_nonac"), ("4-Share AC", "rent_four_ac"),
        ]:
            if pg.get(key):
                prices.append(f"{label}: ₹{pg[key]}")

        price_str = " | ".join(prices) if prices else "Pricing not listed"

        amenities = [
            label for label, key in [
                ("WiFi", "wifi"), ("AC", "ac_available"), ("Parking", "parking"),
                ("Laundry", "laundry"), ("Gym", "gym"), ("Hot Water", "hot_water"),
                ("Attached Bath", "attached_bathroom"), ("CCTV", "cctv"),
            ]
            if pg.get(key)
        ]

        gender_label = "Co-living (all genders)" if pg.get("gender", "").lower() == "any" else pg.get("gender", "?")

        food_str = ""
        if pg.get("food_included"):
            food_str = f" | Food: {pg.get('food_type', 'included')}"

        elec_str = {
            "included": "Electricity included",
            "extra_fixed": f"Electricity ₹{pg.get('electricity_fixed', '?')}/mo extra",
        }.get(pg.get("electricity", ""), "Electricity: actual usage")

        advance_str = (
            f"₹{pg['advance_fixed']} advance" if pg.get("advance_fixed")
            else f"{pg.get('advance_months', 2)} months advance"
        )

        output += (
            f"{i}. {pg['pg_name']} — {pg['area']}\n"
            f"   📍 {pg['address']}\n"
            f"   💰 {price_str}\n"
            f"   🛏  {pg.get('rooms_available', '?')} rooms available | For: {gender_label}{food_str}\n"
            f"   ✨ {', '.join(amenities) if amenities else 'Basic amenities'}\n"
            f"   📋 {advance_str} | {elec_str}\n"
            f"   📞 {pg.get('phone', 'N/A')} | ID: {pg['id']}\n\n"
        )

    if len(results) > 5:
        output += f"(+{len(results) - 5} more results — ask user to narrow down if needed)"

    return output.strip()


@tool
def get_pg_details_tool(pg_id: str) -> str:
    """
    Get complete details of a specific PG by its ID.
    Use when tenant asks for more info about a specific PG.

    Input: pg_id (string) — the ID shown in search results
    Output: Full formatted details including all pricing, amenities, rules, contact.
    """
    pg_id = pg_id.strip()
    return get_pg_details_text(pg_id)


@tool
def find_nearby_pgs_tool(location_json: str) -> str:
    """
    Find PGs near a given GPS location, sorted by distance.
    Use when tenant shares their location or asks for PGs near a specific place.

    Input: JSON with keys: latitude (float), longitude (float), radius_km (float, default 3.0)
    Output: PGs within radius sorted closest-first, with distance in km.
    """
    try:
        location = json.loads(location_json)
    except (json.JSONDecodeError, TypeError):
        return "Error: Could not parse location JSON."

    user_lat = location.get("latitude")
    user_lon = location.get("longitude")
    radius_km = location.get("radius_km", 3.0)

    if user_lat is None or user_lon is None:
        return "Error: Both latitude and longitude are required."

    all_pgs = get_all_active_pgs()
    nearby = sort_pgs_by_distance(all_pgs, user_lat, user_lon)
    nearby = [pg for pg in nearby if pg.get("distance_km", float("inf")) <= radius_km]

    if not nearby:
        return f"No PGs found within {radius_km} km of your location. Try increasing the radius."

    output = f"Found {len(nearby)} PG(s) within {radius_km} km:\n\n"
    for i, pg in enumerate(nearby, 1):
        prices = []
        for key in ["rent_single_nonac", "rent_single_ac", "rent_double_nonac", "rent_double_ac"]:
            if pg.get(key):
                prices.append(f"₹{pg[key]}")
                break  # just show cheapest

        output += (
            f"{i}. {pg['pg_name']} — {pg.get('distance_km', '?')} km away\n"
            f"   📍 {pg['area']}\n"
            f"   💰 From {prices[0] if prices else 'N/A'}/month\n"
            f"   📞 {pg.get('phone', 'N/A')} | ID: {pg['id']}\n\n"
        )
    return output.strip()


@tool
def get_pricing_summary_tool(pg_id: str) -> str:
    """
    Get a clear pricing breakdown for a PG.
    Use when tenant asks about cost, deposit, advance, electricity bill, or total monthly spend.

    Input: pg_id (string)
    Output: All room types with AC/non-AC prices, advance terms, electricity, and minimum monthly cost estimate.
    """
    pg_id = pg_id.strip()
    pg = get_pg_by_id(pg_id)
    if not pg:
        return f"PG with ID '{pg_id}' not found."

    output = f"💰 PRICING — {pg['pg_name']} ({pg['area']})\n{'─'*45}\n"

    min_price = None
    for room_type, ac_key, nonac_key in [
        ("Single",     "rent_single_ac",  "rent_single_nonac"),
        ("Double",     "rent_double_ac",  "rent_double_nonac"),
        ("Triple",     "rent_triple_ac",  "rent_triple_nonac"),
        ("4-Sharing",  "rent_four_ac",    "rent_four_nonac"),
    ]:
        ac = pg.get(ac_key)
        nonac = pg.get(nonac_key)
        if ac or nonac:
            output += f"\n{room_type}:\n"
            if nonac:
                output += f"  Non-AC: ₹{nonac}/month\n"
                if min_price is None or nonac < min_price:
                    min_price = nonac
            if ac:
                output += f"  AC:     ₹{ac}/month\n"
                if min_price is None or ac < min_price:
                    min_price = ac

    output += "\nADVANCE:\n"
    if pg.get("advance_fixed"):
        output += f"  ₹{pg['advance_fixed']} (fixed)\n"
    else:
        output += f"  {pg.get('advance_months', 2)} months of rent\n"
    if pg.get("advance_note"):
        output += f"  Note: {pg['advance_note']}\n"

    output += "\nELECTRICITY:\n"
    elec = pg.get("electricity", "")
    if elec == "included":
        output += "  ✅ Included in rent\n"
        elec_cost = 0
    elif elec == "extra_fixed":
        fixed = pg.get("electricity_fixed", 0) or 0
        output += f"  ⚡ Fixed ₹{fixed}/month extra\n"
        elec_cost = fixed
    else:
        output += "  ⚡ Actual usage (split among roommates)\n"
        elec_cost = 0  # unknown, mention it
    if pg.get("electricity_note"):
        output += f"  Note: {pg['electricity_note']}\n"

    if min_price:
        output += f"\nMINIMUM MONTHLY (cheapest room):\n"
        output += f"  Rent:        ₹{min_price}\n"
        if elec_cost:
            output += f"  Electricity: ₹{elec_cost}\n"
            output += f"  Total:       ₹{min_price + elec_cost}\n"
        elif elec == "metered":
            output += "  + actual electricity usage\n"
        else:
            output += f"  Total:       ₹{min_price}\n"

    return output.strip()