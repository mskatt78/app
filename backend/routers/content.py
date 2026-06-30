"""Content routes for yoga, breathwork, crystals, mantras, mudras, meditations, etc."""
from datetime import datetime, timezone
import asyncio
from collections import Counter
from dataclasses import dataclass
import hashlib
import logging
import os
import re
import secrets
import time
from typing import Any, Literal, Optional, Sequence
import uuid
from urllib.parse import quote, urlparse

from fastapi import APIRouter, HTTPException
import httpx
from pydantic import BaseModel, EmailStr, Field, field_validator

from .dependencies import get_db

router = APIRouter(tags=["content"])
logger = logging.getLogger(__name__)

MIN_NARRATION_MINUTES = 7
TARGET_WORDS_PER_MINUTE = 132
SEGMENT_TARGET_WORDS = 220
FIRST_SEGMENT_TARGET_WORDS = 95
MAX_PARAGRAPH_STEM_REPEAT_RATIO = 0.12
SCRIPT_EXPANSION_CACHE_TTL_SECONDS = 60 * 45
SCRIPT_EXPANSION_CACHE_MAX_ITEMS = 180
script_expansion_cache: dict[str, tuple[float, dict[str, Any]]] = {}

WIKIPEDIA_SUMMARY_ENDPOINT = "https://en.wikipedia.org/api/rest_v1/page/summary/{}"
WIKIPEDIA_ACTION_API_ENDPOINT = "https://en.wikipedia.org/w/api.php"
COMMONS_API_ENDPOINT = "https://commons.wikimedia.org/w/api.php"
WIKIPEDIA_CLIENT_TIMEOUT_SECONDS = 8.0
CRYSTAL_IMAGE_CACHE_TTL_HOURS = 72
CRYSTAL_IMAGE_VALIDATION_COLLECTION = "crystal_image_validations"
CRYSTAL_IMAGE_KEYWORDS = ("crystal", "mineral", "gem", "gemstone", "silicate", "rock")
WIKIPEDIA_IMAGE_HOST_ALLOWLIST = ("upload.wikimedia.org", "commons.wikimedia.org", "wikipedia.org", "wikimedia.org")
COMMONS_SEARCH_EXCLUDE_TOKENS = ("diagram", "chart", "logo", "symbol", "map", "flag", "icon", "coat", "drawing")

VISUAL_FORM_KEYWORDS = {
    "gemstone": ("gem", "gemstone", "faceted", "facet", "cabochon", "jewel", "jewelry", "cut"),
    "tumbled": ("tumbled", "polished", "stone", "palm", "pebble", "bead"),
    "raw": ("raw", "rough", "crystal", "cluster", "mineral", "specimen"),
    "blade": ("blade", "bladed", "raw", "rough", "crystal"),
}

CRYSTAL_WIKIPEDIA_TITLE_MAP = {
    "clear-quartz": "Quartz",
    "amethyst": "Amethyst",
    "rose-quartz": "Rose quartz",
    "black-tourmaline": "Schorl",
    "citrine": "Citrine",
    "selenite": "Selenite (mineral)",
    "labradorite": "Labradorite",
    "obsidian": "Obsidian",
    "carnelian": "Carnelian",
    "lapis-lazuli": "Lapis lazuli",
    "moonstone": "Moonstone (gemstone)",
    "turquoise": "Turquoise",
    "malachite": "Malachite",
    "green-aventurine": "Aventurine",
    "tigers-eye": "Tiger's eye",
    "lepidolite": "Lepidolite",
    "rhodonite": "Rhodonite",
    "fluorite": "Fluorite",
    "chrysocolla": "Chrysocolla",
    "sunstone": "Sunstone (mineral)",
    "aquamarine": "Aquamarine (gemstone)",
    "kunzite": "Kunzite",
    "iolite": "Cordierite",
    "amazonite": "Amazonite",
    "howlite": "Howlite",
    "kyanite": "Kyanite",
    "angelite": "Anhydrite",
}

CRYSTAL_VISUAL_FORM_MAP = {
    "clear-quartz": "raw",
    "amethyst": "raw",
    "rose-quartz": "tumbled",
    "black-tourmaline": "raw",
    "citrine": "gemstone",
    "selenite": "raw",
    "labradorite": "tumbled",
    "obsidian": "tumbled",
    "carnelian": "tumbled",
    "lapis-lazuli": "tumbled",
    "moonstone": "gemstone",
    "turquoise": "tumbled",
    "malachite": "tumbled",
    "green-aventurine": "tumbled",
    "tigers-eye": "tumbled",
    "lepidolite": "tumbled",
    "rhodonite": "tumbled",
    "fluorite": "raw",
    "chrysocolla": "tumbled",
    "sunstone": "gemstone",
    "aquamarine": "gemstone",
    "kunzite": "gemstone",
    "iolite": "gemstone",
    "amazonite": "tumbled",
    "howlite": "tumbled",
    "kyanite": "blade",
    "angelite": "tumbled",
}

CRYSTAL_STRICT_VISUAL_VALIDATION_IDS = {"iolite"}

MUDRA_VERIFIED_IMAGE_MAP: dict[str, dict[str, Any]] = {
    "gyan mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Gyana_%28jnana%29_mudra_and_rudraksha.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Gyana_(jnana)_mudra_and_rudraksha.jpg",
            "https://commons.wikimedia.org/wiki/Category:J%C3%B1%C4%81na_mudra",
        ],
    },
    "anjali mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/01/A%C3%B1jali_Mudr%C4%81_%28Pra%E1%B9%87%C4%81m%C4%81sana%29.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:A%C3%B1jali_Mudr%C4%81_(Pra%E1%B9%87%C4%81m%C4%81sana).jpg",
            "https://en.wikipedia.org/wiki/Anjali_Mudra",
        ],
    },
    "dhyana mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Budhha_in_Dhyana_Mudra%2C_The_Great_Stupa%2C_Sanchi.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Budhha_in_Dhyana_Mudra,_The_Great_Stupa,_Sanchi.jpg",
            "https://commons.wikimedia.org/wiki/Category:Dhy%C4%81na_mudra",
        ],
    },
    "prithvi mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Prithvi_mudra.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Prithvi_mudra.jpg",
            "https://commons.wikimedia.org/wiki/Category:Prithvi_mudra",
        ],
    },
    "varuna mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Varuna-Mudra.webp",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Varuna-Mudra.webp",
            "https://en.wikipedia.org/wiki/List_of_mudras_(yoga)",
        ],
    },
    "agni mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/06/Mudras.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mudras.jpg",
            "https://commons.wikimedia.org/wiki/Category:Mudras",
        ],
    },
    "vayu mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/08/Mudras_1.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mudras_1.jpg",
            "https://commons.wikimedia.org/wiki/Category:Mudras",
        ],
    },
    "shuni mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Ellora-Cave29-ShuniMudra.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Ellora-Cave29-ShuniMudra.jpg",
            "https://commons.wikimedia.org/wiki/Category:Shuni_mudra",
        ],
    },
    "surya mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/74/Mudras_2.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mudras_2.jpg",
            "https://commons.wikimedia.org/wiki/Category:Mudras",
        ],
    },
    "prana mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Language_of_Mudras.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:The_Language_of_Mudras.jpg",
            "https://commons.wikimedia.org/wiki/Category:Mudras",
        ],
    },
    "apana mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Apna_Mudra.svg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Apna_Mudra.svg",
            "https://commons.wikimedia.org/wiki/Category:Apana_mudra",
        ],
    },
    "chin mudra": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Chin_Mudra.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Chin_Mudra.jpg",
            "https://commons.wikimedia.org/wiki/File:Chin_Mudraa.jpg",
        ],
    },
}

MANTRA_DIRECT_VIDEO_MAP: dict[str, list[str]] = {
    "om": ["https://www.youtube.com/watch?v=eQTenvydZIo"],
    "om mani padme hum": ["https://www.youtube.com/watch?v=JgHId_MP7gY"],
    "om ma ni pad me hum": ["https://www.youtube.com/watch?v=JgHId_MP7gY"],
    "lokah samastah sukhino bhavantu": ["https://www.youtube.com/watch?v=CBe4Q3upir8"],
    "so hum": ["https://www.youtube.com/watch?v=303Dmd3WIl8"],
    "sat nam": ["https://www.youtube.com/watch?v=kUCCrf4c6R0"],
    "om namah shivaya": ["https://www.youtube.com/watch?v=0C2s8ved0VU"],
    "gayatri mantra": ["https://www.youtube.com/watch?v=ESW83VsEfWc"],
    "ham sa": ["https://www.youtube.com/watch?v=303Dmd3WIl8"],
    "om gam ganapataye namaha": ["https://www.youtube.com/watch?v=oahB95PKbfA"],
    "om gam ganapa taye namaha": ["https://www.youtube.com/watch?v=oahB95PKbfA"],
    "ra ma da sa": ["https://www.youtube.com/watch?v=8IYzSbrI6h0"],
    "ra ma da sa sa say so hung": ["https://www.youtube.com/watch?v=8IYzSbrI6h0"],
    "aham brahmasmi": ["https://www.youtube.com/watch?v=Zz4fJJzoLHY"],
    "om shanti shanti shanti": ["https://www.youtube.com/watch?v=Ql5vZGKe8KQ"],
    "om tare tu tare tu re so ha hooooommmmm": ["https://www.youtube.com/watch?v=5L5k6wD6NnQ"],
    "om aim hreem kleem chamundaye viche": ["https://www.youtube.com/watch?v=hmQzUQGVwjo"],
    "om dum durgayei namaha": ["https://www.youtube.com/watch?v=WAQxR5JX8mM"],
    "om shreem mahalakshmiyei namaha": ["https://www.youtube.com/watch?v=5A0B7fJQh2A"],
    "om kreem kalikayei namaha": ["https://www.youtube.com/watch?v=IY07n6U4a7Y"],
    "om namo bhagavate vasudevaya": ["https://www.youtube.com/watch?v=6d3gP5xV2Y4"],
    "om tryambakam yajamahe": ["https://www.youtube.com/watch?v=V2m8qfBf0m4"],
    "om shri ram jai ram jai jai ram": ["https://www.youtube.com/watch?v=tYf8x8aRj0k"],
    "om kleem krishnaya namaha": ["https://www.youtube.com/watch?v=m2N3xY6lYfM"],
    "om namo narayanaya": ["https://www.youtube.com/watch?v=CHNQ6Y8K9zA"],
    "om sri hanumate namaha": ["https://www.youtube.com/watch?v=Vx0HfFz8qJU"],
}

MUDRA_DIRECT_VIDEO_MAP: dict[str, list[str]] = {
    "gyan mudra": ["https://www.youtube.com/watch?v=fRtOijVfhn4"],
    "anjali mudra": ["https://www.youtube.com/watch?v=JgFLogqy1LU"],
    "dhyana mudra": ["https://www.youtube.com/watch?v=yogF5AOPrpU"],
    "prithvi mudra": ["https://www.youtube.com/watch?v=KbCrUaXee_w"],
    "varuna mudra": ["https://www.youtube.com/watch?v=LRSqHICoKF0"],
    "agni mudra": ["https://www.youtube.com/watch?v=R8Qfy-V77Ug"],
    "vayu mudra": ["https://www.youtube.com/watch?v=SiWC_Ra7PWI"],
    "shuni mudra": ["https://www.youtube.com/watch?v=oJJQ_eJthLk"],
    "surya mudra": ["https://www.youtube.com/watch?v=gA5ndKk1B68"],
    "prana mudra": ["https://www.youtube.com/watch?v=3ritYT9VnTM"],
    "apana mudra": ["https://www.youtube.com/watch?v=8Zy5nJqKLHg"],
    "chin mudra": ["https://www.youtube.com/watch?v=fRtOijVfhn4"],
}

YOGA_DIRECT_VIDEO_MAP: dict[str, list[str]] = {
    "mountain pose": ["https://www.youtube.com/watch?v=ipitZ_o2ut4"],
    "tree pose": ["https://www.youtube.com/watch?v=HrQZnM3soFk"],
    "bridge pose": ["https://www.youtube.com/watch?v=IV9Y-52NOY0"],
    "garland pose": ["https://www.youtube.com/watch?v=7LzI9jlvX0g"],
    "extended triangle": ["https://www.youtube.com/watch?v=JhtpJfrxfDs"],
    "wide legged forward fold": ["https://www.youtube.com/watch?v=tJAbNDZBUwE"],
    "chair pose": ["https://www.youtube.com/watch?v=NUTWhwm04WY"],
    "standing forward fold": ["https://www.youtube.com/watch?v=GZZk3sAf61U"],
    "goddess pose": ["https://www.youtube.com/watch?v=HvkzRRG8OC0"],
    "half moon pose": ["https://www.youtube.com/watch?v=xMm6zCZxmRc"],
}

BREATHWORK_DIRECT_VIDEO_MAP: dict[str, list[str]] = {
    "earth grounding breath": ["https://www.youtube.com/watch?v=URiPyIbU3bg"],
    "fire breath kapalabhati": ["https://www.youtube.com/watch?v=QEOCE_f32tc"],
    "ocean breath ujjayi": ["https://www.youtube.com/watch?v=GryOvhcnRcw"],
    "wind clearing breath": ["https://www.youtube.com/watch?v=OYa-EJAMDjg"],
    "spirit journey breath": ["https://www.youtube.com/watch?v=sJ3YzmDiIzA"],
    "4 7 8 relaxation": ["https://www.youtube.com/watch?v=FpQMfI56Cj4"],
}

MEDITATION_DIRECT_VIDEO_MAP: dict[str, list[str]] = {
    "inner peace journey": ["https://www.youtube.com/watch?v=td6BhfC7Xwk"],
    "mountain meditation": ["https://www.youtube.com/watch?v=yW_-d84Igxw"],
    "chakra cleansing": ["https://www.youtube.com/watch?v=I6jP5oLdKpY"],
    "forest bathing": ["https://www.youtube.com/watch?v=qRzKqLnv5ms"],
    "ocean of consciousness": ["https://www.youtube.com/watch?v=jPpUNAFHgxM"],
    "inner fire activation": ["https://www.youtube.com/watch?v=PoW4rqDue0c"],
}

PRACTICE_IMAGE_FALLBACKS: dict[str, str] = {
    "5-4-3-2-1 senses": "https://images.unsplash.com/photo-1590924439288-2fbd62193d84?crop=entropy&cs=srgb&fm=jpg&q=85",
    "root visualization": "https://images.unsplash.com/photo-1590924439288-2fbd62193d84?crop=entropy&cs=srgb&fm=jpg&q=85",
    "cold water reset": "https://images.unsplash.com/photo-1707303674302-1a99bbd6b0c1?crop=entropy&cs=srgb&fm=jpg&q=85",
    "barefoot walking": "https://images.pexels.com/photos/2998999/pexels-photo-2998999.jpeg?auto=compress&cs=tinysrgb&w=800",
    "body scan anchor": "https://images.unsplash.com/photo-1613602025754-04e1b4a24156?crop=entropy&cs=srgb&fm=jpg&q=85",
    "tree hugging meditation": "https://images.unsplash.com/photo-1702095735034-001484d87c31?crop=entropy&cs=srgb&fm=jpg&q=85",
    "stone holding practice": "https://images.pexels.com/photos/37804170/pexels-photo-37804170.jpeg?auto=compress&cs=tinysrgb&w=800",
    "mountain visualization": "https://images.pexels.com/photos/1809677/pexels-photo-1809677.jpeg?auto=compress&cs=tinysrgb&w=800",
    "gratitude practice": "https://images.unsplash.com/photo-1589347155881-96a4c76f147d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "water gratitude ceremony": "https://images.unsplash.com/photo-1774020039240-5420f9ea4b27?crop=entropy&cs=srgb&fm=jpg&q=85",
    "full moon water": "https://images.unsplash.com/photo-1589347155881-96a4c76f147d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "new moon water": "https://images.unsplash.com/photo-1589347155881-96a4c76f147d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "crystalline water activation": "https://images.unsplash.com/photo-1553792006-995530772e9b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "light code water infusion": "https://images.unsplash.com/photo-1553792006-995530772e9b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "crystal-charged water medicine": "https://images.unsplash.com/photo-1553792006-995530772e9b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "energetic water cleansing": "https://images.pexels.com/photos/9447948/pexels-photo-9447948.jpeg?auto=compress&cs=tinysrgb&w=800",
    "sound bath healing": "https://images.pexels.com/photos/6931975/pexels-photo-6931975.jpeg?auto=compress&cs=tinysrgb&w=800",
    "auric river rinse": "https://images.unsplash.com/photo-1774020039240-5420f9ea4b27?crop=entropy&cs=srgb&fm=jpg&q=85",
    "meridian pulse soak": "https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=800",
    "moon vessel infusion": "https://images.unsplash.com/photo-1589347155881-96a4c76f147d?crop=entropy&cs=srgb&fm=jpg&q=85",
}

GENERIC_CATEGORY_IMAGE_FALLBACKS: dict[str, str] = {
    "grounding": "https://images.pexels.com/photos/2998999/pexels-photo-2998999.jpeg?auto=compress&cs=tinysrgb&w=800",
    "earth": "https://images.pexels.com/photos/2998999/pexels-photo-2998999.jpeg?auto=compress&cs=tinysrgb&w=800",
    "water": "https://images.unsplash.com/photo-1774020039240-5420f9ea4b27?crop=entropy&cs=srgb&fm=jpg&q=85",
    "moon": "https://images.unsplash.com/photo-1589347155881-96a4c76f147d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "moon-water": "https://images.unsplash.com/photo-1589347155881-96a4c76f147d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "blessing": "https://images.unsplash.com/photo-1774020039240-5420f9ea4b27?crop=entropy&cs=srgb&fm=jpg&q=85",
    "ceremony": "https://images.unsplash.com/photo-1774020039240-5420f9ea4b27?crop=entropy&cs=srgb&fm=jpg&q=85",
    "ritual": "https://images.unsplash.com/photo-1774020039240-5420f9ea4b27?crop=entropy&cs=srgb&fm=jpg&q=85",
    "frequency": "https://images.unsplash.com/photo-1553792006-995530772e9b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "crystalline": "https://images.unsplash.com/photo-1553792006-995530772e9b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "cleansing": "https://images.pexels.com/photos/9447948/pexels-photo-9447948.jpeg?auto=compress&cs=tinysrgb&w=800",
    "somatic": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "release": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "stress": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "healing": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&q=85",
    "chakra": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&q=85",
    "energy": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&q=85",
    "feminine": "https://images.unsplash.com/photo-1518611012118-696072aa579a?crop=entropy&cs=srgb&fm=jpg&q=85",
    "masculine": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "movement": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=srgb&fm=jpg&q=85",
}

WATER_PRACTICE_SUPPLEMENTS = [
    {
        "id": "water-practice-auric-rinse",
        "name": "Auric River Rinse",
        "category": "ritual",
        "duration_minutes": 12,
        "description": "A dawn-to-dusk energetic rinse using intentional water passes around the auric field.",
        "materials": ["Bowl of clean water", "Sea salt pinch", "Blue candle"],
        "steps": [
            "Stand facing east and circle the bowl three times clockwise.",
            "Dip fingertips and trace water across forehead, heart, and lower abdomen.",
            "Whisper the release phrase and pour remaining water at plant roots.",
        ],
        "benefits": ["Emotional reset", "Nervous system calming", "Energetic boundary restoration"],
    },
    {
        "id": "water-practice-meridian-soak",
        "name": "Meridian Pulse Soak",
        "category": "healing",
        "duration_minutes": 18,
        "description": "A warm hand-and-foot soak sequence aligned with kidney and bladder meridian balancing.",
        "materials": ["Warm basin", "Epsom salt", "Lavender or cedar drop"],
        "steps": [
            "Soak palms for 4 minutes while breathing into lower back.",
            "Soak feet for 8 minutes and trace along inner ankle line.",
            "Close by patting dry and applying gentle acupressure at K1 points.",
        ],
        "benefits": ["Meridian support", "Grounding", "Sleep quality support"],
    },
    {
        "id": "water-practice-moon-infusion",
        "name": "Moon Vessel Infusion",
        "category": "moon-water",
        "duration_minutes": 9,
        "description": "Short lunar charging ritual for intention-focused hydration and emotional coherence.",
        "materials": ["Glass jar", "Spring water", "Written intention"],
        "steps": [
            "Place intention beneath the jar for one lunar hour.",
            "Hold jar at heart center and breathe 12 slow breaths.",
            "Drink in three sips while naming one aligned action.",
        ],
        "benefits": ["Intentional hydration", "Mental clarity", "Emotional coherence"],
    },
]

HEART_PRACTICE_SUPPLEMENTS = [
    {"id": "heart-supp-101", "name": "Compassionate Boundary Breath", "category": "boundary-healing", "element": "air", "duration_minutes": 14, "description": "Blend compassion with clean boundaries through paced breath and embodied self-advocacy."},
    {"id": "heart-supp-102", "name": "Forgiveness Somatic Release", "category": "forgiveness", "element": "water", "duration_minutes": 18, "description": "Release stuck grief and resentment through breath, tears, and grounded closure ritual."},
    {"id": "heart-supp-103", "name": "Inner Child Heart Reparenting", "category": "self-love", "element": "earth", "duration_minutes": 20, "description": "Rebuild inner safety through hand-on-heart dialogue and nervous-system reassurance."},
    {"id": "heart-supp-104", "name": "Relational Repair Invocation", "category": "relationship-healing", "element": "fire", "duration_minutes": 16, "description": "Prepare for truthful repair conversations with regulation, intention, and accountability."},
    {"id": "heart-supp-105", "name": "Evening Heart Coherence Seal", "category": "integration", "element": "spirit", "duration_minutes": 12, "description": "Close the day with coherence breathing and one gratitude-to-action commitment."},
]

ENERGY_HEALING_SUPPLEMENTS = [
    {
        "id": "energy-healing-supp-101",
        "name": "Reiki Nervous System Coherence Ritual",
        "modality": "Reiki",
        "element": "Water",
        "duration_minutes": 24,
        "description": "A trauma-aware Reiki sequence for grounding, vagal settling, and emotional regulation.",
    },
    {
        "id": "energy-healing-supp-102",
        "name": "Sekhem Solar Channel Purification",
        "modality": "Sekhem",
        "element": "Fire",
        "duration_minutes": 26,
        "description": "Clear stagnant density and restore empowered solar flow through breath, symbol, and voice.",
    },
    {
        "id": "energy-healing-supp-103",
        "name": "Dreamtime Ancestral Thread Repair",
        "modality": "Dreamtime",
        "element": "Earth",
        "duration_minutes": 32,
        "description": "A lineage repair protocol integrating ancestral listening, body tracking, and practical integration.",
    },
    {
        "id": "energy-healing-supp-104",
        "name": "Meridian Field Recalibration",
        "modality": "Pranic",
        "element": "Air",
        "duration_minutes": 22,
        "description": "Clear energetic congestion along major channels and restore embodied flow through breath-led scanning.",
    },
    {
        "id": "energy-healing-supp-105",
        "name": "Crystal Grid Emotional Harmonization",
        "modality": "Crystal",
        "element": "Water",
        "duration_minutes": 27,
        "description": "Use focused crystal placement to regulate emotional states and stabilize the heart field.",
    },
    {
        "id": "energy-healing-supp-106",
        "name": "Quantum Timeline Healing Prayer",
        "modality": "Quantum",
        "element": "Spirit",
        "duration_minutes": 30,
        "description": "A structured timeline prayer for release, reconciliation, and coherent future embodiment.",
    },
    {
        "id": "energy-healing-supp-107",
        "name": "Sound Current Aura Repair",
        "modality": "Sound",
        "element": "Air",
        "duration_minutes": 21,
        "description": "Layered toning protocol to soften fragmentation and rebuild auric coherence.",
    },
    {
        "id": "energy-healing-supp-108",
        "name": "Heart Shield Restoration",
        "modality": "Reiki",
        "element": "Spirit",
        "duration_minutes": 19,
        "description": "Restore compassionate boundaries and heart-field integrity after relational overextension.",
    },
    {
        "id": "energy-healing-supp-109",
        "name": "Sacred Breathlight Infusion",
        "modality": "Pranic",
        "element": "Fire",
        "duration_minutes": 18,
        "description": "Infuse low-energy states with deliberate breathlight cycles and grounded integration closure.",
    },

    {"id": "energy-healing-egyptian-201", "name": "Temple Flame Meridian Alignment", "modality": "Egyptian", "element": "Fire", "duration_minutes": 33, "description": "Activate temple-line breath to align will, spine, and energetic circulation before sacred action."},
    {"id": "energy-healing-egyptian-202", "name": "Ankh Crown-to-Heart Descent", "modality": "Egyptian", "element": "Air", "duration_minutes": 27, "description": "Guide high-frequency insight from crown into heart-led embodiment and practical service."},
    {"id": "energy-healing-egyptian-203", "name": "Pyramid Breath Containment", "modality": "Egyptian", "element": "Earth", "duration_minutes": 22, "description": "Contain scattered energy in a stable field through geometric breath pacing and grounding."},
    {"id": "energy-healing-egyptian-204", "name": "Solar Ka Vitality Recall", "modality": "Egyptian", "element": "Fire", "duration_minutes": 24, "description": "Recover depleted life force with rhythmic chest opening and controlled exhale release."},
    {"id": "energy-healing-egyptian-205", "name": "Nile Flow Emotional Purification", "modality": "Egyptian", "element": "Water", "duration_minutes": 28, "description": "Clear emotional residues through water invocation, soft movement, and compassionate witnessing."},
    {"id": "energy-healing-egyptian-206", "name": "Sekhem Boundary Consecration", "modality": "Egyptian", "element": "Spirit", "duration_minutes": 20, "description": "Consecrate energetic boundaries to prevent over-giving and preserve healing coherence."},
    {"id": "energy-healing-egyptian-207", "name": "Isis Grief Alchemy Passage", "modality": "Egyptian", "element": "Water", "duration_minutes": 31, "description": "Transmute grief through ritual tears, breath-led pacing, and devotional integration vows."},
    {"id": "energy-healing-egyptian-208", "name": "Horus Vision Coherence Reset", "modality": "Egyptian", "element": "Air", "duration_minutes": 18, "description": "Reset directional clarity and focus through eye-orientation practice and calm breath cycles."},
    {"id": "energy-healing-egyptian-209", "name": "Temple Drum Regulation Circuit", "modality": "Egyptian", "element": "Earth", "duration_minutes": 19, "description": "Use pulse rhythm to regulate nervous activation and return to embodied safety."},
    {"id": "energy-healing-egyptian-210", "name": "Ancestral Throne Integration", "modality": "Egyptian", "element": "Spirit", "duration_minutes": 26, "description": "Seat your energy in grounded leadership through lineage honoring and accountability practice."},
    {"id": "energy-healing-egyptian-211", "name": "Djed Column Spine Repair", "modality": "Egyptian", "element": "Earth", "duration_minutes": 25, "description": "Stabilize spine-based energy flow and soften chronic guarding in upper-back and jaw."},
    {"id": "energy-healing-egyptian-212", "name": "Golden Scarab Renewal Rite", "modality": "Egyptian", "element": "Fire", "duration_minutes": 23, "description": "Complete symbolic death-rebirth cycle to release stagnation and re-enter life force flow."},

    {"id": "energy-healing-australian-201", "name": "Songline Breath Tracking", "modality": "Australian", "element": "Earth", "duration_minutes": 30, "description": "Follow breath as a living songline through body terrain to restore belonging and orientation."},
    {"id": "energy-healing-australian-202", "name": "Dreaming Field Listening", "modality": "Australian", "element": "Spirit", "duration_minutes": 34, "description": "Strengthen intuitive listening and ethical action through deep stillness and place-based awareness."},
    {"id": "energy-healing-australian-203", "name": "Red Earth Grief Grounding", "modality": "Australian", "element": "Earth", "duration_minutes": 27, "description": "Ground grief states into supportive contact with land, breath, and embodied reverence."},
    {"id": "energy-healing-australian-204", "name": "Didgeridoo Pulse Entrainment", "modality": "Australian", "element": "Air", "duration_minutes": 21, "description": "Regulate dysregulated states with low-frequency pulse entrainment and paced exhale release."},
    {"id": "energy-healing-australian-205", "name": "Ancestor Campfire Reconciliation", "modality": "Australian", "element": "Fire", "duration_minutes": 29, "description": "Repair relational strain through spoken truth, humility, and grounded reparative action."},
    {"id": "energy-healing-australian-206", "name": "Waterhole Nervous System Softening", "modality": "Australian", "element": "Water", "duration_minutes": 24, "description": "Cool hyperarousal with water imagery, shoulder release, and long-form parasympathetic breathing."},
    {"id": "energy-healing-australian-207", "name": "Bush Medicine Boundary Rite", "modality": "Australian", "element": "Earth", "duration_minutes": 20, "description": "Restore personal boundaries through body-led consent ritual and movement anchoring."},
    {"id": "energy-healing-australian-208", "name": "Kangaroo Heart Courage Practice", "modality": "Australian", "element": "Fire", "duration_minutes": 19, "description": "Train courageous heart coherence during uncertainty without abandoning tenderness."},
    {"id": "energy-healing-australian-209", "name": "Star Camp Vision Alignment", "modality": "Australian", "element": "Air", "duration_minutes": 26, "description": "Clarify direction through star-anchored reflection and practical next-step planning."},
    {"id": "energy-healing-australian-210", "name": "Wattle Blossom Renewal Breath", "modality": "Australian", "element": "Water", "duration_minutes": 18, "description": "Invite seasonal renewal through gentle breath and release of emotional residue."},
    {"id": "energy-healing-australian-211", "name": "Country Respect Offering", "modality": "Australian", "element": "Spirit", "duration_minutes": 17, "description": "Practice reciprocal gratitude to place while anchoring humility and responsibility."},
    {"id": "energy-healing-australian-212", "name": "Dreaming Integration Journal", "modality": "Australian", "element": "Earth", "duration_minutes": 16, "description": "Convert insight into embodied commitments through structured integration journaling."},

    {"id": "energy-healing-crystal-201", "name": "Black Tourmaline Boundary Grid", "modality": "Crystal", "element": "Earth", "duration_minutes": 22, "description": "Construct an energetic boundary grid to reduce overwhelm and re-establish centered presence."},
    {"id": "energy-healing-crystal-202", "name": "Rose Quartz Heart Recovery", "modality": "Crystal", "element": "Water", "duration_minutes": 26, "description": "Soothe relational pain with heart-holding ritual and compassionate body tracking."},
    {"id": "energy-healing-crystal-203", "name": "Citrine Confidence Ignition", "modality": "Crystal", "element": "Fire", "duration_minutes": 18, "description": "Strengthen self-trust and action through solar plexus crystal placement and breath activation."},
    {"id": "energy-healing-crystal-204", "name": "Amethyst Crown Clarification", "modality": "Crystal", "element": "Air", "duration_minutes": 21, "description": "Clear mental noise and restore clarity with crown-oriented stillness protocol."},
    {"id": "energy-healing-crystal-205", "name": "Obsidian Trauma Grounding", "modality": "Crystal", "element": "Earth", "duration_minutes": 28, "description": "Ground hypervigilance with dark-stone containment and consent-centered pacing."},
    {"id": "energy-healing-crystal-206", "name": "Selenite Field Purification", "modality": "Crystal", "element": "Air", "duration_minutes": 15, "description": "Sweep the auric field and release static energetic residue with calm breath sequencing."},
    {"id": "energy-healing-crystal-207", "name": "Labradorite Intuition Tuning", "modality": "Crystal", "element": "Spirit", "duration_minutes": 20, "description": "Refine intuition while staying grounded in body evidence and practical discernment."},
    {"id": "energy-healing-crystal-208", "name": "Carnelian Creative Repair", "modality": "Crystal", "element": "Fire", "duration_minutes": 19, "description": "Re-open blocked creative current through sacral warmth and rhythmic movement."},
    {"id": "energy-healing-crystal-209", "name": "Fluorite Focus Circuit", "modality": "Crystal", "element": "Air", "duration_minutes": 14, "description": "Train attention coherence and reduce mental fragmentation through focused practice loops."},
    {"id": "energy-healing-crystal-210", "name": "Moonstone Cyclical Soothing", "modality": "Crystal", "element": "Water", "duration_minutes": 24, "description": "Support cyclical emotional regulation with moonstone-led rest and repair protocol."},
    {"id": "energy-healing-crystal-211", "name": "Clear Quartz Amplification Ethics", "modality": "Crystal", "element": "Spirit", "duration_minutes": 17, "description": "Amplify healing intention responsibly with ethical framing and boundary awareness."},
    {"id": "energy-healing-crystal-212", "name": "Hematite Root Rebuild", "modality": "Crystal", "element": "Earth", "duration_minutes": 16, "description": "Rebuild root stability after stress overload through weighted grounding and breath downshift."},

    {"id": "energy-healing-sound-201", "name": "Low-Frequency Safety Toning", "modality": "Sound", "element": "Earth", "duration_minutes": 20, "description": "Use low sustained tones to signal safety and reduce hyperarousal in the nervous system."},
    {"id": "energy-healing-sound-202", "name": "Vowel Ladder Emotional Release", "modality": "Sound", "element": "Water", "duration_minutes": 23, "description": "Move emotional stagnation through ascending vowel toning and paced breath cycles."},
    {"id": "energy-healing-sound-203", "name": "Drum Rhythm Grounding Protocol", "modality": "Sound", "element": "Earth", "duration_minutes": 18, "description": "Stabilize dissociative drift with repetitive rhythm and present-moment orientation."},
    {"id": "energy-healing-sound-204", "name": "Harmonic Breath Resynchronization", "modality": "Sound", "element": "Air", "duration_minutes": 16, "description": "Resynchronize breath and heart rhythm through harmonic layering and silence intervals."},
    {"id": "energy-healing-sound-205", "name": "Bell Sweep Boundary Reset", "modality": "Sound", "element": "Spirit", "duration_minutes": 14, "description": "Reset energetic boundaries with directional bell sweeps and embodiment check-ins."},
    {"id": "energy-healing-sound-206", "name": "Heart Drum Coherence Session", "modality": "Sound", "element": "Fire", "duration_minutes": 22, "description": "Train compassionate courage through drum-heart entrainment and grounded action vows."},
    {"id": "energy-healing-sound-207", "name": "Chime Breath Window", "modality": "Sound", "element": "Air", "duration_minutes": 12, "description": "Create micro-reset windows with chime punctuations and deliberate recovery breaths."},
    {"id": "energy-healing-sound-208", "name": "Mantra Resonance Repair", "modality": "Sound", "element": "Spirit", "duration_minutes": 19, "description": "Use short mantra loops to restore coherence after emotional rupture."},
    {"id": "energy-healing-sound-209", "name": "Body Humming Fascia Melt", "modality": "Sound", "element": "Water", "duration_minutes": 17, "description": "Soften fascia tension through body humming pathways and jaw-throat release."},
    {"id": "energy-healing-sound-210", "name": "Silence Integration Chamber", "modality": "Sound", "element": "Spirit", "duration_minutes": 15, "description": "Integrate soundwork effects in a structured silence chamber with sensation tracking."},
    {"id": "energy-healing-sound-211", "name": "Breath-Drum Transition Rite", "modality": "Sound", "element": "Fire", "duration_minutes": 21, "description": "Bridge breath regulation into empowered action using incremental rhythm increases."},
    {"id": "energy-healing-sound-212", "name": "Evening Toning Downshift", "modality": "Sound", "element": "Water", "duration_minutes": 13, "description": "Downshift evening activation through soft tones and restorative exhale ratios."},

    {"id": "energy-healing-quantum-201", "name": "Timeline Release Protocol", "modality": "Quantum", "element": "Spirit", "duration_minutes": 31, "description": "Release repeating emotional loops through present-moment witnessing and conscious re-choice."},
    {"id": "energy-healing-quantum-202", "name": "Future-Self Embodiment Anchor", "modality": "Quantum", "element": "Fire", "duration_minutes": 24, "description": "Anchor desired-state identity in body posture, breath pattern, and immediate action."},
    {"id": "energy-healing-quantum-203", "name": "Parallel Choice Clarity Drill", "modality": "Quantum", "element": "Air", "duration_minutes": 19, "description": "Resolve indecision by comparing body responses across competing choices."},
    {"id": "energy-healing-quantum-204", "name": "Field Entanglement Repair", "modality": "Quantum", "element": "Water", "duration_minutes": 27, "description": "Disentangle over-fused relational energy while preserving compassion and dignity."},
    {"id": "energy-healing-quantum-205", "name": "Memory Charge Neutralization", "modality": "Quantum", "element": "Earth", "duration_minutes": 22, "description": "Reduce charge on intrusive memory loops through paced exposure and breath containment."},
    {"id": "energy-healing-quantum-206", "name": "Observer State Stabilization", "modality": "Quantum", "element": "Air", "duration_minutes": 18, "description": "Stabilize observer awareness while remaining connected to bodily sensation and emotion."},
    {"id": "energy-healing-quantum-207", "name": "Coherence Decision Gateway", "modality": "Quantum", "element": "Fire", "duration_minutes": 16, "description": "Make aligned decisions from coherent state rather than stress reactivity."},
    {"id": "energy-healing-quantum-208", "name": "Quantum Grief Translation", "modality": "Quantum", "element": "Water", "duration_minutes": 29, "description": "Translate grief into meaning and service through ritualized witnessing and integration."},
    {"id": "energy-healing-quantum-209", "name": "Field Boundary Calibration", "modality": "Quantum", "element": "Earth", "duration_minutes": 17, "description": "Calibrate energetic boundaries for empathic people without emotional collapse."},
    {"id": "energy-healing-quantum-210", "name": "Belief Architecture Rewrite", "modality": "Quantum", "element": "Spirit", "duration_minutes": 26, "description": "Rewrite limiting narratives through body-led evidence and accountability commitments."},
    {"id": "energy-healing-quantum-211", "name": "Signal-to-Noise Reduction", "modality": "Quantum", "element": "Air", "duration_minutes": 14, "description": "Filter intuition from anxiety noise through structured inquiry and regulation."},
    {"id": "energy-healing-quantum-212", "name": "Embodied Probability Shift", "modality": "Quantum", "element": "Fire", "duration_minutes": 23, "description": "Shift behavioral probability toward healing outcomes using repetition and somatic anchors."},

    {"id": "energy-healing-reiki-201", "name": "Reiki Root Safety Hold", "modality": "Reiki", "element": "Earth", "duration_minutes": 20, "description": "Rebuild baseline safety through root-hand placements and gentle breath regulation."},
    {"id": "energy-healing-reiki-202", "name": "Heart-Line Forgiveness Flow", "modality": "Reiki", "element": "Water", "duration_minutes": 25, "description": "Support heart repair and forgiveness without bypassing boundaries or accountability."},
    {"id": "energy-healing-reiki-203", "name": "Solar Plexus Confidence Seal", "modality": "Reiki", "element": "Fire", "duration_minutes": 18, "description": "Restore agency by sealing confidence at the solar plexus with intentional breathwork."},
    {"id": "energy-healing-reiki-204", "name": "Throat Truth Activation", "modality": "Reiki", "element": "Air", "duration_minutes": 16, "description": "Release throat constriction and strengthen truthful speech under pressure."},
    {"id": "energy-healing-reiki-205", "name": "Third Eye Clarity Sweep", "modality": "Reiki", "element": "Air", "duration_minutes": 14, "description": "Clear cognitive overload and recover focused perception with calm attention loops."},
    {"id": "energy-healing-reiki-206", "name": "Crown Surrender Integration", "modality": "Reiki", "element": "Spirit", "duration_minutes": 19, "description": "Cultivate surrender while staying grounded in practical embodiment."},
    {"id": "energy-healing-reiki-207", "name": "Reiki Trauma Pace Protocol", "modality": "Reiki", "element": "Water", "duration_minutes": 28, "description": "Practice trauma-aware pacing to prevent overwhelm and support gradual integration."},
    {"id": "energy-healing-reiki-208", "name": "Morning Reiki Coherence", "modality": "Reiki", "element": "Fire", "duration_minutes": 12, "description": "Start the day in coherent alignment before entering relational or work demands."},
    {"id": "energy-healing-reiki-209", "name": "Evening Reiki Release", "modality": "Reiki", "element": "Water", "duration_minutes": 13, "description": "Release accumulated relational load and reset for restorative sleep."},
    {"id": "energy-healing-reiki-210", "name": "Boundary Blessing Sequence", "modality": "Reiki", "element": "Earth", "duration_minutes": 15, "description": "Bless your boundaries as acts of devotion, not defense."},
    {"id": "energy-healing-reiki-211", "name": "Reiki Integration Vow Practice", "modality": "Reiki", "element": "Spirit", "duration_minutes": 17, "description": "Complete each session with one embodied vow and next-action follow-through."},
    {"id": "energy-healing-reiki-212", "name": "Relational Repair Hand Protocol", "modality": "Reiki", "element": "Water", "duration_minutes": 21, "description": "Prepare for healthy repair conversations through hand placement and emotional regulation."},

    {"id": "energy-healing-sekhem-201", "name": "Sekhem Fire Column", "modality": "Sekhem", "element": "Fire", "duration_minutes": 27, "description": "Channel vertical fire current through spinal alignment and grounded breath cycles."},
    {"id": "energy-healing-sekhem-202", "name": "Sekhem Heart Temple Purge", "modality": "Sekhem", "element": "Water", "duration_minutes": 25, "description": "Cleanse emotional density in the heart temple while preserving compassionate boundaries."},
    {"id": "energy-healing-sekhem-203", "name": "Sekhem Solar Discipline Rite", "modality": "Sekhem", "element": "Fire", "duration_minutes": 20, "description": "Convert spiritual intention into disciplined embodied action through solar activation."},
    {"id": "energy-healing-sekhem-204", "name": "Sekhem Breath-Lock Transmutation", "modality": "Sekhem", "element": "Air", "duration_minutes": 18, "description": "Use gentle breath-lock windows to transmute agitation into coherent focus."},
    {"id": "energy-healing-sekhem-205", "name": "Sekhem Boundary Throne", "modality": "Sekhem", "element": "Earth", "duration_minutes": 16, "description": "Re-seat your authority through boundary declaration and rooted body posture."},
    {"id": "energy-healing-sekhem-206", "name": "Sekhem Trauma Softening Arc", "modality": "Sekhem", "element": "Water", "duration_minutes": 29, "description": "Soften trauma load through incremental exposure, breath pacing, and orienting cycles."},
    {"id": "energy-healing-sekhem-207", "name": "Sekhem Voice of Truth", "modality": "Sekhem", "element": "Air", "duration_minutes": 15, "description": "Unlock throat expression and clear suppression patterns through voice ritual."},
    {"id": "energy-healing-sekhem-208", "name": "Sekhem Grief-to-Service Alchemy", "modality": "Sekhem", "element": "Spirit", "duration_minutes": 31, "description": "Transform grief into service orientation with ritualized commitment and support mapping."},
    {"id": "energy-healing-sekhem-209", "name": "Sekhem Integrative Silence", "modality": "Sekhem", "element": "Spirit", "duration_minutes": 13, "description": "Integrate energetic work in structured silence and body sensation reflection."},
    {"id": "energy-healing-sekhem-210", "name": "Sekhem Field Repair Scan", "modality": "Sekhem", "element": "Earth", "duration_minutes": 19, "description": "Scan and repair field ruptures caused by stress overload and relational conflict."},
    {"id": "energy-healing-sekhem-211", "name": "Sekhem Dawn Alignment", "modality": "Sekhem", "element": "Fire", "duration_minutes": 14, "description": "Daily dawn protocol for coherent initiation into purpose-driven action."},
    {"id": "energy-healing-sekhem-212", "name": "Sekhem Night Closure", "modality": "Sekhem", "element": "Water", "duration_minutes": 12, "description": "Close daily energetic loops to protect sleep quality and emotional recovery."},

    {"id": "energy-healing-dreamtime-201", "name": "Dreamtime Earth Memory Retrieval", "modality": "Dreamtime", "element": "Earth", "duration_minutes": 30, "description": "Retrieve forgotten inner wisdom through body memory tracking and grounded reflection."},
    {"id": "energy-healing-dreamtime-202", "name": "Dreamtime River Emotion Passage", "modality": "Dreamtime", "element": "Water", "duration_minutes": 26, "description": "Allow emotional movement without collapse through river-imagery pacing ritual."},
    {"id": "energy-healing-dreamtime-203", "name": "Dreamtime Ancestor Dialogue", "modality": "Dreamtime", "element": "Spirit", "duration_minutes": 33, "description": "Develop ethical ancestor dialogue with discernment, boundaries, and integration."},
    {"id": "energy-healing-dreamtime-204", "name": "Dreamtime Breath Drum Walk", "modality": "Dreamtime", "element": "Air", "duration_minutes": 22, "description": "Walk-breath protocol for restoring coherence after overwhelm and grief activation."},
    {"id": "energy-healing-dreamtime-205", "name": "Dreamtime Vision Thread", "modality": "Dreamtime", "element": "Air", "duration_minutes": 18, "description": "Clarify recurring vision patterns and convert them into grounded action steps."},
    {"id": "energy-healing-dreamtime-206", "name": "Dreamtime Fire Renewal", "modality": "Dreamtime", "element": "Fire", "duration_minutes": 21, "description": "Renew depleted life-force through safe activation, orientation, and embodied closure."},
    {"id": "energy-healing-dreamtime-207", "name": "Dreamtime Boundary Lore", "modality": "Dreamtime", "element": "Earth", "duration_minutes": 16, "description": "Strengthen boundary literacy through story ritual and practical relational agreements."},
    {"id": "energy-healing-dreamtime-208", "name": "Dreamtime Grief Resting Place", "modality": "Dreamtime", "element": "Water", "duration_minutes": 24, "description": "Create a safe resting place for unresolved grief with ritual containment steps."},
    {"id": "energy-healing-dreamtime-209", "name": "Dreamtime Integration Mapping", "modality": "Dreamtime", "element": "Earth", "duration_minutes": 17, "description": "Map visions into weekly embodied practices and accountability anchors."},
    {"id": "energy-healing-dreamtime-210", "name": "Dreamtime Compassion Return", "modality": "Dreamtime", "element": "Spirit", "duration_minutes": 15, "description": "Return to self-compassion after emotional rupture using breath and hand ritual."},
    {"id": "energy-healing-dreamtime-211", "name": "Dreamtime Night Safeguard", "modality": "Dreamtime", "element": "Air", "duration_minutes": 14, "description": "Protect sleep and dream integration with structured nervous-system downshifting."},
    {"id": "energy-healing-dreamtime-212", "name": "Dreamtime Morning Re-Entry", "modality": "Dreamtime", "element": "Fire", "duration_minutes": 12, "description": "Re-enter waking life with coherence after intense dream processing nights."},

    {"id": "energy-healing-pranic-201", "name": "Pranic Root Purification", "modality": "Pranic", "element": "Earth", "duration_minutes": 20, "description": "Purify root channel congestion and rebuild stability through pranic sweep sequence."},
    {"id": "energy-healing-pranic-202", "name": "Pranic Heart Ventilation", "modality": "Pranic", "element": "Water", "duration_minutes": 24, "description": "Vent emotional accumulation from heart field with breath-led pranic release."},
    {"id": "energy-healing-pranic-203", "name": "Pranic Solar Recharge", "modality": "Pranic", "element": "Fire", "duration_minutes": 18, "description": "Recharge depleted vitality through controlled solar plexus pranic accumulation."},
    {"id": "energy-healing-pranic-204", "name": "Pranic Throat Clearing", "modality": "Pranic", "element": "Air", "duration_minutes": 16, "description": "Clear expressive blockages and restore truthful communication pathways."},
    {"id": "energy-healing-pranic-205", "name": "Pranic Crown Stabilization", "modality": "Pranic", "element": "Spirit", "duration_minutes": 19, "description": "Stabilize high-frequency states through crown grounding and embodied containment."},
    {"id": "energy-healing-pranic-206", "name": "Pranic Emotional Detox", "modality": "Pranic", "element": "Water", "duration_minutes": 26, "description": "Detox emotional residue with trauma-aware pacing and body-based discharge cycles."},
    {"id": "energy-healing-pranic-207", "name": "Pranic Boundary Sweep", "modality": "Pranic", "element": "Earth", "duration_minutes": 14, "description": "Sweep external energetic residue and re-establish clear personal field edges."},
    {"id": "energy-healing-pranic-208", "name": "Pranic Focus Beam", "modality": "Pranic", "element": "Air", "duration_minutes": 13, "description": "Reduce cognitive fragmentation by strengthening single-pointed focus current."},
    {"id": "energy-healing-pranic-209", "name": "Pranic Action Ignition", "modality": "Pranic", "element": "Fire", "duration_minutes": 15, "description": "Convert insight into motion through short high-coherence activation cycles."},
    {"id": "energy-healing-pranic-210", "name": "Pranic Recovery Basin", "modality": "Pranic", "element": "Water", "duration_minutes": 17, "description": "Recover after overload with restorative pranic pooling and breath downregulation."},
    {"id": "energy-healing-pranic-211", "name": "Pranic Integrity Seal", "modality": "Pranic", "element": "Spirit", "duration_minutes": 12, "description": "Seal daily field integrity through brief ritualized completion practice."},
    {"id": "energy-healing-pranic-212", "name": "Pranic Daily Embodiment Close", "modality": "Pranic", "element": "Earth", "duration_minutes": 11, "description": "Close each day with practical integration, gratitude, and field reset."},
]

