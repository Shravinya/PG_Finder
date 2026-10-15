import os
import json
import re
import requests
import time
from dotenv import load_dotenv

from tools import search_pgs_tool, get_pg_details_tool, find_nearby_pgs_tool, get_pricing_summary_tool
from database import save_session_messages, load_session_messages, delete_session_messages

load_dotenv()

# ─────────────────────────────────────────────────────────────────────────────
# SYSTEM PROMPT
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are PG Buddy, a friendly assistant helping students and working professionals find PGs in Hyderabad.

## PERSONALITY
- Warm, casual, conversational — like a knowledgeable local friend, not a corporate bot
- Keep replies short and snappy. No walls of text.
- Natural Indian English is fine — "no issues", "sure thing", "sounds good" all work
- Max one emoji per message. Never use emojis inside bullet lists.
- Never use fake opener phrases: "Certainly!", "Of course!", "Great question!", "Absolutely!"

## YOUR GOAL
Collect exactly 3 things naturally in conversation, then search:
  1. Area  — where they want to stay, or infer from college/office they mention
  2. Budget — max monthly rent in rupees
  3. Gender — always ask "Men's PG or women's?" — NEVER assume from name or context

Collect naturally. Don't interrogate. One question at a time if needed.
If they give area + budget in one message, just ask gender next and search immediately after.

## RULES — FOLLOW EXACTLY
- Once you have area + budget + gender → call search_pgs RIGHT AWAY. No extra questions.
- NEVER invent PG names, prices, or details. You have zero PG knowledge. All data comes from tools.
- NEVER ask about room type, AC, amenities, or food BEFORE the first search. Search first, refine after.
- NEVER show raw tool output to the user.
- NEVER recommend more than 3 PGs at once.
- If search returns no results → say so honestly, suggest relaxing budget or area, offer to search again.

## AFTER SEARCH RESULTS
Pick the top 3 that best match what the user told you. For each one:
- Mention the name and area
- Mention price (cheapest available room type)
- Say briefly WHY it fits — connect it to what they told you (budget, area, food preference, etc.)
Keep it conversational, not a formal report.
End with: "Want full details or pricing on any of these?"

## FOLLOW-UP TOOL USE
- User asks "tell me more about [PG name or number]" → call get_pg_details with its ID
- User asks "what's the total cost / pricing" → call get_pricing_summary with its ID
- User shares location → call find_nearby_pgs with coordinates
- User asks to search again with new filters → call search_pgs again with updated filters

