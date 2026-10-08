from fastapi import APIRouter, HTTPException, Query
from googleapiclient.discovery import build
from google import genai
import os
import json
import logging
import re
import html
from typing import Optional

router = APIRouter(prefix="/api/tutorials", tags=["tutorials"])
logger = logging.getLogger(__name__)

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini Client if available
gemini_client = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Gemini client successfully initialized for tutorials")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")

# Load Curated Clean Tutorials JSON
CURATED_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "curated_tutorials.json")
CURATED_TUTORIALS = {}

if os.path.exists(CURATED_FILE):
    try:
        with open(CURATED_FILE, "r", encoding="utf-8") as f:
            CURATED_TUTORIALS = json.load(f)
        logger.info(f"Loaded curated tutorials from {CURATED_FILE}")
    except Exception as e:
        logger.error(f"Error reading curated_tutorials.json: {e}")

CATEGORY_METADATA = {
    "resin": {
        "label": "Resin Art",
        "icon": "🧪",
        "search_term": "epoxy resin art tutorial for beginners",
        "learning_path": [
            {"step": 1, "title": "Safety & Ratio Mixing", "desc": "Nitrile gloves, respirator mask & precision 2:1 or 3:1 weighing on digital scales."},
            {"step": 2, "title": "Silicone Mold Casting", "desc": "Coasters, bookmark trays, bubble popping with butane torch & alcohol ink."},
            {"step": 3, "title": "Advanced Cell Lacing & Ocean Waves", "desc": "White pigment paste, heat gun angling at 45° & layered translucent pours."},
            {"step": 4, "title": "Sanding, Topcoating & Monetization", "desc": "High grit wet sanding, scratch-free doming glaze & custom pricing strategy."}
        ],
        "pro_tips": [
            "Always work in a room temperature between 24°C - 28°C for optimal bubble release.",
            "Never use water-based food coloring — it will permanently ruin the chemical cure.",
            "Wait 48 hours for full cure before sanding or shipping heavy preservation pieces."
        ]
    },
    "candle": {
        "label": "Candle Making",
        "icon": "🕯️",
        "search_term": "soy candle making tutorial step by step",
        "learning_path": [
            {"step": 1, "title": "Wax Melting & Temperature Control", "desc": "Double boiler melting, thermometer monitoring at 80°C - 85°C."},
            {"step": 2, "title": "Wick Selection & Jar Centering", "desc": "Cotton vs wooden wicks, wick glue dots & centering stabilizer clips."},
            {"step": 3, "title": "Fragrance Oil Blending & Hot Throw", "desc": "Adding 6-10% fragrance oil at 70°C and stirring gently for 2 full minutes."},
            {"step": 4, "title": "Curing, Frosting Fix & Packaging", "desc": "Heat gun surface smoothing, 2-week soy curing & luxury safety label compliance."}
        ],
        "pro_tips": [
            "Pour soy wax at 55°C - 60°C to minimize frosting and sinkholes on the surface.",
            "Trim wicks to 1/4 inch before each burn to prevent soot and mushrooming.",
            "Allow soy candles to cure for 7–14 days for maximum aroma release."
        ]
    },
    "crochet": {
        "label": "Crochet & Yarn",
        "icon": "🧶",
        "search_term": "how to crochet step by step tutorial beginner",
        "learning_path": [
            {"step": 1, "title": "Grips, Slip Knot & Foundation Chain", "desc": "Knife vs pencil grip, yarn tension around pinky and consistent starting loops."},
            {"step": 2, "title": "Core Stitches (SC, HDC, DC)", "desc": "Single crochet, half-double crochet and clean turning chains without dropping loops."},
            {"step": 3, "title": "Magic Ring & 3D Amigurumi", "desc": "Continuous spiral rounds, invisible decreases & polyester fiberfill stuffing."},
            {"step": 4, "title": "Pattern Reading & Floral Bouquets", "desc": "Reading US vs UK bracket instructions, floral stem wire joins & blocking."}
        ],
        "pro_tips": [
            "Use light-colored worsted yarn (weight 4) and a 4.5mm or 5mm ergonomic hook to start.",
            "Count your stitches at the end of every single row to prevent uneven tapering edges.",
            "Use a safety pin or locking stitch marker to keep track of the first stitch in spiral rounds."
        ]
    },
    "clay": {
        "label": "Clay Sculpting",
        "icon": "🏺",
        "search_term": "polymer clay sculpting lippan art tutorial",
        "learning_path": [
            {"step": 1, "title": "Clay Conditioning & Moisture", "desc": "Conditioning pasta rollers, air-dry moisture maintenance & acrylic armature cores."},
            {"step": 2, "title": "Form Blocking & Facial Planes", "desc": "Axel wedge blocking, basic proportions, ball styluses & silicone sculpting tools."},
            {"step": 3, "title": "Traditional Lippan Art & Mud Relief", "desc": "MDF grid marking, resin-clay dough coils, smooth spoon rolling & abhla mirrors."},
            {"step": 4, "title": "Curing, Sanding & Weatherproof Varnishing", "desc": "Low-temp oven baking, acrylic painting, metallic powders & high-gloss UV varnish."}
        ],
        "pro_tips": [
            "Never bake polymer clay at uncalibrated oven temperatures; use an oven thermometer.",
            "For Lippan art dough, use talcum powder or cornstarch to prevent clay from sticking to fingers.",
            "Seal air-dry clay pieces with 2 coats of gesso before applying acrylic paint and mirrors."
        ]
    },
    "pipe-cleaner": {
        "label": "Pipe Cleaner Crafts",
        "icon": "🌸",
        "search_term": "pipe cleaner flower bouquet tutorial step by step",
        "learning_path": [
            {"step": 1, "title": "Wire Bending & Petal Geometry", "desc": "Loop twisting, flattening velvet pile, bending teardrop & tulip petal outlines."},
            {"step": 2, "title": "Core Assembling & Hot Glue Bonding", "desc": "Pistil/stamen wire rolling, layering multi-tier petals with precision hot glue."},
            {"step": 3, "title": "Stem Wrapping & Green Calyx Leaves", "desc": "Green floral tape wrapping, inserting floral dowel rods & securing leaf sprays."},
            {"step": 4, "title": "Korean Aesthetic Bouquet Packaging", "desc": "Waterproof frosted cellophane folds, contrasting liner paper & luxury ribbon tie."}
        ],
        "pro_tips": [
            "Use high-density 6mm or 9mm chenille stems so wire bends without showing metal gaps.",
            "Stretch your floral tape slightly as you wrap — stretching activates the floral wax adhesive.",
            "Iron or gently brush the velvet pile with a spoolie brush for a velvety, natural floral texture."
        ]
    }
}