MINDFULNESS_SUPPLEMENTS = [
    {
        "id": "mindful-threshold-walk",
        "name": "Threshold Walking Meditation",
        "category": "movement",
        "element": "earth",
        "duration_minutes": 10,
        "description": "A doorway-to-doorway awareness practice for transitions and emotional resets.",
        "linked_practices": ["yoga-sequence-grounding-flow", "water-practice-auric-rinse"],
    },
    {
        "id": "mindful-dawn-breath",
        "name": "Dawn Breath Witnessing",
        "category": "breath",
        "element": "air",
        "duration_minutes": 7,
        "description": "Observe breath texture at first light and journal one body sensation per minute.",
        "linked_practices": ["yoga-sequence-sunrise-awakening"],
    },
    {"id": "mindful-body-prayer", "name": "Body Prayer Scan", "category": "meditation", "element": "water", "duration_minutes": 12, "description": "Devotional body scan with breath, sensation tracking, and nervous-system settling."},
    {"id": "mindful-threshold-journaling", "name": "Threshold Journaling Ritual", "category": "writing", "element": "earth", "duration_minutes": 14, "description": "Journal one release, one gratitude, and one practical integration step."},
    {"id": "mindful-heart-coherence", "name": "Heart Coherence Pause", "category": "breath", "element": "air", "duration_minutes": 8, "description": "Regulate breath and heart focus to restore emotional coherence before key decisions."},
    {"id": "mindful-voice-toning", "name": "Compassion Toning", "category": "voice", "element": "spirit", "duration_minutes": 10, "description": "Short humming and vowel toning sequence for self-soothing and embodied compassion."},
    {"id": "mindful-evening-integration", "name": "Evening Integration Review", "category": "reflection", "element": "earth", "duration_minutes": 9, "description": "Close the day with embodied review and one course-correction promise."},
    {"id": "mindful-water-listening", "name": "Water Listening Stillness", "category": "nature", "element": "water", "duration_minutes": 11, "description": "Listen to water while tracking emotional shifts and completing release breaths."},
    {"id": "mindful-boundary-reset", "name": "Boundary Reset Breath", "category": "breath", "element": "fire", "duration_minutes": 7, "description": "Micro-practice for restoring boundaries without collapsing compassion."},
]

MEDITATION_SUPPLEMENTS = [
    {"id": "meditation-supp-101", "title": "Temple of Still Waters", "category": "inner-healing", "element": "water", "duration_minutes": 18, "description": "A long-form stillness meditation for emotional settling and somatic trust."},
    {"id": "meditation-supp-102", "title": "Lionheart Presence", "category": "confidence", "element": "fire", "duration_minutes": 16, "description": "Regulate fear and anchor courage through paced breath and posture coherence."},
    {"id": "meditation-supp-103", "title": "Mountain Spine Alignment", "category": "grounding", "element": "earth", "duration_minutes": 20, "description": "Lengthen spine, soften jaw, and stabilize inner dialogue with deep grounding."},
    {"id": "meditation-supp-104", "title": "Sky Mind Spaciousness", "category": "clarity", "element": "air", "duration_minutes": 15, "description": "Create mental spaciousness and reduce overthinking through attention training."},
    {"id": "meditation-supp-105", "title": "Ancestral Gratitude Sit", "category": "devotional", "element": "spirit", "duration_minutes": 22, "description": "Offer gratitude to lineage while tracking body resonance and practical integration."},
    {"id": "meditation-supp-106", "title": "Dusk Nervous System Reset", "category": "restoration", "element": "water", "duration_minutes": 14, "description": "Evening protocol for decompression, breath downshifting, and emotional release."},
    {"id": "meditation-supp-107", "title": "Inner Witness Training", "category": "awareness", "element": "air", "duration_minutes": 17, "description": "Strengthen witness consciousness without dissociating from felt experience."},
    {"id": "meditation-supp-108", "title": "Soul Compass Meditation", "category": "purpose", "element": "spirit", "duration_minutes": 19, "description": "Clarify purpose through body-based inquiry and practical commitment vows."},
]

MANTRA_SUPPLEMENTS = [
    {"id": "mantra-supp-201", "name": "Om Hrim Soham Shakti", "sanskrit": "ॐ ह्रीं सोऽहं शक्तिः", "transliteration": "Om Hrim Soham Shakti", "element": "fire", "duration_minutes": 16, "meaning": "I embody luminous transformative power with humility."},
    {"id": "mantra-supp-202", "name": "Ram Yam Hridaya", "sanskrit": "रं यं हृदय", "transliteration": "Ram Yam Hridaya", "element": "air", "duration_minutes": 14, "meaning": "I ignite clear boundaries and compassionate heart coherence."},
    {"id": "mantra-supp-203", "name": "Om Aim Medha", "sanskrit": "ॐ ऐं मेधा", "transliteration": "Om Aim Medha", "element": "air", "duration_minutes": 12, "meaning": "May wisdom and clarity guide my speech and actions."},
    {"id": "mantra-supp-204", "name": "Shreem Klim Sauh", "sanskrit": "श्रीं क्लीं सौः", "transliteration": "Shreem Klim Sauh", "element": "water", "duration_minutes": 18, "meaning": "I call in sacred abundance aligned with integrity."},
    {"id": "mantra-supp-205", "name": "Om Gam Ganapataye", "sanskrit": "ॐ गं गणपतये", "transliteration": "Om Gam Ganapataye", "element": "earth", "duration_minutes": 10, "meaning": "Obstacles dissolve as I move with grounded devotion."},
    {"id": "mantra-supp-206", "name": "Om Tara Tuttare", "sanskrit": "ॐ तारे तुत्तारे", "transliteration": "Om Tara Tuttare", "element": "water", "duration_minutes": 15, "meaning": "Compassion and courage protect my path."},
    {"id": "mantra-supp-207", "name": "Om Vajra Satva Hum", "sanskrit": "ॐ वज्र सत्व हुम्", "transliteration": "Om Vajra Satva Hum", "element": "spirit", "duration_minutes": 17, "meaning": "I purify body, speech, and mind with truth."},
    {"id": "mantra-supp-208", "name": "Om Namah Shivaya Hridayam", "sanskrit": "ॐ नमः शिवाय हृदयम्", "transliteration": "Om Namah Shivaya Hridayam", "element": "spirit", "duration_minutes": 20, "meaning": "I bow to inner consciousness and embodied stillness."},
    {"id": "mantra-supp-209", "name": "So Hum Antar Jyoti", "sanskrit": "सो हम अन्तर ज्योति", "transliteration": "So Hum Antar Jyoti", "element": "air", "duration_minutes": 11, "meaning": "I am the inner light breathing through all moments."},
    {"id": "mantra-supp-210", "name": "Om Shanti Hridaya", "sanskrit": "ॐ शान्ति हृदय", "transliteration": "Om Shanti Hridaya", "element": "earth", "duration_minutes": 13, "meaning": "Peace anchors in my body, speech, and relationships."},
]

SHAMANIC_ADVANCED_SUPPLEMENTS = [
    {
        "id": "shamanic-advanced-soul-retrieval",
        "name": "Deep Soul Retrieval Descent",
        "category": "journey",
        "tradition": "Andean / Core Shamanic",
        "duration_minutes": 38,
        "description": "Advanced journey protocol for reclaiming exiled vitality fragments with strict safety, witness integration, and post-journey nervous-system repair.",
        "preparation": "Set circle boundaries, identify support contact, and establish a 4-6 breath regulation rhythm before drumming begins.",
        "journey_steps": [
            "Name the lost essence quality you are reclaiming and anchor one body sensation to track throughout the descent.",
            "Journey through lower-world imagery while keeping one hand on your heart for orienting safety.",
            "Invite the returned essence through breath, voice, and micro-movement until warmth and coherence increase.",
            "Seal retrieval with hydration, written integration notes, and one concrete life action within 24 hours.",
        ],
        "safety_notes": "Not for acute destabilization states. Pause if dissociation rises; orient to room, feet, and breath before continuing.",
        "closing_prayer": "I welcome my returned essence with responsibility, tenderness, and grounded action.",
    },
    {
        "id": "shamanic-advanced-ancestral-court",
        "name": "Ancestral Court Reconciliation Rite",
        "category": "healing",
        "tradition": "West African Diaspora / Ritual Dialogue",
        "duration_minutes": 34,
        "description": "Ceremonial protocol to process inherited burden patterns and negotiate intergenerational repair through reverent ancestral witness work.",
        "preparation": "Prepare photos/symbols, white candle, and two pages for dialogue notes (burden + blessing columns).",
        "journey_steps": [
            "Open with three offerings: breath, gratitude, and one truthful acknowledgment of inherited pain.",
            "Name the lineage burden pattern and ask what boundary/action ends its repetition in your branch.",
            "Receive one blessing quality and embody it with upright posture, softened jaw, and coherent exhale.",
            "Close with a service vow expressed as one relational repair action this week.",
        ],
        "safety_notes": "Practice with support if trauma activation is high. Keep sessions time-bounded and ground physically after completion.",
    },
    {
        "id": "shamanic-advanced-fire-vision-fast",
        "name": "Fire Vision Fast (Short Form)",
        "category": "ceremony",
        "tradition": "Indigenous Fire Circle / Vision Quest Adaptation",
        "duration_minutes": 42,
        "description": "Guided abbreviated fast + fire protocol for clarifying purpose through disciplined silence, tracking inner resistance, and receiving directional vision.",
        "preparation": "Hydrate well, avoid stimulants, and define a single guiding question before entering the fire watch.",
        "journey_steps": [
            "Hold silent watch for twelve breath cycles while gazing softly at the flame perimeter.",
            "Speak your core question aloud once, then return to receptive silence with relaxed lower belly.",
            "Record three phrases/images that repeat; treat repetition as signal rather than noise.",
            "Translate insight into one measurable 7-day commitment.",
        ],
    },
    {
        "id": "shamanic-advanced-drum-protocol",
        "name": "Three-World Drum Navigation Protocol",
        "category": "journey",
        "tradition": "Core Shamanic Drumming",
        "duration_minutes": 36,
        "description": "Precision drumming structure for transitioning through lower, middle, and upper world inquiry while preserving coherent return and integration.",
        "preparation": "Set timer blocks (12/12/12), choose retrieval focus, and establish re-entry cue phrase before beginning.",
        "journey_steps": [
            "Lower world: seek embodied resource and protective ally support.",
            "Middle world: witness current relational/systemic pattern without collapse.",
            "Upper world: request directional teaching and future-aligned correction.",
            "Return through reverse sequence and seal with breath, hydration, and grounding meal.",
        ],
    },
    {
        "id": "shamanic-advanced-shadow-bone",
        "name": "Shadow Bone Oracle Integration",
        "category": "integration",
        "tradition": "Bone Casting / Symbolic Divination",
        "duration_minutes": 30,
        "description": "Advanced shadow integration sequence using symbolic pattern reading to identify avoidance loops and convert insight into embodied accountability.",
        "preparation": "Choose 6-9 symbolic objects and assign one intentional domain to each before casting.",
        "journey_steps": [
            "Cast symbols once; read first pattern before cognitive editing begins.",
            "Identify one avoided truth and one protective adaptation that can now soften.",
            "Anchor correction through breath + posture + one sentence accountability vow.",
            "Complete one practical repair action within 48 hours.",
        ],
    },
    {
        "id": "shamanic-advanced-river-rebirth",
        "name": "River Rebirth Crossing",
        "category": "ritual",
        "tradition": "Water Crossing Rite",
        "duration_minutes": 33,
        "description": "Threshold crossing ritual for identity transitions, grief release, and re-entry into next-phase commitments with body-led consent.",
        "preparation": "Mark crossing line physically, prepare dry grounding layer, and define old identity / new commitment statements.",
        "journey_steps": [
            "Speak the identity you are completing and name what it protected.",
            "Cross water boundary slowly while extending exhale and relaxing shoulders.",
            "Speak your next-phase commitment aloud three times with stable posture.",
            "Close by writing non-negotiable support structures for the transition.",
        ],
    },
]

EARTH_CRAFTING_TOOL_SUPPLEMENTS = [
    {
        "id": "earth-crafting-stone-001",
        "name": "River Stone Prayer Bundle",
        "category": "earth-crafting",
        "element": "Earth",
        "duration_minutes": 24,
        "description": "Craft a palm-size stone bundle that anchors grief, gratitude, and daily devotional focus.",
    },
    {
        "id": "earth-crafting-tool-002",
        "name": "Sacred Tool Birthing: Breath Rattle",
        "category": "sacred-tool-birthing",
        "element": "Air",
        "duration_minutes": 28,
        "description": "Birth a personal rattle through rhythm, intention, and co-regulation breath to support ceremony.",
    },
    {
        "id": "earth-crafting-tool-003",
        "name": "Clay Vessel Intention Firing",
        "category": "earth-crafting",
        "element": "Earth",
        "duration_minutes": 20,
        "description": "Shape a small clay vessel to hold one season-long intention and embodied commitment.",
    },
    {
        "id": "earth-crafting-tool-004",
        "name": "Herbal Smoke Wand with Consent",
        "category": "sacred-tool-birthing",
        "element": "Fire",
        "duration_minutes": 26,
        "description": "Assemble a smoke wand with ethical sourcing, clear boundaries, and trauma-aware pacing.",
    },
    {
        "id": "earth-crafting-tool-005",
        "name": "Blessed Water Bowl Craft",
        "category": "earth-crafting",
        "element": "Water",
        "duration_minutes": 18,
        "description": "Create a dedicated bowl for blessing, release rituals, and daily emotional integration.",
    },
    {
        "id": "earth-crafting-tool-006",
        "name": "Threaded Protection Cord",
        "category": "sacred-tool-birthing",
        "element": "Air",
        "duration_minutes": 16,
        "description": "Weave a cord with breath counts and spoken values to support boundary integrity.",
    },
    {
        "id": "earth-crafting-tool-007",
        "name": "Sunrise Ash Sigil Tablet",
        "category": "earth-crafting",
        "element": "Fire",
        "duration_minutes": 22,
        "description": "Mix ash and clay to press a daily sigil tablet for sunrise intention anchoring.",
    },
    {
        "id": "earth-crafting-tool-008",
        "name": "Ancestor Altar Cloth Dye",
        "category": "sacred-tool-birthing",
        "element": "Water",
        "duration_minutes": 30,
        "description": "Dye altar cloth with natural pigments while speaking lineage blessings and boundaries.",
    },
    {
        "id": "earth-crafting-tool-009",
        "name": "Sacred Tool Birthing: Medicine Drum",
        "category": "sacred-tool-birthing",
        "element": "Earth",
        "duration_minutes": 42,
        "description": "Birth a hand drum with ethically sourced hide and frame, consecrate rhythm, and seal with gratitude ceremony.",
    },
    {
        "id": "earth-crafting-tool-010",
        "name": "Sacred Tool Birthing: Ceremony Wand",
        "category": "sacred-tool-birthing",
        "element": "Air",
        "duration_minutes": 34,
        "description": "Carve and bind a ceremonial wand from naturally fallen wood, plant resins, and intention-anchored thread.",
    },
    {
        "id": "earth-crafting-tool-011",
        "name": "Sacred Tool Birthing: Prayer Staff",
        "category": "sacred-tool-birthing",
        "element": "Earth",
        "duration_minutes": 48,
        "description": "Create a walking prayer staff with lineage-safe symbols, boundary vows, and integration procession.",
    },
    {
        "id": "earth-crafting-tool-012",
        "name": "Sacred Tool Birthing: Feather Fan",
        "category": "sacred-tool-birthing",
        "element": "Air",
        "duration_minutes": 29,
        "description": "Assemble a cleansing feather fan through ethical sourcing agreements, breath prayer, and smoke-free blessing ritual.",
    },
    {
        "id": "earth-crafting-tool-013",
        "name": "Sacred Tool Birthing: Boundary Rattle Pair",
        "category": "sacred-tool-birthing",
        "element": "Fire",
        "duration_minutes": 36,
        "description": "Birth paired rattles for invocation and closure, including consent ritual and ethical material blessings.",
    },
    {
        "id": "earth-crafting-tool-014",
        "name": "Sacred Tool Birthing: Herbal Offering Bowl",
        "category": "sacred-tool-birthing",
        "element": "Water",
        "duration_minutes": 27,
        "description": "Craft an offering bowl for herbs, flowers, and prayers while honoring reciprocal harvesting ethics.",
    },
]

CHAIR_YOGA_SUPPLEMENTS = [
    {
        "id": "chair-yoga-201",
        "name": "Chair Neck & Jaw Unwinding",
        "style": "Accessible",
        "element": "Air",
        "duration_minutes": 8,
        "description": "Gentle seated release for jaw, throat, and neck to reduce stress and restore expression.",
        "body_focus": "Jaw, throat, cervical fascia",
        "breathing_pattern": "Inhale 4, exhale 6",
        "instructions": [
            "Sit upright with feet grounded and hands resting on thighs.",
            "Soften jaw and trace tiny circles with your chin.",
            "Lift and lower shoulders slowly with breath.",
            "Hum softly on exhales to relax throat fascia.",
            "Close with 5 slow breaths and stillness.",
        ],
    },
    {
        "id": "chair-yoga-202",
        "name": "Chair Hip Basin Flow",
        "style": "Accessible",
        "element": "Water",
        "duration_minutes": 10,
        "description": "Seated hip and lower-back mobility to release stored tension and support pelvic safety.",
        "body_focus": "Pelvis, sacrum, low back",
        "breathing_pattern": "Inhale 4, exhale 6",
        "instructions": [
            "Root feet and lengthen spine.",
            "Slowly tilt pelvis forward and back with breath.",
            "Make gentle figure-eight circles through hips.",
            "Add side bends while keeping sit bones anchored.",
            "Pause and notice softening in lower belly.",
        ],
    },
    {
        "id": "chair-yoga-203",
        "name": "Chair Shoulder Gate Opener",
        "style": "Accessible",
        "element": "Air",
        "duration_minutes": 9,
        "description": "Supported shoulder and chest opening for posture, breath capacity, and emotional release.",
        "body_focus": "Shoulders, chest, upper thoracic fascia",
        "breathing_pattern": "Inhale 5, exhale 7",
        "instructions": [
            "Interlace fingers behind back or hold a strap.",
            "Lift sternum gently while keeping ribs soft.",
            "Alternate shoulder circles forward and backward.",
            "Reach one arm overhead and side bend each side.",
            "Finish with hands at heart and long exhales.",
        ],
    },
    {
        "id": "chair-yoga-204",
        "name": "Chair Core Stability Spiral",
        "style": "Accessible",
        "element": "Fire",
        "duration_minutes": 11,
        "description": "Seated core activation and spinal spiral for confidence, digestion, and grounded power.",
        "body_focus": "Core, obliques, thoracolumbar fascia",
        "breathing_pattern": "Inhale 4, exhale 5",
        "instructions": [
            "Sit tall and lightly engage lower belly.",
            "Rotate right and left with controlled breath.",
            "Add opposite elbow-to-knee cross pattern slowly.",
            "Pause between rounds to down-regulate.",
            "Close with one hand on solar plexus.",
        ],
    },
    {
        "id": "chair-yoga-205",
        "name": "Chair Lymphatic Wake-Up",
        "style": "Accessible",
        "element": "Water",
        "duration_minutes": 8,
        "description": "Low-impact seated sequence to boost circulation and reduce morning stiffness.",
        "body_focus": "Ankles, calves, armpits, neck",
        "breathing_pattern": "Natural breath",
        "instructions": [
            "Pump ankles and spread toes slowly.",
            "Tap collarbones and underarms softly.",
            "Swing arms across body with relaxed jaw.",
            "March in place while seated for one minute.",
            "Rest with palms on thighs and breathe.",
        ],
    },
    {
        "id": "chair-yoga-206",
        "name": "Chair Heart Meridian Stretch",
        "style": "Accessible",
        "element": "Air",
        "duration_minutes": 10,
        "description": "Seated arm-line and chest sequence to support heart meridian flow and emotional openness.",
        "body_focus": "Inner arms, chest, wrists",
        "breathing_pattern": "Inhale 4, exhale 6",
        "instructions": [
            "Extend arms to sides and flex wrists gently.",
            "Open palms and spread fingers on inhale.",
            "Cross arms in front and reopen rhythmically.",
            "Add seated cactus arms with slow breaths.",
            "Close in prayer at heart center.",
        ],
    },
    {
        "id": "chair-yoga-207",
        "name": "Chair Psoas Soothe Sequence",
        "style": "Accessible",
        "element": "Earth",
        "duration_minutes": 12,
        "description": "Gentle seated psoas and hip flexor release to calm stress reactivity and low-back guarding.",
        "body_focus": "Hip flexors, lower abdomen, lumbar spine",
        "breathing_pattern": "Inhale 4, exhale 7",
        "instructions": [
            "Scoot forward on chair with spine tall.",
            "Alternate knee lifts with controlled exhale.",
            "Lean forward slightly and lengthen through crown.",
            "Release one leg back with toe touch support.",
            "Breathe into lower belly before switching sides.",
        ],
    },
    {
        "id": "chair-yoga-208",
        "name": "Chair Nervous System Reset",
        "style": "Accessible",
        "element": "Spirit",
        "duration_minutes": 9,
        "description": "Regulating seated protocol for overwhelm, anxiety spikes, and end-of-day decompression.",
        "body_focus": "Vagus pathways, diaphragm, jaw",
        "breathing_pattern": "Inhale 4, hold 2, exhale 8",
        "instructions": [
            "Orient to room and name three safe cues.",
            "Place one hand on chest, one on belly.",
            "Follow long exhale breathing cycles.",
            "Hum or sigh on exhale to downshift.",
            "End with one integration intention.",
        ],
    },
    {
        "id": "chair-yoga-209",
        "name": "Chair Spine Wave Ritual",
        "style": "Accessible",
        "element": "Water",
        "duration_minutes": 10,
        "description": "Fluid seated spinal waves to rehydrate fascia and restore graceful movement.",
        "body_focus": "Entire spine, rib cage, sacrum",
        "breathing_pattern": "Inhale as chest opens, exhale as spine rounds",
        "instructions": [
            "Begin with cat-cow seated spinal motion.",
            "Add side-to-side rib wave patterns.",
            "Circle torso slowly in both directions.",
            "Pause at neutral for still breath.",
            "Close with palms over lower ribs.",
        ],
    },
    {
        "id": "chair-yoga-210",
        "name": "Chair Grounded Strength Builder",
        "style": "Accessible",
        "element": "Earth",
        "duration_minutes": 11,
        "description": "Seated strength sequence for legs, core, and confidence without joint strain.",
        "body_focus": "Quadriceps, glutes, deep core",
        "breathing_pattern": "Inhale prepare, exhale engage",
        "instructions": [
            "Press feet down and lift chest.",
            "Perform controlled seated leg extensions.",
            "Add isometric thigh squeeze with pillow.",
            "Pulse arms overhead with steady breath.",
            "Finish with grounding stillness and gratitude.",
        ],
    },
]