## STRICT API EFFICIENCY RULES
- ONE tool call per user turn MAXIMUM. Never chain tools automatically.
- After search_pgs returns results, STOP and present them. Do NOT auto-call get_pg_details.
- Only call a second tool if the USER explicitly asks for it in their message.
- If search returns results, present them directly from the tool output. Do not say "let me try again".
"""

# ─────────────────────────────────────────────────────────────────────────────
# TOOL DEFINITIONS
# ─────────────────────────────────────────────────────────────────────────────
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_pgs",
            "description": (
                "Search for PGs in Hyderabad by area, budget, and gender. "
                "Call this as soon as you have all three. Do not delay."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "area": {
                        "type": "string",
                        "description": "Neighbourhood or area name in Hyderabad, e.g. 'Madhapur', 'Kukatpally'"
                    },
                    "max_rent": {
                        "type": "number",
                        "description": "Maximum monthly rent in INR"
                    },
                    "gender": {
                        "type": "string",
                        "enum": ["Male", "Female"],
                        "description": "Men's PG or women's PG"
                    },
                    "amenities": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional amenities: wifi, food, gym, ac, parking, laundry, cctv, hot_water"
                    },
                },
                "required": ["area", "max_rent", "gender"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_pg_details",
            "description": "Get complete details for a specific PG by ID. Use when user asks for more info on a PG.",
            "parameters": {
                "type": "object",
                "properties": {
                    "pg_id": {
                        "type": "string",
                        "description": "PG ID exactly as returned in search results"
                    },
                },
                "required": ["pg_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "find_nearby_pgs",
            "description": "Find PGs near a GPS location, sorted by distance. Use when user shares their location.",
            "parameters": {
                "type": "object",
                "properties": {
                    "latitude":  {"type": "number"},
                    "longitude": {"type": "number"},
                    "radius_km": {
                        "type": "number",
                        "description": "Search radius in km. Default 3."
                    },
                },
                "required": ["latitude", "longitude"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_pricing_summary",
            "description": (
                "Get a full pricing breakdown for a PG: all room types, advance deposit, "
                "electricity charges, and estimated total monthly cost."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "pg_id": {"type": "string"},
                },
                "required": ["pg_id"],
            },
        },
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# LANGCHAIN TOOL MAP
#
# CRITICAL: LangChain registers tools using the function name, which includes
# the "_tool" suffix (e.g. "search_pgs_tool"). But the TOOLS definitions above
# tell the model to call them as "search_pgs", "get_pg_details", etc. (no suffix).
# So _tools_map must accept BOTH forms, otherwise _execute_tool gets None back
# and silently fails — causing the model to hallucinate PG names instead.
# ─────────────────────────────────────────────────────────────────────────────
_tools_list = [search_pgs_tool, get_pg_details_tool, find_nearby_pgs_tool, get_pricing_summary_tool]

# Build map with both "search_pgs_tool" (LangChain name) and "search_pgs" (model call name)
_tools_map: dict = {}
for t in _tools_list:
    _tools_map[t.name] = t                          # e.g. "search_pgs_tool"
    _tools_map[t.name.removesuffix("_tool")] = t    # e.g. "search_pgs"

# Valid tool names — used by the text-format fallback parser (no suffix form)
_VALID_TOOL_NAMES = {"search_pgs", "get_pg_details", "find_nearby_pgs", "get_pricing_summary"}

# ─────────────────────────────────────────────────────────────────────────────
# SESSION STORE
# ─────────────────────────────────────────────────────────────────────────────
_session_store: dict[str, list] = {}
MAX_HISTORY_MESSAGES = 30

# ─────────────────────────────────────────────────────────────────────────────
# GROQ API CONFIG
# ─────────────────────────────────────────────────────────────────────────────
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL   = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")


# ─────────────────────────────────────────────────────────────────────────────
# TEXT-FORMAT TOOL CALL FALLBACK PARSER
#
# Groq's llama-3.3-70b-versatile sometimes ignores the structured tool_calls
# API and instead writes tool calls as plain text in one of these formats:
#
#   Format A (most common):
#     <function=search_pgs>{"area": "Gachibowli", "max_rent": 8000, "gender": "Male"}</function>
#
#   Format B:
#     <tool_call>{"name": "search_pgs", "arguments": {...}}</tool_call>
#
# This parser detects both, extracts tool name + args, and returns them so the
# chat loop can execute them properly — exactly like a structured tool_call.
# ─────────────────────────────────────────────────────────────────────────────
def _parse_text_tool_calls(content: str) -> tuple[list[dict], str]:
    """
    Scan `content` for text-embedded tool calls.

    Returns:
        (tool_calls, cleaned_content)
        tool_calls      — list of dicts with keys: name, arguments (dict), id
        cleaned_content — content with all tool-call markup stripped out
    """
    found   = []
    cleaned = content

    # ── Format A: <function=TOOLNAME>{...}</function> ──
    pattern_a = re.compile(
        r'<function=([a-zA-Z_]+)>(.*?)</function>',
        re.DOTALL
    )
    for match in pattern_a.finditer(content):
        tool_name = match.group(1).strip()
        raw_args  = match.group(2).strip()
        if tool_name not in _VALID_TOOL_NAMES:
            continue
        try:
            arguments = json.loads(raw_args)
        except json.JSONDecodeError:
            arguments = {}
        found.append({
            "id":        f"text_call_{len(found)}",
            "name":      tool_name,
            "arguments": arguments,
        })
        cleaned = cleaned.replace(match.group(0), "").strip()

    # ── Format B: <tool_call>{"name": ..., "arguments": {...}}</tool_call> ──
    pattern_b = re.compile(
        r'<tool_call>(.*?)</tool_call>',
        re.DOTALL
    )
    for match in pattern_b.finditer(content):
        raw = match.group(1).strip()
        try:
            obj       = json.loads(raw)
            tool_name = obj.get("name", "")
            arguments = obj.get("arguments", obj.get("parameters", {}))
            if tool_name not in _VALID_TOOL_NAMES:
                continue
            found.append({
                "id":        f"text_call_{len(found)}",
                "name":      tool_name,
                "arguments": arguments,
            })
            cleaned = cleaned.replace(match.group(0), "").strip()
        except json.JSONDecodeError:
            continue

    # Clean up leftover whitespace
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned).strip()
    return found, cleaned


# ─────────────────────────────────────────────────────────────────────────────
# LOW-LEVEL API CALL
# ─────────────────────────────────────────────────────────────────────────────
def _raw_api_call(messages: list, max_tokens: int = 1200) -> dict:
    """
    POST to Groq and return the raw message dict from choices[0].
    Raises on any error — caller handles retries.
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model":       GROQ_MODEL,
        "messages":    messages,
        "max_tokens":  max_tokens,
        "temperature": 0.7,
        "tools":       TOOLS,
        "tool_choice": "auto",
    }
    resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if "error" in data:
        raise RuntimeError(f"Groq error: {data['error'].get('message', str(data['error']))}")
    if not data.get("choices"):
        raise RuntimeError(f"Empty response from Groq: {data}")

    return data["choices"][0]["message"]