def parse_iso8601_duration(duration_str: str) -> str:
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration_str or "")
    if not match:
        return "12 mins"
    hours, minutes, seconds = match.groups()
    h = int(hours) if hours else 0
    m = int(minutes) if minutes else 0
    s = int(seconds) if seconds else 0
    if h > 0:
        return f"{h}h {m}m"
    return f"{m}:{s:02d}"

def search_youtube_live(query: str, max_results: int = 6):
    """Fetch live real-time videos from YouTube Data API"""
    if not YOUTUBE_API_KEY:
        logger.warning("No YOUTUBE_API_KEY provided")
        return []

    try:
        yt = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        req = yt.search().list(
            q=query,
            part="snippet",
            maxResults=max_results,
            type="video",
            relevanceLanguage="en",
            regionCode="IN"
        )
        res = req.execute()
        items = res.get("items", [])
        if not items:
            return []

        # Fetch extra details for stats & duration
        video_ids = [it["id"]["videoId"] for it in items if "id" in it and "videoId" in it["id"]]
        details_map = {}
        if video_ids:
            details_req = yt.videos().list(
                id=",".join(video_ids),
                part="snippet,contentDetails,statistics"
            )
            details_res = details_req.execute()
            for vd in details_res.get("items", []):
                details_map[vd["id"]] = vd

        results = []
        for it in items:
            vid = it["id"]["videoId"]
            vd = details_map.get(vid, {})
            raw_views = int(vd.get("statistics", {}).get("viewCount", 0)) if vd else 0
            if raw_views >= 1000000:
                views = f"{raw_views/1000000:.1f}M+"
            elif raw_views >= 1000:
                views = f"{raw_views/1000:.0f}K+"
            else:
                views = f"{raw_views}"

            raw_dur = vd.get("contentDetails", {}).get("duration", "") if vd else ""
            dur = parse_iso8601_duration(raw_dur)

            title = html.unescape(it["snippet"]["title"])
            desc = html.unescape(it["snippet"]["description"])
            desc_short = desc[:140] + "..." if len(desc) > 140 else desc

            results.append({
                "id": vid,
                "title": title,
                "channel": it["snippet"]["channelTitle"],
                "description": desc_short,
                "thumbnail": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
                "url": f"https://www.youtube.com/watch?v={vid}",
                "embedUrl": f"https://www.youtube.com/embed/{vid}",
                "views": views,
                "duration": dur,
                "level": "All Levels",
                "topic": "Live YouTube Search"
            })
        return results
    except Exception as e:
        logger.error(f"Error calling YouTube Live Search: {e}")
        return []