PARTNER_YOGA_SUPPLEMENTS = [
    {
        "id": "partner-yoga-101",
        "name": "Partner Supported Child’s Pose",
        "sanskrit": "Sahana Balasana",
        "element": "Water",
        "difficulty": "Beginner",
        "duration": 7,
        "description": "One partner rests in child’s pose while the other offers gentle back grounding and breath synchronization.",
        "instructions": [
            "Partner A enters child’s pose comfortably.",
            "Partner B kneels behind and places warm palms on upper back.",
            "Match breath rhythm for 10 cycles.",
            "Switch roles and repeat.",
        ],
        "benefits": ["Nervous-system co-regulation", "Back body soothing", "Trust and safety"],
        "modifications": ["Use bolster under chest", "Keep contact very light if sensitive"],
        "color": {"text": "text-blue-300", "bg": "bg-blue-500/10", "border": "border-blue-500/20"},
    },
    {
        "id": "partner-yoga-102",
        "name": "Partner Low Lunge Assist",
        "sanskrit": "Sahana Anjaneyasana",
        "element": "Earth",
        "difficulty": "Beginner",
        "duration": 8,
        "description": "Guided lunge with shoulder support to open hips and improve lower-body mobility together.",
        "instructions": [
            "Partner A enters low lunge with front knee stable.",
            "Partner B supports shoulders from behind.",
            "Breathe and pulse gently in and out of stretch.",
            "Switch sides and partner roles.",
        ],
        "benefits": ["Hip opening", "Balance confidence", "Relational communication"],
        "modifications": ["Use blocks for hands", "Pad back knee"],
        "color": {"text": "text-emerald-300", "bg": "bg-emerald-500/10", "border": "border-emerald-500/20"},
    },
    {
        "id": "partner-yoga-103",
        "name": "Back-to-Back Breath Ladder",
        "sanskrit": "Sahana Prana Krama",
        "element": "Air",
        "difficulty": "Beginner",
        "duration": 6,
        "description": "Back-to-back seated breathing ladder to harmonize rhythm and emotional safety.",
        "instructions": [
            "Sit back-to-back with upright posture.",
            "Complete 3 rounds inhale 4/exhale 6.",
            "Then 3 rounds inhale 5/exhale 7.",
            "Close with silent resting breath together.",
        ],
        "benefits": ["Breath coherence", "Calmer conflict response", "Heart-rate synchronization"],
        "modifications": ["Sit on cushion", "Shorten exhale if dizzy"],
        "color": {"text": "text-cyan-300", "bg": "bg-cyan-500/10", "border": "border-cyan-500/20"},
    },
    {
        "id": "partner-yoga-104",
        "name": "Partner Seated Side Bend",
        "sanskrit": "Sahana Parsva Sukhasana",
        "element": "Air",
        "difficulty": "Beginner",
        "duration": 7,
        "description": "Seated side-body opening using partner leverage for gentle rib and shoulder release.",
        "instructions": [
            "Sit side by side, outside hands connected.",
            "Raise connected arms and arc away slowly.",
            "Hold for 5 breaths each side.",
            "Switch orientation and repeat.",
        ],
        "benefits": ["Rib mobility", "Improved breathing capacity", "Shared pacing"],
        "modifications": ["Keep lower hand grounded", "Use strap for grip"],
        "color": {"text": "text-sky-300", "bg": "bg-sky-500/10", "border": "border-sky-500/20"},
    },
    {
        "id": "partner-yoga-105",
        "name": "Partner Reclined Twist",
        "sanskrit": "Sahana Supta Matsyendrasana",
        "element": "Water",
        "difficulty": "Beginner",
        "duration": 8,
        "description": "Reclined spinal twist with safe partner support for decompression and emotional release.",
        "instructions": [
            "Partner A reclines and twists knees to one side.",
            "Partner B supports opposite shoulder gently.",
            "Breathe together for 6-8 breaths.",
            "Switch sides and roles.",
        ],
        "benefits": ["Spinal decompression", "Digestive support", "Nervous-system settling"],
        "modifications": ["Place pillow under knees", "Reduce twist depth"],
        "color": {"text": "text-indigo-300", "bg": "bg-indigo-500/10", "border": "border-indigo-500/20"},
    },
    {
        "id": "partner-yoga-106",
        "name": "Partner Supported Bridge",
        "sanskrit": "Sahana Setu Bandha",
        "element": "Fire",
        "difficulty": "Intermediate",
        "duration": 6,
        "description": "Bridge pose with supportive hands and verbal cues for safe heart opening and glute activation.",
        "instructions": [
            "Partner A enters bridge pose.",
            "Partner B stabilizes hips with light support.",
            "Hold for 5 breaths, lower slowly.",
            "Repeat and switch roles.",
        ],
        "benefits": ["Posterior chain activation", "Heart opening", "Confidence with support"],
        "modifications": ["Place block under sacrum", "Keep lower lift"],
        "color": {"text": "text-amber-300", "bg": "bg-amber-500/10", "border": "border-amber-500/20"},
    },
    {
        "id": "partner-yoga-107",
        "name": "Partner Warrior Anchor",
        "sanskrit": "Sahana Virabhadrasana",
        "element": "Fire",
        "difficulty": "Intermediate",
        "duration": 7,
        "description": "Mirrored warrior stance with hand-to-hand anchor to train stability and focused courage.",
        "instructions": [
            "Stand facing each other in warrior II.",
            "Connect front hands with steady pressure.",
            "Pulse deeper on exhales for 5 breaths.",
            "Switch sides.",
        ],
        "benefits": ["Leg strength", "Embodied confidence", "Shared focus"],
        "modifications": ["Shorten stance", "Use wall behind back leg"],
        "color": {"text": "text-orange-300", "bg": "bg-orange-500/10", "border": "border-orange-500/20"},
    },
    {
        "id": "partner-yoga-108",
        "name": "Partner Standing Quad Stretch",
        "sanskrit": "Sahana Nataraja Prep",
        "element": "Earth",
        "difficulty": "Beginner",
        "duration": 6,
        "description": "Standing balance and quad release with mutual shoulder support.",
        "instructions": [
            "Face each other and hold forearms.",
            "Each partner bends one knee and holds ankle.",
            "Keep torso upright and breathe for 6 breaths.",
            "Switch legs.",
        ],
        "benefits": ["Balance", "Quad mobility", "Team coordination"],
        "modifications": ["Use wall support", "Hold pant leg instead of ankle"],
        "color": {"text": "text-green-300", "bg": "bg-green-500/10", "border": "border-green-500/20"},
    },
    {
        "id": "partner-yoga-109",
        "name": "Partner Restorative Savasana",
        "sanskrit": "Sahana Savasana",
        "element": "Spirit",
        "difficulty": "Beginner",
        "duration": 10,
        "description": "Deep guided rest with hand-to-heart grounding and shared integration breaths.",
        "instructions": [
            "Lie side by side in savasana.",
            "Place one hand on your heart, one on your belly.",
            "Take 12 synchronized breaths.",
            "End by sharing one word for your state.",
        ],
        "benefits": ["Deep regulation", "Emotional integration", "Trust restoration"],
        "modifications": ["Use bolster under knees", "Blanket for warmth"],
        "color": {"text": "text-violet-300", "bg": "bg-violet-500/10", "border": "border-violet-500/20"},
    },
    {
        "id": "partner-yoga-110",
        "name": "Partner Heart Coherence Flow",
        "sanskrit": "Sahana Hridaya Flow",
        "element": "Spirit",
        "difficulty": "Intermediate",
        "duration": 9,
        "description": "Flowing partner sequence combining breath, touch, and synchronized movement for relational coherence.",
        "instructions": [
            "Begin standing with palms connected.",
            "Inhale sweep arms up together.",
            "Exhale fold halfway with soft knees.",
            "Rise and open chest for 8 rounds.",
            "Close with eye contact and gratitude breath.",
        ],
        "benefits": ["Co-regulation", "Heart coherence", "Embodied connection"],
        "modifications": ["Slow pace", "Reduce range of motion"],
        "color": {"text": "text-fuchsia-300", "bg": "bg-fuchsia-500/10", "border": "border-fuchsia-500/20"},
    },
]


def _append_chair_yoga_supplements(practices: list[dict[str, Any]], style: Optional[str]) -> list[dict[str, Any]]:
    if style:
        return practices
    existing_ids = {str(item.get("id") or "").strip().lower() for item in practices}
    additions = [item for item in CHAIR_YOGA_SUPPLEMENTS if item["id"].lower() not in existing_ids]
    return practices + additions

SECTION_FREE_RATIO = 0.25
SECTION_MIN_FREE_ITEMS = 1
SECTION_DEFAULT_FREE_ITEMS = 4
SECTION_DEFAULT_PREMIUM_ITEMS = 10
SECTION_MAX_TIER_ITEMS = SECTION_DEFAULT_FREE_ITEMS + SECTION_DEFAULT_PREMIUM_ITEMS
SECTION_UNCAPPED_UNLOCK_IDS = {"yoga_poses", "somatic_practices"}

# User-approved per-section free counts override global ratio where specified.
SECTION_FREE_COUNT_OVERRIDES: dict[str, int] = {
    "yoga_poses": 4,
    "somatic_practices": 4,
    "premium_breathwork": 4,
    "meditations": 4,
    "mindfulness_practices": 4,
    "premium_mantras": 4,
    "water_practices": 4,
    "heart_practices": 4,
    "sacred_allies": 4,
    "angelic_alchemy": 4,
    "sacred_guardians": 4,
    "ancient_wisdom": 4,
    "sacred_art_therapy": 4,
    "energy_healing": 4,
    "light_codes": 4,
    "crystals": 4,
    "tarot": 4,
    "runes": 4,
    "i_ching": 4,
    "free_form_movement": 4,
}

SECTION_PREMIUM_LABELS = {
    "yoga_poses": "Yoga Library Premium",
    "premium_breathwork": "Breathwork Premium",
    "premium_mantras": "Mantra Premium",
    "mindfulness_practices": "Mindfulness Premium",
    "meditations": "Meditations Premium",
    "heart_practices": "Heart Practices Premium",
    "shamanic_practices": "Shamanic Premium",
    "elemental_practices": "Elemental Practices Premium",
    "water_practices": "Water Practices Premium",
    "chakra_cleansing": "Chakra Cleansing Premium",
    "somatic_practices": "Somatic Premium",
    "grounding_practices": "Grounding Premium",
    "sacred_guardians": "Sacred Guardians Premium",
    "sound_frequencies": "Sound Healing Premium",
    "angelic_alchemy": "Angelic Alchemy Premium",
    "ancient_wisdom": "Ancient Traditions Premium",
    "sacred_allies": "Sacred Ally Premium",
    "sacred_art_therapy": "Sacred Art Premium",
    "energy_healing": "Energy Healing Premium",
    "light_codes": "Light Codes Premium",
    "crystals": "Crystals Premium",
    "tarot": "Tarot Premium",
    "runes": "Runes Premium",
    "i_ching": "I Ching Premium",
    "free_form_movement": "Sacred Movement Premium",
}

YOGA_SEQUENCE_OF_DAY_LIBRARY = [
    {
        "id": "yoga-sequence-sunrise-awakening",
        "name": "Sunrise Awakening Flow",
        "duration_minutes": 15,
        "poses": ["Cat-Cow", "Low Lunge", "Half Sun Salutation", "Standing Forward Fold"],
    },
    {
        "id": "yoga-sequence-grounding-flow",
        "name": "Grounding Earth Sequence",
        "duration_minutes": 18,
        "poses": ["Mountain", "Warrior II", "Triangle", "Seated Fold"],
    },
    {
        "id": "yoga-sequence-evening-unwind",
        "name": "Evening Nervous System Unwind",
        "duration_minutes": 14,
        "poses": ["Child's Pose", "Supine Twist", "Happy Baby", "Legs-Up-The-Wall"],
    },
]

MOON_GUIDANCE = {
    "new_moon": {"theme": "New Beginnings & Intention Setting", "energy": "introspective", "focus": ["womb", "shadow", "rest"]},
    "waxing_crescent": {"theme": "Taking First Steps", "energy": "building", "focus": ["warrior", "solar", "action"]},
    "first_quarter": {"theme": "Overcoming Challenges", "energy": "active", "focus": ["warrior", "boundaries", "strength"]},
    "waxing_gibbous": {"theme": "Refinement & Adjustment", "energy": "refining", "focus": ["heart", "relationship", "healing"]},
    "full_moon": {"theme": "Illumination & Release", "energy": "peak", "focus": ["crown", "release", "celebration"]},
    "waning_gibbous": {"theme": "Gratitude & Sharing", "energy": "distributing", "focus": ["heart", "service", "teaching"]},
    "last_quarter": {"theme": "Letting Go", "energy": "releasing", "focus": ["grief", "shadow", "forgiveness"]},
    "waning_crescent": {"theme": "Rest & Surrender", "energy": "surrendering", "focus": ["rest", "womb", "intuition"]},
}

DAY_THEMES = {
    "monday": {"ruler": "Moon", "theme": "Intuition & Emotions", "practices": ["lunar", "womb", "water"]},
    "tuesday": {"ruler": "Mars", "theme": "Courage & Action", "practices": ["warrior", "fire", "strength"]},
    "wednesday": {"ruler": "Mercury", "theme": "Communication & Learning", "practices": ["throat", "sage", "voice"]},
    "thursday": {"ruler": "Jupiter", "theme": "Expansion & Abundance", "practices": ["crown", "spiritual", "gratitude"]},
    "friday": {"ruler": "Venus", "theme": "Love & Beauty", "practices": ["heart", "sensuality", "self-love"]},
    "saturday": {"ruler": "Saturn", "theme": "Structure & Discipline", "practices": ["root", "grounding", "boundaries"]},
    "sunday": {"ruler": "Sun", "theme": "Vitality & Self-Expression", "practices": ["solar", "king", "radiance"]},
}


YOGA_VERIFIED_IMAGE_OVERRIDES = {
    "mountain pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/8/8d/Tadasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Tadasana.jpg",
            "https://en.wikipedia.org/wiki/Tadasana",
        ],
    },
    "tree pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/72/Vriksasana_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Vriksasana_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Tree_pose",
        ],
    },
    "warrior i": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Virabhadrasana_I_-_Warrior_Pose_I.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Virabhadrasana_I_-_Warrior_Pose_I.jpg",
            "https://en.wikipedia.org/wiki/Virabhadrasana",
        ],
    },
    "warrior ii": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/1d/Virabhadrasana_II_-_Warrior_II_Pose.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Virabhadrasana_II_-_Warrior_II_Pose.jpg",
            "https://en.wikipedia.org/wiki/Virabhadrasana",
        ],
    },
    "downward dog": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/57/Downward-Facing-Dog.JPG",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Downward-Facing-Dog.JPG",
            "https://en.wikipedia.org/wiki/Downward_Dog_Pose",
        ],
    },
    "downward facing dog": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/57/Downward-Facing-Dog.JPG",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Downward-Facing-Dog.JPG",
            "https://en.wikipedia.org/wiki/Downward_Dog_Pose",
        ],
    },
    "cobra pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/21/Bhujangasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Bhujangasana.jpg",
            "https://en.wikipedia.org/wiki/Bhujangasana",
        ],
    },
    "upward facing dog": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/12/Upward-facing_dog_pose.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Upward-facing_dog_pose.jpg",
            "https://en.wikipedia.org/wiki/Upward_Dog_Pose",
        ],
    },
    "chair pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/59/Utkatasana_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Utkatasana_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Utkatasana",
        ],
    },
    "standing forward fold": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/72/3Uttanasana.JPG",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:3Uttanasana.JPG",
            "https://en.wikipedia.org/wiki/Uttanasana",
        ],
    },
    "child's pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Balasana.JPG",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Balasana.JPG",
            "https://en.wikipedia.org/wiki/Child%27s_pose",
        ],
    },
    "seated forward fold": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Paschimottanasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Paschimottanasana.jpg",
            "https://en.wikipedia.org/wiki/Paschimottanasana",
        ],
    },
    "pigeon pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Kapotasana_-_Pigeon_pose.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Kapotasana_-_Pigeon_pose.jpg",
            "https://en.wikipedia.org/wiki/Kapotasana",
        ],
    },
    "half moon pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Ardha-Chandrasana_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Ardha-Chandrasana_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Ardha_Chandrasana",
        ],
    },
    "eagle pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/b6/Garudasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Garudasana.jpg",
            "https://en.wikipedia.org/wiki/Garudasana",
        ],
    },
    "camel pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/e/ee/Ustrasana_-_Camel_Pose.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Ustrasana_-_Camel_Pose.jpg",
            "https://en.wikipedia.org/wiki/Ustrasana",
        ],
    },
    "dancer pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/75/Natarajasana_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Natarajasana_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Natarajasana",
        ],
    },
    "warrior iii": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/06/Tuladandasana_-_Virabhadrasana_III.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Tuladandasana_-_Virabhadrasana_III.jpg",
            "https://en.wikipedia.org/wiki/Virabhadrasana",
        ],
    },
    "boat pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Mr-yoga-boat-pose2.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-boat-pose2.jpg",
            "https://en.wikipedia.org/wiki/Navasana",
        ],
    },
    "side plank": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/e/e2/Mr-yoga-side-plank.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-side-plank.jpg",
            "https://en.wikipedia.org/wiki/Vasisthasana",
        ],
    },
    "crow pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Bakasana_Yoga-Asana_Nina-Mel_%28cropped%29.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Bakasana_Yoga-Asana_Nina-Mel_(cropped).jpg",
            "https://en.wikipedia.org/wiki/Bakasana",
        ],
    },
    "bow pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/10/Dhanurasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Dhanurasana.jpg",
            "https://en.wikipedia.org/wiki/Dhanurasana",
        ],
    },
    "fish pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Matsyasana%2C_Heinz_Grill_1992.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Matsyasana,_Heinz_Grill_1992.jpg",
            "https://en.wikipedia.org/wiki/Matsyasana",
        ],
    },
    "sleeping swan": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/Eka_Pada_Rajakapotasana_-_One_Legged_Royal_Pigeon_Pose.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Eka_Pada_Rajakapotasana_-_One_Legged_Royal_Pigeon_Pose.jpg",
            "https://en.wikipedia.org/wiki/Kapotasana",
        ],
    },
    "wheel pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/d/df/Chakrasana_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Chakrasana_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Chakrasana",
        ],
    },
    "headstand": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Mr-yoga-headstand-5-6.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-headstand-5-6.jpg",
            "https://en.wikipedia.org/wiki/Sirsasana",
        ],
    },
    "shoulder stand": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Mr-yoga-shouldertand.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-shouldertand.jpg",
            "https://en.wikipedia.org/wiki/Sarvangasana",
        ],
    },
    "plow pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Halasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Halasana.jpg",
            "https://en.wikipedia.org/wiki/Halasana",
        ],
    },
    "wild thing": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/90/Mr-yoga-wild-thing.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-wild-thing.jpg",
            "https://en.wikipedia.org/wiki/Yoga_asana",
        ],
    },
    "revolved triangle": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/c/cf/Parivrtta-Trikonasana_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Parivrtta-Trikonasana_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Parivrtta_Trikonasana",
        ],
    },
    "bird of paradise": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/68/Svargadvijasana.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Svargadvijasana.png",
            "https://en.wikipedia.org/wiki/Yoga_asana",
        ],
    },
    "lotus pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/f/f0/Padamasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Padamasana.jpg",
            "https://en.wikipedia.org/wiki/Lotus_position",
        ],
    },
    "hero pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/22/Mr-yoga-complete-thunderbolt.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-complete-thunderbolt.jpg",
            "https://en.wikipedia.org/wiki/Virasana",
        ],
    },
    "standing split": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/f/f5/Mr-yoga-one_legged_forward_bend_1.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-one_legged_forward_bend_1.jpg",
            "https://en.wikipedia.org/wiki/Yoga_asana",
        ],
    },
    "supported headstand": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/8/88/Salamba_Sirsasana_-_Supported_Headstand.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Salamba_Sirsasana_-_Supported_Headstand.jpg",
            "https://en.wikipedia.org/wiki/Sirsasana",
        ],
    },
    "firefly pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/58/Mr-yoga-firefly-pose-1.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-firefly-pose-1.jpg",
            "https://en.wikipedia.org/wiki/Tittibhasana",
        ],
    },
    "eight angle pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/13/Astavakrasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Astavakrasana.jpg",
            "https://en.wikipedia.org/wiki/Astavakrasana",
        ],
    },
    "bridge pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Anil_Shrikrishna_Manekar_-_Setubandhasana_-_International_Day_of_Yoga_Celebration_-_NCSM_-_Kolkata_2015-06-21_7399.JPG",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Anil_Shrikrishna_Manekar_-_Setubandhasana_-_International_Day_of_Yoga_Celebration_-_NCSM_-_Kolkata_2015-06-21_7399.JPG",
            "https://en.wikipedia.org/wiki/Setu_Bandha_Sarvangasana",
        ],
    },
    "cat-cow flow": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Bidalasana.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Bidalasana.png",
            "https://en.wikipedia.org/wiki/Marjaryasana",
        ],
    },
    "corpse pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Savasana_-_International_Day_of_Yoga_Celebration_-_NCSM_-_Kolkata_2015-06-21_7408.JPG",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Savasana_-_International_Day_of_Yoga_Celebration_-_NCSM_-_Kolkata_2015-06-21_7408.JPG",
            "https://en.wikipedia.org/wiki/Savasana",
        ],
    },
    "easy pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/ae/Sukkasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Sukkasana.jpg",
            "https://en.wikipedia.org/wiki/Sukhasana",
        ],
    },
    "extended side angle": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Parsvakonasana_Utthita_B_-_Revolved_Side_Angle_Pose_B_-_with_arm_Support.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Parsvakonasana_Utthita_B_-_Revolved_Side_Angle_Pose_B_-_with_arm_Support.jpg",
            "https://en.wikipedia.org/wiki/Utthita_Parsvakonasana",
        ],
    },
    "extended triangle": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Trikonasana_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Trikonasana_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Trikonasana",
        ],
    },
    "garland pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Mr-yoga-lion-pose-in-garland-pose.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-lion-pose-in-garland-pose.jpg",
            "https://en.wikipedia.org/wiki/Malasana",
        ],
    },
    "goddess pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Utkatakonasana.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Utkatakonasana.png",
            "https://en.wikipedia.org/wiki/Utkata_Konasana",
        ],
    },
    "locust pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/14/Salabhasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Salabhasana.jpg",
            "https://en.wikipedia.org/wiki/Salabhasana",
        ],
    },
    "thunderbolt pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Mrs_Manekar_and_Anil_Shrikrishna_Manekar_-_Vajrasana_-_International_Day_of_Yoga_Celebration_-_NCSM_-_Kolkata_2015-06-21_7342.JPG",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mrs_Manekar_and_Anil_Shrikrishna_Manekar_-_Vajrasana_-_International_Day_of_Yoga_Celebration_-_NCSM_-_Kolkata_2015-06-21_7342.JPG",
            "https://en.wikipedia.org/wiki/Vajrasana",
        ],
    },
    "prayer pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Pranamanasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Pranamanasana.jpg",
            "https://en.wikipedia.org/wiki/Anjali_Mudra",
        ],
    },
    "wide-legged forward fold": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Prasaritapadottanasana.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Prasaritapadottanasana.png",
            "https://en.wikipedia.org/wiki/Prasarita_Padottanasana",
        ],
    },
    "happy baby pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/bd/IMG_0377_2_Happy_Baby.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:IMG_0377_2_Happy_Baby.jpg",
            "https://en.wikipedia.org/wiki/Ananda_Balasana",
        ],
    },
    "legs up the wall": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/3b/Viparita-Karani_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Viparita-Karani_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Viparita_Karani",
        ],
    },
    "reclined bound angle": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Mr-yoga-reclined-bound-angle.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Mr-yoga-reclined-bound-angle.jpg",
            "https://en.wikipedia.org/wiki/Baddha_Konasana",
        ],
    },
    "staff pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Dandasana_yoga_posture.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Dandasana_yoga_posture.jpg",
            "https://en.wikipedia.org/wiki/Dandasana",
        ],
    },
    "seated meditation": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/4/40/Meditation_sitting_pose_siddhasana_yoga_Gloria.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Meditation_sitting_pose_siddhasana_yoga_Gloria.jpg",
            "https://en.wikipedia.org/wiki/Dhyana_in_Hinduism",
        ],
    },
    "plank pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/76/Phalakasana.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Phalakasana.png",
            "https://en.wikipedia.org/wiki/Phalakasana",
        ],
    },
    "seated spinal twist": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/8/84/Ardha-Matsyendrasana_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Ardha-Matsyendrasana_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Ardha_Matsyendrasana",
        ],
    },
    "fire log pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Flickr_-_Nicholas_T_-_Crossed.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Flickr_-_Nicholas_T_-_Crossed.jpg",
            "https://en.wikipedia.org/wiki/Yoga_asana",
        ],
    },
    "frog pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Yagnesh_Uttanmandukasan.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Yagnesh_Uttanmandukasan.jpg",
            "https://commons.wikimedia.org/wiki/Category:Mandukasana",
        ],
    },
    "reverse warrior": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Nama_Baddha_Hasta_Virabhadrasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Nama_Baddha_Hasta_Virabhadrasana.jpg",
            "https://en.wikipedia.org/wiki/Virabhadrasana",
        ],
    },
    "supine twist": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/55/Waist_Rotating_Pose.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Waist_Rotating_Pose.jpg",
            "https://commons.wikimedia.org/wiki/Category:Jathara_Parivartanasana",
        ],
    },
    "thread the needle": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/55/Hatha_yoga_child_pose.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Hatha_yoga_child_pose.jpg",
            "https://commons.wikimedia.org/wiki/Category:Twisting_asanas",
        ],
    },
    "embryo pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/31/Garbhasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Garbhasana.jpg",
            "https://en.wikipedia.org/wiki/Yoga_asana",
        ],
    },
    "seated ankle circles": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/ba/1.Ausstrecken.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:1.Ausstrecken.png",
            "https://en.wikibooks.org/wiki/Yoga/Chair_Yoga",
        ],
    },
    "seated cat cow": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/d/d4/3.1.Vorbeugen.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:3.1.Vorbeugen.png",
            "https://en.wikibooks.org/wiki/Yoga/Chair_Yoga",
        ],
    },
    "seated chest opener": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/ba/1.Ausstrecken.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:1.Ausstrecken.png",
            "https://en.wikibooks.org/wiki/Yoga/Chair_Yoga",
        ],
    },
    "seated eagle arms": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/b6/Garudasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Garudasana.jpg",
            "https://en.wikipedia.org/wiki/Garudasana",
        ],
    },
    "seated neck rolls": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/06/4.Kopf_bewegen.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:4.Kopf_bewegen.png",
            "https://en.wikibooks.org/wiki/Yoga/Chair_Yoga",
        ],
    },
    "seated pigeon pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/Eka_Pada_Rajakapotasana_-_One_Legged_Royal_Pigeon_Pose.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Eka_Pada_Rajakapotasana_-_One_Legged_Royal_Pigeon_Pose.jpg",
            "https://en.wikipedia.org/wiki/Kapotasana",
        ],
    },
    "seated relaxation": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a8/10.Meditation.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:10.Meditation.png",
            "https://en.wikibooks.org/wiki/Yoga/Chair_Yoga",
        ],
    },
    "seated side stretch": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/ba/1.Ausstrecken.png",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:1.Ausstrecken.png",
            "https://en.wikibooks.org/wiki/Yoga/Chair_Yoga",
        ],
    },
    "seated tree pose": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/72/Vriksasana_Yoga-Asana_Nina-Mel.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Vriksasana_Yoga-Asana_Nina-Mel.jpg",
            "https://en.wikipedia.org/wiki/Tree_pose",
        ],
    },
    "seated warrior": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Nama_Baddha_Hasta_Virabhadrasana.jpg",
        "source_references": [
            "https://commons.wikimedia.org/wiki/File:Nama_Baddha_Hasta_Virabhadrasana.jpg",
            "https://en.wikipedia.org/wiki/Virabhadrasana",
        ],
    },
}

YOGA_FASCIA_FOCUS_BY_ELEMENT = {
    "earth": "Explore the plantar fascia and posterior chain with steady, grounded loading.",
    "water": "Soften pelvic bowl, adductors, and deep hip fascia through gradual yielding.",
    "fire": "Activate core fascial lines and front-body extension while regulating intensity.",
    "air": "Lengthen shoulder girdle and side-body fascia with spacious, supported breathing.",
    "spirit": "Integrate craniosacral ease with full-body fascial continuity and stillness.",
}

YOGA_BREATH_HYBRID_BY_ELEMENT = {
    "earth": "Inhale for 4, exhale for 6, and root through feet while relaxing jaw and belly.",
    "water": "Use wave breath: inhale low ribs, exhale through mouth softly and release hips.",
    "fire": "Use energizing nasal breath with long exhales to stabilize effort and reduce strain.",
    "air": "Use lateral-rib breath and smooth exhale hums to open chest and shoulders.",
    "spirit": "Use coherent breath (5 in, 5 out) with brief pauses for meditative integration.",
}

SOMATIC_TRACK_ORDER = {
    "Somatic Movement": 0,
    "Tai Chi": 1,
    "Chi Gong": 2,
}

SOMATIC_FASCIA_FOCUS_BY_ELEMENT = {
    "earth": "Feet, calves, hamstrings, and lower-back fascia for grounding and containment.",
    "water": "Hips, psoas, and pelvic fascia for fluid release and emotional discharge.",
    "fire": "Core and front-line fascia for boundary restoration and empowered action.",
    "air": "Ribcage, throat, and shoulder fascia for breath mobility and expression.",
    "spirit": "Whole-body fascial integration with orienting and interoceptive awareness.",
}


def _normalize_label_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def _lookup_yoga_override(pose_name_key: str) -> dict[str, Any] | None:
    direct = YOGA_VERIFIED_IMAGE_OVERRIDES.get(pose_name_key)
    if direct:
        return direct

    for raw_key, override in YOGA_VERIFIED_IMAGE_OVERRIDES.items():
        if _normalize_label_key(raw_key) == pose_name_key:
            return override

    return None


def _yoga_pending_verification_priority(pose: dict[str, Any], pose_name_key: str) -> str:
    difficulty = str(pose.get("difficulty") or "").lower().strip()
    if difficulty in {"advanced", "intermediate"}:
        return "high"

    if pose_name_key.startswith("seated "):
        return "medium"

    return "low"


def _merge_source_references(*ref_groups: Any) -> list[str]:
    merged: list[str] = []
    seen: set[str] = set()
    for group in ref_groups:
        for ref in _normalize_source_references(group):
            if ref in seen:
                continue
            seen.add(ref)
            merged.append(ref)
    return merged