def _call_api(messages: list, max_tokens: int = 1200) -> dict:
    """
    Retry wrapper with 429 rate-limit backoff. Always returns a message dict.
    Groq free tier: 30 req/min on llama-3.3-70b. On 429 we read Retry-After
    and wait before retrying. MAX_TOOL_ROUNDS in chat() means one user turn
    can make up to 5 API calls — so stay mindful of token budgets.
    """
    if not GROQ_API_KEY:
        return {
            "role": "assistant",
            "content": "⚠️ GROQ_API_KEY is not set. Please add it to your .env file and restart."
        }

    MAX_ATTEMPTS = 3

    for attempt in range(MAX_ATTEMPTS):
        try:
            return _raw_api_call(messages, max_tokens)

        except requests.exceptions.Timeout:
            if attempt >= MAX_ATTEMPTS - 1:
                return {"role": "assistant",
                        "content": "⏱️ That's taking too long — please try again in a moment."}
            time.sleep(2)

        except requests.exceptions.ConnectionError:
            if attempt >= MAX_ATTEMPTS - 1:
                return {"role": "assistant",
                        "content": "🔌 Can't connect right now. Check your internet and try again."}
            time.sleep(2)

        except requests.exceptions.HTTPError as e:
            code = e.response.status_code if e.response is not None else 0
            body = e.response.text[:300] if e.response is not None else ""
            print(f"[HTTP {code}] {body}")

            if code == 429:
                # Respect Retry-After header; default 20s, cap at 60s
                retry_after = int(e.response.headers.get("Retry-After", 20))
                retry_after = min(retry_after, 60)
                print(f"[Rate limit 429] Waiting {retry_after}s (attempt {attempt + 1}/{MAX_ATTEMPTS})")
                if attempt >= MAX_ATTEMPTS - 1:
                    return {"role": "assistant",
                            "content": "Getting a lot of requests right now — wait a few seconds and try again."}
                time.sleep(retry_after)
            else:
                if attempt >= MAX_ATTEMPTS - 1:
                    return {"role": "assistant",
                            "content": f"API error ({code}). Please try again."}
                time.sleep(2)

        except Exception as e:
            print(f"[API Error attempt {attempt}] {e}")
            if attempt >= MAX_ATTEMPTS - 1:
                return {"role": "assistant",
                        "content": "Something went wrong on my end. Please try again."}
            time.sleep(2)

    return {"role": "assistant", "content": "Something went wrong. Please try again."}