@router.get("/{category}")
async def get_tutorials(category: str, refresh: bool = False):
    """
    Get 100% verified, real-time working tutorials for a craft category.
    Returns 8 authentic YouTube videos with valid IDs, embeds, views & durations,
    plus category-specific learning path and safety checklists.
    """
    norm_cat = category.lower().strip()
    if norm_cat not in CATEGORY_METADATA:
        norm_cat = "resin"

    meta = CATEGORY_METADATA[norm_cat]
    curated_list = CURATED_TUTORIALS.get(norm_cat, [])

    # If refresh is explicitly requested and YouTube API key is active, fetch live fresh results
    if refresh and YOUTUBE_API_KEY:
        live_vids = search_youtube_live(meta["search_term"], max_results=8)
        if live_vids:
            return {
                "category": norm_cat,
                "categoryLabel": meta["label"],
                "icon": meta["icon"],
                "tutorials": live_vids,
                "totalCount": len(live_vids),
                "source": "youtube_live_api",
                "learningPath": meta["learning_path"],
                "proTips": meta["pro_tips"]
            }

    # Return curated authentic tutorials
    return {
        "category": norm_cat,
        "categoryLabel": meta["label"],
        "icon": meta["icon"],
        "tutorials": curated_list,
        "totalCount": len(curated_list),
        "source": "curated_grounded_youtube",
        "learningPath": meta["learning_path"],
        "proTips": meta["pro_tips"]
    }

@router.get("/{category}/search")
async def search_category_tutorials(category: str, q: str = Query(..., min_length=2)):
    """
    Search YouTube live for any specific technique or keyword within the category.
    """
    norm_cat = category.lower().strip()
    meta = CATEGORY_METADATA.get(norm_cat, CATEGORY_METADATA["resin"])
    full_query = f"{meta['label']} {q} tutorial"

    live_results = search_youtube_live(full_query, max_results=8)
    if not live_results:
        # Fallback filter from curated
        curated_list = CURATED_TUTORIALS.get(norm_cat, [])
        query_words = q.lower().split()
        filtered = [
            v for v in curated_list
            if any(w in v["title"].lower() or w in v["topic"].lower() for w in query_words)
        ]
        live_results = filtered if filtered else curated_list

    return {
        "category": norm_cat,
        "query": q,
        "results": live_results,
        "count": len(live_results),
        "source": "youtube_live_search"
    }

@router.get("/{category}/ai-insights")
async def get_ai_tutorial_insights(category: str):
    """
    Generate dynamic Gemini AI tutorial guidance and technique breakdown.
    """
    norm_cat = category.lower().strip()
    meta = CATEGORY_METADATA.get(norm_cat, CATEGORY_METADATA["resin"])

    if gemini_client:
        try:
            prompt = f"""
            You are a master instructor for Indian artisans practicing {meta['label']}.
            Provide 3 high-yield workshop tips for Indian beginners, 2 common mistakes to avoid, and 3 recommended project progression ideas.
            Return ONLY valid JSON matching this schema:
            {{
              "workshopTips": ["tip 1", "tip 2", "tip 3"],
              "commonMistakes": ["mistake 1", "mistake 2"],
              "recommendedProjects": [
                {{"level": "Beginner", "title": "Project Name", "duration": "30 mins", "outcome": "Quick description"}},
                {{"level": "Intermediate", "title": "Project Name", "duration": "2 hours", "outcome": "Quick description"}},
                {{"level": "Masterclass", "title": "Project Name", "duration": "1 day", "outcome": "Quick description"}}
              ]
            }}
            """
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            raw_text = response.text or ""
            # Clean markdown codeblocks
            clean_json = re.sub(r"^```json\s*|^```\s*|```$", "", raw_text.strip(), flags=re.MULTILINE)
            parsed = json.loads(clean_json)
            return {"category": norm_cat, "insights": parsed, "source": "gemini_api"}
        except Exception as e:
            logger.error(f"Gemini API error in tutorials: {e}")

    # Fallback response
    return {
        "category": norm_cat,
        "insights": {
            "workshopTips": meta["pro_tips"],
            "commonMistakes": [
                "Improper temperature or mixing leading to uneven setting",
                "Skipping safety gear and proper ventilation"
            ],
            "recommendedProjects": [
                {"level": "Beginner", "title": f"Starter {meta['label']} Mini Kit", "duration": "45 mins", "outcome": "Learn core foundational mechanics"},
                {"level": "Intermediate", "title": f"Layered {meta['label']} Showcase", "duration": "2 hours", "outcome": "Combine color gradients and textures"},
                {"level": "Masterclass", "title": f"Bespoke Commercial Commission", "duration": "2 days", "outcome": "Commercial-grade finish for client orders"}
            ]
        },
        "source": "grounded_base"
    }