def _enrich_yoga_pose(pose: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(pose)
    pose_name_key = _normalize_label_key(enriched.get("name", ""))
    override = _lookup_yoga_override(pose_name_key)
    source_type = "hybrid-curated"

    if override:
        enriched["image_url"] = override["image_url"]
        enriched["source_references"] = _merge_source_references(
            enriched.get("source_references"),
            override.get("source_references"),
        )
        enriched["image_source"] = "wikimedia_commons_verified"
        enriched["image_validation"] = {
            "status": "verified",
            "source_type": "wikimedia_commons",
            "score": 0.94,
            "verified_at": datetime.now(timezone.utc).isoformat(),
        }
        source_type = "wikipedia_commons_verified"
    else:
        priority = _yoga_pending_verification_priority(enriched, pose_name_key)
        enriched["image_source"] = "pending_verification"
        enriched["image_validation"] = {
            "status": "pending_review",
            "source_type": "awaiting_wikimedia_match",
            "score": 0.0,
            "priority": priority,
            "note": "No exact Wikimedia Commons match verified yet for this pose variant.",
        }
        enriched.setdefault("source_references", [])
        source_type = "hybrid-curated-pending-verification"

    element_key = _normalize_label_key(enriched.get("element", "spirit"))
    enriched.setdefault(
        "somatic_fascia_focus",
        YOGA_FASCIA_FOCUS_BY_ELEMENT.get(element_key, YOGA_FASCIA_FOCUS_BY_ELEMENT["spirit"]),
    )
    enriched.setdefault(
        "breath_hybrid_cue",
        YOGA_BREATH_HYBRID_BY_ELEMENT.get(element_key, YOGA_BREATH_HYBRID_BY_ELEMENT["spirit"]),
    )
    enriched.setdefault(
        "mindfulness_prompt",
        "Track one sensation, one emotion, and one breath shift while holding the posture.",
    )
    enriched.setdefault(
        "master_embodiment_protocol",
        _build_modality_master_protocol(
            str(enriched.get("name") or "Yoga Pose"),
            "yoga",
            str(enriched.get("somatic_fascia_focus") or "stable posture and slow breath"),
        ),
    )
    pose_name = str(enriched.get("name") or "Yoga Pose")
    override_tutorials = _build_admin_override_tutorials(pose_name, enriched.get("youtube_tutorial_override_urls"))
    if override_tutorials:
        enriched["youtube_tutorials"] = override_tutorials
    else:
        enriched.setdefault(
            "youtube_tutorials",
            _build_youtube_tutorial_links(pose_name, "yoga pose alignment", YOGA_DIRECT_VIDEO_MAP),
        )
    enriched.setdefault("best_for_tags", _resolve_best_for_tags(enriched, "yoga"))

    return _enrich_content_integrity(enriched, source_type)


def _resolve_somatic_movement_track(category: str) -> str:
    normalized = _normalize_label_key(category)
    if "tai chi" in normalized:
        return "Tai Chi"
    if "qigong" in normalized or "chi gong" in normalized:
        return "Chi Gong"
    return "Somatic Movement"


def _build_somatic_breath_hybrid_sequence(practice: dict[str, Any]) -> list[str]:
    element_key = _normalize_label_key(practice.get("element", "spirit"))
    fascia_focus = SOMATIC_FASCIA_FOCUS_BY_ELEMENT.get(element_key, SOMATIC_FASCIA_FOCUS_BY_ELEMENT["spirit"])
    return [
        "Round 1 — Arrive: 4-count inhale through nose, 6-count exhale through mouth, soften jaw and shoulders.",
        f"Round 2 — Fascia Scan: move slowly while sensing {fascia_focus}",
        "Round 3 — Trauma Shedding: alternate 3 gentle activation breaths with 1 long settling exhale.",
        "Round 4 — Mindfulness Integration: pause in stillness, orient to safety, and name one body shift.",
    ]


def _enrich_somatic_practice(practice: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(practice)
    movement_track = _resolve_somatic_movement_track(str(enriched.get("category", "")))
    element_key = _normalize_label_key(enriched.get("element", "spirit"))

    enriched["movement_track"] = movement_track
    enriched["movement_track_order"] = SOMATIC_TRACK_ORDER.get(movement_track, 99)
    enriched["display_category"] = "Somatic & Fascia" if movement_track == "Somatic Movement" else movement_track

    if movement_track == "Somatic Movement":
        enriched.setdefault(
            "somatic_fascia_focus",
            SOMATIC_FASCIA_FOCUS_BY_ELEMENT.get(element_key, SOMATIC_FASCIA_FOCUS_BY_ELEMENT["spirit"]),
        )
        enriched.setdefault("breath_hybrid_mode", "Somatic & Fascia Breath Hybrid")
        enriched.setdefault("breath_hybrid_sequence", _build_somatic_breath_hybrid_sequence(enriched))
        enriched.setdefault(
            "mindfulness_anchor",
            "Stay at 60-70% intensity, track one sensation at a time, and return to long exhales.",
        )

    return enriched

DAILY_PRACTICE_COLLECTIONS = [
    ("chakra_cleansing", "chakra", "chakra_cleansing"),
    ("feminine_embodiment", "feminine", "embodiment"),
    ("masculine_embodiment", "masculine", "embodiment"),
    ("energy_healing", "energy", "energy_healing"),
    ("somatic_yoga", "somatic", "somatic_yoga"),
    ("free_form_movement", "movement", "free_form_movement"),
]

MORNING_KEYWORDS = ["awakening", "warrior", "solar", "activation", "grounding", "breath", "movement"]
EVENING_KEYWORDS = ["rest", "release", "healing", "moon", "womb", "heart", "grief", "restorative"]


class LiveSessionRsvpRequest(BaseModel):
    display_name: str
    email: EmailStr


class LiveSessionMessageRequest(BaseModel):
    display_name: str
    email: Optional[EmailStr] = None
    message: str
    kind: Literal["chat", "question"] = "chat"

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, value: Any) -> Optional[EmailStr]:
        if value in ("", None):
            return None
        return value


class ExpandScriptRequest(BaseModel):
    practice_id: Optional[str] = None
    practice_name: str
    element: Optional[str] = None
    duration_minutes: Optional[float] = None
    steps: list[str] = Field(default_factory=list)
    source_texts: list[str] = Field(default_factory=list)
    use_ai: bool = False
    anti_repetition_mode: Literal["strict", "balanced"] = "strict"
    include_toning: bool = True


class ExpandScriptResponse(BaseModel):
    practice_name: str
    target_minutes: int
    target_word_count: int
    word_count: int
    used_ai: bool
    paragraphs: list[str]
    segments: list[str]


def _count_words(text: str) -> int:
    return len(re.findall(r"\S+", str(text or "").strip()))


def _flatten_text(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        trimmed = value.strip()
        return [trimmed] if trimmed else []
    if isinstance(value, list):
        result: list[str] = []
        for item in value:
            result.extend(_flatten_text(item))
        return result
    if isinstance(value, dict):
        dict_result: list[str] = []
        for item in value.values():
            dict_result.extend(_flatten_text(item))
        return dict_result
    converted = str(value).strip()
    return [converted] if converted else []


def _truncate_for_cache_key(values: list[str], limit: int = 12, max_len: int = 180) -> list[str]:
    compact: list[str] = []
    for value in values[:limit]:
        text = re.sub(r"\s+", " ", str(value or "")).strip().lower()
        if not text:
            continue
        compact.append(text[:max_len])
    return compact


def _build_script_expansion_cache_key(request: ExpandScriptRequest) -> str:
    payload = {
        "practice_id": str(request.practice_id or ""),
        "practice_name": re.sub(r"\s+", " ", str(request.practice_name or "")).strip().lower(),
        "element": re.sub(r"\s+", " ", str(request.element or "")).strip().lower(),
        "duration_minutes": round(float(request.duration_minutes or MIN_NARRATION_MINUTES), 2),
        "anti_repetition_mode": request.anti_repetition_mode,
        "include_toning": bool(request.include_toning),
        "use_ai": bool(request.use_ai),
        "steps": _truncate_for_cache_key(request.steps or [], limit=10, max_len=160),
        "source_texts": _truncate_for_cache_key(request.source_texts or [], limit=14, max_len=180),
    }
    serialized = repr(payload).encode("utf-8")
    return hashlib.sha256(serialized).hexdigest()


def _prune_script_expansion_cache() -> None:
    now = time.time()
    expired = [key for key, (expires_at, _) in script_expansion_cache.items() if expires_at <= now]
    for key in expired:
        script_expansion_cache.pop(key, None)

    if len(script_expansion_cache) <= SCRIPT_EXPANSION_CACHE_MAX_ITEMS:
        return

    overflow = len(script_expansion_cache) - SCRIPT_EXPANSION_CACHE_MAX_ITEMS
    # dict keeps insertion order; pop earliest inserted keys first.
    for key in list(script_expansion_cache.keys())[:overflow]:
        script_expansion_cache.pop(key, None)


def _get_cached_script_expansion(cache_key: str) -> dict[str, Any] | None:
    entry = script_expansion_cache.get(cache_key)
    if not entry:
        return None
    expires_at, value = entry
    if expires_at <= time.time():
        script_expansion_cache.pop(cache_key, None)
        return None
    return dict(value)


def _set_cached_script_expansion(cache_key: str, payload: dict[str, Any]) -> None:
    _prune_script_expansion_cache()
    script_expansion_cache[cache_key] = (time.time() + SCRIPT_EXPANSION_CACHE_TTL_SECONDS, dict(payload))


def _normalize_source_references(value: Any) -> list[str]:
    if isinstance(value, str):
        chunks = re.split(r"[\n,]", value)
        return _normalize_source_references(chunks)

    if isinstance(value, list):
        refs: list[str] = []
        seen: set[str] = set()
        for item in value:
            ref = str(item or "").strip()
            if not ref:
                continue
            if not (ref.startswith("http://") or ref.startswith("https://")):
                continue
            if ref in seen:
                continue
            seen.add(ref)
            refs.append(ref)
        return refs
    return []


def _enrich_content_integrity(item: dict[str, Any], default_source_type: str) -> dict[str, Any]:
    enriched = dict(item)
    references = _normalize_source_references(item.get("source_references"))
    source_type = str(item.get("source_type") or default_source_type)
    verified = bool(references)

    enriched["source_references"] = references
    enriched["content_integrity"] = {
        "source_type": source_type,
        "verified": verified,
        "references_count": len(references),
        "last_reviewed_at": item.get("last_reviewed_at"),
    }
    return enriched


def _normalize_image_topic_key(item: dict[str, Any]) -> str:
    return _normalize_label_key(
        str(item.get("name") or item.get("title") or item.get("id") or "")
    )


def _resolve_practice_image_fallback(item: dict[str, Any]) -> Optional[str]:
    topic_key = _normalize_image_topic_key(item)
    if topic_key and topic_key in PRACTICE_IMAGE_FALLBACKS:
        return PRACTICE_IMAGE_FALLBACKS[topic_key]

    category_keys = [
        _normalize_label_key(str(item.get("category") or "")),
        _normalize_label_key(str(item.get("element") or "")),
        _normalize_label_key(str(item.get("type") or "")),
    ]
    for key in category_keys:
        if key and key in GENERIC_CATEGORY_IMAGE_FALLBACKS:
            return GENERIC_CATEGORY_IMAGE_FALLBACKS[key]

    return None


def _apply_subject_image_alignment(item: dict[str, Any], default_source_type: str = "hybrid-curated") -> dict[str, Any]:
    enriched = _enrich_content_integrity(item, default_source_type)
    fallback_url = _resolve_practice_image_fallback(enriched)
    existing_url = str(enriched.get("image_url") or "").strip()
    topic_key = _normalize_image_topic_key(enriched)
    explicit_override = bool(topic_key and topic_key in PRACTICE_IMAGE_FALLBACKS)
    should_replace = explicit_override or (not existing_url) or ("static.prod-images.emergentagent.com/jobs/" in existing_url)

    if fallback_url and should_replace:
        enriched["image_url"] = fallback_url
        source_refs = list(enriched.get("source_references") or [])
        if fallback_url not in source_refs:
            source_refs.append(fallback_url)
        enriched["source_references"] = source_refs[:8]
        enriched["source_type"] = "subject-matched-curated"
        enriched["review_status"] = "verified"
        if isinstance(enriched.get("content_integrity"), dict):
            enriched["content_integrity"]["source_type"] = "subject-matched-curated"
            enriched["content_integrity"]["verified"] = True
            enriched["content_integrity"]["references_count"] = len(enriched["source_references"])
    return enriched


def _build_youtube_tutorial_links(
    practice_name: str,
    focus: str,
    direct_video_map: Optional[dict[str, list[str]]] = None,
) -> list[dict[str, str]]:
    name = str(practice_name or "practice").strip()
    focus_term = str(focus or "tutorial").strip()
    normalized_name = _normalize_label_key(name)

    links: list[dict[str, str]] = []
    seen_urls: set[str] = set()

    if direct_video_map and normalized_name in direct_video_map:
        for idx, url in enumerate(direct_video_map.get(normalized_name, [])[:2]):
            if not url or url in seen_urls:
                continue
            links.append({
                "title": f"{name} — Curated tutorial {idx + 1}",
                "url": url,
                "platform": "youtube",
                "source": "direct_video",
            })
            seen_urls.add(url)

    query_pairs = [
        (f"{name} {focus_term} step by step tutorial", "Step-by-step tutorial"),
        (f"{name} {focus_term} guided practice", "Guided practice video"),
    ]

    for query, label in query_pairs:
        url = f"https://www.youtube.com/results?search_query={quote(query)}"
        if url in seen_urls:
            continue
        links.append({
            "title": f"{name} — {label}",
            "url": url,
            "platform": "youtube",
            "source": "search_query",
        })
        seen_urls.add(url)
    return links[:3]


def _build_modality_master_protocol(practice_name: str, modality: str, somatic_anchor: str) -> dict[str, Any]:
    name = str(practice_name or "Practice").strip()
    mode = str(modality or "practice").strip()
    anchor = str(somatic_anchor or "steady breath and grounded posture").strip()

    return {
        "preparation_phase": [
            f"Ritual arrival (2-4 min): settle your body and clarify intention for {name}.",
            f"Nervous-system setup: use slow nasal breathing and establish {anchor} as your somatic anchor.",
            f"Safety and pacing check: choose intensity that supports sustainable {mode} integration.",
        ],
        "embodiment_phase": [
            f"Core {mode} engagement (8-20 min): practice with precision rather than force.",
            "Micro-adjust every few minutes: release excess tension and restore coherent breath rhythm.",
            "Track one body sensation + one emotional shift to keep the session deeply embodied.",
        ],
        "integration_phase": [
            "Down-regulate with 90-180 seconds of stillness before transitioning out.",
            "Journal one tangible nervous-system change and one practical life integration action.",
            "Hydrate, orient to environment, and complete a gentle movement reset.",
        ],
        "seven_day_embodiment": [
            "Day 1: Learn foundations and establish safe baseline duration/intensity.",
            "Day 2: Refine breath pacing and remove unnecessary muscular effort.",
            "Day 3: Add mindful cueing (sensation + emotion tracking).",
            "Day 4: Split into two shorter sessions to improve consistency.",
            "Day 5: Integrate with intentional movement transitions and posture awareness.",
            "Day 6: Add 3-minute stillness integration after the active practice.",
            "Day 7: Review gains, identify friction points, and commit to next-week progression.",
        ],
    }


def _resolve_best_for_tags(item: dict[str, Any], modality: str) -> list[str]:
    mode = _normalize_label_key(modality)
    element_key = _normalize_label_key(item.get("element", ""))
    category_key = _normalize_label_key(item.get("category", item.get("type", "")))

    tags: list[str] = []
    if mode in {"mantra", "mudra", "meditation", "breathwork"}:
        tags.extend(["focus", "sleep"])

    if mode in {"yoga", "breathwork"}:
        tags.append("energy")

    if mode in {"meditation", "mantra"}:
        tags.append("grief")

    if "water" in element_key or "relax" in category_key:
        tags.append("sleep")
    if "fire" in element_key or "activ" in category_key:
        tags.append("energy")
    if "earth" in element_key or "ground" in category_key:
        tags.append("anxiety")
    if "heart" in category_key:
        tags.append("grief")

    ordered = ["sleep", "anxiety", "focus", "grief", "energy"]
    return [tag for tag in ordered if tag in set(tags)]


def _normalize_tutorial_override_urls(value: Any) -> list[str]:
    if isinstance(value, list):
        urls = [str(entry or "").strip() for entry in value]
    elif isinstance(value, str):
        urls = [chunk.strip() for chunk in re.split(r"[\n,]", value)]
    else:
        return []

    normalized: list[str] = []
    seen: set[str] = set()
    for url in urls:
        if not url:
            continue
        if not url.startswith("https://www.youtube.com/"):
            continue
        if url in seen:
            continue
        seen.add(url)
        normalized.append(url)
    return normalized


def _build_admin_override_tutorials(practice_name: str, override_urls: Any) -> list[dict[str, str]]:
    name = str(practice_name or "Practice").strip()
    urls = _normalize_tutorial_override_urls(override_urls)
    tutorials: list[dict[str, str]] = []
    for idx, url in enumerate(urls[:3]):
        tutorials.append({
            "title": f"{name} — Admin curated tutorial {idx + 1}",
            "url": url,
            "platform": "youtube",
            "source": "admin_override",
        })
    return tutorials


def _enrich_breathwork_session_entry(session: dict[str, Any]) -> dict[str, Any]:
    enriched = _enrich_devotional_language(_apply_subject_image_alignment(session, "hybrid-curated"), "breathwork")
    session_name = str(enriched.get("name") or "Breathwork Session").strip()
    enriched.setdefault(
        "master_embodiment_protocol",
        _build_modality_master_protocol(session_name, "breathwork", "diaphragmatic breathing and jaw/shoulder release"),
    )
    override_tutorials = _build_admin_override_tutorials(session_name, enriched.get("youtube_tutorial_override_urls"))
    if override_tutorials:
        enriched["youtube_tutorials"] = override_tutorials
    else:
        enriched.setdefault(
            "youtube_tutorials",
            _build_youtube_tutorial_links(session_name, "breathwork technique", BREATHWORK_DIRECT_VIDEO_MAP),
        )
    enriched.setdefault("best_for_tags", _resolve_best_for_tags(enriched, "breathwork"))
    if bool(enriched.get("is_premium")):
        enriched.setdefault("premium_unlock_id", "premium_breathwork")
        enriched.setdefault("premium_label", "Breathlove")
    return enriched


def _enrich_meditation_entry(meditation: dict[str, Any]) -> dict[str, Any]:
    enriched = _enrich_devotional_language(_apply_subject_image_alignment(meditation, "hybrid-curated"), "meditation")
    meditation_name = str(enriched.get("name") or "Meditation").strip()
    enriched.setdefault(
        "master_embodiment_protocol",
        _build_modality_master_protocol(meditation_name, "meditation", "upright spine and long exhale"),
    )
    override_tutorials = _build_admin_override_tutorials(meditation_name, enriched.get("youtube_tutorial_override_urls"))
    if override_tutorials:
        enriched["youtube_tutorials"] = override_tutorials
    else:
        enriched.setdefault(
            "youtube_tutorials",
            _build_youtube_tutorial_links(meditation_name, "guided meditation", MEDITATION_DIRECT_VIDEO_MAP),
        )
    enriched.setdefault("best_for_tags", _resolve_best_for_tags(enriched, "meditation"))
    return enriched


def _build_mantra_master_protocol(mantra: dict[str, Any]) -> dict[str, Any]:
    name = str(mantra.get("name") or "this mantra").strip()
    chakra = str(mantra.get("chakra") or "energy center").strip()
    translation = str(mantra.get("translation") or "Return to sacred steadiness.").strip()

    return {
        "preparation_phase": [
            f"Seat and spine setup (2-3 min): sit tall, soften jaw/shoulders, and align awareness at the {chakra}.",
            f"Intentional breath entrainment (2 min): breathe nasal 4-in/6-out and set intention with '{translation}'.",
            f"Vocal warm-up (1 min): hum softly to prepare resonance pathways before chanting {name}.",
        ],
        "embodiment_phase": [
            f"Chant cycles (8-20 min): repeat {name} while feeling vibration through chest, throat, and skull corridors.",
            "Somatic anchoring: keep one subtle body cue (hands, sternum, lower belly) to prevent dissociation into mental repetition.",
            "Regulation checkpoints every 3-5 minutes: pause one breath, release tension, and restart with clear pronunciation.",
        ],
        "integration_phase": [
            "Silent absorption (2-4 min): stop vocalizing and notice after-vibration in body and breath rhythm.",
            "Journal one concrete shift: emotional tone, mental clarity, and body state after chanting.",
            "Behavior bridge: choose one grounded action in the next 24h that reflects the mantra's medicine.",
        ],
        "seven_day_embodiment": [
            "Day 1: Learn pronunciation slowly; record one intentional round and listen back.",
            "Day 2: Match mantra rhythm to breath pacing (4-in/6-out) for nervous-system regulation.",
            "Day 3: Add posture discipline (stable spine + relaxed throat) for full-session consistency.",
            "Day 4: Chant in two blocks (morning/evening) and compare emotional-state differences.",
            "Day 5: Integrate walking or hand-on-heart chanting for embodied movement.",
            "Day 6: Offer one round as compassion practice for someone else (without bypassing your own process).",
            "Day 7: Complete integration review: what changed in breath, mood, and behavior; set next-week commitment.",
        ],
    }


def _enrich_mantra_entry(mantra: dict[str, Any]) -> dict[str, Any]:
    enriched = _enrich_devotional_language(dict(mantra), "mantra")
    name = str(enriched.get("name") or "Mantra").strip()
    translation = str(enriched.get("translation") or "").strip()
    meaning = str(enriched.get("meaning") or "").strip()
    if meaning and not translation:
        enriched["translation"] = meaning
    if translation and not meaning:
        enriched["meaning"] = translation
    if bool(enriched.get("is_premium")):
        enriched.setdefault("premium_unlock_id", "premium_mantras")
        enriched.setdefault("premium_label", "Mantra Premium")
    override_tutorials = _build_admin_override_tutorials(name, enriched.get("youtube_tutorial_override_urls"))
    if override_tutorials:
        enriched["youtube_tutorials"] = override_tutorials
    else:
        enriched.setdefault("youtube_tutorials", _build_youtube_tutorial_links(name, "mantra chanting", MANTRA_DIRECT_VIDEO_MAP))
    if not enriched.get("master_embodiment_protocol"):
        enriched["master_embodiment_protocol"] = _build_mantra_master_protocol(enriched)
    enriched.setdefault("best_for_tags", _resolve_best_for_tags(enriched, "mantra"))
    return enriched


def _mudra_key(name: str) -> str:
    return str(name or "").strip().lower()


def _enrich_mudra_entry(mudra: dict[str, Any]) -> dict[str, Any]:
    enriched = _enrich_devotional_language(dict(mudra), "mudra")
    mudra_name = _mudra_key(mudra.get("name", ""))
    verified_image = MUDRA_VERIFIED_IMAGE_MAP.get(mudra_name)

    enriched["image_url_original"] = mudra.get("image_url")
    if verified_image:
        enriched["image_url"] = verified_image.get("image_url")
        enriched["image_source"] = "wikimedia_commons_verified"
        enriched["image_validation"] = {
            "status": "verified",
            "source_type": "wikimedia_commons_verified",
            "score": 0.95,
            "verified_at": datetime.now(timezone.utc).isoformat(),
        }
        enriched["source_references"] = _merge_source_references(
            enriched.get("source_references"),
            verified_image.get("source_references"),
        )
    else:
        enriched["image_url"] = None
        enriched["image_source"] = "awaiting_verification"
        enriched["image_validation"] = {
            "status": "review",
            "source_type": "awaiting_wikimedia_commons_verified_match",
            "score": 0.0,
            "note": "Awaiting verified mudra reference image",
        }

    mudra_name = str(enriched.get("name") or "Mudra").strip()
    override_tutorials = _build_admin_override_tutorials(mudra_name, enriched.get("youtube_tutorial_override_urls"))
    if override_tutorials:
        enriched["youtube_tutorials"] = override_tutorials
    else:
        enriched.setdefault("youtube_tutorials", _build_youtube_tutorial_links(mudra_name, "mudra hand position", MUDRA_DIRECT_VIDEO_MAP))
    if not enriched.get("master_embodiment_protocol"):
        enriched["master_embodiment_protocol"] = {
            "preparation_phase": [
                "Seat and shoulder release (2 min): relax wrists, elbows, and upper traps before forming the mudra.",
                "Breath entry (90 sec): nasal inhale/exhale with equal counts to stabilize concentration.",
                f"Hand seal setup: form {mudra_name} gently (no over-pressing) and soften fingertip contact.",
            ],
            "embodiment_phase": [
                "Hold cycle (6-15 min): maintain the seal while tracking pulse, warmth, and subtle energetic flow.",
                "Micro-adjust every 2-3 minutes: release hand tension, reset posture, and re-enter with precision.",
                "Combine with mantra or breath count for attentional steadiness and deeper somatic imprinting.",
            ],
            "integration_phase": [
                "Release slowly and shake out fingers/wrists for circulation reset.",
                "Place one palm on heart and one on belly for five slow breaths.",
                "Capture one practical integration action for the next day (communication, boundary, or emotional regulation).",
            ],
            "seven_day_embodiment": [
                "Day 1: Learn finger geometry and hold for 5 minutes with relaxed breath.",
                "Day 2: Increase to 7 minutes; monitor where tension accumulates in hands/shoulders.",
                "Day 3: Pair with short affirmation rounds for neural and emotional coupling.",
                "Day 4: Practice morning and evening to compare energetic/mental state shifts.",
                "Day 5: Integrate standing posture for embodied grounding while holding mudra.",
                "Day 6: Add 2-minute silent stillness after release and track mood/focus effects.",
                "Day 7: Review changes in clarity, regulation, and consistency; set next-week progression.",
            ],
        }

    enriched.setdefault("best_for_tags", _resolve_best_for_tags(enriched, "mudra"))

    return enriched


def _enrich_practice_links(item: dict[str, Any], domain: str) -> dict[str, Any]:
    enriched = dict(item)
    element = str(item.get("element") or "").lower()
    links = [
        {"type": "mindfulness", "route": "/mindfulness", "label": "Mindfulness Companion"},
        {"type": "water", "route": "/water-practices", "label": "Water Regulation Practice"},
    ]
    if element in {"fire", "air", "water", "earth", "spirit"}:
        links.append({"type": "yoga", "route": "/yoga", "label": f"{element.title()} yoga sequence"})
    links.append({"type": domain, "route": f"/{domain}", "label": "Explore related teachings"})
    enriched["linked_practices"] = links
    return enriched


DEVOTIONAL_DOMAIN_SUFFIX = {
    "mantra": "Chant as ceremony: keep pronunciation clear, breath steady, and allow vibration to become embodied medicine.",
    "mudra": "Practice as a subtle ritual seal: reduce effort, refine sensation, and complete with grounded integration.",
    "breathwork": "Move slowly, pace your inhale and exhale with consent, and let each cycle become a living ritual in your body.",
    "mindfulness": "Treat attention as ceremony: witness without force, soften the jaw, and return to breath each time the mind wanders.",
    "meditation": "Receive this as transmission, not performance—allow stillness to reveal what your nervous system is ready to heal and integrate.",
    "somatic": "Prioritize body signals over intensity; micro-pauses and orienting are part of the medicine, not interruptions to it.",
    "heart-practices": "Let tenderness and boundaries coexist, and convert insight into one grounded relational action within the next day.",
    "shamanic-practices": "Enter with reverence, track safety continuously, and complete every descent with hydration, orientation, and embodied closure.",
    "elemental-practices": "Work with this element as a relational field: breathe with it, feel it through posture, and close with a practical act of integration.",
    "healing-portals": "This portal is designed as an immersive ceremonial container—slow your pace, track sensation, and let truth become embodied action.",
    "feminine-embodiment": "Approach this as devotional embodiment: soften, listen deeply, and honor cyclical rhythm over productivity pressure.",
    "sacred-allies": "Relate to this ally as living medicine: breathe with humility, track body truth, and convert insight into a grounded act of healing.",
    "angelic-alchemy": "Receive this transmission with clear boundaries and practical devotion—integrate guidance through embodied action and compassionate leadership.",
    "ancient-wisdom": "Treat this lineage as living practice, not concept: embody one teaching, complete one ritual act, and anchor one service-based integration.",
    "grounding-practices": "Ground as ritual: orient to safety, slow your exhale, and let Earth-contact become embodied trust.",
    "masculine-practices": "Practice embodied masculine coherence through honest feeling, clean boundaries, devoted action, and accountable integration.",
    "sacred-guardians": "Approach guardian work as reciprocal ceremony: listen, invoke with integrity, and embody one concrete action after receiving guidance.",
    "sound-frequencies": "Receive sound as somatic ritual—track breath, body sensation, and emotional tone while integrating gently after each listening cycle.",
    "tarot": "Treat divination as embodied inquiry: feel the message in your body, name one truth, and take one grounded action.",
    "runes": "Cast and interpret with reverence, pacing, and practical integration so symbolic wisdom becomes lived alignment.",
    "i-ching": "Hold the oracle as living dialogue: regulate your nervous system first, then integrate with clarity and ethical action.",
    "videos": "Use teachings as practice containers, not passive content: pause, embody, and complete one integration step after viewing.",
    "courses": "Study as initiation—apply each lesson through ritualized action, reflection, and compassionate discipline.",
    "books": "Read devotionally: extract one practice, embody one insight, and close each session with integration journaling.",
    "retreats": "Enter retreat preparation as ceremony: align intention, boundaries, and embodied pacing before and after immersion.",
}

ELEMENT_EMBODIMENT_ANCHOR = {
    "earth": "Anchor through feet, lower belly, and spinal weight.",
    "water": "Soften chest and pelvic bowl while lengthening exhale.",
    "fire": "Engage core with compassionate intensity, not force.",
    "air": "Widen side-ribs and throat while maintaining gentle pace.",
    "spirit": "Hold upright stillness and orient to safety every few breaths.",
}


def _enrich_devotional_language(item: dict[str, Any], domain: str) -> dict[str, Any]:
    enriched = dict(item)
    practice_name = str(enriched.get("name") or enriched.get("title") or enriched.get("id") or "this practice").strip()
    element_key = _normalize_label_key(str(enriched.get("element") or "spirit"))
    anchor = ELEMENT_EMBODIMENT_ANCHOR.get(element_key, ELEMENT_EMBODIMENT_ANCHOR["spirit"])
    suffix = DEVOTIONAL_DOMAIN_SUFFIX.get(domain, "Practice slowly with breath awareness, consent, and clear integration.")

    description = str(enriched.get("description") or "").strip()
    lower = description.lower()
    depth_keywords = ("ritual", "ceremony", "embod", "somatic", "integration", "devotion", "nervous system")
    has_depth = len(description) >= 190 or sum(1 for token in depth_keywords if token in lower) >= 2

    if description and not has_depth:
        enriched["description"] = f"{description} {suffix} {anchor}".strip()
    elif not description:
        tagline = str(enriched.get("tagline") or "").strip()
        if tagline:
            enriched["description"] = f"{tagline}. {suffix} {anchor}".strip()

    enriched.setdefault(
        "devotional_invocation",
        f"I enter {practice_name} with reverence, paced breath, and compassionate honesty.",
    )
    enriched.setdefault(
        "embodiment_prompt",
        f"During {practice_name}, track one breath shift, one body sensation, and one emotional tone without forcing change.",
    )
    enriched.setdefault(
        "integration_vow",
        f"Before closing {practice_name}, commit one grounded action within 24 hours that expresses this medicine.",
    )

    enriched = _enrich_immersive_ritual_fields(enriched, domain)

    return enriched


def _extract_text_lines(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        chunks = [segment.strip() for segment in re.split(r"\n+|•|\*|-\s+", value) if segment and segment.strip()]
        lines: list[str] = []
        for chunk in chunks:
            lines.extend(_split_sentences(chunk) or [chunk])
        return [line.strip() for line in lines if len(line.strip()) > 10]
    if isinstance(value, list):
        lines: list[str] = []
        for item in value:
            lines.extend(_extract_text_lines(item))
        return lines
    if isinstance(value, dict):
        lines: list[str] = []
        for item in value.values():
            lines.extend(_extract_text_lines(item))
        return lines
    return _extract_text_lines(str(value))


DIVINATION_IMAGE_OVERRIDES: dict[str, str] = {
    "oracle:the medicine wheel": "https://images.unsplash.com/photo-1529257414771-1960bceb4d44?auto=format&fit=crop&w=1200&q=80",
    "oracle:the drum": "https://images.pexels.com/photos/4518456/pexels-photo-4518456.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:eagle spirit": "https://images.pexels.com/photos/258804/pexels-photo-258804.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:bear medicine": "https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:wolf pack": "https://images.pexels.com/photos/2923591/pexels-photo-2923591.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:serpent wisdom": "https://images.pexels.com/photos/45246/green-tree-python-python-tree-pythonidae-45246.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:owl vision": "https://images.pexels.com/photos/86596/owl-bird-eyes-eagle-owl-86596.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:deer spirit": "https://images.pexels.com/photos/33547/deer-stag-male-animal.jpg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:raven messenger": "https://images.pexels.com/photos/3132388/pexels-photo-3132388.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:butterfly emergence": "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:thunder being": "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:moon mother": "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:sun father": "https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:turtle island": "https://images.pexels.com/photos/847393/pexels-photo-847393.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:hummingbird joy": "https://images.pexels.com/photos/349758/pexels-photo-349758.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:coyote trickster": "https://upload.wikimedia.org/wikipedia/commons/8/80/2009-Coyote-YNP.jpg",
    "oracle:whale dreamer": "https://images.pexels.com/photos/892548/pexels-photo-892548.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:spider weaver": "https://images.pexels.com/photos/1227513/pexels-photo-1227513.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:jaguar power": "https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:dragonfly dreams": "https://images.pexels.com/photos/53594/blue-dragonfly-anisoptera-insect-53594.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:phoenix rising": "https://images.pexels.com/photos/51951/forest-fire-fire-smoke-conservation-51951.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "oracle:star nations": "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1200",
}


I_CHING_IMAGE_BY_NUMBER: dict[int, str] = {
    1: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1200",
    2: "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1200",
    3: "https://images.pexels.com/photos/531321/pexels-photo-531321.jpeg?auto=compress&cs=tinysrgb&w=1200",
    4: "https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=1200",
    5: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1200",
    6: "https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1200",
    7: "https://images.pexels.com/photos/50594/army-soldiers-war-weapon-50594.jpeg?auto=compress&cs=tinysrgb&w=1200",
    8: "https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?auto=compress&cs=tinysrgb&w=1200",
}


def _normalize_divination_image(entry: dict[str, Any], domain: str) -> dict[str, Any]:
    normalized = dict(entry)
    name = str(normalized.get("name") or normalized.get("title") or "").strip().lower()
    key = f"{domain}:{name}"
    override = DIVINATION_IMAGE_OVERRIDES.get(key)

    if domain == "i-ching":
        number = normalized.get("number")
        if isinstance(number, int):
            override = I_CHING_IMAGE_BY_NUMBER.get(number, override)

    image_url = str(normalized.get("image_url") or "").strip()
    if override:
        normalized["image_url"] = override
    elif image_url.startswith("http://") or image_url.startswith("https://"):
        normalized["image_url"] = image_url
    else:
        if domain == "runes":
            normalized["image_url"] = "https://images.pexels.com/photos/606537/pexels-photo-606537.jpeg?auto=compress&cs=tinysrgb&w=1200"
        elif domain == "tarot":
            normalized["image_url"] = "https://images.pexels.com/photos/7163688/pexels-photo-7163688.jpeg?auto=compress&cs=tinysrgb&w=1200"
        elif domain == "i-ching":
            normalized["image_url"] = "https://images.pexels.com/photos/3815585/pexels-photo-3815585.jpeg?auto=compress&cs=tinysrgb&w=1200"
        else:
            normalized["image_url"] = "https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=1200"

    return normalized


def _coalesce_depth_lines(item: dict[str, Any], keys: Sequence[str], limit: int = 8) -> list[str]:
    seen: set[str] = set()
    lines: list[str] = []
    for key in keys:
        for line in _extract_text_lines(item.get(key)):
            normalized = _normalize_label_key(line)
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            lines.append(line)
            if len(lines) >= limit:
                return lines
    return lines


def _ensure_minimum_lines(primary: list[str], defaults: list[str], minimum: int = 3, limit: int = 8) -> list[str]:
    merged: list[str] = []
    seen: set[str] = set()
    for source in (primary, defaults):
        for line in source:
            normalized = _normalize_label_key(line)
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            merged.append(line)
            if len(merged) >= limit:
                break
        if len(merged) >= limit:
            break
    if len(merged) >= minimum:
        return merged
    return (merged + defaults)[:max(minimum, len(merged))]


def _enrich_immersive_ritual_fields(item: dict[str, Any], domain: str) -> dict[str, Any]:
    enriched = dict(item)
    practice_name = str(
        enriched.get("name")
        or enriched.get("title")
        or enriched.get("id")
        or "this practice"
    ).strip()
    element = str(enriched.get("element") or "spirit").strip().lower()
    domain_label = str(domain or "practice").replace("-", " ")

    default_alchemy = [
        f"{practice_name} teaches relational alchemy: witness your pattern honestly, regulate your breath, and transmute reactivity into grounded presence.",
        f"In this {domain_label} transmission, embodiment outranks theory—complete one somatic action that proves your insight is lived.",
        f"Align your {element} current through devotion, pacing, and practical integrity so spiritual insight becomes daily medicine.",
    ]
    default_ritual = [
        f"Opening ritual: place one hand on heart and one on lower belly, then breathe 4-in / 6-out for 12 rounds while naming your intention for {practice_name}.",
        "Somatic regulation ritual: pause every two minutes to soften jaw, shoulders, and pelvis so intensity stays within your consent window.",
        "Integration ritual: drink water, journal one truth line, and complete one grounded action before the day ends.",
    ]
    default_ceremony = [
        f"Threshold ceremony: speak an invocation for {practice_name}, orient to safety in your space, and enter with reverence rather than urgency.",
        "Descent ceremony: move through breath, voice, and posture in deliberate phases while tracking sensation and emotional signal changes.",
        "Closing ceremony: seal your field with gratitude, boundary clarity, and one service-aligned commitment for the next 24 hours.",
    ]
    default_guided = [
        "Guided phase 1 (arrival): orient your eyes to the room, lengthen exhale, and settle into grounded stillness.",
        "Guided phase 2 (embodiment): alternate breath focus with one ritual step until your body feels coherent and present.",
        "Guided phase 3 (integration): name one insight aloud and convert it into a specific, time-bound action.",
    ]

    alchemy_lines = _coalesce_depth_lines(
        enriched,
        ("alchemy", "alchemy_teachings", "teachings", "expanded_context", "description", "message", "deeper_teaching"),
    )
    ritual_lines = _coalesce_depth_lines(
        enriched,
        ("ritual", "rituals", "practical_rituals", "practice", "practice_guide", "instructions", "steps"),
    )
    ceremony_lines = _coalesce_depth_lines(
        enriched,
        ("ceremony", "ceremonies", "practice", "rituals", "practical_rituals", "practice_guide"),
    )
    guided_lines = _coalesce_depth_lines(
        enriched,
        ("guided_practice", "practice", "instructions", "steps", "rituals", "ceremonies"),
    )

    final_alchemy = _ensure_minimum_lines(alchemy_lines, default_alchemy)
    final_ritual = _ensure_minimum_lines(ritual_lines, default_ritual)
    final_ceremony = _ensure_minimum_lines(ceremony_lines, default_ceremony)
    final_guided = _ensure_minimum_lines(guided_lines, default_guided)

    enriched.setdefault("alchemy", final_alchemy)
    enriched.setdefault("ritual", final_ritual)
    enriched.setdefault("ceremony", final_ceremony)
    enriched.setdefault("guided_practice", final_guided)

    enriched.setdefault("alchemy_teachings", final_alchemy)
    enriched.setdefault("rituals", final_ritual)
    enriched.setdefault("practical_rituals", final_ritual)
    enriched.setdefault("ceremonies", final_ceremony)
    enriched.setdefault("practice", final_guided)

    # Ensure rich voice/script-ready fields exist so frontend guided audio can produce
    # longer, deeply embodied narration consistently across sections.
    enriched.setdefault(
        "voice_script",
        "\n".join([
            f"Welcome to {practice_name}. Enter slowly, with consent and reverence.",
            *final_ceremony,
            *final_ritual,
            *final_guided,
            "Close by naming one embodied action you will complete within 24 hours.",
        ])
    )
    enriched.setdefault("embodiment", final_guided)
    enriched.setdefault("embodiment_prompts", final_guided)
    enriched.setdefault("ritual_practice", final_ritual)
    enriched.setdefault("healing_trajectory", final_alchemy)
    enriched.setdefault(
        "precision_description",
        f"{practice_name} is structured as an immersive {domain_label} ritual with somatic tracking, paced breath, and grounded integration.",
    )
    enriched.setdefault(
        "nervous_system_cues",
        [
            "Soften jaw, tongue, and shoulders before each phase.",
            "Lengthen exhale whenever activation rises.",
            "Pause if intensity exceeds your consent window, then re-enter gently.",
        ],
    )
    enriched.setdefault(
        "integration_actions",
        [
            "Drink water and orient to your physical environment.",
            "Journal one insight and one embodied next step.",
            "Complete one practical action that expresses this medicine today.",
        ],
    )

    return enriched


def _enrich_light_code_payload(payload: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(payload or {})
    enriched.setdefault("linguistic_foundations", [
        {
            "id": "phoneme-harmonics",
            "title": "Phoneme Harmonics",
            "description": "How vowel resonance and consonant impact shape felt energetic meaning in light-language style chanting.",
            "practice": "Speak one symbol name slowly over six breaths and track vibratory shifts in chest/throat.",
        },
        {
            "id": "glyph-semantics",
            "title": "Glyph Semantics",
            "description": "Symbol families are interpreted through stroke direction, angle, and repetition density.",
            "practice": "Trace a chosen glyph clockwise and write three associated felt meanings.",
        },
    ])
    enriched.setdefault("symbol_lineage_notes", [
        "Cross-reference symbols with geometry traditions before interpretation.",
        "Anchor interpretations in breath rhythm and body sensation logs.",
        "Use repeated symbol journaling to detect stable semantic patterns.",
    ])

    symbol_sections = [
        "sacred_geometry",
        "ancient_alphabets",
        "light_language_symbols",
        "galactic_codes",
        "chakra_codes",
    ]

    for section_name in symbol_sections:
        raw_items = enriched.get(section_name)
        if not isinstance(raw_items, list):
            continue

        section_enriched: list[dict[str, Any]] = []
        for symbol in raw_items:
            if not isinstance(symbol, dict):
                continue
            entry = dict(symbol)
            symbol_char = str(entry.get("symbol") or "✧")
            entry.setdefault("light_coded_symbols", [
                symbol_char,
                f"{symbol_char}·{symbol_char}",
                f"⟡ {symbol_char} ⟡",
            ])
            entry.setdefault("embodiment_ritual", [
                "Stand or sit upright, place one hand on heart and one hand on lower belly.",
                f"Inhale while tracing {symbol_char} in the air; exhale and feel where the symbol lands in the body.",
                "Close by naming one grounded action to embody this code in daily life.",
            ])
            entry.setdefault("ceremony", [
                "Opening: light a candle and ask for the highest good to guide interpretation.",
                "Transmission: gaze softly at the symbol for several breaths, then journal sensation and meaning.",
                "Integration: speak one vow aloud and anchor it with a practical action.",
            ])
            entry.setdefault("guided_practice", [
                "Phase 1 — Orient: soften shoulders and lengthen exhale for one minute.",
                "Phase 2 — Encode: trace the symbol slowly while breathing in a 4/6 rhythm.",
                "Phase 3 — Integrate: walk slowly for 2 minutes and embody the chosen quality.",
            ])
            section_enriched.append(entry)

        section_enriched = [_enrich_devotional_language(_enrich_content_integrity(item, "hybrid-curated"), "healing-portals") for item in section_enriched]
        enriched[section_name] = _apply_free_paid_tiering(section_enriched, "light_codes")

    return enriched


def _enrich_energy_healing_entry(entry: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(entry)
    enriched.setdefault("ritual_tools", ["journal", "breath timer", "clean water", "grounding stone"])
    enriched.setdefault("meridian_functions", [
        "Supports parasympathetic downshifting",
        "Improves energetic flow perception along major channels",
        "Helps identify emotional holding patterns in body zones",
    ])
    enriched.setdefault("body_ailment_connections", [
        "Tension headaches and jaw clenching patterns",
        "Digestive stress and lower belly holding",
        "Upper-back guarding linked to emotional load",
    ])

    enriched.setdefault("alchemy", [
        f"{enriched.get('name', 'This modality')} teaches that healing is relational: regulate first, reveal safely, then integrate through grounded action.",
        "Energetic release is paired with somatic tracking so insight becomes embodied change rather than spiritual bypass.",
        "Compassionate boundaries are not separate from healing—they are the architecture that allows energy medicine to stabilize.",
    ])
    enriched.setdefault("ritual", [
        "Begin with 12 rounds of 4-in / 6-out breath while orienting to safety in your environment.",
        "Place one hand on heart and one on lower belly, then name your intention in one clear sentence.",
        "Close with water, journaling, and one practical integration commitment for the next 24 hours.",
    ])
    enriched.setdefault("ceremony", [
        "Threshold: invoke protection, consent, and compassionate pacing before entering depth work.",
        "Descent: alternate energetic technique with somatic check-ins every few minutes.",
        "Closure: seal your field with gratitude, boundaries, and embodied follow-through.",
    ])
    enriched.setdefault("guided_practice", [
        "Arrival: orient eyes to the room, soften shoulders, and lengthen exhale.",
        "Activation: run one full healing sequence while tracking sensation and emotional shifts.",
        "Integration: anchor one truth line and one real-world action before ending.",
    ])
    return enriched


def _append_energy_healing_supplements(practices: list[dict[str, Any]], modality: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(practice.get("id")) for practice in practices}
    additions = []
    modality_filter = str(modality or "").strip().lower()

    for item in ENERGY_HEALING_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if modality_filter and str(item.get("modality", "")).strip().lower() != modality_filter:
            continue
        additions.append(item)
    return practices + additions


def _append_water_supplements(practices: list[dict[str, Any]], category: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(practice.get("id")) for practice in practices}
    additions = []
    for item in WATER_PRACTICE_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if category and str(item.get("category", "")).lower() != str(category).lower():
            continue
        additions.append(item)
    return practices + additions


def _append_heart_supplements(practices: list[dict[str, Any]], category: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(practice.get("id")) for practice in practices}
    additions = []
    for item in HEART_PRACTICE_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if category and str(item.get("category", "")).lower() != str(category).lower():
            continue
        additions.append(item)
    return practices + additions


def _append_mindfulness_supplements(practices: list[dict[str, Any]], category: Optional[str], element: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(practice.get("id")) for practice in practices}
    additions = []
    for item in MINDFULNESS_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if category and str(item.get("category", "")).lower() != str(category).lower():
            continue
        if element and str(item.get("element", "")).lower() != str(element).lower():
            continue
        additions.append(item)
    return practices + additions


def _append_meditation_supplements(practices: list[dict[str, Any]], category: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(practice.get("id")) for practice in practices}
    additions = []
    for item in MEDITATION_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if category and str(item.get("category", "")).lower() != str(category).lower():
            continue
        additions.append(item)
    return practices + additions


def _append_mantra_supplements(practices: list[dict[str, Any]], element: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(practice.get("id")) for practice in practices}
    additions = []
    element_filter = str(element or "").lower()
    for item in MANTRA_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if element_filter and str(item.get("element", "")).lower() != element_filter:
            continue
        additions.append(item)
    return practices + additions


def _append_shamanic_supplements(practices: list[dict[str, Any]], category: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(practice.get("id")) for practice in practices}
    additions = []
    for item in SHAMANIC_ADVANCED_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if category and str(item.get("category", "")).lower() != str(category).lower():
            continue
        additions.append(item)
    return practices + additions


def _append_earth_crafting_supplements(items: list[dict[str, Any]], category: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(item.get("id")) for item in items}
    additions = []
    category_filter = (category or "").strip().lower()

    for item in EARTH_CRAFTING_TOOL_SUPPLEMENTS:
        if str(item.get("id")) in existing_ids:
            continue
        item_category = str(item.get("category") or "").strip().lower()
        if category_filter and item_category and item_category != category_filter:
            continue
        additions.append(item)

    return items + additions


def _enrich_sacred_tool_birthing_entry(item: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(item)
    category = str(enriched.get("category") or "").strip().lower()
    if category != "sacred-tool-birthing":
        return enriched

    name = str(enriched.get("name") or "Sacred Tool")
    enriched.setdefault("ethical_materials", [
        "Use naturally shed, reclaimed, or verifiably reciprocal materials whenever possible.",
        "Do not harvest from protected species, sacred sites without permission, or ecologies under stress.",
        "Offer reciprocity: donation, restoration action, or community support for any gathered material.",
    ])
    enriched.setdefault("materials", [
        "Natural fibers, reclaimed wood, clay, seeds, shells, stones, or ethically sourced feathers/hides",
        "Blessing water, candle, and journal for integration notes",
        "Thread, cord, or binding material aligned to your intention",
    ])
    enriched.setdefault("ritual", [
        "Open by naming lineage respect, consent, and the purpose of the tool you are birthing.",
        "Cleanse materials with breath, water, or smoke-free prayer while speaking gratitude aloud.",
        "Seal the completed tool with a boundary vow: when and how it will be used in service.",
    ])
    enriched.setdefault("ceremony", [
        "Threshold: orient body, invoke protection, and commit to ethical sourcing before crafting.",
        "Creation: craft in rhythmic breath cycles, pausing for sensation check-ins every few minutes.",
        "Consecration: dedicate the tool with a spoken prayer and one concrete integrity commitment.",
    ])
    enriched.setdefault("guided_practice", [
        f"Arrival: hold {name} materials in both hands and breathe slowly for one minute.",
        "Embodiment: craft with deliberate tempo, staying aware of jaw, shoulders, and breath rhythm.",
        "Integration: close with gratitude, document sourcing choices, and schedule first ceremonial use.",
    ])
    enriched.setdefault("alchemy", [
        f"{name} becomes medicine when craft, ethics, and devotion remain inseparable.",
        "The tool is not an object of status; it is a relational vow between body, Earth, and service.",
        "Every sourcing decision is part of the ceremony and shapes the spiritual integrity of the outcome.",
    ])
    enriched.setdefault("process_steps", [
        "Confirm ethical origin of each material and record provenance before assembly.",
        "Set the crafting altar with one object for gratitude and one for accountability.",
        "Craft in silence or prayerful chanting, then pause to feel whether the tool is complete.",
        "Consecrate with breath, water, and intention; close with a grounded integration action.",
    ])
    enriched.setdefault("spiritual_purpose", "Birth sacred tools through ceremonial integrity, ecological reciprocity, and embodied devotion.")
    return enriched


def _parse_tier_sort_value(item: dict[str, Any]) -> tuple[int, str]:
    raw_id = str(item.get("id") or "")
    digits = "".join(char for char in raw_id if char.isdigit())
    if digits:
        return int(digits), str(item.get("name") or "")
    return 10_000_000, str(item.get("name") or raw_id)


def _humanize_unlock_id(unlock_id: str) -> str:
    return unlock_id.replace("_", " ").strip().title()


def _expand_section_items_to_target(items: list[dict[str, Any]], unlock_id: str) -> list[dict[str, Any]]:
    if not items:
        return []

    expanded_items = [dict(item) for item in items]
    source_items = [dict(item) for item in items]
    section_title = _humanize_unlock_id(unlock_id)
    ceremonial_templates = [
        "Open sacred space, name your intention, and invite your body to soften before beginning.",
        "Move slowly through each phase while tracking breath, pulse, and emotional texture with compassion.",
        "Close with grounding: hand to heart, hand to belly, and one clear integration commitment for today.",
    ]
    domain_seed = unlock_id.lower().strip()

    domain_focus_map = {
        "sacred_guardians": "Call your allies with humility and listen for guidance through sensation, image, and felt knowing.",
        "sacred_ally_alchemy": "Practice relational alchemy: transmute reactivity into truth-telling, coherent breath, and embodied choice.",
        "angelic_alchemy": "Anchor celestial guidance through practical devotion, clean boundaries, and compassionate action.",
        "healing_portals": "Treat each round as nervous-system medicine: orient, regulate, release, and integrate before advancing.",
        "elemental_temples": "Work elementally: earth for stability, water for flow, fire for courage, air for perspective, spirit for unity.",
        "sound_frequencies": "Use tone, humming, and silence cycles to restore coherence across breath, fascia, and emotional field.",
        "creative_processes": "Create as ceremony: gather materials prayerfully, build rhythm, and witness meaning as it emerges.",
        "yoga_poses": "Prioritize alignment and safety, then add subtle bandha awareness and devotional breath pacing.",
        "somatic_movement": "Favor slow transitions and pendulation so fascia unwinds without overwhelm.",
        "breathwork_sessions": "Maintain a gentle intensity ladder and return to longer exhale phases for integration.",
    }

    default_domain_focus = (
        "Hold this as a devotional practice: regulate pace, deepen embodiment, and complete with grounded integration."
    )
    extension_index = 1

    while len(expanded_items) < SECTION_MAX_TIER_ITEMS:
        base_item = source_items[(len(expanded_items) - len(items)) % len(source_items)]
        base_id = str(base_item.get("id") or f"{unlock_id}-practice")
        base_name = str(base_item.get("name") or base_item.get("title") or section_title)
        base_description = str(
            base_item.get("description")
            or base_item.get("summary")
            or base_item.get("message")
            or ""
        ).strip()

        extension_item = dict(base_item)
        extension_item["id"] = f"{base_id}-deepening-{extension_index}"

        extension_title = f"{base_name} · Deepening Cycle {extension_index}"
        extension_item["name"] = extension_title
        if "title" in extension_item:
            extension_item["title"] = extension_title

        ceremonial_line = ceremonial_templates[(extension_index - 1) % len(ceremonial_templates)]
        domain_focus = domain_focus_map.get(domain_seed, default_domain_focus)
        deepening_suffix = f"{ceremonial_line} {domain_focus}"
        extension_item["description"] = (
            f"{base_description} {deepening_suffix}".strip()
            if base_description
            else f"{section_title} deepening sequence {extension_index}. {deepening_suffix}"
        )

        extension_item["alchemy"] = [
            f"{section_title} deepening {extension_index}: breathe into your center and choose coherence over urgency.",
            "Witness the pattern kindly, then transmute it through paced breath and aligned action.",
            domain_focus,
        ]
        extension_item["ritual"] = [
            "Light a candle or set a simple anchor object before beginning.",
            "Speak one sentence of intention out loud, then begin with three slow exhales.",
            "Close by journaling one practical integration step for the next 24 hours.",
        ]
        extension_item["ceremony"] = [
            "Opening: orient to the room, feel your feet, and invite sacred presence.",
            "Middle: complete the core sequence at a sustainable pace with devotional attention.",
            "Closing: gratitude breath, integration touchpoint, and conscious return.",
        ]
        extension_item["guided_practice"] = [
            "Phase 1 (Arrival): soften jaw, shoulders, and breath without forcing.",
            "Phase 2 (Embodiment): continue slowly while tracking sensation and emotional movement.",
            "Phase 3 (Integration): lengthen exhale and complete with grounded reflection.",
        ]

        expanded_items.append(extension_item)
        extension_index += 1

    return expanded_items


def _apply_free_paid_tiering(
    items: list[dict[str, Any]],
    unlock_id: str,
    free_ratio: float = SECTION_FREE_RATIO,
    minimum_free: int = SECTION_MIN_FREE_ITEMS,
) -> list[dict[str, Any]]:
    if not items:
        return []

    ordered = sorted(items, key=_parse_tier_sort_value)
    if unlock_id not in SECTION_UNCAPPED_UNLOCK_IDS:
        ordered = _expand_section_items_to_target(ordered, unlock_id)
    total_items = len(ordered)
    override_free_count = SECTION_FREE_COUNT_OVERRIDES.get(unlock_id, SECTION_DEFAULT_FREE_ITEMS)
    free_count = max(minimum_free, int(override_free_count))
    free_count = max(1, min(free_count, total_items))

    if unlock_id in SECTION_UNCAPPED_UNLOCK_IDS:
        max_visible_items = total_items
    else:
        max_visible_items = min(total_items, free_count + SECTION_DEFAULT_PREMIUM_ITEMS)
    selected_items = ordered[:max_visible_items]
    visible_free_count = min(free_count, len(selected_items))

    premium_label = SECTION_PREMIUM_LABELS.get(unlock_id, "Premium Access")

    tiered: list[dict[str, Any]] = []
    for index, item in enumerate(selected_items):
        enriched = dict(item)
        is_premium = index >= visible_free_count
        enriched["is_premium"] = is_premium
        if is_premium:
            enriched.setdefault("premium_unlock_id", unlock_id)
            enriched.setdefault("premium_label", premium_label)
        else:
            if str(enriched.get("premium_unlock_id") or "") == unlock_id:
                enriched.pop("premium_unlock_id", None)
            if str(enriched.get("premium_label") or "") == premium_label:
                enriched.pop("premium_label", None)
        tiered.append(enriched)
    return tiered


def _split_sentences(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", str(text or "")).strip()
    if not normalized:
        return []
    chunks = re.split(r"(?<=[.!?])\s+", normalized)
    return [chunk.strip() for chunk in chunks if len(chunk.strip()) > 20]


def _secure_choice(items: Sequence[dict[str, Any]]) -> Optional[dict[str, Any]]:
    if not items:
        return None
    return items[secrets.randbelow(len(items))]


def _secure_sample(items: Sequence[dict[str, Any]], count: int) -> list[dict[str, Any]]:
    pool: list[dict[str, Any]] = list(items)
    result: list[dict[str, Any]] = []
    for _ in range(min(count, len(pool))):
        idx = secrets.randbelow(len(pool))
        result.append(pool.pop(idx))
    return result


def _deterministic_rotate_pool(practices: Sequence[dict[str, Any]], seed_value: int) -> list[dict[str, Any]]:
    ordered = sorted(list(practices), key=lambda item: str(item.get("id") or item.get("name") or ""))
    if not ordered:
        return []
    rotation = seed_value % len(ordered)
    return ordered[rotation:] + ordered[:rotation]


def _secure_bool(probability: float = 0.5):
    threshold = max(0, min(10000, int(probability * 10000)))
    return secrets.randbelow(10000) < threshold


def _sanitize_llm_text(raw_text: str) -> str:
    text = str(raw_text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z0-9_-]*\n?", "", text)
        text = re.sub(r"```$", "", text).strip()
    return text


def _segment_paragraphs(paragraphs: list[str]) -> list[str]:
    segments: list[str] = []
    current: list[str] = []
    running_words = 0

    for paragraph in paragraphs:
        paragraph_text = paragraph.strip()
        if not paragraph_text:
            continue
        paragraph_words = _count_words(paragraph_text)
        current_target = FIRST_SEGMENT_TARGET_WORDS if len(segments) == 0 else SEGMENT_TARGET_WORDS
        if current and (running_words + paragraph_words) > current_target:
            segments.append("\n\n".join(current))
            current = []
            running_words = 0
        current.append(paragraph_text)
        running_words += paragraph_words

    if current:
        segments.append("\n\n".join(current))

    if not segments:
        segments = ["Take a slow breath in. Take a longer breath out. You are safe here."]

    return segments


def _normalize_text_for_repeat_check(text: str) -> str:
    normalized = re.sub(r"\s+", " ", str(text or "")).strip().lower()
    normalized = re.sub(r"[^a-z0-9 ]+", "", normalized)
    return normalized


def _paragraph_stem(text: str, words: int = 8) -> str:
    return " ".join(_normalize_text_for_repeat_check(text).split()[:words])


def _paragraph_stem_repeat_ratio(paragraphs: list[str], stem_words: int = 8) -> float:
    stems = [_paragraph_stem(paragraph, words=stem_words) for paragraph in paragraphs if paragraph]
    stems = [stem for stem in stems if stem]
    if not stems:
        return 0.0

    stem_counts = Counter(stems)
    repeated = sum(count - 1 for count in stem_counts.values() if count > 1)
    return repeated / len(stems)


def _enforce_stem_diversity(paragraphs: list[str], max_occurrences: int = 1, stem_words: int = 8) -> list[str]:
    stem_counts: dict[str, int] = {}
    filtered: list[str] = []

    for paragraph in paragraphs:
        stem = _paragraph_stem(paragraph, words=stem_words)
        if not stem:
            continue
        if stem_counts.get(stem, 0) >= max_occurrences:
            continue
        stem_counts[stem] = stem_counts.get(stem, 0) + 1
        filtered.append(paragraph)

    return filtered or paragraphs


def _dedupe_paragraphs(paragraphs: list[str]) -> list[str]:
    cleaned: list[str] = []
    seen_normalized: set[str] = set()
    stem_counts: dict[str, int] = {}

    for paragraph in paragraphs:
        text = re.sub(r"\s+", " ", str(paragraph or "")).strip()
        if not text or _count_words(text) < 8:
            continue

        normalized = _normalize_text_for_repeat_check(text)
        if not normalized or normalized in seen_normalized:
            continue

        stem = _paragraph_stem(normalized, words=8)
        stem_counts[stem] = stem_counts.get(stem, 0) + 1
        if stem_counts[stem] > 1:
            continue

        cleaned.append(text)
        seen_normalized.add(normalized)

    return cleaned


def _unique_preserve(items: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for item in items:
        cleaned = re.sub(r"\s+", " ", str(item or "")).strip().rstrip(".")
        key = _normalize_text_for_repeat_check(cleaned)
        if not key or key in seen:
            continue
        seen.add(key)
        ordered.append(cleaned)
    return ordered


def _resolve_context_sentences(request: ExpandScriptRequest, practice_name: str) -> list[str]:
    context_sentences = _unique_preserve([
        sentence
        for text in request.source_texts
        for sentence in _split_sentences(text)
    ])
    if context_sentences:
        return context_sentences
    return [
        f"{practice_name} is a sacred return to your breath, body, and inner wisdom",
        "Move slowly and gently, giving your nervous system enough space to soften and trust",
        "Let your attention settle into sensation so this practice becomes deeply embodied",
        "Allow this moment to unfold with patience, kindness, and honest listening",
    ]


def _filter_context_by_steps(context_sentences: list[str], unique_steps: list[str]) -> list[str]:
    step_keys = [_normalize_text_for_repeat_check(step) for step in unique_steps]
    filtered_context: list[str] = []
    for sentence in context_sentences:
        normalized_sentence = _normalize_text_for_repeat_check(sentence)
        overlaps_step = any(
            step_key and (step_key in normalized_sentence or normalized_sentence in step_key)
            for step_key in step_keys
        )
        if not overlaps_step:
            filtered_context.append(sentence)
    return filtered_context or context_sentences


def _build_fallback_intro(practice_name: str, element: str) -> list[str]:
    element_themes = {
        "earth": "steady, grounded, and quietly reassuring",
        "water": "fluid, receptive, and emotionally spacious",
        "fire": "clear, brave, and gently energizing",
        "air": "light, open, and mentally spacious",
        "spirit": "expansive, devotional, and deeply present",
    }
    element_theme = element_themes.get(element, element_themes["spirit"])
    return [
        (
            f"Welcome to {practice_name}. Take one easy breath with me, then another. "
            "There is nothing to perform here—you can simply arrive as you are."
        ),
        (
            f"This is a {element} practice, with a tone that feels {element_theme}. "
            "We begin gently, gather grounded strength through the middle, and close in a soft integration."
        ),
    ]


TONING_SEED_BY_ELEMENT = {
    "earth": "LAM",
    "water": "VAM",
    "fire": "RAM",
    "air": "YAM",
    "spirit": "OM",
}

TONING_PARAGRAPH_TEMPLATES = [
    "If it feels supportive, add a soft vocal tone under the breath for two or three exhalations—gentle sounds like ahh, ooh, or mmm. Keep it quiet enough to feel soothing in the chest and throat.",
    "On the next few exhales, hum very softly and feel the vibration traveling through the sternum, jaw, and face. You are not performing; you are simply resonating with your own nervous system.",
    "You can weave in a light seed syllable when ready: {seed}. Let the sound be subtle, warm, and unforced, then return to natural breathing for a few cycles.",
    "Try one rounded tone for the length of your exhale, then rest in silence. Alternate tone and silence so your body can absorb the effect gently.",
    "If emotion rises, keep the sound tender and low. A soft hum can hold you while release moves through, without needing to push or explain anything.",
]


def _inject_toning_paragraphs(paragraphs: list[str], element: str) -> list[str]:
    if not paragraphs:
        return paragraphs

    seed = TONING_SEED_BY_ELEMENT.get(str(element or "spirit").lower(), TONING_SEED_BY_ELEMENT["spirit"])
    interval = max(3, min(8, len(paragraphs) // 3 if len(paragraphs) > 3 else 3))

    injected: list[str] = []
    cue_index = 0
    for index, paragraph in enumerate(paragraphs):
        injected.append(paragraph)
        if (index + 1) % interval != 0:
            continue

        cue_template = TONING_PARAGRAPH_TEMPLATES[cue_index % len(TONING_PARAGRAPH_TEMPLATES)]
        cue_index += 1
        injected.append(cue_template.format(seed=seed))

    if cue_index == 0:
        injected.append(TONING_PARAGRAPH_TEMPLATES[0].format(seed=seed))

    return injected


def _build_step_paragraphs(unique_steps: list[str], context_sentences: list[str]) -> list[str]:
    step_frames = [
        "Whenever you're ready, begin with",
        "If it feels supportive, explore",
        "This next moment can open through",
        "Gently move toward",
        "For this part, stay with",
        "Let yourself settle into",
        "Try this softly:",
        "You can open this section through",
    ]
    somatic_prompts = [
        "Keep your breath smooth and notice what shifts in jaw, chest, and belly.",
        "Let your body respond in its own timing—no need to force precision.",
        "Give your nervous system a patient pace it can actually trust.",
        "Soften effort while staying clear and kind with your attention.",
        "Stay curious about small signals: warmth, pulse, emotion, and release.",
        "Let this feel embodied and human, not performative.",
        "Use each exhale to loosen strain and come back to yourself.",
        "Keep shoulders, face, and throat relaxed as this unfolds.",
    ]
    paragraphs: list[str] = []
    for index, step in enumerate(unique_steps[:8]):
        support = context_sentences[index % len(context_sentences)]
        frame = step_frames[index % len(step_frames)]
        somatic = somatic_prompts[index % len(somatic_prompts)]
        paragraphs.append(f"{frame} {step}. {somatic} {support}.")
    return paragraphs


def _build_context_absorption_paragraphs(context_sentences: list[str]) -> list[str]:
    lead_ins = [
        "Let this guidance land softly",
        "Take a quiet moment with this",
        "If it helps, stay with this line",
        "Let these words settle into your body",
    ]
    return [
        (
            f"{lead_ins[index % len(lead_ins)]}: {sentence}. "
            "Notice what shifts in your breath, emotional tone, and inner steadiness."
        )
        for index, sentence in enumerate(context_sentences[:12])
    ]


ADAPTIVE_BODY_PHRASE_BANK: dict[str, list[str]] = {
    "awareness_points": [
        "the space behind your eyes", "your jaw and tongue", "your throat and collarbones", "the center of your chest",
        "the rise and fall of your ribs", "your diaphragm and belly", "your lower back and sacrum", "your hips and pelvis",
        "the weight in your legs", "your feet touching the ground", "the back of your heart", "the rhythm of your pulse",
        "the temperature of your skin", "the subtle movement of breath", "your emotional edges", "your sense of internal space",
        "your shoulder blades resting", "the inside of your palms", "your pelvic floor", "your spine lengthening",
        "your heartbeat against stillness", "the bridge between breath and emotion", "your forehead softening", "your belly wall relaxing",
    ],
    "breath_cues": [
        "Lengthen your exhale slightly beyond your inhale",
        "Receive the inhale naturally, without pulling",
        "Keep the pauses soft instead of rigid",
        "Breathe through your nose with an even, quiet cadence",
        "Round off unnecessary tension on each breath cycle",
        "Maintain a breath volume that feels sustainable",
        "Guide the breath lower toward the belly",
        "Hold a rhythm your nervous system can trust",
        "Synchronize breath and body without forcing",
        "Use breath as an anchor rather than a demand",
        "Breathe as if there is ample time",
        "Soften around the edge of each exhale",
        "Give every exhale enough length to signal safety",
        "Let ribcage expansion and release stay effortless",
        "Keep the breath low, warm, and steady",
        "Choose a breathing rhythm that remains simple",
        "Ease the edges of effort through steady breathing",
        "Stay with a cadence that feels clear and manageable",
        "Breathe as though support is rising from within",
        "Relax the throat so breath can move cleanly",
    ],
    "integration_targets": [
        "nervous system regulation", "emotional steadiness", "inner trust", "embodied clarity", "somatic safety",
        "grounded awareness", "gentle resilience", "self-compassion", "present-moment stability", "deeper self-connection",
        "energetic coherence", "relational softness", "mental spaciousness", "body-based confidence", "subtle emotional release",
    ],
    "imagery_prompts": [
        "Imagine this practice moving through you like a calm tide", "Feel this process settling like warm light through the body",
        "Let awareness spread like roots finding stable ground", "Sense your attention widening without losing precision",
        "Receive each breath as a quiet message of safety", "Notice that stillness can coexist with movement",
        "Allow your body to become both soft and strong", "Let the mind become spacious while the body stays grounded",
        "Feel yourself held by the moment rather than pushed by it", "Allow presence to deepen with each cycle",
        "Picture tension loosening like knots in warm water", "Feel your awareness becoming clear and spacious",
        "Imagine each exhale polishing the mind toward stillness", "Sense the body returning to its natural rhythm",
        "Let this moment feel like an inner sanctuary", "Feel your system organizing itself around calm clarity",
    ],
    "narrative_openers": [
        "In this next interval, stay slow and attentive",
        "Continue with patience and a softer focus",
        "As you settle deeper, let awareness feel embodied",
        "This minute can unfold with steadiness and ease",
        "Take this phase as an invitation to listen inwardly",
        "From here, move with gentle care",
        "Remain present while subtle shifts reveal themselves",
        "This layer of practice can ripen gradually",
        "Keep attention honest and unforced",
        "Notice how depth appears when urgency fades",
        "Continue with curiosity and kind discipline",
        "Treat this section as lived experience, not theory",
        "Let calm precision and grounded strength move together",
        "Stay graceful as your inner focus grows clearer",
        "Hold this part of the journey as tender and strong",
        "If you need to slow down, that is part of the practice",
        "Let this feel more like conversation than command",
    ],
}


def _adaptive_body_phrase_bank() -> dict[str, list[str]]:
    return ADAPTIVE_BODY_PHRASE_BANK


def _compose_adaptive_paragraph(index: int, context_queue: list[str], phrase_bank: dict[str, list[str]]) -> str:
    opener = phrase_bank["narrative_openers"][index % len(phrase_bank["narrative_openers"])]
    awareness = phrase_bank["awareness_points"][index % len(phrase_bank["awareness_points"])]
    breath_cue = phrase_bank["breath_cues"][(index * 2 + 1) % len(phrase_bank["breath_cues"])]
    target = phrase_bank["integration_targets"][(index * 3 + 2) % len(phrase_bank["integration_targets"])]
    imagery = phrase_bank["imagery_prompts"][(index * 5 + 3) % len(phrase_bank["imagery_prompts"])]
    optional_context = f"{context_queue.pop(0)}. " if context_queue and index % 6 == 0 else ""

    variants = [
        (
            f"{opener}. Keep a gentle awareness near {awareness}. {breath_cue}. "
            f"{optional_context}{imagery}. Let this support {target} without pressure."
        ),
        (
            f"{opener}. {imagery}. {breath_cue}. "
            f"You might notice small changes around {awareness}; let that quietly build {target}."
        ),
        (
            f"{opener}. Stay oriented to {awareness} while you breathe. "
            f"{optional_context}Keep this moment simple and clear. "
            f"{breath_cue}. This phase can restore {target}."
        ),
        (
            f"{opener}. {breath_cue}. Let awareness stay anchored in {awareness}. "
            f"{imagery}. Give this enough time to cultivate {target}."
        ),
    ]

    return variants[index % len(variants)]


def _build_adaptive_body_paragraphs(context_sentences: list[str], target_words: int, seed_words: int) -> list[str]:
    phrase_bank = _adaptive_body_phrase_bank()
    running_words = seed_words
    index = 0
    body: list[str] = []
    context_queue = context_sentences[12:]
    recent_stems: list[str] = []
    while running_words < max(target_words - 80, 0):
        paragraph = _compose_adaptive_paragraph(index, context_queue, phrase_bank)
        stem = " ".join(_normalize_text_for_repeat_check(paragraph).split()[:10])
        if stem and stem in recent_stems:
            index += 1
            continue

        body.append(paragraph)
        running_words += _count_words(paragraph)
        if stem:
            recent_stems.append(stem)
            if len(recent_stems) > 20:
                recent_stems.pop(0)
        index += 1

    return body


def _build_fallback_closing() -> list[str]:
    return [
        "As this practice begins to close, stay for a few final breaths and notice the shift in your body, your emotions, and your inner clarity.",
        "When you are ready, return gently. Carry this blend of grace and grounded power into the rest of your day.",
    ]


def _build_fallback_paragraphs(request: ExpandScriptRequest, target_words: int) -> list[str]:
    practice_name = request.practice_name.strip() or "This practice"
    element = (request.element or "spirit").lower().strip() or "spirit"

    unique_steps = _unique_preserve(request.steps)
    context_sentences = _resolve_context_sentences(request, practice_name)
    context_sentences = _filter_context_by_steps(context_sentences, unique_steps)

    intro = _build_fallback_intro(practice_name, element)
    step_content = _build_step_paragraphs(unique_steps, context_sentences)
    context_content = _build_context_absorption_paragraphs(context_sentences)

    paragraphs = [*intro, *step_content, *context_content]
    seed_words = _count_words(" ".join(paragraphs))
    adaptive_body = _build_adaptive_body_paragraphs(context_sentences, target_words, seed_words)
    paragraphs.extend(adaptive_body)
    paragraphs.extend(_build_fallback_closing())
    if request.include_toning:
        paragraphs = _inject_toning_paragraphs(paragraphs, element)
    return _dedupe_paragraphs(paragraphs)


EXTENSION_PHRASE_BANK: dict[str, list[str]] = {
    "openers": [
        "Continue with patience and care",
        "Stay with the process as it unfolds naturally",
        "Keep awareness spacious and grounded",
        "Let this next minute stay steady and unrushed",
        "Support your body in learning through breath",
        "Remain connected to present sensation",
        "Keep this phase simple and embodied",
        "Maintain a calm, sustainable rhythm",
        "Continue with gentle attentiveness",
        "Stay graceful as your inner signal grows clearer",
        "Let steady power rise without force",
        "Track subtle shifts while keeping your pace human",
        "Hold the posture of listening, not performing",
        "Keep your focus soft, clear, and grounded",
        "If needed, take this section slower and kinder",
        "Let this feel like guidance from a trusted voice",
    ],
    "midlines": [
        "Keep your breathing even and unforced",
        "Stay receptive while attention remains clear",
        "Track subtle sensation without over-analyzing every shift",
        "Let awareness stay grounded in what is present",
        "Hold a rhythm that does not strain the body",
        "Continue with patient focus instead of urgency",
        "Give this moment room to settle before moving on",
        "Let breath and posture coordinate with minimal effort",
        "Keep jaw, shoulders, and belly soft as you continue",
        "Maintain clarity while your nervous system settles",
        "Stay connected to your inner pacing cues",
        "Keep this phase embodied rather than performative",
        "Allow precision and softness to move together",
        "Stay present to sensation while breath remains smooth",
        "If emotion rises, let it move through you without rushing",
        "Keep returning to the body as your most honest anchor",
    ],
    "closers": [
        "Nothing is missing in this moment",
        "Depth comes through consistency, not force",
        "Your pace is enough",
        "Gentleness is part of the medicine",
        "Trust the process as it reveals itself",
        "Keep listening from within",
        "Steadiness is more valuable than intensity",
        "Let this settle before moving ahead",
        "Presence is the practice",
        "Small steady steps shape real change",
        "This is how calm strength is built",
        "Take only what your system can integrate now",
        "The body learns best in clear, steady cycles",
        "Your awareness is already doing meaningful work",
        "Integration happens through repetition with variation",
        "Stay kind and precise at the same time",
        "You can trust what your body is telling you",
        "Softness and strength can live together here",
        "You are allowed to be held while you heal",
        "Let this guidance meet you exactly where you are",
    ],
}


def _extension_phrase_bank() -> dict[str, list[str]]:
    return EXTENSION_PHRASE_BANK


def _compose_extension_paragraph(index: int, context_queue: list[str], phrase_bank: dict[str, list[str]]) -> str:
    openers = phrase_bank["openers"]
    midlines = phrase_bank["midlines"]
    closers = phrase_bank["closers"]

    opener = openers[index % len(openers)]
    midline = midlines[(index * 3 + 1) % len(midlines)]
    closer = closers[(index * 2 + 1) % len(closers)]
    optional_context = f" {context_queue.pop(0)}." if context_queue and index % 4 == 0 else ""

    if index % 3 == 0:
        return f"{opener}. {midline}.{optional_context} {closer}."
    if index % 3 == 1:
        return f"{opener}. {optional_context.strip()} {midline}. {closer}.".strip()
    return f"{midline}. {opener}.{optional_context} {closer}."


def _resolve_extension_context_sentences(request: ExpandScriptRequest, practice_name: str) -> list[str]:
    context_sentences = [
        sentence.strip()
        for text in request.source_texts
        for sentence in _split_sentences(text)
        if sentence.strip()
    ]
    if context_sentences:
        return context_sentences
    return [
        f"{practice_name} supports deeper embodiment through gentle repetition",
        "Stay present with your breath and soften around unnecessary effort",
    ]


def _extension_generation_limits(required_words: int, anti_repetition_mode: str) -> tuple[int, int]:
    max_midline_reuse = 2 if anti_repetition_mode == "strict" else 4
    max_attempts = max(required_words * 4, 400)
    return max_midline_reuse, max_attempts


def _extract_midline_stem(paragraph: str) -> str:
    midline_sentence = paragraph.split(". ")[1] if ". " in paragraph else paragraph
    return _paragraph_stem(midline_sentence, words=6)


def _should_skip_extension_candidate(
    stem: str,
    recent_stems: list[str],
    midline_stem: str,
    midline_counts: dict[str, int],
    max_midline_reuse: int,
    attempts_without_append: int,
) -> bool:
    if stem and stem in recent_stems:
        return True
    if midline_stem and midline_counts.get(midline_stem, 0) >= max_midline_reuse and attempts_without_append < 80:
        return True
    return False


def _build_extension_paragraphs(
    request: ExpandScriptRequest,
    required_words: int,
    start_index: int = 0,
    anti_repetition_mode: str = "strict",
) -> list[str]:
    if required_words <= 0:
        return []

    practice_name = request.practice_name.strip() or "This practice"
    context_sentences = _resolve_extension_context_sentences(request, practice_name)
    phrase_bank = _extension_phrase_bank()

    state = _initialize_extension_generation_state(start_index, context_sentences)
    max_midline_reuse, max_attempts = _extension_generation_limits(required_words, anti_repetition_mode)
    attempts = 0

    while state["words"] < required_words + 40:
        attempts += 1
        if attempts > max_attempts:
            break

        paragraph = _compose_extension_paragraph(state["index"], state["context_queue"], phrase_bank)
        stem = " ".join(_normalize_text_for_repeat_check(paragraph).split()[:10])
        midline_stem = _extract_midline_stem(paragraph)
        if _should_skip_extension_candidate(
            stem,
            state["recent_stems"],
            midline_stem,
            state["midline_counts"],
            max_midline_reuse,
            state["attempts_without_append"],
        ):
            state["index"] += 1
            state["attempts_without_append"] += 1
            continue

        state["generated"].append(paragraph)
        state["attempts_without_append"] = 0
        state["words"] += _count_words(paragraph)
        if stem:
            state["recent_stems"].append(stem)
            if len(state["recent_stems"]) > 20:
                state["recent_stems"].pop(0)
        if midline_stem:
            state["midline_counts"][midline_stem] = state["midline_counts"].get(midline_stem, 0) + 1
        state["index"] += 1

    return _dedupe_paragraphs(state["generated"])


def _initialize_extension_generation_state(
    start_index: int,
    context_sentences: list[str],
) -> dict[str, Any]:
    return {
        "generated": [],
        "words": 0,
        "index": start_index,
        "context_queue": context_sentences[:],
        "recent_stems": [],
        "midline_counts": {},
        "attempts_without_append": 0,
    }


WORD_FLOOR_PADDING_OPENERS = [
    "Continue by noticing what is softening inside your body",
    "Stay with this slower rhythm as your system settles",
    "Keep awareness anchored in the breath-body relationship",
    "Let the next moments deepen your inner steadiness",
    "Receive this phase as quiet nervous-system support",
    "Allow attention to remain embodied and precise",
    "Keep listening for subtle shifts without forcing meaning",
    "Stay in gentle contact with breath, posture, and feeling tone",
    "Let this continuity train calm focus and emotional balance",
    "Continue with grounded patience and a receptive mind",
    "Remain present to the small details that signal regulation",
    "Let this sequence reinforce trust in your internal pacing",
    "Keep this interval simple, clear, and compassionate",
    "Stay steady as breath organizes your inner landscape",
    "Allow this section to build calm strength through consistency",
    "Continue with soft concentration and unhurried attention",
    "Remain connected to the body as your primary reference",
    "Let this moment remind you that slower can still be powerful",
    "Keep your focus kind while breathing stays even",
    "Stay here long enough for integration to feel tangible",
    "If you need a gentler pace, trust that instinct",
    "Let this feel supportive, steady, and deeply humane",
]

WORD_FLOOR_PADDING_SUPPORTS = [
    "Lengthen the exhale slightly and allow the inhale to arrive on its own.",
    "Notice jaw, throat, chest, and belly as one coordinated field of awareness.",
    "Keep effort low while presence stays high.",
    "Allow sensation to move without rushing to conclusions.",
    "Stay with what feels true in this breath, then the next.",
    "Let your nervous system register safety through steady pacing.",
    "Keep posture supportive and breathing sustainable.",
    "Receive each cycle as both grounding and emotional clearing.",
    "Let steadiness become the tone of this practice.",
    "Continue in a way that feels reliable, calm, and embodied.",
    "If your mind races, return to one kind breath at a time.",
    "Give yourself permission to be human while you heal.",
]

WORD_FLOOR_PADDING_CLOSERS = [
    "This is how integration becomes lived experience.",
    "Your pace is not behind; your pace is the medicine.",
    "Small, consistent moments of presence create lasting change.",
    "Let this steadiness accompany you beyond the practice.",
    "You are building resilience through kindness and clarity.",
    "Stay with the process as it unfolds in its own timing.",
    "This is enough to support meaningful regulation.",
    "Carry this grounded quality into whatever follows.",
    "You are allowed to soften and still be strong.",
    "Allow this moment to honor exactly where you are right now.",
]


def _build_word_floor_padding_paragraphs(required_words: int) -> list[str]:
    if required_words <= 0:
        return []

    generated: list[str] = []
    words = 0
    index = 0
    while words < required_words + 20:
        paragraph = (
            f"{WORD_FLOOR_PADDING_OPENERS[index % len(WORD_FLOOR_PADDING_OPENERS)]}. "
            f"{WORD_FLOOR_PADDING_SUPPORTS[(index * 2 + 1) % len(WORD_FLOOR_PADDING_SUPPORTS)]} "
            f"{WORD_FLOOR_PADDING_CLOSERS[(index * 3 + 2) % len(WORD_FLOOR_PADDING_CLOSERS)]}"
        )
        generated.append(paragraph)
        words += _count_words(paragraph)
        index += 1

    deduped = _dedupe_paragraphs(generated)
    return _enforce_stem_diversity(deduped, max_occurrences=1, stem_words=6)


def _build_duration_alignment_booster(round_index: int) -> str:
    return (
        f"Round {round_index + 1}: Stay present with slow, unforced breath. "
        "Keep your jaw soft, shoulders released, and eyes relaxed behind closed lids. "
        "Let awareness travel through throat, chest, belly, hips, and legs with patience. "
        "If attention drifts, return gently to sensation and rhythm, without judgment. "
        "Notice warmth, spaciousness, and subtle internal movement unfolding naturally. "
        "Continue in this steady cadence, receiving each inhale as support and each exhale as release, "
        "allowing calm regulation to deepen through body, mind, and heart."
    )


def _postprocess_ai_paragraphs(text: str, target_words: int) -> list[str] | None:
    if _count_words(text) < int(target_words * 0.55):
        return None

    paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
    if not paragraphs:
        paragraphs = [
            paragraph.strip()
            for paragraph in re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
            if paragraph.strip()
        ]

    paragraphs = _dedupe_paragraphs(paragraphs)
    paragraphs = _enforce_stem_diversity(paragraphs, max_occurrences=1, stem_words=8)
    if _paragraph_stem_repeat_ratio(paragraphs, stem_words=8) > MAX_PARAGRAPH_STEM_REPEAT_RATIO:
        return None
    return paragraphs or None


def _extend_script_to_floor(
    request: ExpandScriptRequest,
    paragraphs: list[str],
    current_word_count: int,
    minimum_word_floor: int,
    target_words: int,
    anti_repetition_mode: str,
    stem_max_occurrences: int,
) -> tuple[list[str], int]:
    extension_round = 0
    selected = paragraphs[:]
    current = current_word_count

    while current < minimum_word_floor and extension_round < 3:
        required_words = max(target_words - current, minimum_word_floor - current)
        extensions = _build_extension_paragraphs(
            request,
            required_words=required_words,
            start_index=len(selected) + (extension_round * 7),
            anti_repetition_mode=anti_repetition_mode,
        )
        if not extensions:
            break

        selected.extend(extensions)
        selected = _dedupe_paragraphs(selected)
        selected = _enforce_stem_diversity(selected, max_occurrences=stem_max_occurrences, stem_words=8)
        next_word_count = _count_words(" ".join(selected))
        if next_word_count <= current:
            break

        current = next_word_count
        extension_round += 1

    return selected, current


def _apply_script_padding(
    paragraphs: list[str],
    word_count: int,
    minimum_word_floor: int,
    stem_max_occurrences: int,
) -> tuple[list[str], int]:
    selected = paragraphs[:]
    current = word_count

    if current < minimum_word_floor:
        padding = _build_word_floor_padding_paragraphs(minimum_word_floor - current)
        selected.extend(padding)
        selected = _dedupe_paragraphs(selected)
        selected = _enforce_stem_diversity(
            selected,
            max_occurrences=stem_max_occurrences + 1,
            stem_words=8,
        )
        current = _count_words(" ".join(selected))

    if current < minimum_word_floor:
        final_padding = _build_word_floor_padding_paragraphs((minimum_word_floor - current) + 40)
        selected.extend(final_padding)
        current = _count_words(" ".join(selected))

    return selected, current


def _build_llm_script_prompt(request: ExpandScriptRequest, target_words: int) -> str:
    context_lines = [line for line in _flatten_text(request.source_texts + request.steps) if line]
    trimmed_context = "\n".join(context_lines[:60])
    target_minutes = max(MIN_NARRATION_MINUTES, int(round(request.duration_minutes or MIN_NARRATION_MINUTES)))
    toning_requirement = (
        "13) Include occasional non-repetitive soft vocal toning cues (e.g., gentle hum, ahh, ooh, seed syllables like OM/LAM/VAM) woven naturally into the guidance."
        if request.include_toning
        else "13) Do not include vocal toning or chant cues."
    )
    return f"""
Create a deeply detailed guided meditation narration script.

Practice name: {request.practice_name}
Element: {request.element or 'spirit'}
Duration target (minutes): {target_minutes}
Minimum target words: {target_words}

Source context:
{trimmed_context if trimmed_context else 'No extra context provided.'}

Requirements:
1) Write long-form spoken guidance that feels warm, immersive, therapeutic, and human.
2) Include breath pacing, body awareness, somatic language, and gentle integration prompts.
3) Keep the flow continuous with no headings, no bullets, no markdown, and no labels.
4) Return only plain narration text.
5) Ensure the output is at least {target_words} words.
6) Avoid repetitive sentence stems (do not keep reusing the same opening phrase repeatedly).
7) Use an adaptive arc: graceful opening, stronger empowering middle, soft integrative close.
8) Keep first spoken transition concise (no prolonged opening silence language).
9) Do NOT overuse repeated lead-ins such as "let", "allow", "now", "breathe" at the start of consecutive sentences.
10) Keep lexical variety high: sentence openings should feel naturally varied and human.
11) Tone should sound like an intuitive human guide speaking with compassion, not a mechanical script.
12) Use occasional natural phrasing (e.g., "if it helps", "whenever you're ready") without overusing any single phrase.
13) Voice tone must blend: (A) warm intimate guide + (C) ceremonial elder. Keep language personable, grounded, and gently sacred.
14) Use occasional first-person invitations (e.g., "I invite you", "let us") sparingly to feel more human and relational.
{toning_requirement}
""".strip()


def _import_llm_chat_dependencies() -> tuple[Any, Any] | None:
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        return LlmChat, UserMessage
    except Exception as exc:
        logger.warning("Could not import LLM chat for script expansion: %s", exc)
        return None


async def _request_llm_script_text(api_key: str, prompt: str, llm_chat_cls: Any, user_message_cls: Any) -> str | None:
    chat = llm_chat_cls(
        api_key=api_key,
        session_id=f"guided_script_{uuid.uuid4().hex[:12]}",
        system_message=(
            "You are an expert meditation guide writing high-quality long-form voice scripts. "
            "Your output must sound emotionally grounded, intuitive, naturally human, "
            "and blend warm relational guidance with ceremonial sacred cadence."
        ),
    ).with_model("openai", "gpt-5.2")

    response = await asyncio.wait_for(
        chat.send_message(user_message_cls(text=prompt)),
        timeout=20,
    )
    return _sanitize_llm_text(response)


async def _expand_with_llm(request: ExpandScriptRequest, target_words: int) -> Optional[list[str]]:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return None

    llm_types = _import_llm_chat_dependencies()
    if not llm_types:
        return None
    llm_chat_cls, user_message_cls = llm_types

    prompt = _build_llm_script_prompt(request, target_words)

    try:
        text = await _request_llm_script_text(api_key, prompt, llm_chat_cls, user_message_cls)
        if not text:
            return None
        return _postprocess_ai_paragraphs(text, target_words)
    except Exception as exc:
        logger.warning("AI script expansion failed: %s", exc)
        return None


async def _resolve_script_source(
    request: ExpandScriptRequest,
    target_words: int,
    fallback_paragraphs: list[str],
) -> tuple[list[str], bool, int]:
    selected_paragraphs = fallback_paragraphs.copy()
    used_ai = False
    anti_repetition_mode = "balanced" if request.anti_repetition_mode == "balanced" else "strict"
    stem_max_occurrences = 2 if anti_repetition_mode == "strict" else 3

    ai_expansion_enabled = os.environ.get("ENABLE_GUIDED_AI_EXPANSION", "true").lower() != "false"
    if request.use_ai and ai_expansion_enabled:
        try:
            ai_paragraphs = await asyncio.wait_for(_expand_with_llm(request, target_words), timeout=10)
        except asyncio.TimeoutError:
            logger.warning("AI script expansion timeout; using deterministic fallback")
            ai_paragraphs = None
        if ai_paragraphs:
            selected_paragraphs = ai_paragraphs
            used_ai = True

    return selected_paragraphs, used_ai, stem_max_occurrences


def _finalize_script_paragraphs(
    request: ExpandScriptRequest,
    selected_paragraphs: list[str],
    stem_max_occurrences: int,
) -> list[str]:
    finalized = _dedupe_paragraphs(selected_paragraphs)
    if request.include_toning:
        finalized = _inject_toning_paragraphs(finalized, request.element or "spirit")
        finalized = _dedupe_paragraphs(finalized)

    return _enforce_stem_diversity(finalized, max_occurrences=stem_max_occurrences, stem_words=8)


@router.post("/content/expand-script", response_model=ExpandScriptResponse)
async def expand_guided_script(request: ExpandScriptRequest) -> ExpandScriptResponse:
    """Expand guided practice text into long-form narration suitable for 7+ minute audio."""
    cache_key = _build_script_expansion_cache_key(request)
    cached_payload = _get_cached_script_expansion(cache_key)
    if cached_payload:
        return _build_expand_script_response(
            practice_name=cached_payload["practice_name"],
            target_minutes=cached_payload["target_minutes"],
            target_words=cached_payload["target_words"],
            used_ai=cached_payload["used_ai"],
            paragraphs=cached_payload["selected_paragraphs"],
            segments=cached_payload["segments"],
        )

    context = await _build_expand_script_context(request)
    segments = _segment_paragraphs(context["selected_paragraphs"])
    _set_cached_script_expansion(
        cache_key,
        {
            "practice_name": context["practice_name"],
            "target_minutes": context["target_minutes"],
            "target_words": context["target_words"],
            "used_ai": context["used_ai"],
            "selected_paragraphs": context["selected_paragraphs"],
            "segments": segments,
        },
    )
    return _build_expand_script_response(
        practice_name=context["practice_name"],
        target_minutes=context["target_minutes"],
        target_words=context["target_words"],
        used_ai=context["used_ai"],
        paragraphs=context["selected_paragraphs"],
        segments=segments,
    )


async def _build_expand_script_context(request: ExpandScriptRequest) -> dict[str, Any]:
    expansion_targets = _build_script_expansion_targets(request)
    target_words = expansion_targets["target_words"]
    fallback_paragraphs = _build_fallback_paragraphs(request, target_words)
    selected_paragraphs, used_ai, stem_max_occurrences = await _resolve_script_source(
        request,
        target_words,
        fallback_paragraphs,
    )
    selected_paragraphs = _finalize_script_paragraphs(request, selected_paragraphs, stem_max_occurrences)
    selected_paragraphs = _enforce_word_floors(
        request=request,
        selected_paragraphs=selected_paragraphs,
        expansion_targets=expansion_targets,
        stem_max_occurrences=stem_max_occurrences,
    )

    return {
        "practice_name": expansion_targets["practice_name"],
        "target_minutes": expansion_targets["target_minutes"],
        "target_words": target_words,
        "used_ai": used_ai,
        "selected_paragraphs": selected_paragraphs,
    }


def _enforce_word_floors(
    request: ExpandScriptRequest,
    selected_paragraphs: list[str],
    expansion_targets: dict[str, Any],
    stem_max_occurrences: int,
) -> list[str]:
    current_word_count = _count_words(" ".join(selected_paragraphs))
    minimum_word_floor = expansion_targets["minimum_word_floor"]
    target_words = expansion_targets["target_words"]
    anti_repetition_mode = expansion_targets["anti_repetition_mode"]

    selected_paragraphs, current_word_count = _extend_script_to_floor(
        request,
        selected_paragraphs,
        current_word_count,
        minimum_word_floor,
        target_words,
        anti_repetition_mode,
        stem_max_occurrences,
    )

    selected_paragraphs, current_word_count = _apply_script_padding(
        selected_paragraphs,
        current_word_count,
        minimum_word_floor,
        stem_max_occurrences,
    )

    duration_alignment_floor = expansion_targets["duration_alignment_floor"]
    selected_paragraphs, _ = _apply_duration_alignment_floor(
        selected_paragraphs,
        current_word_count,
        duration_alignment_floor,
        stem_max_occurrences,
    )
    return selected_paragraphs


def _build_script_expansion_targets(request: ExpandScriptRequest) -> dict[str, Any]:
    target_minutes = max(MIN_NARRATION_MINUTES, int(round(request.duration_minutes or MIN_NARRATION_MINUTES)))
    target_words = max(MIN_NARRATION_MINUTES * TARGET_WORDS_PER_MINUTE, target_minutes * TARGET_WORDS_PER_MINUTE)
    anti_repetition_mode = "balanced" if request.anti_repetition_mode == "balanced" else "strict"
    return {
        "practice_name": request.practice_name.strip() if request.practice_name else "Guided Practice",
        "target_minutes": target_minutes,
        "target_words": target_words,
        "anti_repetition_mode": anti_repetition_mode,
        "minimum_word_floor": int(target_words * (0.96 if anti_repetition_mode == "strict" else 0.93)),
        "duration_alignment_floor": int(target_words * 0.985),
    }


def _build_expand_script_response(
    practice_name: str,
    target_minutes: int,
    target_words: int,
    used_ai: bool,
    paragraphs: list[str],
    segments: list[dict[str, Any]],
) -> ExpandScriptResponse:
    return ExpandScriptResponse(
        practice_name=practice_name,
        target_minutes=target_minutes,
        target_word_count=target_words,
        word_count=_count_words(" ".join(paragraphs)),
        used_ai=used_ai,
        paragraphs=paragraphs,
        segments=segments,
    )


def _apply_duration_alignment_floor(
    selected_paragraphs: list[str],
    current_word_count: int,
    duration_alignment_floor: int,
    stem_max_occurrences: int,
) -> tuple[list[str], int]:
    if current_word_count >= duration_alignment_floor:
        return selected_paragraphs, current_word_count

    alignment_attempts = 0
    while current_word_count < duration_alignment_floor and alignment_attempts < 6:
        before_count = current_word_count
        needed_words = duration_alignment_floor - current_word_count

        alignment_padding = _build_word_floor_padding_paragraphs(needed_words + 60)
        selected_paragraphs.extend(alignment_padding)
        selected_paragraphs = _dedupe_paragraphs(selected_paragraphs)
        selected_paragraphs = _enforce_stem_diversity(
            selected_paragraphs,
            max_occurrences=stem_max_occurrences + 1,
            stem_words=7,
        )
        current_word_count = _count_words(" ".join(selected_paragraphs))

        if current_word_count <= before_count:
            selected_paragraphs.append(_build_duration_alignment_booster(alignment_attempts))
            current_word_count = _count_words(" ".join(selected_paragraphs))

        alignment_attempts += 1

    return selected_paragraphs, current_word_count


async def _build_live_session(session: dict, db) -> dict:
    if not session:
        return session

    session_id = session["id"]
    attendee_count = await db.live_session_rsvps.count_documents({"session_id": session_id})
    message_count = await db.live_session_messages.count_documents({"session_id": session_id, "kind": "chat"})
    question_count = await db.live_session_messages.count_documents({"session_id": session_id, "kind": "question"})

    scheduled_date = ""
    scheduled_time = ""
    scheduled_at = session.get("scheduled_at")
    if scheduled_at:
        try:
            dt = datetime.fromisoformat(scheduled_at.replace("Z", "+00:00"))
            scheduled_date = dt.date().isoformat()
            scheduled_time = dt.strftime("%H:%M")
        except ValueError:
            scheduled_date = scheduled_at[:10]

    return {
        **session,
        "scheduled_date": scheduled_date,
        "scheduled_time": scheduled_time,
        "attendee_count": attendee_count,
        "message_count": message_count,
        "question_count": question_count,
    }


# ============ YOGA ROUTES ============

@router.get("/yoga/poses")
async def get_yoga_poses(element: Optional[str] = None, difficulty: Optional[str] = None) -> list[dict[str, Any]]:
    """Get yoga poses from database, optionally filtered by element or difficulty."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    if difficulty:
        query["difficulty"] = {"$regex": f"^{difficulty}$", "$options": "i"}
    
    poses = await db.yoga_poses.find(query, {"_id": 0}).to_list(length=100)
    enriched = [_enrich_devotional_language(_enrich_yoga_pose(pose), "elemental-practices") for pose in poses]
    return _apply_free_paid_tiering(enriched, "yoga_poses")


@router.get("/yoga/poses/{pose_id}")
async def get_yoga_pose(pose_id: str) -> dict[str, Any]:
    """Get a specific yoga pose from database."""
    db = get_db()
    pose = await db.yoga_poses.find_one({"id": pose_id}, {"_id": 0})
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")
    return _enrich_devotional_language(_enrich_yoga_pose(pose), "elemental-practices")


# ============ BREATHWORK ROUTES ============

@router.get("/breathwork/sessions")
async def get_breathwork_sessions(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get breathwork sessions from database, optionally filtered by element."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    sessions = await db.breathwork_sessions.find(query, {"_id": 0}).to_list(length=20)
    enriched = [_enrich_breathwork_session_entry(session) for session in sessions]
    return _apply_free_paid_tiering(enriched, "premium_breathwork")


@router.get("/breathwork/sessions/{session_id}")
async def get_breathwork_session(session_id: str) -> dict[str, Any]:
    """Get a specific breathwork session from database."""
    db = get_db()
    session = await db.breathwork_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return _enrich_breathwork_session_entry(session)


# ============ CRYSTALS ROUTES ============

def _normalized_token_set(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", str(value or "").lower()))


def _token_similarity(left: str, right: str) -> float:
    left_tokens = _normalized_token_set(left)
    right_tokens = _normalized_token_set(right)
    if not left_tokens or not right_tokens:
        return 0.0
    overlap = len(left_tokens.intersection(right_tokens))
    return overlap / max(len(left_tokens), len(right_tokens))


def _get_crystal_visual_form(crystal_id: str) -> str:
    return CRYSTAL_VISUAL_FORM_MAP.get(str(crystal_id or "").strip().lower(), "tumbled")


def _visual_form_score(preferred_form: str, text: str) -> float:
    normalized = str(text or "").lower()
    keywords = VISUAL_FORM_KEYWORDS.get(preferred_form, ())
    if not keywords:
        return 0.0
    hits = sum(1 for token in keywords if token in normalized)
    return hits / len(keywords)


def _visual_alignment_score(preferred_form: str, *chunks: str) -> float:
    corpus = " ".join(str(chunk or "") for chunk in chunks)
    return _visual_form_score(preferred_form, corpus)


def _build_commons_query(crystal: dict[str, Any], preferred_form: str) -> str:
    crystal_name = str(crystal.get("name") or crystal.get("id") or "crystal").strip()
    if preferred_form == "gemstone":
        return f"{crystal_name} gemstone"
    if preferred_form == "raw":
        return f"{crystal_name} crystal specimen"
    if preferred_form == "blade":
        return f"{crystal_name} crystal blade"
    return f"{crystal_name} tumbled stone"


def _looks_like_wikipedia_image(url: str | None) -> bool:
    if not url:
        return False
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        if parsed.scheme not in {"https", "http"}:
            return False
        return any(host.endswith(allowed) for allowed in WIKIPEDIA_IMAGE_HOST_ALLOWLIST)
    except Exception:
        return False


def _extract_wikipedia_image(summary: dict[str, Any]) -> str | None:
    thumbnail = summary.get("thumbnail") or {}
    if isinstance(thumbnail, dict) and thumbnail.get("source"):
        return str(thumbnail.get("source"))

    original = summary.get("originalimage") or {}
    if isinstance(original, dict) and original.get("source"):
        return str(original.get("source"))
    return None


def _build_wikipedia_title_candidates(crystal: dict[str, Any]) -> list[str]:
    crystal_id = str(crystal.get("id") or "").strip().lower()
    crystal_name = str(crystal.get("name") or "").strip()
    mapped_title = CRYSTAL_WIKIPEDIA_TITLE_MAP.get(crystal_id)

    candidates: list[str] = []
    if mapped_title:
        candidates.append(mapped_title)
    if crystal_name:
        candidates.append(crystal_name)
    if crystal_id:
        candidates.append(crystal_id.replace("-", " "))

    de_duped: list[str] = []
    seen: set[str] = set()
    for candidate in candidates:
        normalized = candidate.lower().strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            de_duped.append(candidate)
    return de_duped


def _wikipedia_summary_text(summary: dict[str, Any]) -> str:
    return " ".join(
        [
            str(summary.get("description") or ""),
            str(summary.get("extract") or ""),
            str(summary.get("type") or ""),
        ]
    ).lower()


def _weighted_wikipedia_match_score(
    title_score: float,
    context_score: float,
    image_score: float,
    style_score: float,
    is_disambiguation: bool,
) -> float:
    weighted = (title_score * 0.45) + (context_score * 0.22) + (image_score * 0.15) + (style_score * 0.18)
    if is_disambiguation:
        weighted -= 0.35
    return max(0.0, min(1.0, weighted))


def _compute_wikipedia_match_score(
    crystal: dict[str, Any],
    summary: dict[str, Any],
    image_url: str | None,
    preferred_form: str,
) -> float:
    crystal_name = str(crystal.get("name") or "")
    crystal_id = str(crystal.get("id") or "").replace("-", " ")
    summary_title = str(summary.get("title") or "")
    summary_text = _wikipedia_summary_text(summary)

    title_score = max(
        _token_similarity(crystal_name, summary_title),
        _token_similarity(crystal_id, summary_title),
    )
    context_score = 1.0 if any(keyword in summary_text for keyword in CRYSTAL_IMAGE_KEYWORDS) else 0.0
    image_score = 1.0 if _looks_like_wikipedia_image(image_url) else 0.0
    style_score = _visual_alignment_score(preferred_form, summary_title, summary_text, image_url or "")
    is_disambiguation = str(summary.get("type") or "").lower() == "disambiguation"

    return _weighted_wikipedia_match_score(title_score, context_score, image_score, style_score, is_disambiguation)


async def _fetch_wikipedia_summary(title: str) -> dict[str, Any] | None:
    encoded_title = quote(title.replace(" ", "_"), safe="")
    headers = {
        "Accept": "application/json",
        "User-Agent": "ShamanicSoulTempleCrystalVerifier/1.0 (support@shamanic-elements.app)",
    }

    try:
        async with httpx.AsyncClient(timeout=WIKIPEDIA_CLIENT_TIMEOUT_SECONDS) as client:
            response = await client.get(WIKIPEDIA_SUMMARY_ENDPOINT.format(encoded_title), headers=headers)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            payload = response.json()
            if isinstance(payload, dict):
                return payload
            return None
    except Exception as exc:
        logger.warning("Wikipedia summary fetch failed for %s: %s", title, exc)
        return None


async def _fetch_wikipedia_page_images(title: str) -> list[str]:
    headers = {
        "Accept": "application/json",
        "User-Agent": "ShamanicSoulTempleCrystalVerifier/1.0 (support@shamanic-elements.app)",
    }
    params = {
        "action": "query",
        "format": "json",
        "prop": "images",
        "titles": title,
        "imlimit": 50,
    }

    try:
        async with httpx.AsyncClient(timeout=WIKIPEDIA_CLIENT_TIMEOUT_SECONDS) as client:
            response = await client.get(WIKIPEDIA_ACTION_API_ENDPOINT, params=params, headers=headers)
            response.raise_for_status()
            payload = response.json()
    except Exception as exc:
        logger.warning("Wikipedia page-images lookup failed for %s: %s", title, exc)
        return []

    return _extract_wikipedia_file_titles(payload)


def _extract_wikipedia_pages(payload: dict[str, Any] | None) -> dict[str, Any]:
    if not isinstance(payload, dict):
        return {}
    pages = ((payload.get("query") or {}).get("pages") or {})
    if isinstance(pages, dict):
        return pages
    return {}


def _extract_wikipedia_file_titles(payload: dict[str, Any] | None) -> list[str]:
    pages = _extract_wikipedia_pages(payload)
    if not pages:
        return []

    file_titles: list[str] = []
    for page in pages.values():
        if not isinstance(page, dict):
            continue
        images_value = page.get("images")
        if not isinstance(images_value, list):
            continue
        for image_entry in images_value:
            if not isinstance(image_entry, dict):
                continue
            title_value = str(image_entry.get("title") or "").strip()
            if title_value:
                file_titles.append(title_value)
    return file_titles


def _extract_wikipedia_file_url_from_payload(payload: dict[str, Any] | None) -> str | None:
    pages = _extract_wikipedia_pages(payload)
    if not pages:
        return None
    for page in pages.values():
        if not isinstance(page, dict):
            continue
        image_info = page.get("imageinfo")
        if not isinstance(image_info, list) or not image_info:
            continue
        first_info = image_info[0]
        if isinstance(first_info, dict) and first_info.get("url"):
            return str(first_info.get("url"))
    return None


async def _fetch_wikipedia_image_file_url(file_title: str) -> str | None:
    headers = {
        "Accept": "application/json",
        "User-Agent": "ShamanicSoulTempleCrystalVerifier/1.0 (support@shamanic-elements.app)",
    }
    params = {
        "action": "query",
        "format": "json",
        "prop": "imageinfo",
        "titles": file_title,
        "iiprop": "url",
    }

    try:
        async with httpx.AsyncClient(timeout=WIKIPEDIA_CLIENT_TIMEOUT_SECONDS) as client:
            response = await client.get(WIKIPEDIA_ACTION_API_ENDPOINT, params=params, headers=headers)
            response.raise_for_status()
            payload = response.json()
    except Exception as exc:
        logger.warning("Wikipedia file-url lookup failed for %s: %s", file_title, exc)
        return None

    return _extract_wikipedia_file_url_from_payload(payload)


def _should_skip_article_file_title(file_title: str) -> bool:
    lowered = file_title.lower()
    if any(token in lowered for token in COMMONS_SEARCH_EXCLUDE_TOKENS):
        return True
    return not lowered.endswith((".jpg", ".jpeg", ".webp", ".png"))


async def _score_article_file_candidate(
    file_title: str,
    article_title: str,
    preferred_form: str,
    crystal_name: str,
) -> dict[str, Any] | None:
    file_url = await _fetch_wikipedia_image_file_url(file_title)
    if not file_url:
        return None
    score = _score_commons_candidate(preferred_form, crystal_name, file_title, file_url)
    return {
        "title": file_title,
        "image_url": file_url,
        "page_url": f"https://en.wikipedia.org/wiki/{quote(article_title.replace(' ', '_'))}",
        "score": score,
    }


async def _search_wikipedia_article_image_for_crystal(
    crystal: dict[str, Any],
    article_title: str | None,
    preferred_form: str,
) -> dict[str, Any] | None:
    if not article_title:
        return None

    file_titles = await _fetch_wikipedia_page_images(article_title)
    if not file_titles:
        return None

    crystal_name = str(crystal.get("name") or crystal.get("id") or "")
    best_candidate = await _find_best_article_image_candidate(
        file_titles=file_titles,
        article_title=article_title,
        preferred_form=preferred_form,
        crystal_name=crystal_name,
    )
    return _get_article_image_candidate_if_passing(best_candidate, minimum_score=0.38)


async def _find_best_article_image_candidate(
    file_titles: list[str],
    article_title: str,
    preferred_form: str,
    crystal_name: str,
) -> dict[str, Any] | None:
    best_candidate: dict[str, Any] | None = None
    for file_title in file_titles:
        if _should_skip_article_file_title(file_title):
            continue

        candidate = await _score_article_file_candidate(
            file_title=file_title,
            article_title=article_title,
            preferred_form=preferred_form,
            crystal_name=crystal_name,
        )
        if not candidate:
            continue

        if _is_higher_score_candidate(best_candidate, candidate):
            best_candidate = candidate

    return best_candidate


def _is_higher_score_candidate(best_candidate: dict[str, Any] | None, candidate: dict[str, Any]) -> bool:
    if not best_candidate:
        return True
    return candidate["score"] > best_candidate["score"]


def _get_article_image_candidate_if_passing(candidate: dict[str, Any] | None, minimum_score: float) -> dict[str, Any] | None:
    if not candidate:
        return None
    if candidate["score"] < minimum_score:
        return None
    return candidate


def _score_commons_candidate(preferred_form: str, crystal_name: str, title: str, image_url: str) -> float:
    lowered_title = str(title or "").lower()
    lowered_url = str(image_url or "").lower()
    corpus = f"{lowered_title} {lowered_url}"

    if any(token in corpus for token in COMMONS_SEARCH_EXCLUDE_TOKENS):
        return 0.0

    name_score = _token_similarity(crystal_name, title)
    visual_score = _visual_alignment_score(preferred_form, title, image_url)
    host_score = 1.0 if _looks_like_wikipedia_image(image_url) else 0.0
    exact_name_bonus = 0.25 if str(crystal_name or "").lower() in lowered_title else 0.0
    return min(1.0, (name_score * 0.45) + (visual_score * 0.25) + (host_score * 0.20) + exact_name_bonus)


async def _search_commons_image_for_crystal(crystal: dict[str, Any], preferred_form: str) -> dict[str, Any] | None:
    query = _build_commons_query(crystal, preferred_form)
    headers = {
        "Accept": "application/json",
        "User-Agent": "ShamanicSoulTempleCrystalVerifier/1.0 (support@shamanic-elements.app)",
    }
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": 6,
        "gsrlimit": 8,
        "prop": "imageinfo|info",
        "inprop": "url",
        "iiprop": "url",
    }

    try:
        async with httpx.AsyncClient(timeout=WIKIPEDIA_CLIENT_TIMEOUT_SECONDS) as client:
            response = await client.get(COMMONS_API_ENDPOINT, params=params, headers=headers)
            response.raise_for_status()
            payload = response.json()
    except Exception as exc:
        logger.warning("Commons image lookup failed for %s: %s", crystal.get("id"), exc)
        return None

    pages = _extract_commons_pages(payload)
    if not pages:
        return None

    crystal_name = str(crystal.get("name") or crystal.get("id") or "")
    best_candidate, best_score = _select_best_commons_candidate(pages, crystal_name, preferred_form)

    if not best_candidate or best_score < 0.48:
        return None
    return best_candidate


def _extract_commons_pages(payload: dict[str, Any] | None) -> list[dict[str, Any]]:
    query_payload = payload.get("query") if isinstance(payload, dict) else None
    pages = query_payload.get("pages") if isinstance(query_payload, dict) else None
    if not isinstance(pages, dict):
        return []
    return [page for page in pages.values() if isinstance(page, dict)]


def _select_best_commons_candidate(
    pages: list[dict[str, Any]],
    crystal_name: str,
    preferred_form: str,
) -> tuple[dict[str, Any] | None, float]:
    best_candidate: dict[str, Any] | None = None
    best_score = 0.0

    for page in pages:
        title = str(page.get("title") or "")
        image_info_list = page.get("imageinfo") if isinstance(page.get("imageinfo"), list) else []
        if not image_info_list:
            continue
        image_url = image_info_list[0].get("url") if isinstance(image_info_list[0], dict) else None
        if not image_url:
            continue

        score = _score_commons_candidate(preferred_form, crystal_name, title, str(image_url))
        if score > best_score:
            best_score = score
            best_candidate = {
                "title": title,
                "image_url": str(image_url),
                "page_url": str(page.get("fullurl") or ""),
                "score": score,
            }

    return best_candidate, best_score


def _build_image_validation_payload(
    status: str,
    score: float,
    source_type: str,
    wikipedia_title: str | None = None,
    wikipedia_page_url: str | None = None,
) -> dict[str, Any]:
    return {
        "status": status,
        "score": round(score, 4),
        "source_type": source_type,
        "wikipedia_title": wikipedia_title,
        "wikipedia_page_url": wikipedia_page_url,
        "validated_at": datetime.now(timezone.utc).isoformat(),
    }


def _apply_image_resolution(
    crystal: dict[str, Any],
    resolved_image_url: str | None,
    source_type: str,
    validation: dict[str, Any],
) -> dict[str, Any]:
    enriched = dict(crystal)
    original_image_url = crystal.get("image_url")

    enriched["image_url_original"] = original_image_url
    enriched["image_url_resolved"] = resolved_image_url or original_image_url
    enriched["verified_image_url"] = resolved_image_url if source_type in {"wikipedia_verified", "commons_verified"} else None
    enriched["image_source"] = source_type
    enriched["image_validation"] = validation

    if resolved_image_url:
        enriched["image_url"] = resolved_image_url

    return enriched


def _normalize_cached_datetime(value: Any) -> datetime | None:
    if not isinstance(value, datetime):
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _is_valid_cache_entry(cached: dict[str, Any], now: datetime) -> bool:
    cached_at = _normalize_cached_datetime(cached.get("updated_at"))
    if not cached_at:
        return False

    age_hours = (now - cached_at).total_seconds() / 3600
    cached_validation = cached.get("validation") or {}
    cached_status = str(cached_validation.get("status") or "")
    cached_score = float(cached.get("score") or 0.0)
    cached_source = str(cached.get("source_type") or "")
    return (
        age_hours <= CRYSTAL_IMAGE_CACHE_TTL_HOURS
        and cached_score > 0.05
        and (cached_status == "verified" or cached_source in {"wikipedia_verified", "commons_verified"})
    )


def _build_cached_resolution(crystal: dict[str, Any], cached: dict[str, Any]) -> dict[str, Any]:
    validation = cached.get("validation") or _build_image_validation_payload(
        status="cached",
        score=float(cached.get("score") or 0.0),
        source_type=str(cached.get("source_type") or "catalog_original"),
        wikipedia_title=cached.get("wikipedia_title"),
        wikipedia_page_url=cached.get("wikipedia_page_url"),
    )
    return _apply_image_resolution(
        crystal,
        cached.get("resolved_image_url"),
        str(cached.get("source_type") or "catalog_original"),
        validation,
    )


async def _resolve_crystal_image_from_cache(
    crystal: dict[str, Any],
    crystal_id: str,
    cache_collection: Any,
    now: datetime,
) -> dict[str, Any] | None:
    if not crystal_id:
        return None
    cached = await cache_collection.find_one({"crystal_id": crystal_id}, {"_id": 0})
    if not cached or not _is_valid_cache_entry(cached, now):
        return None

    if crystal_id in CRYSTAL_STRICT_VISUAL_VALIDATION_IDS:
        cached_source = str(cached.get("source_type") or "")
        if cached_source == "wikipedia_verified":
            preferred_form = _get_crystal_visual_form(crystal_id)
            if not _is_resolution_visual_match(
                preferred_form,
                str(cached.get("wikipedia_title") or ""),
                str(cached.get("resolved_image_url") or ""),
            ):
                return None

    return _build_cached_resolution(crystal, cached)


async def _find_best_wikipedia_match(crystal: dict[str, Any], crystal_id: str) -> tuple[dict[str, Any] | None, float, str]:
    candidates = _build_wikipedia_title_candidates(crystal)
    mapped_title = CRYSTAL_WIKIPEDIA_TITLE_MAP.get(crystal_id)
    preferred_form = _get_crystal_visual_form(crystal_id)
    best_match: dict[str, Any] | None = None
    best_score = 0.0
    best_has_image = False

    for candidate_title in candidates:
        summary = await _fetch_wikipedia_summary(candidate_title)
        if not summary:
            continue

        image_url = _extract_wikipedia_image(summary)
        score = _compute_wikipedia_match_score(crystal, summary, image_url, preferred_form)
        if mapped_title and candidate_title.strip().lower() == mapped_title.strip().lower() and image_url:
            score = max(score, 0.66)

        candidate_has_image = bool(image_url)
        if score > best_score or (candidate_has_image and not best_has_image and score >= (best_score - 0.12)):
            best_score = score
            best_has_image = candidate_has_image
            best_match = {
                "summary": summary,
                "image_url": image_url,
            }

    return best_match, best_score, preferred_form


def _derive_image_resolution_state(
    crystal: dict[str, Any],
    best_match: dict[str, Any] | None,
    best_score: float,
) -> "CrystalImageResolutionState":
    source_type = "catalog_original"
    resolved_image_url = crystal.get("image_url")
    wikipedia_title: str | None = None
    wikipedia_page_url: str | None = None
    status = "review"

    if best_match and best_match.get("image_url") and best_score >= 0.58:
        summary = best_match["summary"]
        source_type = "wikipedia_verified"
        resolved_image_url = best_match.get("image_url")
        wikipedia_title = summary.get("title")
        content_urls = summary.get("content_urls")
        desktop_urls = content_urls.get("desktop", {}) if isinstance(content_urls, dict) else {}
        wikipedia_page_url = desktop_urls.get("page") if isinstance(desktop_urls, dict) else None
        status = "verified"
    elif not resolved_image_url:
        source_type = "missing"
        status = "missing"

    return CrystalImageResolutionState(
        source_type=source_type,
        resolved_image_url=resolved_image_url,
        wikipedia_title=wikipedia_title,
        wikipedia_page_url=wikipedia_page_url,
        best_score=best_score,
        status=status,
    )


def _is_resolution_visual_match(preferred_form: str, title: str | None, image_url: str | None) -> bool:
    if not image_url:
        return False
    score = _visual_alignment_score(preferred_form, title or "", image_url or "")
    return score >= 0.08


@dataclass
class CrystalImageResolutionState:
    source_type: str
    resolved_image_url: str | None
    wikipedia_title: str | None
    wikipedia_page_url: str | None
    best_score: float
    status: str


async def _apply_commons_visual_fallback_if_needed(
    crystal: dict[str, Any],
    preferred_form: str,
    article_title: str | None,
    state: CrystalImageResolutionState,
) -> CrystalImageResolutionState:
    needs_fallback = (
        state.source_type != "wikipedia_verified"
        or not _is_resolution_visual_match(preferred_form, state.wikipedia_title, state.resolved_image_url)
    )
    if not needs_fallback:
        return state

    wiki_article_image = await _search_wikipedia_article_image_for_crystal(
        crystal,
        article_title or state.wikipedia_title,
        preferred_form,
    )
    if wiki_article_image:
        return CrystalImageResolutionState(
            source_type="wikipedia_verified",
            resolved_image_url=wiki_article_image.get("image_url"),
            wikipedia_title=wiki_article_image.get("title"),
            wikipedia_page_url=wiki_article_image.get("page_url"),
            best_score=max(state.best_score, float(wiki_article_image.get("score") or 0.0)),
            status="verified",
        )

    commons_match = await _search_commons_image_for_crystal(crystal, preferred_form)
    if not commons_match:
        return state

    return CrystalImageResolutionState(
        source_type="commons_verified",
        resolved_image_url=commons_match.get("image_url"),
        wikipedia_title=commons_match.get("title"),
        wikipedia_page_url=commons_match.get("page_url"),
        best_score=max(state.best_score, float(commons_match.get("score") or 0.0)),
        status="verified",
    )


async def _persist_crystal_image_validation(
    cache_collection: Any,
    crystal_id: str,
    resolution_state: CrystalImageResolutionState,
    validation: dict[str, Any],
    now: datetime,
) -> None:
    if not crystal_id:
        return

    await cache_collection.update_one(
        {"crystal_id": crystal_id},
        {
            "$set": {
                "crystal_id": crystal_id,
                "source_type": resolution_state.source_type,
                "resolved_image_url": resolution_state.resolved_image_url,
                "wikipedia_title": resolution_state.wikipedia_title,
                "wikipedia_page_url": resolution_state.wikipedia_page_url,
                "score": round(resolution_state.best_score, 4),
                "validation": validation,
                "updated_at": now,
            }
        },
        upsert=True,
    )


async def _resolve_crystal_image(crystal: dict[str, Any], db) -> dict[str, Any]:
    crystal_id = str(crystal.get("id") or "").strip().lower()
    now = datetime.now(timezone.utc)
    cache_collection = db[CRYSTAL_IMAGE_VALIDATION_COLLECTION]
    cached_resolution = await _resolve_crystal_image_from_cache(crystal, crystal_id, cache_collection, now)
    if cached_resolution:
        return cached_resolution

    best_match, best_score, preferred_form = await _find_best_wikipedia_match(crystal, crystal_id)
    resolution_state = _derive_image_resolution_state(
        crystal,
        best_match,
        best_score,
    )
    source_article_title = None
    if best_match and isinstance(best_match.get("summary"), dict):
        source_article_title = best_match["summary"].get("title")

    resolution_state = await _apply_commons_visual_fallback_if_needed(
        crystal,
        preferred_form,
        source_article_title,
        resolution_state,
    )

    validation = _build_image_validation_payload(
        status=resolution_state.status,
        score=resolution_state.best_score,
        source_type=resolution_state.source_type,
        wikipedia_title=resolution_state.wikipedia_title,
        wikipedia_page_url=resolution_state.wikipedia_page_url,
    )

    await _persist_crystal_image_validation(
        cache_collection,
        crystal_id,
        resolution_state,
        validation,
        now,
    )

    return _apply_image_resolution(crystal, resolution_state.resolved_image_url, resolution_state.source_type, validation)


async def _enrich_crystals_with_verified_images(crystals: list[dict[str, Any]], db) -> list[dict[str, Any]]:
    semaphore = asyncio.Semaphore(6)

    async def _enrich_single(crystal: dict[str, Any]) -> dict[str, Any]:
        async with semaphore:
            try:
                return await _resolve_crystal_image(crystal, db)
            except Exception as exc:
                logger.warning("Crystal image enrichment failed for %s: %s", crystal.get("id"), exc)
                fallback_validation = _build_image_validation_payload(
                    status="fallback",
                    score=0.0,
                    source_type="catalog_original",
                )
                return _apply_image_resolution(crystal, crystal.get("image_url"), "catalog_original", fallback_validation)

    return await asyncio.gather(*[_enrich_single(crystal) for crystal in crystals])

@router.get("/crystals")
async def get_crystals(element: Optional[str] = None, chakra: Optional[str] = None) -> list[dict[str, Any]]:
    """Get crystals from database, optionally filtered by element or chakra."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    if chakra:
        query["chakras"] = {"$regex": chakra, "$options": "i"}
    
    crystals = await db.crystals.find(query, {"_id": 0}).to_list(length=100)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(crystal, "hybrid-curated"), "elemental-practices") for crystal in crystals]
    return _apply_free_paid_tiering(enriched, "crystals")


@router.get("/crystals/deep")
async def get_deep_crystals() -> list[dict[str, Any]]:
    """Get deep crystal healing data with rituals, meditations, and comprehensive guidance."""
    db = get_db()
    crystals = await db.crystals_deep.find({}, {"_id": 0}).to_list(length=100)
    if not crystals:
        from data.crystals_deep import CRYSTALS_DEEP
        crystals = CRYSTALS_DEEP
    enriched = await _enrich_crystals_with_verified_images(crystals, db)
    devotional = [_enrich_devotional_language(_enrich_content_integrity(item, "hybrid-curated"), "elemental-practices") for item in enriched]
    return _apply_free_paid_tiering(devotional, "crystals")


@router.get("/crystals/deep/{crystal_id}")
async def get_deep_crystal(crystal_id: str) -> dict[str, Any]:
    """Get a specific deep crystal by ID."""
    db = get_db()
    crystal = await db.crystals_deep.find_one({"id": crystal_id}, {"_id": 0})
    if not crystal:
        from data.crystals_deep import CRYSTALS_DEEP
        for c in CRYSTALS_DEEP:
            if c["id"] == crystal_id:
                return await _resolve_crystal_image(c, db)
        raise HTTPException(status_code=404, detail="Crystal not found")
    return await _resolve_crystal_image(crystal, db)


@router.get("/crystals/{crystal_id}")
async def get_crystal(crystal_id: str) -> dict[str, Any]:
    """Get a specific crystal from database."""
    db = get_db()
    crystal = await db.crystals.find_one({"id": crystal_id}, {"_id": 0})
    if not crystal:
        raise HTTPException(status_code=404, detail="Crystal not found")
    return crystal


# ============ MANTRAS ROUTES ============

@router.get("/mantras")
async def get_mantras(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get mantras from database, optionally filtered by element."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    mantras = await db.mantras.find(query, {"_id": 0}).to_list(length=50)
    mantras = _append_mantra_supplements(mantras, element)
    enriched = [_enrich_content_integrity(mantra, "hybrid-curated") for mantra in mantras]
    enriched = [_enrich_mantra_entry(mantra) for mantra in enriched]
    return _apply_free_paid_tiering(enriched, "premium_mantras")


# ============ MUDRAS ROUTES ============

@router.get("/mudras")
async def get_mudras(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get mudras from database, optionally filtered by element."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    mudras = await db.mudras.find(query, {"_id": 0}).to_list(length=100)

    # Remove duplicated mudra records by normalized mudra name to avoid repeated images/content.
    unique_by_name: dict[str, dict[str, Any]] = {}
    for mudra in mudras:
        key = _mudra_key(mudra.get("name", ""))
        if not key:
            key = str(mudra.get("id") or "").strip().lower()
        if key in unique_by_name:
            continue
        unique_by_name[key] = mudra

    enriched_mudras = [_enrich_content_integrity(mudra, "hybrid-curated") for mudra in unique_by_name.values()]
    return [_enrich_mudra_entry(mudra) for mudra in enriched_mudras]


# ============ MINDFULNESS PRACTICES ============

@router.get("/mindfulness")
async def get_mindfulness_practices(category: Optional[str] = None, element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get mindfulness practices from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    practices = await db.mindfulness_practices.find(query, {"_id": 0}).to_list(length=50)
    practices = _append_mindfulness_supplements(practices, category, element)
    enriched = [
        _enrich_devotional_language(
            _apply_subject_image_alignment(_enrich_practice_links(practice, "mindfulness"), "hybrid-curated"),
            "mindfulness",
        )
        for practice in practices
    ]
    return _apply_free_paid_tiering(enriched, "mindfulness_practices")


@router.get("/mindfulness-practices")
async def get_mindfulness_practices_alias(category: Optional[str] = None, element: Optional[str] = None) -> list[dict[str, Any]]:
    """Alias endpoint for clients expecting /mindfulness-practices."""
    return await get_mindfulness_practices(category=category, element=element)


# ============ GUIDED MEDITATIONS ============

@router.get("/meditations")
async def get_meditations(category: Optional[str] = None, element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get guided meditations from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    meditations = await db.meditations.find(query, {"_id": 0}).to_list(length=50)
    meditations = _append_meditation_supplements(meditations, category)
    enriched = [_enrich_meditation_entry(meditation) for meditation in meditations]
    return _apply_free_paid_tiering(enriched, "meditations")


@router.get("/meditations/{meditation_id}")
async def get_meditation(meditation_id: str) -> dict[str, Any]:
    """Get a specific meditation from database."""
    db = get_db()
    meditation = await db.meditations.find_one({"id": meditation_id}, {"_id": 0})
    if not meditation:
        raise HTTPException(status_code=404, detail="Meditation not found")
    return _enrich_meditation_entry(meditation)


# ============ SOMATIC PRACTICES ============

@router.get("/somatic")
async def get_somatic_practices(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get somatic practices from database."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    practices = await db.somatic_practices.find(query, {"_id": 0}).to_list(length=100)
    enriched_practices = [_enrich_devotional_language(_enrich_somatic_practice(practice), "somatic") for practice in practices]
    sorted_practices = sorted(
        enriched_practices,
        key=lambda practice: (
            practice.get("movement_track_order", 99),
            str(practice.get("name", "")).lower(),
        ),
    )
    return _apply_free_paid_tiering(sorted_practices, "somatic_practices")


# ============ GROUNDING EXERCISES ============

@router.get("/grounding")
async def get_grounding_exercises(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get grounding exercises from database."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    exercises = await db.grounding_exercises.find(query, {"_id": 0}).to_list(length=50)
    enriched = [
        _enrich_devotional_language(_enrich_content_integrity(_apply_subject_image_alignment(exercise, "hybrid-curated"), "hybrid-curated"), "grounding-practices")
        for exercise in exercises
    ]
    return _apply_free_paid_tiering(enriched, "grounding_practices")


# ============ PRESET RITUALS (Public) ============

@router.get("/preset-rituals")
async def get_preset_rituals(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get preset ritual templates."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    rituals = await db.preset_rituals.find(query, {"_id": 0}).to_list(length=50)
    return rituals


@router.get("/preset-rituals/{ritual_id}")
async def get_preset_ritual(ritual_id: str) -> dict[str, Any]:
    """Get a specific preset ritual."""
    db = get_db()
    ritual = await db.preset_rituals.find_one({"id": ritual_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Preset ritual not found")
    return ritual


# ============ HEART PRACTICES ============

@router.get("/heart-practices")
async def get_heart_practices(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get heart practices from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    practices = await db.heart_practices.find(query, {"_id": 0}).to_list(length=50)
    practices = _append_heart_supplements(practices, category)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "heart-practices") for practice in practices]
    return _apply_free_paid_tiering(enriched, "heart_practices")


@router.get("/heart-practices/{practice_id}")
async def get_heart_practice(practice_id: str) -> dict[str, Any]:
    """Get a specific heart practice."""
    db = get_db()
    practice = await db.heart_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Heart practice not found")
    return _enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "heart-practices")


# ============ SHAMANIC PRACTICES ============

@router.get("/shamanic-practices")
async def get_shamanic_practices(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get shamanic practices from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    practices = await db.shamanic_practices.find(query, {"_id": 0}).to_list(length=80)
    practices = _append_shamanic_supplements(practices, category)
    enriched = [
        _enrich_devotional_language(
            _enrich_content_integrity(_enrich_practice_links(practice, "shamanic-practices"), "hybrid-curated"),
            "shamanic-practices",
        )
        for practice in practices
    ]
    return _apply_free_paid_tiering(enriched, "shamanic_practices")


@router.get("/shamanic-practices/{practice_id}")
async def get_shamanic_practice(practice_id: str) -> dict[str, Any]:
    """Get a specific shamanic practice."""
    db = get_db()
    practice = await db.shamanic_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Shamanic practice not found")
    return _enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "shamanic-practices")


# ============ ELEMENTAL PRACTICES ============

@router.get("/elemental-practices")
async def get_elemental_practices(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get elemental practices from database."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    practices = await db.elemental_practices.find(query, {"_id": 0}).to_list(length=50)
    enriched = [
        _enrich_devotional_language(
            _enrich_content_integrity(_enrich_practice_links(practice, "elemental-practices"), "hybrid-curated"),
            "elemental-practices",
        )
        for practice in practices
    ]
    return _apply_free_paid_tiering(enriched, "elemental_practices")


@router.get("/elemental-practices/{practice_id}")
async def get_elemental_practice(practice_id: str) -> dict[str, Any]:
    """Get a specific elemental practice."""
    db = get_db()
    practice = await db.elemental_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Elemental practice not found")
    return _enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "elemental-practices")


# ============ CREATIVE PROCESSES ============

@router.get("/creative-processes")
async def get_creative_processes(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get creative processes from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    processes = await db.creative_processes.find(query, {"_id": 0}).to_list(length=50)
    processes = _append_earth_crafting_supplements(processes, category)
    enriched = [
        _enrich_devotional_language(
            _enrich_sacred_tool_birthing_entry(_enrich_content_integrity(process, "hybrid-curated")),
            "courses",
        )
        for process in processes
    ]
    return _apply_free_paid_tiering(enriched, "sacred_art_therapy")


@router.get("/creative-processes/{process_id}")
async def get_creative_process(process_id: str) -> dict[str, Any]:
    """Get a specific creative process."""
    db = get_db()
    process = await db.creative_processes.find_one({"id": process_id}, {"_id": 0})
    if not process:
        raise HTTPException(status_code=404, detail="Creative process not found")
    return _enrich_devotional_language(_enrich_sacred_tool_birthing_entry(_enrich_content_integrity(process, "hybrid-curated")), "courses")


# ============ EARTH ALTARS ============

@router.get("/earth-altars")
async def get_earth_altars() -> list[dict[str, Any]]:
    """Get earth altars from database."""
    db = get_db()
    altars = await db.earth_altars.find({}, {"_id": 0}).to_list(length=50)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(altar, "hybrid-curated"), "elemental-practices") for altar in altars]
    return _apply_free_paid_tiering(enriched, "sacred_art_therapy")


@router.get("/earth-altars/{altar_id}")
async def get_earth_altar(altar_id: str) -> dict[str, Any]:
    """Get a specific earth altar."""
    db = get_db()
    altar = await db.earth_altars.find_one({"id": altar_id}, {"_id": 0})
    if not altar:
        raise HTTPException(status_code=404, detail="Earth altar not found")
    return _enrich_devotional_language(_enrich_content_integrity(altar, "hybrid-curated"), "elemental-practices")



# ============ RUNES ROUTES ============

@router.get("/runes")
async def get_runes() -> list[dict[str, Any]]:
    """Get all Elder Futhark runes."""
    db = get_db()
    runes = await db.runes.find({}, {"_id": 0}).to_list(length=30)
    enriched = [
        _normalize_divination_image(
            _enrich_devotional_language(_enrich_content_integrity(rune, "hybrid-curated"), "runes"),
            "runes",
        )
        for rune in runes
    ]
    return _apply_free_paid_tiering(enriched, "runes")


@router.get("/runes/{rune_id}")
async def get_rune(rune_id: str) -> dict[str, Any]:
    """Get a specific rune."""
    db = get_db()
    rune = await db.runes.find_one({"id": rune_id}, {"_id": 0})
    if not rune:
        raise HTTPException(status_code=404, detail="Rune not found")
    return _normalize_divination_image(
        _enrich_devotional_language(_enrich_content_integrity(rune, "hybrid-curated"), "runes"),
        "runes",
    )


@router.get("/runes/draw/single")
async def draw_single_rune() -> dict[str, Any]:
    """Draw a single rune for daily guidance."""
    db = get_db()
    runes = await db.runes.find({}, {"_id": 0}).to_list(length=30)
    if not runes:
        raise HTTPException(status_code=404, detail="No runes found")
    rune = _secure_choice(runes)
    rune["is_reversed"] = _secure_bool(0.3)  # 30% chance reversed
    return _normalize_divination_image(
        _enrich_devotional_language(_enrich_content_integrity(rune, "hybrid-curated"), "runes"),
        "runes",
    )


@router.get("/runes/draw/three")
async def draw_three_runes() -> list[dict[str, Any]]:
    """Draw three runes for past/present/future spread."""
    db = get_db()
    runes = await db.runes.find({}, {"_id": 0}).to_list(length=30)
    if not runes or len(runes) < 3:
        raise HTTPException(status_code=404, detail="Not enough runes found")
    selected = _secure_sample(runes, 3)
    positions = ["past", "present", "future"]
    result = []
    for i, rune in enumerate(selected):
        rune["position"] = positions[i]
        rune["is_reversed"] = _secure_bool(0.3)
        result.append(rune)
    return [
        _normalize_divination_image(
            _enrich_devotional_language(_enrich_content_integrity(rune, "hybrid-curated"), "runes"),
            "runes",
        )
        for rune in result
    ]


@router.get("/runes/draw/celtic-cross")
async def draw_celtic_cross() -> list[dict[str, Any]]:
    """Draw 10 runes for a full Celtic Cross spread."""
    db = get_db()
    runes = await db.runes.find({}, {"_id": 0}).to_list(length=30)
    if not runes or len(runes) < 10:
        raise HTTPException(status_code=404, detail="Not enough runes found")
    selected = _secure_sample(runes, 10)
    positions = [
        "present", "challenge", "past", "future", 
        "above", "below", "advice", "external",
        "hopes_fears", "outcome"
    ]
    position_meanings = [
        "Your current situation",
        "The challenge or obstacle",
        "The foundation/past influence",
        "The near future",
        "Your conscious goal",
        "Your subconscious influence",
        "Advice from the runes",
        "External influences",
        "Your hopes and fears",
        "The final outcome"
    ]
    result = []
    for i, rune in enumerate(selected):
        rune["position"] = positions[i]
        rune["position_meaning"] = position_meanings[i]
        rune["is_reversed"] = _secure_bool(0.3)
        result.append(rune)
    return [
        _normalize_divination_image(
            _enrich_devotional_language(_enrich_content_integrity(rune, "hybrid-curated"), "runes"),
            "runes",
        )
        for rune in result
    ]


# ============ I CHING ROUTES ============

@router.get("/i-ching")
async def get_hexagrams() -> list[dict[str, Any]]:
    """Get all I Ching hexagrams."""
    db = get_db()
    hexagrams = await db.i_ching.find({}, {"_id": 0}).to_list(length=70)
    enriched = [
        _normalize_divination_image(
            _enrich_devotional_language(_enrich_content_integrity(hexagram, "hybrid-curated"), "i-ching"),
            "i-ching",
        )
        for hexagram in hexagrams
    ]
    return _apply_free_paid_tiering(enriched, "i_ching")


@router.get("/i-ching/{hexagram_number}")
async def get_hexagram(hexagram_number: int) -> dict[str, Any]:
    """Get a specific hexagram by number."""
    db = get_db()
    hexagram = await db.i_ching.find_one({"number": hexagram_number}, {"_id": 0})
    if not hexagram:
        raise HTTPException(status_code=404, detail="Hexagram not found")
    return _normalize_divination_image(
        _enrich_devotional_language(_enrich_content_integrity(hexagram, "hybrid-curated"), "i-ching"),
        "i-ching",
    )


def _cast_coin_lines() -> tuple[list[int], list[int]]:
    lines: list[int] = []
    changing_lines: list[int] = []
    for i in range(6):
        toss = sum(2 + secrets.randbelow(2) for _ in range(3))
        lines.append(toss)
        if toss in (6, 9):
            changing_lines.append(i + 1)
    return lines, changing_lines


def _resolve_hexagram_number(lines: list[int]) -> int:
    binary_lines = [1 if line in [7, 9] else 0 for line in lines]
    hexagram_number = int("".join(str(bit) for bit in reversed(binary_lines)), 2) + 1
    return min(hexagram_number, 8)


async def _fetch_hexagram_or_fallback(db, hexagram_number: int) -> dict:
    hexagram = await db.i_ching.find_one({"number": hexagram_number}, {"_id": 0})
    if hexagram:
        return hexagram
    return await db.i_ching.find_one({"number": 1}, {"_id": 0})


def _append_changing_line_meanings(hexagram: dict, changing_lines: list[int]) -> dict:
    result = dict(hexagram or {})
    changing_lines_text = result.get("changing_lines_text", {})
    result["changing_lines"] = changing_lines
    result["line_meanings"] = []

    for line_num in changing_lines:
        line_key = str(line_num)
        if line_key in changing_lines_text:
            result["line_meanings"].append({"line": line_num, "meaning": changing_lines_text[line_key]})
    return result


@router.get("/i-ching/cast/coins")
async def cast_i_ching() -> dict[str, Any]:
    """Cast I Ching using the three coin method."""
    db = get_db()
    lines, changing_lines = _cast_coin_lines()
    hexagram_number = _resolve_hexagram_number(lines)
    hexagram = await _fetch_hexagram_or_fallback(db, hexagram_number)

    hexagram["lines_cast"] = lines
    return _normalize_divination_image(
        _enrich_devotional_language(
            _enrich_content_integrity(_append_changing_line_meanings(hexagram, changing_lines), "hybrid-curated"),
            "i-ching",
        ),
        "i-ching",
    )


# ============ LIGHT CODES ROUTES ============

@router.get("/light-codes")
async def get_all_light_codes() -> dict[str, Any]:
    """Get all light codes (sacred geometry, alphabets, light language)."""
    db = get_db()
    light_codes = await db.light_codes.find_one({}, {"_id": 0})
    return _enrich_light_code_payload(light_codes or {})


@router.get("/light-codes/sacred-geometry")
async def get_sacred_geometry() -> list[dict[str, Any]]:
    """Get sacred geometry symbols."""
    db = get_db()
    data = await db.light_codes.find_one({}, {"_id": 0})
    payload = _enrich_light_code_payload(data or {})
    return payload.get("sacred_geometry", [])


@router.get("/light-codes/ancient-alphabets")
async def get_ancient_alphabets() -> list[dict[str, Any]]:
    """Get ancient alphabet symbols."""
    db = get_db()
    data = await db.light_codes.find_one({}, {"_id": 0})
    payload = _enrich_light_code_payload(data or {})
    return payload.get("ancient_alphabets", [])


@router.get("/light-codes/light-language")
async def get_light_language() -> list[dict[str, Any]]:
    """Get light language symbols."""
    db = get_db()
    data = await db.light_codes.find_one({}, {"_id": 0})
    payload = _enrich_light_code_payload(data or {})
    return payload.get("light_language_symbols", [])


# ============ LIVE SESSIONS ROUTES ============

@router.get("/live-sessions")
async def get_live_sessions(status: Optional[str] = None, session_type: Optional[str] = None) -> list[dict[str, Any]]:
    db = get_db()
    query = {}
    if status:
        query["status"] = {"$regex": f"^{status}$", "$options": "i"}
    if session_type:
        query["session_type"] = {"$regex": f"^{session_type}$", "$options": "i"}

    sessions = await db.live_sessions.find(query, {"_id": 0}).sort("scheduled_at", 1).to_list(length=100)
    return [await _build_live_session(session, db) for session in sessions]


@router.get("/live-sessions/{session_id}")
async def get_live_session(session_id: str) -> dict[str, Any]:
    db = get_db()
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")
    return await _build_live_session(session, db)


@router.post("/live-sessions/{session_id}/rsvp")
async def rsvp_live_session(session_id: str, payload: LiveSessionRsvpRequest) -> dict[str, Any]:
    db = get_db()
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")

    now = datetime.now(timezone.utc).isoformat()
    email = payload.email.lower()
    record = {
        "session_id": session_id,
        "display_name": payload.display_name.strip(),
        "email": email,
        "updated_at": now,
    }

    existing = await db.live_session_rsvps.find_one({"session_id": session_id, "email": email}, {"_id": 0})
    if existing:
        await db.live_session_rsvps.update_one({"session_id": session_id, "email": email}, {"$set": record})
    else:
        await db.live_session_rsvps.insert_one({**record, "created_at": now})

    attendee_count = await db.live_session_rsvps.count_documents({"session_id": session_id})
    return {
        "success": True,
        "session_id": session_id,
        "display_name": payload.display_name.strip(),
        "attendee_count": attendee_count,
    }


@router.get("/live-sessions/{session_id}/messages")
async def get_live_session_messages(session_id: str, kind: Optional[str] = None) -> list[dict[str, Any]]:
    db = get_db()
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")

    query = {"session_id": session_id}
    if kind:
        query["kind"] = kind

    return await db.live_session_messages.find(query, {"_id": 0}).sort("created_at", 1).to_list(length=500)


@router.post("/live-sessions/{session_id}/messages")
async def post_live_session_message(session_id: str, payload: LiveSessionMessageRequest) -> dict[str, Any]:
    db = get_db()
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")

    message = payload.message.strip()
    if len(message) < 2:
        raise HTTPException(status_code=400, detail="Message is too short")

    record = {
        "id": f"msg_{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        "session_id": session_id,
        "display_name": payload.display_name.strip(),
        "email": payload.email.lower() if payload.email else None,
        "message": message,
        "kind": payload.kind,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.live_session_messages.insert_one(record.copy())
    return record


# ============ SACRED GUARDIANS & ALLIES ============

@router.get("/sacred-guardians")
async def get_sacred_guardians(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get sacred guardians and allies, optionally filtered by category."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    guardians = await db.sacred_guardians.find(query, {"_id": 0}).to_list(length=100)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(guardian, "hybrid-curated"), "sacred-guardians") for guardian in guardians]
    return _apply_free_paid_tiering(enriched, "sacred_guardians")


@router.get("/sacred-guardians/{guardian_id}")
async def get_sacred_guardian(guardian_id: str) -> dict[str, Any]:
    """Get a specific sacred guardian."""
    db = get_db()
    guardian = await db.sacred_guardians.find_one({"id": guardian_id}, {"_id": 0})
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    return _enrich_devotional_language(_enrich_content_integrity(guardian, "hybrid-curated"), "sacred-guardians")


# ============ SACRED ALLY ALCHEMY ==========

@router.get("/sacred-ally-alchemy")
async def get_sacred_ally_alchemy(category: Optional[str] = None, ally_type: Optional[str] = None) -> list[dict[str, Any]]:
    """Get Sacred Ally Alchemy entries with optional category/type filters."""
    db = get_db()
    query: dict[str, Any] = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if ally_type:
        normalized_ally_type = str(ally_type or "").strip().lower()
        if normalized_ally_type in {"kundalini", "kundulini", "serpent-kundalini", "kundalini-consciousness"}:
            query["ally_type"] = {"$regex": "^serpent$", "$options": "i"}
        else:
            query["ally_type"] = {"$regex": f"^{ally_type}$", "$options": "i"}

    items = await db.sacred_ally_alchemy.find(query, {"_id": 0}).to_list(length=300)
    enriched = [
        _enrich_devotional_language(_enrich_content_integrity(item, "hybrid-curated"), "sacred-allies")
        for item in items
    ]
    return _apply_free_paid_tiering(enriched, "sacred_allies")


@router.get("/sacred-ally-alchemy/{item_id}")
async def get_sacred_ally_alchemy_item(item_id: str) -> dict[str, Any]:
    """Get one Sacred Ally Alchemy entry by id."""
    db = get_db()
    item = await db.sacred_ally_alchemy.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Sacred ally alchemy entry not found")
    return _enrich_devotional_language(_enrich_content_integrity(item, "hybrid-curated"), "sacred-allies")


# ============ ANGELIC ALCHEMY ==========

@router.get("/angelic-alchemy")
async def get_angelic_alchemy(sacred_geometry: Optional[str] = None) -> list[dict[str, Any]]:
    """Get Angelic Alchemy entries, optionally filtered by sacred geometry."""
    db = get_db()
    query: dict[str, Any] = {}
    if sacred_geometry:
        query["sacred_geometry"] = {"$regex": sacred_geometry, "$options": "i"}

    items = await db.angelic_alchemy.find(query, {"_id": 0}).to_list(length=200)
    enriched = [
        _enrich_devotional_language(_enrich_content_integrity(item, "hybrid-curated"), "angelic-alchemy")
        for item in items
    ]
    return _apply_free_paid_tiering(enriched, "angelic_alchemy")


@router.get("/angelic-alchemy/{item_id}")
async def get_angelic_alchemy_item(item_id: str) -> dict[str, Any]:
    """Get one Angelic Alchemy entry by id."""
    db = get_db()
    item = await db.angelic_alchemy.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Angelic alchemy entry not found")
    return _enrich_devotional_language(_enrich_content_integrity(item, "hybrid-curated"), "angelic-alchemy")


# ============ HEALING PORTALS ==========

@router.get("/healing-portals")
async def get_healing_portals(portal_type: Optional[str] = None) -> list[dict[str, Any]]:
    """Get healing portals, optionally filtered by portal type."""
    db = get_db()
    query: dict[str, Any] = {}
    if portal_type:
        query["portal_type"] = {"$regex": f"^{portal_type}$", "$options": "i"}

    items = await db.healing_portals.find(query, {"_id": 0}).to_list(length=300)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(item, "hybrid-curated"), "healing-portals") for item in items]
    return _apply_free_paid_tiering(enriched, "healing_portals")


@router.get("/healing-portals/{portal_id}")
async def get_healing_portal(portal_id: str) -> dict[str, Any]:
    """Get one healing portal by id."""
    db = get_db()
    item = await db.healing_portals.find_one({"id": portal_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Healing portal not found")
    return _enrich_devotional_language(_enrich_content_integrity(item, "hybrid-curated"), "healing-portals")


# ============ SACRED ALLY AUDIO JOURNEYS & PATHWAYS ==========

@router.get("/sacred-ally-audio-journeys")
async def get_sacred_ally_audio_journeys(
    ally_id: Optional[str] = None,
    category: Optional[str] = None,
    focus_tag: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Get guided ally/angelic audio journey templates."""
    db = get_db()
    query: dict[str, Any] = {}
    if ally_id:
        query["ally_id"] = ally_id
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if focus_tag:
        query["focus_tags"] = {"$in": [focus_tag]}

    items = await db.sacred_ally_audio_journeys.find(query, {"_id": 0}).to_list(length=200)
    return [_enrich_content_integrity(item, "hybrid-curated") for item in items]


@router.get("/sacred-ally-pathways")
async def get_sacred_ally_pathways(ally_id: Optional[str] = None) -> list[dict[str, Any]]:
    """Get Sacred Ally progression pathways (7/14/21 day style)."""
    db = get_db()
    query: dict[str, Any] = {}
    if ally_id:
        query["ally_id"] = ally_id

    items = await db.sacred_ally_pathways.find(query, {"_id": 0}).to_list(length=200)
    return [_enrich_content_integrity(item, "hybrid-curated") for item in items]


@router.post("/sacred-ally/daily-recommendation")
async def get_sacred_ally_daily_recommendation(payload: dict[str, Any]) -> dict[str, Any]:
    """Return personalized ally recommendation by mood + moon + intention with deterministic variety."""
    db = get_db()
    mood = str(payload.get("mood") or "balanced").strip().lower()
    moon_phase = str(payload.get("moon_phase") or "").strip().lower()
    intention = str(payload.get("intention") or "clarity").strip().lower()
    recent_ids = [str(x).strip() for x in (payload.get("recent_ids") or []) if str(x).strip()]

    allies = await db.sacred_ally_alchemy.find({}, {"_id": 0}).to_list(length=200)
    angelic = await db.angelic_alchemy.find({}, {"_id": 0}).to_list(length=100)
    combined = allies + angelic
    if not combined:
        raise HTTPException(status_code=404, detail="No Sacred Ally content available")

    mood_weights = {
        "anxious": {"whale": 4, "dolphin": 3, "raphael": 3, "gabriel": 2},
        "tired": {"dragon": 3, "michael": 3, "wolf": 2, "jaguar": 2, "sophia": 2},
        "sad": {"whale": 4, "raphael": 3, "fairy": 2, "gabriel": 2},
        "overwhelmed": {"metatron": 4, "whale": 3, "wolf": 2},
        "focused": {"dragon": 3, "metatron": 3, "michael": 2, "sophia": 2},
        "balanced": {"dolphin": 2, "fairy": 2, "dragon": 2, "metatron": 2, "sophia": 2},
    }

    moon_weights = {
        "new": {"metatron": 3, "fairy": 2, "gabriel": 2},
        "waxing": {"dragon": 3, "dolphin": 2, "michael": 2, "sophia": 2},
        "full": {"whale": 4, "wolf": 2, "raphael": 2, "sophia": 2},
        "waning": {"jaguar": 3, "metatron": 2, "michael": 2},
    }

    intention_weights = {
        "courage": {"dragon": 4, "michael": 3, "wolf": 2},
        "healing": {"whale": 3, "raphael": 4, "dolphin": 2},
        "clarity": {"metatron": 4, "raven": 3, "gabriel": 2, "sophia": 3},
        "joy": {"dolphin": 4, "fairy": 3, "gabriel": 2},
        "protection": {"michael": 4, "dragon": 3, "jaguar": 2, "sophia": 2},
    }

    moon_key = ""
    if "new" in moon_phase:
        moon_key = "new"
    elif "wax" in moon_phase:
        moon_key = "waxing"
    elif "full" in moon_phase:
        moon_key = "full"
    elif "wan" in moon_phase or "last quarter" in moon_phase:
        moon_key = "waning"

    seed_key = f"{mood}|{moon_key}|{intention}"
    rotation_seed = sum(ord(ch) for ch in seed_key)

    def _score(entry: dict[str, Any]) -> tuple[int, int]:
        name = str(entry.get("name") or "").lower()
        category = str(entry.get("category") or "").lower()
        ally_type = str(entry.get("ally_type") or "").lower()
        base = 1
        keys = [category, ally_type, name]

        def add_weight(weight_map: dict[str, int] | None) -> int:
            if not weight_map:
                return 0
            score = 0
            for key, val in weight_map.items():
                key_l = key.lower()
                if any(key_l in token for token in keys):
                    score += int(val)
            return score

        base += add_weight(mood_weights.get(mood))
        base += add_weight(moon_weights.get(moon_key))
        base += add_weight(intention_weights.get(intention))

        entry_id = str(entry.get("id") or "")
        if entry_id == "ally-dragon-sovereign-flame":
            base += 3

        if str(entry.get("id") or "") in recent_ids:
            base -= 3

        tie_break = (rotation_seed + sum(ord(c) for c in str(entry.get("id") or ""))) % 100
        return base, tie_break

    ranked = sorted(combined, key=lambda item: _score(item), reverse=True)
    selected = ranked[0]
    selected_id = str(selected.get("id") or "")

    journey = await db.sacred_ally_audio_journeys.find_one({"ally_id": selected_id}, {"_id": 0})
    pathway = await db.sacred_ally_pathways.find_one({"ally_id": selected_id}, {"_id": 0})

    selected_name = str(selected.get("name") or "").lower()
    selected_category = str(selected.get("category") or "").lower()
    selected_type = str(selected.get("ally_type") or "").lower()

    if not journey:
        if "metatron" in selected_name:
            journey = await db.sacred_ally_audio_journeys.find_one({"id": "journey-metatron-cube-attunement"}, {"_id": 0})
        elif "michael" in selected_name:
            journey = await db.sacred_ally_audio_journeys.find_one({"id": "journey-michael-blue-shield"}, {"_id": 0})
        elif "raphael" in selected_name or "gabriel" in selected_name:
            journey = await db.sacred_ally_audio_journeys.find_one({"id": "journey-whale-songline-immersion"}, {"_id": 0})
        elif selected_category == "whales":
            journey = await db.sacred_ally_audio_journeys.find_one({"id": "journey-whale-songline-immersion"}, {"_id": 0})
        elif selected_category == "dolphins":
            journey = await db.sacred_ally_audio_journeys.find_one({"id": "journey-dolphin-joy-current"}, {"_id": 0})
        elif selected_category == "dragon" or selected_type == "dragon":
            journey = await db.sacred_ally_audio_journeys.find_one({"id": "journey-dragon-fire-initiation"}, {"_id": 0})

    if not pathway:
        if "metatron" in selected_name:
            pathway = await db.sacred_ally_pathways.find_one({"id": "pathway-metatron-21"}, {"_id": 0})
        elif selected_category == "whales":
            pathway = await db.sacred_ally_pathways.find_one({"id": "pathway-whale-14"}, {"_id": 0})
        elif selected_category == "dragon" or selected_type == "dragon":
            pathway = await db.sacred_ally_pathways.find_one({"id": "pathway-dragon-21"}, {"_id": 0})

    return {
        "recommended_at": datetime.now(timezone.utc).isoformat(),
        "input": {
            "mood": mood,
            "moon_phase": moon_phase,
            "intention": intention,
        },
        "recommended_ally": _enrich_content_integrity(selected, "hybrid-curated"),
        "recommended_journey": _enrich_content_integrity(journey, "hybrid-curated") if journey else None,
        "recommended_pathway": _enrich_content_integrity(pathway, "hybrid-curated") if pathway else None,
    }


# ============ ANCIENT WISDOM TRADITIONS ============

@router.get("/ancient-wisdom")
async def get_ancient_wisdom(tradition: Optional[str] = None) -> list[dict[str, Any]]:
    """Get ancient wisdom entries, optionally filtered by tradition."""
    db = get_db()
    query = {}
    if tradition:
        query["tradition"] = {"$regex": f"^{tradition}$", "$options": "i"}
    entries = await db.ancient_wisdom.find(query, {"_id": 0}).to_list(length=200)
    enriched_entries = []
    for entry in entries:
        entry_copy = dict(entry)
        entry_copy.setdefault("expanded_context", f"Extended context: {entry_copy.get('teaching') or entry_copy.get('description') or 'Traditional teaching depth.'}")
        entry_copy.setdefault("section_focus", entry_copy.get("tradition") or "cross-tradition")
        enriched_entries.append(
            _enrich_devotional_language(_enrich_content_integrity(entry_copy, "hybrid-curated"), "ancient-wisdom")
        )
    return _apply_free_paid_tiering(enriched_entries, "ancient_wisdom")


@router.get("/ancient-wisdom/{entry_id}")
async def get_ancient_wisdom_entry(entry_id: str) -> dict[str, Any]:
    """Get a specific ancient wisdom entry."""
    db = get_db()
    entry = await db.ancient_wisdom.find_one({"id": entry_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return _enrich_devotional_language(_enrich_content_integrity(entry, "hybrid-curated"), "ancient-wisdom")



# ============ SOUND FREQUENCIES ROUTES ============

@router.get("/sound-frequencies")
async def get_sound_frequencies(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get sound frequency healing content, optionally filtered by category."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    entries = await db.sound_frequencies.find(query, {"_id": 0}).to_list(length=50)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(entry, "hybrid-curated"), "sound-frequencies") for entry in entries]
    return _apply_free_paid_tiering(enriched, "sound_frequencies")


@router.get("/sound-frequencies/{freq_id}")
async def get_sound_frequency(freq_id: str) -> dict[str, Any]:
    """Get a specific sound frequency entry."""
    db = get_db()
    entry = await db.sound_frequencies.find_one({"id": freq_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Sound frequency not found")
    return _enrich_devotional_language(_enrich_content_integrity(entry, "hybrid-curated"), "sound-frequencies")



# ============ TAROT ROUTES ============

@router.get("/tarot/cards")
async def get_tarot_cards(arcana: Optional[str] = None) -> list[dict[str, Any]]:
    """Get tarot cards, optionally filtered by arcana type."""
    db = get_db()
    query = {}
    if arcana:
        query["arcana"] = {"$regex": f"^{arcana}$", "$options": "i"}
    cards = await db.tarot_cards.find(query, {"_id": 0}).to_list(length=100)
    enriched = [
        _normalize_divination_image(
            _enrich_devotional_language(_enrich_content_integrity(card, "hybrid-curated"), "tarot"),
            "tarot",
        )
        for card in cards
    ]
    return _apply_free_paid_tiering(enriched, "tarot")


@router.get("/tarot/cards/{card_id}")
async def get_tarot_card(card_id: str) -> dict[str, Any]:
    """Get a specific tarot card."""
    db = get_db()
    card = await db.tarot_cards.find_one({"id": card_id}, {"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Tarot card not found")
    return _normalize_divination_image(
        _enrich_devotional_language(_enrich_content_integrity(card, "hybrid-curated"), "tarot"),
        "tarot",
    )


@router.get("/tarot/reading")
async def get_tarot_reading(spread: str = "single") -> dict[str, Any]:
    """Get a random tarot reading. Spreads: single, three, celtic_cross"""
    db = get_db()
    cards = await db.tarot_cards.find({}, {"_id": 0}).to_list(length=100)
    
    if not cards:
        raise HTTPException(status_code=404, detail="No tarot cards found")
    
    if spread == "single":
        selected = _secure_sample(cards, 1)
        positions = ["Present Situation"]
    elif spread == "three":
        selected = _secure_sample(cards, 3)
        positions = ["Past", "Present", "Future"]
    elif spread == "celtic_cross":
        selected = _secure_sample(cards, min(10, len(cards)))
        positions = ["Present", "Challenge", "Past", "Future", "Above", "Below", 
                    "Advice", "External Influences", "Hopes/Fears", "Outcome"]
    else:
        selected = _secure_sample(cards, 1)
        positions = ["Message"]
    
    # Add reversed status randomly
    reading = []
    for i, card in enumerate(selected):
        is_reversed = _secure_bool(0.5)
        reading.append({
            "position": positions[i] if i < len(positions) else f"Card {i+1}",
            "card": _normalize_divination_image(
                _enrich_devotional_language(_enrich_content_integrity(card, "hybrid-curated"), "tarot"),
                "tarot",
            ),
            "reversed": is_reversed,
            "meaning": card["reversed_meaning"] if is_reversed else card["upright_meaning"]
        })
    
    return {"spread": spread, "cards": reading}



# ============ RETREATS ROUTES ============

@router.get("/retreats")
async def get_retreats(status: Optional[str] = None) -> list[dict[str, Any]]:
    """Get retreats, optionally filtered by status."""
    db = get_db()
    query = {}
    if status:
        query["status"] = {"$regex": f"^{status}$", "$options": "i"}
    retreats = await db.retreats.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=50)
    return [_enrich_devotional_language(_enrich_content_integrity(retreat, "hybrid-curated"), "retreats") for retreat in retreats]


@router.get("/retreats/{retreat_id}")
async def get_retreat(retreat_id: str) -> dict[str, Any]:
    """Get a specific retreat."""
    db = get_db()
    retreat = await db.retreats.find_one({"id": retreat_id}, {"_id": 0})
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")
    return _enrich_devotional_language(_enrich_content_integrity(retreat, "hybrid-curated"), "retreats")


# ============ VIDEOS ROUTES ============

@router.get("/videos")
async def get_videos(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get practice videos, optionally filtered by category."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    videos = await db.videos.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(video, "hybrid-curated"), "videos") for video in videos]
    return _apply_free_paid_tiering(enriched, "sacred_art_therapy")


@router.get("/videos/{video_id}")
async def get_video(video_id: str) -> dict[str, Any]:
    """Get a specific video."""
    db = get_db()
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return _enrich_devotional_language(_enrich_content_integrity(video, "hybrid-curated"), "videos")


# ============ COURSES ROUTES ============

@router.get("/courses")
async def get_courses(category: Optional[str] = None, level: Optional[str] = None) -> list[dict[str, Any]]:
    """Get courses, optionally filtered by category or level."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if level:
        query["level"] = {"$regex": f"^{level}$", "$options": "i"}
    courses = await db.courses.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return [_enrich_devotional_language(_enrich_content_integrity(course, "hybrid-curated"), "courses") for course in courses]


@router.get("/courses/{course_id}")
async def get_course(course_id: str) -> dict[str, Any]:
    """Get a specific course."""
    db = get_db()
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return _enrich_devotional_language(_enrich_content_integrity(course, "hybrid-curated"), "courses")


@router.get("/books")
async def get_books() -> list[dict[str, Any]]:
    """Get books collection for the Books page."""
    db = get_db()
    books = await db.books.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return [_enrich_devotional_language(_enrich_content_integrity(book, "hybrid-curated"), "books") for book in books]


@router.get("/books/{book_id}")
async def get_book(book_id: str) -> dict[str, Any]:
    """Get a specific book by id."""
    db = get_db()
    book = await db.books.find_one({"id": book_id}, {"_id": 0})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return _enrich_devotional_language(_enrich_content_integrity(book, "hybrid-curated"), "books")


# ============ SACRED RITES ROUTES ============

@router.get("/sacred-rites")
async def get_sacred_rites() -> list[dict[str, Any]]:
    """Get sacred rites (Munay Ki, Nusta Karpay, 13th Womb Rite) from courses collection."""
    db = get_db()
    rites = await db.courses.find({"category": "Shamanic Initiation"}, {"_id": 0}).to_list(length=20)
    if not rites:
        rites = await db.courses.find(
            {"category": {"$regex": "^sacred_rites$", "$options": "i"}},
            {"_id": 0},
        ).to_list(length=20)
    return [_enrich_devotional_language(_enrich_content_integrity(rite, "hybrid-curated"), "courses") for rite in rites]


@router.get("/sacred-rites/{rite_id}")
async def get_sacred_rite(rite_id: str) -> dict[str, Any]:
    """Get a specific sacred rite."""
    db = get_db()
    rite = await db.courses.find_one({"id": rite_id, "category": "Shamanic Initiation"}, {"_id": 0})
    if not rite:
        rite = await db.courses.find_one(
            {
                "id": rite_id,
                "category": {"$regex": "^sacred_rites$", "$options": "i"},
            },
            {"_id": 0},
        )
    if not rite:
        raise HTTPException(status_code=404, detail="Sacred rite not found")
    return _enrich_devotional_language(_enrich_content_integrity(rite, "hybrid-curated"), "courses")


# ============ COMMUNITY ROUTES ============

@router.get("/community/posts")
async def get_community_posts(type: Optional[str] = None) -> list[dict[str, Any]]:
    """Get community posts, optionally filtered by type."""
    db = get_db()
    query = {"status": {"$ne": "hidden"}}
    if type:
        query["type"] = {"$regex": f"^{type}$", "$options": "i"}
    posts = await db.community_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return posts


@router.post("/community/posts")
async def create_community_post(post_data: dict[str, Any]) -> dict[str, Any]:
    """Create a new community post (shared from journal or directly)."""
    from datetime import datetime, timezone
    db = get_db()
    post = {
        "id": f"post_{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        "title": post_data.get("title", "Reflection"),
        "content": post_data.get("content", ""),
        "author": post_data.get("author", "Anonymous"),
        "author_name": post_data.get("author_name", post_data.get("author", "Sacred Seeker")),
        "type": post_data.get("type", "reflection"),
        "element": post_data.get("element", ""),
        "practice_type": post_data.get("practice_type", ""),
        "moon_phase": post_data.get("moon_phase", ""),
        "mood": post_data.get("mood", ""),
        "tags": post_data.get("tags", []),
        "likes": 0,
        "comments": [],
        "status": "published",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.community_posts.insert_one(post)
    post.pop("_id", None)
    return post


@router.post("/community/posts/{post_id}/like")
async def like_community_post(post_id: str) -> dict[str, Any]:
    """Like a community post."""
    db = get_db()
    result = await db.community_posts.update_one(
        {"id": post_id},
        {"$inc": {"likes": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True}


@router.post("/community/posts/{post_id}/replies")
async def add_community_reply(post_id: str, reply_data: dict[str, Any]) -> dict[str, Any]:
    """Add a reply/comment to a community post."""
    from datetime import datetime, timezone
    import uuid
    db = get_db()
    reply = {
        "id": str(uuid.uuid4())[:8],
        "author_name": reply_data.get("author_name", "Sacred Seeker"),
        "content": reply_data.get("content", "").strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if not reply["content"]:
        raise HTTPException(status_code=400, detail="Reply content cannot be empty")
    result = await db.community_posts.update_one(
        {"id": post_id},
        {"$push": {"comments": reply}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return reply


# ============ SACRED GEOMETRY ROUTES ============

@router.get("/sacred-geometry")
async def get_sacred_geometry_collection() -> list[dict[str, Any]]:
    """Get sacred geometry guides from dedicated collection."""
    db = get_db()
    guides = await db.sacred_geometry.find({}, {"_id": 0}).to_list(length=100)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(guide, "hybrid-curated"), "healing-portals") for guide in guides]
    return _apply_free_paid_tiering(enriched, "light_codes")


# ============ ENERGY HEALING ROUTES ============

@router.get("/energy-healing")
async def get_energy_healing(modality: Optional[str] = None) -> list[dict[str, Any]]:
    """Get energy healing modalities with self-healing guides."""
    db = get_db()
    query = {}
    if modality:
        query["modality"] = {"$regex": f"^{modality}$", "$options": "i"}
    practices = await db.energy_healing.find(query, {"_id": 0}).to_list(length=500)
    practices = _append_energy_healing_supplements(practices, modality)
    enriched = [
        _enrich_devotional_language(
            _enrich_content_integrity(_enrich_energy_healing_entry(practice), "hybrid-curated"),
            "healing-portals",
        )
        for practice in practices
    ]
    return _apply_free_paid_tiering(enriched, "energy_healing")


@router.get("/energy-healing/{practice_id}")
async def get_energy_healing_practice(practice_id: str) -> dict[str, Any]:
    db = get_db()
    practice = await db.energy_healing.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Practice not found")
    return _enrich_devotional_language(
        _enrich_content_integrity(_enrich_energy_healing_entry(practice), "hybrid-curated"),
        "healing-portals",
    )


# ============ FREE FORM MOVEMENT ROUTES ============

@router.get("/free-form-movement")
async def get_free_form_movement(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get free form movement and somatic yoga practices."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    practices = await db.free_form_movement.find(query, {"_id": 0}).to_list(length=100)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "healing-portals") for practice in practices]
    return _apply_free_paid_tiering(enriched, "free_form_movement")


# ============ CHAKRA CLEANSING ROUTES ============

@router.get("/chakra-cleansing")
async def get_chakra_cleansing(chakra: Optional[str] = None) -> list[dict[str, Any]]:
    """Get chakra cleansing practices for all 13 chakras."""
    db = get_db()
    query = {}
    if chakra:
        query["chakra"] = {"$regex": f"^{chakra}$", "$options": "i"}
    practices = await db.chakra_cleansing.find(query, {"_id": 0}).to_list(length=100)
    enriched = [_enrich_devotional_language(practice, "healing-portals") for practice in practices]
    return _apply_free_paid_tiering(enriched, "chakra_cleansing")


@router.get("/chakra-cleansing/{chakra_id}")
async def get_chakra_cleansing_practice(chakra_id: str) -> dict[str, Any]:
    """Get a specific chakra cleansing practice."""
    db = get_db()
    practice = await db.chakra_cleansing.find_one({"id": chakra_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Chakra practice not found")
    return practice


# ============ SOMATIC YOGA ROUTES ============

@router.get("/somatic-yoga")
async def get_somatic_yoga(style: Optional[str] = None) -> list[dict[str, Any]]:
    """Get somatic yoga practices."""
    db = get_db()
    query = {}
    if style:
        query["style"] = {"$regex": f"^{style}$", "$options": "i"}
    practices = await db.somatic_yoga.find(query, {"_id": 0}).to_list(length=100)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "healing-portals") for practice in practices]
    return _apply_free_paid_tiering(enriched, "somatic_practices")


@router.get("/chair-yoga")
async def get_chair_yoga(style: Optional[str] = None) -> list[dict[str, Any]]:
    """Get chair yoga practices as a dedicated, accessibility-first stream."""
    db = get_db()
    query = {}
    if style:
        query["style"] = {"$regex": f"^{style}$", "$options": "i"}

    practices = await db.somatic_yoga.find(query, {"_id": 0}).to_list(length=100)
    practices = _append_chair_yoga_supplements(practices, style)
    adapted: list[dict[str, Any]] = []
    for practice in practices:
        entry = dict(practice)
        base_name = str(entry.get("name") or "Chair Yoga Practice").strip()
        if "chair" not in base_name.lower():
            entry["name"] = f"Chair {base_name}"

        base_description = str(entry.get("description") or "")
        entry["description"] = (
            f"{base_description} This chair adaptation keeps all key healing benefits while using seated options, wall support, and joint-safe pacing."
        ).strip()
        entry["category"] = "Chair Yoga"
        entry["style"] = str(entry.get("style") or "Accessible").strip()
        entry.setdefault("chair_support_level", "All levels")
        entry.setdefault("props", ["Stable chair", "Optional blanket", "Optional yoga strap"])
        entry.setdefault(
            "guided_practice",
            [
                "Seat with both feet grounded, lengthen spine, and soften shoulders.",
                "Move at 60% effort while keeping breath smooth and jaw relaxed.",
                "Close with hand on heart and one seated grounding breath cycle.",
            ],
        )
        adapted.append(entry)

    enriched = [_enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "healing-portals") for practice in adapted]
    return _apply_free_paid_tiering(enriched, "somatic_practices")


@router.get("/fascia-stretching")
async def get_fascia_stretching(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get fascia-focused stretching practices as a dedicated route."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}

    practices = await db.somatic_practices.find(query, {"_id": 0}).to_list(length=100)
    adapted: list[dict[str, Any]] = []
    for practice in practices:
        entry = dict(practice)
        base_name = str(entry.get("name") or "Fascia Stretching").strip()
        if "fascia" not in base_name.lower():
            entry["name"] = f"{base_name} · Fascia Stretching"

        fascia_focus = str(entry.get("somatic_fascia_focus") or "whole-body myofascial release and nervous-system regulation")
        base_description = str(entry.get("description") or "")
        entry["description"] = (
            f"{base_description} Fascia focus: {fascia_focus}. Move slowly and hydrate before and after practice for tissue recovery."
        ).strip()
        entry["category"] = "Fascia Stretching"
        entry["movement_track"] = "Fascia Stretching"
        entry.setdefault("fascia_focus_area", fascia_focus)
        entry.setdefault("props", ["Yoga mat", "Foam roller (optional)", "Massage ball (optional)"])
        entry.setdefault(
            "guided_practice",
            [
                "Begin with long exhales and subtle bouncing to wake connective tissue.",
                "Hold each stretch at edge-of-sensation without forcing range.",
                "Integrate by walking slowly and noticing rebound elasticity.",
            ],
        )
        adapted.append(entry)

    enriched = [_enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "healing-portals") for practice in adapted]
    return _apply_free_paid_tiering(enriched, "somatic_practices")


@router.get("/somatic-yoga/{practice_id}")
async def get_somatic_yoga_practice(practice_id: str) -> dict[str, Any]:
    """Get a specific somatic yoga practice."""
    db = get_db()
    practice = await db.somatic_yoga.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Somatic yoga practice not found")
    return practice


# ============ FEMININE EMBODIMENT (ROSE TEMPLE) ============

@router.get("/feminine-embodiment")
async def get_feminine_embodiment(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get feminine embodiment practices for Rose Temple."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    practices = await db.feminine_embodiment.find(query, {"_id": 0}).to_list(length=100)
    enriched = [_enrich_devotional_language(practice, "feminine-embodiment") for practice in practices]
    return _apply_free_paid_tiering(enriched, "rose_temple")


# ============ DAILY SACRED PRACTICE ============

def _get_moon_phase(now: datetime) -> str:
    known_new_moon = datetime(2024, 1, 11, tzinfo=timezone.utc)
    days_since = (now - known_new_moon).days
    moon_age = days_since % 29.5

    if moon_age < 1.85:
        return "new_moon"
    if moon_age < 7.38:
        return "waxing_crescent"
    if moon_age < 9.23:
        return "first_quarter"
    if moon_age < 14.77:
        return "waxing_gibbous"
    if moon_age < 16.61:
        return "full_moon"
    if moon_age < 22.15:
        return "waning_gibbous"
    if moon_age < 23.99:
        return "last_quarter"
    return "waning_crescent"


async def _load_daily_collection(
    db: Any,
    collection_name: str,
    source: str,
    practice_type: str,
    limit: int = 100,
) -> list[dict[str, Any]]:
    collection = getattr(db, collection_name)
    docs = await collection.find({}, {"_id": 0}).to_list(limit)
    for doc in docs:
        doc["source"] = source
        doc["practice_type"] = practice_type
        aligned = _apply_subject_image_alignment(doc, "hybrid-curated")
        doc.update(aligned)
    return docs


async def _collect_daily_practice_pool(db: Any) -> list[dict[str, Any]]:
    batches = await asyncio.gather(
        *[
            _load_daily_collection(db, collection_name, source, practice_type)
            for collection_name, source, practice_type in DAILY_PRACTICE_COLLECTIONS
        ]
    )
    return [item for batch in batches for item in batch]


def _practice_matches_focus(practice: dict[str, Any], focus_lower: str) -> bool:
    return (
        focus_lower in str(practice.get("name", "")).lower()
        or focus_lower in str(practice.get("description", "")).lower()
        or focus_lower in str(practice.get("category", "")).lower()
        or focus_lower in str(practice.get("chakra", "")).lower()
    )


def _apply_focus_filter(practices: list[dict[str, Any]], focus: Optional[str]) -> list[dict[str, Any]]:
    if not focus:
        return practices
    focus_lower = focus.lower()
    filtered = [practice for practice in practices if _practice_matches_focus(practice, focus_lower)]
    return filtered if filtered else practices


def _filter_by_keywords(practices: list[dict[str, Any]], keywords: list[str]) -> list[dict[str, Any]]:
    return [practice for practice in practices if any(keyword in str(practice).lower() for keyword in keywords)]


def _select_morning_evening_practices(
    practices: list[dict[str, Any]],
    rotation_seed: Optional[int] = None,
) -> tuple[Optional[dict[str, Any]], Optional[dict[str, Any]]]:
    source_practices = practices
    if rotation_seed is not None:
        source_practices = _deterministic_rotate_pool(practices, rotation_seed)

    morning_candidates = _filter_by_keywords(source_practices, MORNING_KEYWORDS) or source_practices
    morning_practice = _secure_choice(morning_candidates)

    evening_candidates = _filter_by_keywords(source_practices, EVENING_KEYWORDS) or source_practices
    if morning_practice:
        evening_candidates = [candidate for candidate in evening_candidates if candidate.get("id") != morning_practice.get("id")]
    evening_practice = _secure_choice(evening_candidates)
    return morning_practice, evening_practice


def _daily_guidance_text(day_of_week: str, current_day: dict[str, Any], moon_phase: str, current_moon: dict[str, Any]) -> str:
    readable_moon = moon_phase.replace("_", " ")
    return (
        f"Today is {day_of_week.capitalize()}, ruled by {current_day['ruler']}, during the {readable_moon}. "
        f"This is a powerful time for {current_moon['theme'].lower()}. "
        f"Honor the {current_moon['energy']} energy by moving gently with the cosmic rhythm."
    )


def _daily_reflection_prompts(current_moon: dict[str, Any], current_day: dict[str, Any]) -> list[str]:
    moon_energy = current_moon["energy"]
    converted_energy = moon_energy.replace("ing", "ed") if moon_energy.endswith("ing") else moon_energy
    return [
        f"What wants to be {converted_energy} in my life right now?",
        f"How can I honor the energy of {current_day['ruler']} today?",
        "What is my body asking for in this moment?",
    ]


def _pick_rotated_daily_item(items: list[dict[str, Any]], rotation_seed: int, salt: str) -> Optional[dict[str, Any]]:
    if not items:
        return None
    ordered = sorted(items, key=lambda item: str(item.get("id") or item.get("name") or ""))
    seed_offset = sum(ord(char) for char in salt)
    index = (rotation_seed + seed_offset) % len(ordered)
    return ordered[index]


def _first_text_line(value: Any, fallback: str = "") -> str:
    if isinstance(value, list):
        for item in value:
            text = str(item or "").strip()
            if text:
                return text
    text = str(value or "").strip()
    return text or fallback


def _daily_collective_dragon_reflection(current_moon: dict[str, Any], current_day: dict[str, Any]) -> dict[str, Any]:
    moon_theme = str(current_moon.get("theme") or "collective attunement").strip()
    day_ruler = str(current_day.get("ruler") or "the day").strip()
    return {
        "title": "Collective Dragon Reflection",
        "summary": f"Today favors {moon_theme.lower()} guided by {day_ruler} discipline.",
        "zodiac_focus": f"Move with {current_moon.get('energy', 'balanced')} lunar rhythm and embodied courage.",
        "integration_prompt": "What one choice today turns insight into aligned action?",
        "is_personalized": False,
    }


def _daily_ceremonial_journal_prompts(
    current_moon: dict[str, Any],
    current_day: dict[str, Any],
    daily_ally: Optional[dict[str, Any]],
    daily_angel: Optional[dict[str, Any]],
    dragon_reflection: dict[str, Any],
) -> list[str]:
    prompts = _daily_reflection_prompts(current_moon, current_day)

    if daily_ally:
        ally_name = str(daily_ally.get("name") or "Sacred Ally").strip()
        ally_prompt = _first_text_line(daily_ally.get("journal_prompts"))
        if ally_prompt:
            prompts.append(f"{ally_name}: {ally_prompt}")

    if daily_angel:
        angel_name = str(daily_angel.get("name") or "Angelic Guide").strip()
        angel_prompt = _first_text_line(daily_angel.get("journal_prompts"))
        if angel_prompt:
            prompts.append(f"{angel_name}: {angel_prompt}")

    dragon_prompt = str(dragon_reflection.get("integration_prompt") or "").strip()
    if dragon_prompt:
        prompts.append(dragon_prompt)

    prompts.append("What sacred action will I complete before nightfall to honor today's guidance?")

    deduped: list[str] = []
    seen: set[str] = set()
    for prompt in prompts:
        normalized = prompt.lower().strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        deduped.append(prompt)
    return deduped[:7]


def _safe_step_duration(value: Any, fallback: int) -> int:
    try:
        parsed = int(value)
    except Exception:
        parsed = fallback
    return max(3, min(25, parsed))


def _daily_unified_ceremonial_flow(
    morning_practice: Optional[dict[str, Any]],
    evening_practice: Optional[dict[str, Any]],
    daily_ally: Optional[dict[str, Any]],
    daily_angel: Optional[dict[str, Any]],
    dragon_reflection: dict[str, Any],
    journal_prompts: list[str],
) -> dict[str, Any]:
    morning_name = str((morning_practice or {}).get("name") or "Morning Awakening").strip()
    evening_name = str((evening_practice or {}).get("name") or "Evening Integration").strip()
    ally_name = str((daily_ally or {}).get("name") or "Sacred Ally").strip()
    angel_name = str((daily_angel or {}).get("name") or "Angelic Guide").strip()

    ally_ritual = _first_text_line((daily_ally or {}).get("rituals"), "Offer one breath of gratitude and grounded intention.")
    angel_ritual = _first_text_line((daily_angel or {}).get("practical_rituals"), "Visualize your field in clear coherent light.")

    return {
        "title": "Ceremonial Daily Flow",
        "opening_invocation": "I enter this day as ceremony—grounded, clear, and aligned.",
        "ceremony_steps": [
            {
                "step_id": "morning-embodiment",
                "title": "Morning Embodiment",
                "instruction": f"Begin with {morning_name}, moving slowly with full body awareness.",
                "duration_minutes": _safe_step_duration((morning_practice or {}).get("duration_minutes"), 8),
                "anchor_name": morning_name,
                "anchor_route": "/daily-practice",
            },
            {
                "step_id": "ally-transmission",
                "title": "Sacred Ally Transmission",
                "instruction": f"Receive guidance from {ally_name}: {ally_ritual}",
                "duration_minutes": 6,
                "anchor_name": ally_name,
                "anchor_route": "/sacred-ally-alchemy",
            },
            {
                "step_id": "angelic-seal",
                "title": "Angelic Alchemy Seal",
                "instruction": f"Seal your field with {angel_name}: {angel_ritual}",
                "duration_minutes": 5,
                "anchor_name": angel_name,
                "anchor_route": "/angelic-alchemy",
            },
            {
                "step_id": "evening-integration",
                "title": "Evening Integration",
                "instruction": f"Close with {evening_name}, releasing what is complete and integrating what is true.",
                "duration_minutes": _safe_step_duration((evening_practice or {}).get("duration_minutes"), 10),
                "anchor_name": evening_name,
                "anchor_route": "/daily-practice",
            },
        ],
        "dragon_integration": str(dragon_reflection.get("summary") or "Align this day with your highest path.").strip(),
        "closing_benediction": "Carry this ceremonial coherence into every word, boundary, and choice.",
        "journal_prompt": str(journal_prompts[0]) if journal_prompts else "What sacred action am I choosing now?",
    }


def _build_daily_practice_response(
    now: datetime,
    day_of_week: str,
    moon_phase: str,
    current_day: dict[str, Any],
    current_moon: dict[str, Any],
    morning_practice: Optional[dict[str, Any]],
    evening_practice: Optional[dict[str, Any]],
    daily_ally: Optional[dict[str, Any]],
    daily_angel: Optional[dict[str, Any]],
    dragon_astrology_reflection: dict[str, Any],
    daily_journal_prompts: list[str],
    ceremonial_affirmation: str,
    unified_daily_flow: dict[str, Any],
) -> dict[str, Any]:
    return {
        "date": now.strftime("%Y-%m-%d"),
        "day_of_week": day_of_week.capitalize(),
        "day_ruler": current_day["ruler"],
        "day_theme": current_day["theme"],
        "moon_phase": moon_phase.replace("_", " ").title(),
        "moon_theme": current_moon["theme"],
        "moon_energy": current_moon["energy"],
        "guidance": _daily_guidance_text(day_of_week, current_day, moon_phase, current_moon),
        "morning_practice": morning_practice,
        "evening_practice": evening_practice,
        "reflection_prompts": _daily_reflection_prompts(current_moon, current_day),
        "daily_ally": daily_ally,
        "daily_angel": daily_angel,
        "dragon_astrology_reflection": dragon_astrology_reflection,
        "daily_journal_prompts": daily_journal_prompts,
        "ceremonial_affirmation": ceremonial_affirmation,
        "unified_daily_flow": unified_daily_flow,
    }


@router.get("/daily-practice")
async def get_daily_practice(focus: Optional[str] = None) -> dict[str, Any]:
    """Get a daily sacred practice with morning and evening guidance."""
    db = get_db()

    now = datetime.now(timezone.utc)
    moon_phase = _get_moon_phase(now)
    day_of_week = now.strftime("%A").lower()

    current_moon = MOON_GUIDANCE.get(moon_phase, MOON_GUIDANCE["new_moon"])
    current_day = DAY_THEMES.get(day_of_week, DAY_THEMES["monday"])

    all_practices = await _collect_daily_practice_pool(db)
    all_practices = _apply_focus_filter(all_practices, focus)
    iso_week = now.isocalendar()[1]
    rotation_seed = (iso_week * 97) + (now.timetuple().tm_yday * 13)
    morning_practice, evening_practice = _select_morning_evening_practices(all_practices, rotation_seed=rotation_seed)

    ally_entries = await db.sacred_ally_alchemy.find({}, {"_id": 0}).to_list(length=200)
    angel_entries = await db.angelic_alchemy.find({}, {"_id": 0}).to_list(length=120)

    selected_ally = _pick_rotated_daily_item(ally_entries, rotation_seed, "daily-ally")
    selected_angel = _pick_rotated_daily_item(angel_entries, rotation_seed, "daily-angel")

    enriched_ally = _enrich_content_integrity(selected_ally, "hybrid-curated") if selected_ally else None
    enriched_angel = _enrich_content_integrity(selected_angel, "hybrid-curated") if selected_angel else None

    dragon_reflection = _daily_collective_dragon_reflection(current_moon, current_day)
    ceremonial_affirmation = (
        _first_text_line((enriched_ally or {}).get("affirmations"))
        or _first_text_line((enriched_angel or {}).get("affirmations"))
        or "I walk this day as ceremony, coherence, and compassion."
    )
    daily_journal_prompts = _daily_ceremonial_journal_prompts(
        current_moon=current_moon,
        current_day=current_day,
        daily_ally=enriched_ally,
        daily_angel=enriched_angel,
        dragon_reflection=dragon_reflection,
    )
    unified_flow = _daily_unified_ceremonial_flow(
        morning_practice=morning_practice,
        evening_practice=evening_practice,
        daily_ally=enriched_ally,
        daily_angel=enriched_angel,
        dragon_reflection=dragon_reflection,
        journal_prompts=daily_journal_prompts,
    )

    return _build_daily_practice_response(
        now=now,
        day_of_week=day_of_week,
        moon_phase=moon_phase,
        current_day=current_day,
        current_moon=current_moon,
        morning_practice=morning_practice,
        evening_practice=evening_practice,
        daily_ally=enriched_ally,
        daily_angel=enriched_angel,
        dragon_astrology_reflection=dragon_reflection,
        daily_journal_prompts=daily_journal_prompts,
        ceremonial_affirmation=ceremonial_affirmation,
        unified_daily_flow=unified_flow,
    )


# ============ MASCULINE EMBODIMENT ============

@router.get("/masculine-embodiment")
async def get_masculine_embodiment(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get masculine embodiment practices for Masculine Temple."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    practices = await db.masculine_embodiment.find(query, {"_id": 0}).to_list(length=100)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "masculine-practices") for practice in practices]
    return _apply_free_paid_tiering(enriched, "masculine_embodiment")


@router.get("/masculine-embodiment/{practice_id}")
async def get_masculine_embodiment_practice(practice_id: str) -> dict[str, Any]:
    """Get a specific masculine embodiment practice."""
    db = get_db()
    practice = await db.masculine_embodiment.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Masculine embodiment practice not found")
    return _enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "masculine-practices")


# ============ ELEMENTAL TEMPLES ROUTES ============

@router.get("/elemental-temples")
async def get_elemental_temples() -> list[dict[str, Any]]:
    """Get all 5 elemental temples with full content."""
    db = get_db()
    temples = await db.elemental_temples.find({}, {"_id": 0}).to_list(length=10)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(temple, "hybrid-curated"), "elemental-practices") for temple in temples]
    return _apply_free_paid_tiering(enriched, "elemental_temples")


@router.get("/elements")
async def get_elements_alias() -> list[dict[str, Any]]:
    """Alias endpoint for elemental temples (frontend compatibility)."""
    return await get_elemental_temples()


@router.get("/elemental-temples/{element_id}")
async def get_elemental_temple(element_id: str) -> dict[str, Any]:
    """Get a specific elemental temple by id (earth, water, fire, air, spirit)."""
    db = get_db()
    temple = await db.elemental_temples.find_one({"id": element_id}, {"_id": 0})
    if not temple:
        raise HTTPException(status_code=404, detail="Temple not found")
    return temple


# ============ WATER PRACTICES ROUTES ============

@router.get("/water-practices")
async def get_water_practices(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get water practices, optionally filtered by category."""
    db = get_db()
    query = {}
    if category:
        query["category"] = category
    practices = await db.water_practices.find(query, {"_id": 0}).to_list(length=100)
    practices = _append_water_supplements(practices, category)
    enriched = [_enrich_devotional_language(_apply_subject_image_alignment(practice, "hybrid-curated"), "healing-portals") for practice in practices]
    tiered = _apply_free_paid_tiering(enriched, "water_practices")
    return tiered