# ─────────────────────────────────────────────────────────────────────────────
# TOOL EXECUTION
# ─────────────────────────────────────────────────────────────────────────────
def _execute_tool(name: str, arguments: dict) -> str:
    """
    Execute a LangChain tool by name with the given arguments dict.

    search_pgs / find_nearby_pgs      → tool expects a JSON string input
    get_pg_details / get_pricing_summary → tool expects just the pg_id string

    Normalise name to the no-suffix form for routing logic, but look up in
    _tools_map using the original name (which handles both forms).
    """
    tool = _tools_map.get(name)
    if not tool:
        return f"[Error] Unknown tool: '{name}'. Available: {list(_tools_map.keys())}"

    # Normalise to base name for routing (strips _tool suffix if present)
    base_name = name.removesuffix("_tool")

    try:
        if base_name in ("search_pgs", "find_nearby_pgs"):
            return str(tool.invoke(json.dumps(arguments)))
        elif base_name in ("get_pg_details", "get_pricing_summary"):
            pg_id = arguments.get("pg_id", "").strip()
            if not pg_id:
                return "[Error] pg_id is required but was empty."
            return str(tool.invoke(pg_id))
        else:
            return str(tool.invoke(json.dumps(arguments)))
    except Exception as e:
        import traceback
        print(f"[Tool Error — {name}]\n{traceback.format_exc()}")
        return f"[Tool Error] {name} failed: {str(e)[:200]}"


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────
def _extract_pg_ids(text: str) -> list[str]:
    """Pull PG IDs out of tool result text (lines like 'ID: some-pg-id')."""
    return list(dict.fromkeys(re.findall(r'ID:\s*(\S+)', text)))


def _is_error_response(text: str) -> bool:
    """True for transient errors we should NOT persist to session history."""
    if not text:
        return False
    return text.startswith(("⏱️", "🔌", "API error", "Something went wrong", "⚠️", "I ran into"))


def _load_session(session_id: str) -> list:
    if session_id not in _session_store:
        _session_store[session_id] = load_session_messages(session_id)
    return _session_store[session_id]


def _save_session(session_id: str) -> None:
    if session_id in _session_store:
        save_session_messages(session_id, _session_store[session_id])


# ─────────────────────────────────────────────────────────────────────────────
# MAIN CHAT FUNCTION
# ─────────────────────────────────────────────────────────────────────────────
def chat(user_message: str, session_id: str) -> dict:
    """
    Process one user message and return the assistant reply.

    Returns:
        {
            "response":        str        — text to show the user
            "recommendations": list[str]  — PG IDs found this turn (may be empty)
        }
    """
    history = _load_session(session_id)
    history.append({"role": "user", "content": user_message})

    recommendations: list[str] = []
    final_response = "I ran into an issue — please try again."

    api_messages: list[dict] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *history[-MAX_HISTORY_MESSAGES:],
    ]

    # ─── Agentic tool-calling loop ────────────────────────────────────────────
    # Loops until the model returns a plain text reply (no tool calls).
    # Handles BOTH structured tool_calls (correct API behaviour) AND
    # text-embedded tool calls (Groq/Llama fallback behaviour).
    MAX_TOOL_ROUNDS = 2  # 1 tool call + 1 final reply = max 3 API calls per user turn

    for round_idx in range(MAX_TOOL_ROUNDS):
        msg        = _call_api(api_messages)
        content    = msg.get("content") or ""
        tool_calls = msg.get("tool_calls")  # structured tool calls from API

        # ── Check for text-format tool calls (Groq/Llama fallback) ───────────
        # If the model didn't use the structured API but wrote the call as text,
        # parse it out and treat it exactly like a structured tool call.
        text_tool_calls, content_cleaned = _parse_text_tool_calls(content)

        if not tool_calls and text_tool_calls:
            print(f"[Fallback] Detected {len(text_tool_calls)} text-format tool call(s) in content.")
            # Rebuild tool_calls in the same shape the loop expects below
            tool_calls = [
                {
                    "id": tc["id"],
                    "function": {
                        "name":      tc["name"],
                        "arguments": json.dumps(tc["arguments"]),
                    }
                }
                for tc in text_tool_calls
            ]
            # Replace msg content with the cleaned version (markup stripped)
            msg = dict(msg)
            msg["content"] = content_cleaned
            # Attach synthetic tool_calls so the assistant message stored in
            # context looks like a proper tool-calling message
            msg["tool_calls"] = [
                {
                    "id":       tc["id"],
                    "type":     "function",
                    "function": {
                        "name":      tc["name"],
                        "arguments": json.dumps(tc["arguments"]),
                    }
                }
                for tc in text_tool_calls
            ]

        # ── No tool calls at all → final plain-text reply ────────────────────
        if not tool_calls:
            final_response = content if content else "I ran into an issue — please try again."
            break

        # ── Execute tools ─────────────────────────────────────────────────────

        # Step 1: append assistant message (with tool_calls) to context
        api_messages.append(msg)

        # Step 2: execute each tool, append result as role="tool"
        for tc in tool_calls:
            tool_call_id = tc.get("id", f"call_{round_idx}_{id(tc)}")
            fn           = tc.get("function", {})
            tool_name    = fn.get("name", "")

            try:
                arguments = json.loads(fn.get("arguments", "{}"))
            except json.JSONDecodeError:
                arguments = {}

            print(f"[Tool ▶] {tool_name}  args={json.dumps(arguments)}")
            tool_result = _execute_tool(tool_name, arguments)
            print(f"[Tool ◀] {tool_result[:300]}")

            if tool_name == "search_pgs":
                recommendations = _extract_pg_ids(tool_result)

            # role="tool" is the correct OpenAI spec role for tool results.
            # Using role="user" here (the old bug) confuses the model badly.
            api_messages.append({
                "role":         "tool",
                "tool_call_id": tool_call_id,
                "name":         tool_name,
                "content":      tool_result,
            })

        # Continue loop — model will now read tool results and reply

    else:
        print(f"[Warning] Hit MAX_TOOL_ROUNDS ({MAX_TOOL_ROUNDS}) for session {session_id}")
        final_response = "Found some options! Let me know if you'd like details on any PG."

    # ── Persist (skip transient errors) ──────────────────────────────────────
    if _is_error_response(final_response):
        return {"response": final_response, "recommendations": recommendations}

    history.append({"role": "assistant", "content": final_response})
    _session_store[session_id] = history[-MAX_HISTORY_MESSAGES:]
    _save_session(session_id)

    return {"response": final_response, "recommendations": recommendations}


# ─────────────────────────────────────────────────────────────────────────────
# GREETING
# ─────────────────────────────────────────────────────────────────────────────
def get_greeting(session_id: str) -> str:
    """
    Returns the opening message for a new session and seeds history.
    Called once by /new-session — separate from chat() to avoid
    double-responses on the first real user message.
    """
    greeting = (
        "Hey! 👋 I'm PG Buddy — your shortcut to finding the right PG in Hyderabad.\n\n"
        "Tell me which area you're targeting (or where you work/study), your budget, "
        "and I'll pull up the best options for you. Where are you looking?"
    )
    _session_store[session_id] = [{"role": "assistant", "content": greeting}]
    _save_session(session_id)
    return greeting


# ─────────────────────────────────────────────────────────────────────────────
# SESSION UTILS
# ─────────────────────────────────────────────────────────────────────────────
def clear_session(session_id: str) -> None:
    _session_store.pop(session_id, None)
    delete_session_messages(session_id)


def get_session_history(session_id: str) -> list:
    return _session_store.get(session_id, [])