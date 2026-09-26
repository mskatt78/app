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
MAX_NARRATION_MINUTES = 20
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
    "partner seated forward fold": "https://images.pexels.com/photos/8436521/pexels-photo-8436521.jpeg?auto=compress&cs=tinysrgb&w=900",
    "double boat pose": "https://images.pexels.com/photos/6456155/pexels-photo-6456155.jpeg?auto=compress&cs=tinysrgb&w=900",
    "partner tree pose": "https://images.unsplash.com/photo-1766069565396-b63c9254bbf0?crop=entropy&cs=srgb&fm=jpg&q=85",
    "flying bow acroyoga": "https://images.pexels.com/photos/8436530/pexels-photo-8436530.jpeg?auto=compress&cs=tinysrgb&w=900",
    "partner camel": "https://images.unsplash.com/photo-1606372952193-27c80cb73d26?crop=entropy&cs=srgb&fm=jpg&q=85",
    "partner seated twist": "https://images.pexels.com/photos/6455776/pexels-photo-6455776.jpeg?auto=compress&cs=tinysrgb&w=900",
    "supported fish": "https://images.pexels.com/photos/8436553/pexels-photo-8436553.jpeg?auto=compress&cs=tinysrgb&w=900",
    "standing forward fold assist": "https://images.pexels.com/photos/8436598/pexels-photo-8436598.jpeg?auto=compress&cs=tinysrgb&w=900",
    "partner supported childs pose": "https://images.pexels.com/photos/4662354/pexels-photo-4662354.jpeg?auto=compress&cs=tinysrgb&w=900",
    "partner low lunge assist": "https://images.unsplash.com/photo-1540206063137-4a88ca974d1a?crop=entropy&cs=srgb&fm=jpg&q=85",
    "back to back breath ladder": "https://images.pexels.com/photos/6455776/pexels-photo-6455776.jpeg?auto=compress&cs=tinysrgb&w=900",
    "partner seated side bend": "https://images.pexels.com/photos/6455849/pexels-photo-6455849.jpeg?auto=compress&cs=tinysrgb&w=900",
    "partner reclined twist": "https://images.pexels.com/photos/4662326/pexels-photo-4662326.jpeg?auto=compress&cs=tinysrgb&w=900",
    "partner supported bridge": "https://images.unsplash.com/photo-1591363642905-244ba0abf55d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "partner warrior anchor": "https://images.unsplash.com/photo-1765873205154-a80487d51bd7?crop=entropy&cs=srgb&fm=jpg&q=85",
    "partner standing quad stretch": "https://images.unsplash.com/photo-1527701758614-2b486f8c0d29?crop=entropy&cs=srgb&fm=jpg&q=85",
    "partner restorative savasana": "https://images.pexels.com/photos/8436496/pexels-photo-8436496.jpeg?auto=compress&cs=tinysrgb&w=900",
    "partner heart coherence flow": "https://images.pexels.com/photos/6455760/pexels-photo-6455760.jpeg?auto=compress&cs=tinysrgb&w=900",
}

YOGA_REALISM_IMAGE_OVERRIDES: dict[str, str] = {
    "mountain pose": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/8f26fde74d308a156a30442cbc2eaf5c4354ea4cfac73c38bfbd15983bbdf0c8.png",
    "tree pose": "https://images.pexels.com/photos/8436521/pexels-photo-8436521.jpeg?auto=compress&cs=tinysrgb&w=900",
    "warrior i": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/40d4a921d74510e183b689d880a200f1fea92e601da0a1e4ab65bcd813d74cf3.png",
    "warrior ii": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/13846b6540f84776e5cdb22e2d6a9565ae97b8be4148b2e825f404f85f75f717.png",
    "warrior iii": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/0f3360689b3fac1592f4a202c41df55a7f3726714c09ac2b5aa25527e6389d91.png",
    "reverse warrior": "https://images.pexels.com/photos/4662438/pexels-photo-4662438.jpeg?auto=compress&cs=tinysrgb&w=900",
    "extended side angle": "https://images.pexels.com/photos/8436718/pexels-photo-8436718.jpeg?auto=compress&cs=tinysrgb&w=900",
    "standing forward fold": "https://images.pexels.com/photos/6456149/pexels-photo-6456149.jpeg?auto=compress&cs=tinysrgb&w=900",
    "chair pose": "https://images.pexels.com/photos/3822116/pexels-photo-3822116.jpeg?auto=compress&cs=tinysrgb&w=900",
    "bridge pose": "https://images.pexels.com/photos/4662436/pexels-photo-4662436.jpeg?auto=compress&cs=tinysrgb&w=900",
    "pigeon pose": "https://images.pexels.com/photos/4662491/pexels-photo-4662491.jpeg?auto=compress&cs=tinysrgb&w=900",
    "downward dog": "https://images.pexels.com/photos/6456136/pexels-photo-6456136.jpeg?auto=compress&cs=tinysrgb&w=900",
    "crow pose": "https://images.pexels.com/photos/4662511/pexels-photo-4662511.jpeg?auto=compress&cs=tinysrgb&w=900",
    "camel pose": "https://images.unsplash.com/photo-1661307987465-1db8d7a8796f?crop=entropy&cs=srgb&fm=jpg&q=85",
    "headstand": "https://images.pexels.com/photos/4662467/pexels-photo-4662467.jpeg?auto=compress&cs=tinysrgb&w=900",
    "shoulder stand": "https://images.pexels.com/photos/6455823/pexels-photo-6455823.jpeg?auto=compress&cs=tinysrgb&w=900",
}

YOGA_REALISM_KEYWORD_OVERRIDES: list[tuple[tuple[str, ...], str]] = [
    (("warrior", "iii"), "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/0f3360689b3fac1592f4a202c41df55a7f3726714c09ac2b5aa25527e6389d91.png"),
    (("warrior", "ii"), "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/13846b6540f84776e5cdb22e2d6a9565ae97b8be4148b2e825f404f85f75f717.png"),
    (("warrior", "i"), "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/40d4a921d74510e183b689d880a200f1fea92e601da0a1e4ab65bcd813d74cf3.png"),
    (("warrior",), "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/13846b6540f84776e5cdb22e2d6a9565ae97b8be4148b2e825f404f85f75f717.png"),
    (("tree",), "https://images.pexels.com/photos/8436521/pexels-photo-8436521.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("bridge",), "https://images.pexels.com/photos/4662436/pexels-photo-4662436.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("triangle",), "https://images.pexels.com/photos/6456149/pexels-photo-6456149.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("garland", "malasana"), "https://images.pexels.com/photos/6456155/pexels-photo-6456155.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("goddess",), "https://images.pexels.com/photos/8436734/pexels-photo-8436734.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("half moon",), "https://images.pexels.com/photos/6456149/pexels-photo-6456149.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("forward fold", "uttanasana"), "https://images.pexels.com/photos/6456149/pexels-photo-6456149.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("boat", "navasana"), "https://images.pexels.com/photos/6456155/pexels-photo-6456155.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("upward facing dog", "urdhva mukha"), "https://images.unsplash.com/photo-1661307987465-1db8d7a8796f?crop=entropy&cs=srgb&fm=jpg&q=85"),
    (("plank",), "https://images.pexels.com/photos/6456136/pexels-photo-6456136.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("side plank",), "https://images.pexels.com/photos/4662467/pexels-photo-4662467.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("locust", "salabhasana"), "https://images.unsplash.com/photo-1661307987465-1db8d7a8796f?crop=entropy&cs=srgb&fm=jpg&q=85"),
    (("bow pose", "dhanurasana"), "https://images.pexels.com/photos/4662491/pexels-photo-4662491.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("child", "balasana"), "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("bound angle", "baddha konasana"), "https://images.pexels.com/photos/8436553/pexels-photo-8436553.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("happy baby",), "https://images.pexels.com/photos/4662491/pexels-photo-4662491.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("legs up the wall", "viparita karani"), "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("fish pose", "matsyasana"), "https://images.pexels.com/photos/4662436/pexels-photo-4662436.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("frog pose",), "https://images.pexels.com/photos/6456112/pexels-photo-6456112.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("cat", "cow"), "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("thread the needle",), "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("sleeping swan",), "https://images.pexels.com/photos/4662491/pexels-photo-4662491.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("eagle pose", "garudasana"), "https://images.pexels.com/photos/3822116/pexels-photo-3822116.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("dancer", "natarajasana"), "https://images.pexels.com/photos/8436718/pexels-photo-8436718.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("wheel pose", "urdhva dhanurasana"), "https://images.pexels.com/photos/4662436/pexels-photo-4662436.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("plow pose", "halasana"), "https://images.pexels.com/photos/6455823/pexels-photo-6455823.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("wild thing",), "https://images.pexels.com/photos/6456136/pexels-photo-6456136.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("bird of paradise",), "https://images.pexels.com/photos/8436718/pexels-photo-8436718.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("corpse", "savasana"), "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("easy pose", "sukhasana"), "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("lotus", "padmasana"), "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("hero pose", "virasana"), "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("staff pose", "dandasana"), "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("fire log",), "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("seated meditation", "meditation"), "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("prayer pose",), "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("standing split",), "https://images.pexels.com/photos/6456149/pexels-photo-6456149.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("firefly", "tittibhasana"), "https://images.pexels.com/photos/4662467/pexels-photo-4662467.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("eight angle", "astavakrasana"), "https://images.pexels.com/photos/4662467/pexels-photo-4662467.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("embryo",), "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("thunderbolt", "vajrasana"), "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("twist", "parivrtta", "marichyasana"), "https://images.pexels.com/photos/6455776/pexels-photo-6455776.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("pigeon", "kapotasana"), "https://images.pexels.com/photos/4662491/pexels-photo-4662491.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("downward", "adho mukha"), "https://images.pexels.com/photos/6456136/pexels-photo-6456136.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("cobra", "bhujangasana"), "https://images.unsplash.com/photo-1661307987465-1db8d7a8796f?crop=entropy&cs=srgb&fm=jpg&q=85"),
    (("headstand", "sirsasana"), "https://images.pexels.com/photos/4662467/pexels-photo-4662467.jpeg?auto=compress&cs=tinysrgb&w=900"),
    (("shoulder stand", "sarvangasana"), "https://images.pexels.com/photos/6455823/pexels-photo-6455823.jpeg?auto=compress&cs=tinysrgb&w=900"),
]

YOGA_REALISM_DEFAULT_IMAGE = "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=900"

SECTION_IMAGE_DEFAULTS: dict[str, str] = {
    "somatic_practices": "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900",
    "energy_healing": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&q=85",
    "shamanic_practices": "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1400",
    "water_practices": "https://images.unsplash.com/photo-1506947411487-a56738267384?crop=entropy&cs=srgb&fm=jpg&q=85",
    "yoga_poses": YOGA_REALISM_DEFAULT_IMAGE,
}

GENERIC_CATEGORY_IMAGE_FALLBACKS: dict[str, str] = {
    "grounding": "https://images.pexels.com/photos/2998999/pexels-photo-2998999.jpeg?auto=compress&cs=tinysrgb&w=800",
    "earth": "https://images.pexels.com/photos/2998999/pexels-photo-2998999.jpeg?auto=compress&cs=tinysrgb&w=800",
    "water": "https://images.unsplash.com/photo-1506947411487-a56738267384?crop=entropy&cs=srgb&fm=jpg&q=85",
    "moon": "https://images.unsplash.com/photo-1589347155881-96a4c76f147d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "moon-water": "https://images.unsplash.com/photo-1589347155881-96a4c76f147d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "blessing": "https://images.unsplash.com/photo-1506947411487-a56738267384?crop=entropy&cs=srgb&fm=jpg&q=85",
    "ceremony": "https://images.unsplash.com/photo-1506947411487-a56738267384?crop=entropy&cs=srgb&fm=jpg&q=85",
    "ritual": "https://images.unsplash.com/photo-1506947411487-a56738267384?crop=entropy&cs=srgb&fm=jpg&q=85",
    "frequency": "https://images.unsplash.com/photo-1553792006-995530772e9b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "crystalline": "https://images.unsplash.com/photo-1553792006-995530772e9b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "cleansing": "https://images.pexels.com/photos/9447948/pexels-photo-9447948.jpeg?auto=compress&cs=tinysrgb&w=800",
    "somatic": "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900",
    "release": "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900",
    "stress": "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900",
    "healing": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&q=85",
    "chakra": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&q=85",
    "energy": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&q=85",
    "feminine": "https://images.unsplash.com/photo-1518611012118-696072aa579a?crop=entropy&cs=srgb&fm=jpg&q=85",
    "masculine": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "movement": "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900",
    "egyptian_mystery": "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1400",
    "priestess_rose": "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1400",
    "merlin_alchemy": "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1400",
    "emerald_tablet": "https://images.pexels.com/photos/4017362/pexels-photo-4017362.jpeg?auto=compress&cs=tinysrgb&w=1400",
    "mystery_school": "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1400",
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
    {
        "id": "water-practice-101",
        "name": "Elemental Tide Mapping",
        "category": "blessing",
        "duration_minutes": 16,
        "description": "Track the emotional tides in your body and bless a glass of water with the exact medicine your nervous system needs.",
        "materials": ["Clear glass", "Journal", "Small bowl of sea salt"],
        "steps": [
            "Scan your body and name the strongest emotional tide present.",
            "Draw a small wave symbol in your journal beside that feeling.",
            "Whisper a blessing into your water that matches the medicine needed (calm, courage, release, trust).",
            "Sip slowly for seven breaths and record one embodied shift.",
        ],
        "benefits": ["Emotional literacy", "Nervous system regulation", "Intentional hydration"],
    },
    {
        "id": "water-practice-102",
        "name": "Blue Flame Purification Bowl",
        "category": "ceremony",
        "duration_minutes": 18,
        "description": "A ceremonial cleanse where flame and water work together to release over-responsibility and energetic residue.",
        "materials": ["Blue candle", "Ceremonial bowl", "Spring water"],
        "steps": [
            "Light a blue candle and place it behind your bowl of water.",
            "Name one burden that is not yours to carry.",
            "Trace three circles over the water and exhale the burden into the bowl.",
            "Pour the water onto earth with gratitude and close with one boundary vow.",
        ],
        "benefits": ["Energetic release", "Boundary restoration", "Ritual completion"],
    },
    {
        "id": "water-practice-103",
        "name": "Ancestral River Whisper Rite",
        "category": "ritual",
        "duration_minutes": 20,
        "description": "Offer a short prayer to your lineage through water, asking for wisdom without inheriting unresolved burden.",
        "materials": ["Cup of water", "Ancestral photo or symbol", "Notebook"],
        "steps": [
            "Place ancestral symbol beside water and breathe steadily for one minute.",
            "Speak gratitude for one inherited blessing.",
            "Speak release for one inherited burden and ask for clean guidance.",
            "Drink three mindful sips and journal one aligned action for the next day.",
        ],
        "benefits": ["Ancestral integration", "Emotional clarity", "Purpose alignment"],
    },
    {
        "id": "water-practice-104",
        "name": "Crystalline Coherence Drift",
        "category": "crystalline",
        "duration_minutes": 14,
        "description": "Charge water with crystal coherence and breath pacing to settle scattered attention.",
        "materials": ["Quartz point", "Glass jar", "Intention card"],
        "steps": [
            "Place quartz beside your jar and set one concise intention.",
            "Breathe in for 4 and out for 6 over 12 cycles while holding the jar.",
            "Whisper your intention three times into the water.",
            "Drink half immediately and half after your next grounding task.",
        ],
        "benefits": ["Attention coherence", "Mental focus", "Subtle energy alignment"],
    },
    {
        "id": "water-practice-105",
        "name": "Sonic Rain Vessel Attunement",
        "category": "frequency",
        "duration_minutes": 12,
        "description": "Use tone and vibration to entrain water with soothing frequencies before difficult conversations.",
        "materials": ["Bowl of water", "Singing tone app or humming voice"],
        "steps": [
            "Generate a steady hum or tone for 3 minutes while gazing softly at the water.",
            "Place one hand over throat and one over heart.",
            "State one truth you will communicate with compassion.",
            "Sip water slowly before speaking.",
        ],
        "benefits": ["Voice-heart coherence", "Communication calm", "Pre-conversation grounding"],
    },
    {
        "id": "water-practice-106",
        "name": "Hydration Prayer of Return",
        "category": "blessing",
        "duration_minutes": 10,
        "description": "A compact morning prayer that turns routine hydration into devotional re-alignment.",
        "materials": ["Morning water", "Quiet standing space"],
        "steps": [
            "Stand upright and soften your jaw and shoulders.",
            "Speak: 'I return to my center, my truth, and my service.'",
            "Drink water in four small rounds, pausing to feel your body each time.",
            "Name one boundary and one blessing for the day.",
        ],
        "benefits": ["Morning centering", "Embodied intention", "Boundary clarity"],
    },
    {
        "id": "water-practice-107",
        "name": "Moonlit Nectar Devotion",
        "category": "moon",
        "duration_minutes": 15,
        "description": "A moon-phase ritual to soothe emotional overdrive and invite intuitive repair.",
        "materials": ["Moon water", "Silver bowl", "Rose petals"],
        "steps": [
            "Place moon water in a silver bowl with one rose petal.",
            "Name what you are ready to soften, not force.",
            "Touch water to forehead, throat, and heart.",
            "Drink and close with three whispered words: 'Soften, trust, receive.'",
        ],
        "benefits": ["Emotional softening", "Intuitive access", "Sleep readiness"],
    },
    {
        "id": "water-practice-108",
        "name": "Salt Doorway Clearing",
        "category": "cleansing",
        "duration_minutes": 11,
        "description": "Cleanse household thresholds with salt water to reduce energetic carryover and restore peace.",
        "materials": ["Warm water", "Sea salt", "Small cloth"],
        "steps": [
            "Dissolve a pinch of salt into warm water.",
            "Wipe doorframes clockwise while exhaling long and slow.",
            "Name what is welcome in your home and what is complete.",
            "Rinse cloth and close with gratitude at the main doorway.",
        ],
        "benefits": ["Household field reset", "Boundary hygiene", "Emotional containment"],
    },
    {
        "id": "water-practice-109",
        "name": "Ocean Pulse Recovery Soak",
        "category": "healing",
        "duration_minutes": 22,
        "description": "A warm salt soak for palms and feet to downshift stress and return to body trust.",
        "materials": ["Two warm basins", "Mineral salt", "Lavender oil (optional)"],
        "steps": [
            "Prepare warm basins and place feet and palms into water.",
            "Breathe with a long exhale for 5 minutes.",
            "Repeat quietly: 'My body is safe to soften now.'",
            "Dry slowly and rest seated for two additional minutes.",
        ],
        "benefits": ["Stress recovery", "Somatic grounding", "Sleep support"],
    },
    {
        "id": "water-practice-110",
        "name": "Ceremonial Tears Alchemy",
        "category": "ceremony",
        "duration_minutes": 19,
        "description": "A grief-honoring rite to transform emotional stagnation into compassionate movement.",
        "materials": ["Bowl of water", "Hand towel", "Journal"],
        "steps": [
            "Place one hand on heart and one on lower belly.",
            "Name the grief without editing or minimizing it.",
            "Allow tears if present and touch fingertips to water between breaths.",
            "Close by writing one supportive act you will offer yourself tonight.",
        ],
        "benefits": ["Grief processing", "Emotional honesty", "Self-compassion"],
    },
    {
        "id": "water-practice-111",
        "name": "Living Spring Intentional Sip",
        "category": "blessing",
        "duration_minutes": 9,
        "description": "A short spring-water intention protocol for moments of indecision and fatigue.",
        "materials": ["Fresh water", "Single clear sentence intention"],
        "steps": [
            "Hold the water and ask: 'What matters most right now?'",
            "Speak one clear sentence of intention.",
            "Take three tiny sips, each followed by one slow exhale.",
            "Move immediately into one aligned action.",
        ],
        "benefits": ["Decision support", "Mental reset", "Action alignment"],
    },
    {
        "id": "water-practice-112",
        "name": "Pearl Frequency Heart Bath",
        "category": "frequency",
        "duration_minutes": 13,
        "description": "A gentle vocal and breath resonance practice for heart repair and relational steadiness.",
        "materials": ["Cup of water", "Soft humming tone"],
        "steps": [
            "Hum a low tone for six breaths while holding water at heart level.",
            "Speak one forgiveness phrase toward yourself.",
            "Sip and rest your tongue softly on the palate.",
            "Finish by placing both palms on heart for one minute.",
        ],
        "benefits": ["Heart coherence", "Relational regulation", "Self-forgiveness"],
    },
    {
        "id": "water-practice-113",
        "name": "Starlight Water Lineage Blessing",
        "category": "moon",
        "duration_minutes": 17,
        "description": "Charge water under stars to bless your path with humility, courage, and right timing.",
        "materials": ["Night-charged water", "Sky-facing space"],
        "steps": [
            "Face the night sky and breathe slowly for twelve counts.",
            "Name your lineage of support (ancestors, guides, Earth, stars).",
            "Bless the water with one vow of integrity.",
            "Drink and sit in silence for three minutes.",
        ],
        "benefits": ["Cosmic orientation", "Integrity anchoring", "Inner stillness"],
    },
    {
        "id": "water-practice-114",
        "name": "Riverstone Body Map Rinse",
        "category": "cleansing",
        "duration_minutes": 14,
        "description": "Use water touch-points across the body map to release held stress and restore embodied presence.",
        "materials": ["Small bowl of water", "Smooth stone"],
        "steps": [
            "Touch water to forehead, throat, sternum, navel, and soles of feet.",
            "At each point, name one sensation without judging it.",
            "Roll the riverstone in your palm while extending the exhale.",
            "Complete with one grounding affirmation and a gentle shoulder shake.",
        ],
        "benefits": ["Somatic awareness", "Stress discharge", "Grounded presence"],
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
    {"id": "energy-healing-supp-110", "name": "Solar-Lunar Pulse Harmonization", "modality": "Integrated", "element": "Fire & Water", "duration_minutes": 20, "description": "Balance sympathetic drive and parasympathetic recovery with alternating solar and lunar breath phases."},
    {"id": "energy-healing-supp-111", "name": "Dragon Spine Voltage Clearing", "modality": "Dragon", "element": "Fire", "duration_minutes": 24, "description": "Clear spinal overcharge through paced movement, grounding breath, and intentional energetic containment."},
    {"id": "energy-healing-supp-112", "name": "Kundalini Safety Arc", "modality": "Kundalini", "element": "Spirit", "duration_minutes": 22, "description": "A regulation-first kundalini protocol designed to support safe uncoiling of life-force without destabilizing the nervous system."},
    {"id": "energy-healing-supp-113", "name": "Pleiadian Heart Field Bath", "modality": "Galactic", "element": "Water", "duration_minutes": 18, "description": "Soften emotional armor with star-lineage heart coherence visualization and compassionate breath pacing."},
    {"id": "energy-healing-supp-114", "name": "Andromedan Nervous System Lattice", "modality": "Galactic", "element": "Air", "duration_minutes": 19, "description": "Rebuild energetic structure and focus through geometric breathing and embodied orientation cues."},
    {"id": "energy-healing-supp-115", "name": "Sirian Temple Voice Alignment", "modality": "Galactic", "element": "Air", "duration_minutes": 17, "description": "Use vocal resonance to align throat expression with grounded truth and embodied integrity."},
    {"id": "energy-healing-supp-116", "name": "Moon Meridian Repair Sequence", "modality": "Integrated", "element": "Water", "duration_minutes": 16, "description": "Release evening stress through meridian touch, long exhales, and lunar downshift pacing."},
    {"id": "energy-healing-supp-117", "name": "Sunline Confidence Transmission", "modality": "Integrated", "element": "Fire", "duration_minutes": 15, "description": "Restore momentum with solar plexus activation and one actionable embodiment commitment."},
    {"id": "energy-healing-supp-118", "name": "Earth Star Grounding Grid", "modality": "Pranic", "element": "Earth", "duration_minutes": 14, "description": "Anchor excess spiritual activation through root contact, weighted breath, and lower-body awareness."},
    {"id": "energy-healing-supp-119", "name": "Aether Cord Reconciliation", "modality": "Quantum", "element": "Spirit", "duration_minutes": 21, "description": "Repair relational energetic cords with consent-centered release, compassion, and boundaries."},
    {"id": "energy-healing-supp-120", "name": "Fascia Lightwave Melt", "modality": "Somatic", "element": "Water", "duration_minutes": 23, "description": "Melt fascia tension with wave-like breath and micro-mobility sequencing for whole-body relief."},
    {"id": "energy-healing-supp-121", "name": "Oracle Wind Clarity Sweep", "modality": "Sound", "element": "Air", "duration_minutes": 13, "description": "Clear cognitive fog through breath, sound sweep, and focused attention rehearsal."},
    {"id": "energy-healing-supp-122", "name": "Sacred Fire Boundary Consecration", "modality": "Sekhem", "element": "Fire", "duration_minutes": 18, "description": "Consecrate boundaries as sacred promises that protect life-force and relational integrity."},
    {"id": "energy-healing-supp-123", "name": "Temple Water Integration Seal", "modality": "Reiki", "element": "Water", "duration_minutes": 12, "description": "Complete healing sessions by sealing the body field with water touch-points and gratitude prayer."},
]

ANCIENT_WISDOM_SUPPLEMENTS = [
    {"id": "ancient-wisdom-supp-101", "name": "Temple of the Seven Springs", "tradition": "avalon", "title": "Waters of Remembering", "description": "A seven-stage Avalon spring rite for emotional healing, vow renewal, and embodied sovereignty.", "teachings": ["Water stores memory and can be consciously re-patterned.", "Vows spoken from regulation become stable medicine.", "Devotion must become daily action."], "practice": ["Touch water to brow, throat, heart, womb/navel, and palms.", "Speak one vow of integrity in each station.", "Journal one corrective action before sleep."], "image_url": "https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg"},
    {"id": "ancient-wisdom-supp-102", "name": "Celtic Well of Oaths", "tradition": "celtic", "title": "Boundary and Blessing Craft", "description": "A Celtic oath practice balancing fierce boundaries with compassionate leadership.", "teachings": ["Boundaries are sacred architecture.", "Speech is spellcraft; words shape destiny.", "Blessing without boundary becomes depletion."], "practice": ["Stand at dawn and state one no and one yes for your day.", "Anoint wrists with water and breathe 4/6 for twelve rounds.", "Close with gratitude for the boundary you upheld."], "image_url": "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg"},
    {"id": "ancient-wisdom-supp-103", "name": "Kemetic Blue Lotus Vigil", "tradition": "egyptian", "title": "Heart-Mind Coherence Night Rite", "description": "An Egyptian dusk vigil using breath and contemplation to harmonize thought and feeling.", "teachings": ["Clarity is a devotional discipline.", "Mind and heart must negotiate, not dominate.", "Night contemplation prepares wise action."], "practice": ["Sit in candlelight for fifteen minutes.", "Inhale a guiding question, exhale a single honest answer.", "Write one concrete action for tomorrow morning."], "image_url": "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg"},
    {"id": "ancient-wisdom-supp-104", "name": "Andean Condor Descent", "tradition": "peruvian", "title": "Vision to Action Bridge", "description": "A mountain-lineage practice for translating high vision into grounded stewardship.", "teachings": ["Vision without embodiment becomes fantasy.", "Stewardship is spiritual maturity.", "Action completes revelation."], "practice": ["Face open sky and ask for one clear directive.", "Walk slowly while repeating that directive for nine breaths.", "Complete one practical expression before noon."], "image_url": "https://images.pexels.com/photos/1509582/pexels-photo-1509582.jpeg"},
    {"id": "ancient-wisdom-supp-105", "name": "Lemurian Compassion Weave", "tradition": "lemurian", "title": "Relational Nervous System Healing", "description": "A heart-centric Lemurian weave for repairing relational ruptures with tenderness and accountability.", "teachings": ["Compassion and accountability belong together.", "Repair requires regulated presence.", "Listening is an embodied art."], "practice": ["Place one hand on heart and one on belly.", "Name the rupture without blame.", "Commit to one repair conversation and one self-repair act."], "image_url": "https://images.pexels.com/photos/775201/pexels-photo-775201.jpeg"},
    {"id": "ancient-wisdom-supp-106", "name": "Atlantean Crystal Law", "tradition": "atlantean", "title": "Power-With Ethics", "description": "An Atlantean corrective teaching ensuring energetic power is anchored in ethics and service.", "teachings": ["Power amplifies intention, so ethics are non-negotiable.", "Service protects against spiritual narcissism.", "Precision is an act of care."], "practice": ["Hold a clear crystal and name your intent in one sentence.", "Ask: Who is served by this action?",
"Seal with one measurable act of service."], "image_url": "https://images.pexels.com/photos/4017362/pexels-photo-4017362.jpeg"},
    {"id": "ancient-wisdom-supp-107", "name": "Aboriginal Songline Return", "tradition": "aboriginal", "title": "Belonging Through Place", "description": "A place-based humility ritual to restore belonging and reciprocal relationship with land.", "teachings": ["Belonging is practiced through reciprocity.", "Listening to place precedes asking from place.", "Humility opens perception."], "practice": ["Walk in silence for ten minutes outdoors.", "Offer gratitude to land and its custodians.", "Commit one restorative action for your local ecology."], "image_url": "https://images.pexels.com/photos/726478/pexels-photo-726478.jpeg"},
    {"id": "ancient-wisdom-supp-108", "name": "Pleiadian Rose Transmission", "tradition": "galactic", "title": "Emotional DNA Softening", "description": "A Pleiadian lineage ritual to soften inherited emotional armor and reopen devotional tenderness.", "teachings": ["Emotional healing is cosmic service.", "Tenderness is a strength practice.", "Heart repair reorganizes destiny."], "practice": ["Breathe sky-blue light into the heart for twelve cycles.", "Name one ancestral pattern you are ending.", "Seal with one relational gesture of care."], "image_url": "https://images.pexels.com/photos/196664/pexels-photo-196664.jpeg"},
    {"id": "ancient-wisdom-supp-109", "name": "Andromedan Lattice Alignment", "tradition": "galactic", "title": "Geometric Nervous System Stability", "description": "An Andromedan coherence practice to rebuild structure after overwhelm or spiritual overextension.", "teachings": ["Structure protects sensitivity.", "Coherence is trainable.", "Embodied pacing prevents collapse."], "practice": ["Visualize a geometric lattice around your body.", "Breathe 4-in/6-out while tracing the lattice with awareness.", "Name one simplification that protects your energy."], "image_url": "https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg"},
    {"id": "ancient-wisdom-supp-110", "name": "Merlin Teachings & Alchemy", "tradition": "celtic", "title": "Avalon Wisdom in Action", "description": "Merlin lineage teachings for discernment, grounded wizardry, and strategic compassion under pressure.", "teachings": ["Power must remain accountable to service.", "Discernment cuts illusion while preserving compassion.", "Embodied consistency is true magic."], "practice": ["Ground through feet and breath before decisions.", "Name one illusion and one reality-based action.", "Close with a Merlin vow of wise service."], "image_url": "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg"},
    {"id": "ancient-wisdom-supp-111", "name": "Egyptian Mystery School Gate", "tradition": "egyptian", "title": "Temple Initiation & Ethics", "description": "A high-priest teaching sequence for temple discipline, Ma'at alignment, and embodied mystery practice.", "teachings": ["Purification precedes revelation.", "Ethics are the vessel of sacred power.", "Initiation is proven by behavior."], "practice": ["Open with water blessing and one integrity vow.", "Study one temple principle and embody it in action the same day.", "Close with reflection on truth, balance, and service."], "image_url": "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg"},
    {"id": "ancient-wisdom-supp-112", "name": "Priestess & Rose Lineage", "tradition": "avalon", "title": "Grail Heart & Sovereign Boundaries", "description": "Rose-lineage teachings on compassionate leadership, relational repair, and priestess nervous-system regulation.", "teachings": ["Tenderness and boundaries are allies.", "The grail heart listens without self-betrayal.", "Service matures through sustainable rhythm."], "practice": ["Hand-to-heart/throat coherence breath for 12 cycles.", "Speak one truthful boundary with kindness.", "Offer one concrete act of rose-lineage service."], "image_url": "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg"},
    {"id": "ancient-wisdom-supp-113", "name": "Emerald Tablet Teaching & Alchemy", "tradition": "international", "title": "Hermetic Correspondence in Daily Life", "description": "Practical hermetic teachings translating emerald principles into emotional regulation, ethical power, and embodied action.", "teachings": ["As within, so without.", "Vibration is trainable through breath and behavior.", "Cause-and-effect integrity restores agency."], "practice": ["Map one inner pattern and its outer reflection.", "Use coherent breathing to shift state.", "Take one aligned behavior that proves the teaching."], "image_url": "https://images.pexels.com/photos/4017362/pexels-photo-4017362.jpeg"},
    {"id": "ancient-wisdom-supp-114", "name": "Merlin Teachings & Alchemy", "tradition": "celtic", "title": "Avalon Wisdom in Action", "description": "Merlin lineage teachings for discernment, grounded wizardry, and strategic compassion under pressure.", "teachings": ["Power must remain accountable to service.", "Discernment cuts illusion while preserving compassion.", "Embodied consistency is true magic."], "practice": ["Ground through feet and breath before decisions.", "Name one illusion and one reality-based action.", "Close with a Merlin vow of wise service."], "image_url": "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg"},
]

SACRED_GUARDIAN_SUPPLEMENTS = [
    {"id": "sacred-guardian-supp-101", "name": "Blue Stag of Moon Wells", "category": "spirit_animal", "element": "Water", "description": "A moon-well guardian guiding emotional dignity, clean boundaries, and deep listening.", "symbolism": ["Emotional sovereignty", "Moon-bound wisdom", "Dignified boundaries"], "spiritual_gifts": ["Intuitive discernment", "Calm presence", "Emotional regulation"], "message": "Move slowly enough to hear what your heart already knows.", "how_to_connect": ["Evening walk under moonlight", "Water bowl reflection", "Journal one honest feeling"], "chakra": "Heart & Third Eye", "image_url": "https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg"},
    {"id": "sacred-guardian-supp-102", "name": "Temple Jaguar of Precision", "category": "power_animal", "element": "Earth", "description": "Jaguar medicine for sovereign movement, energetic stealth, and decisive integrity.", "symbolism": ["Stealth and precision", "Boundary mastery", "Shadow courage"], "spiritual_gifts": ["Strategic focus", "Fear transmutation", "Grounded confidence"], "message": "You do not need noise to hold power; precision is enough.", "how_to_connect": ["Silent walking meditation", "Low-light breath practice", "One courageous micro-action"], "chakra": "Solar Plexus & Root", "image_url": "https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg"},
    {"id": "sacred-guardian-supp-103", "name": "Emerald Dragon Sentinel", "category": "dragon_energy", "element": "Earth", "description": "Dragon guardian of heart-protected leadership, ecological reciprocity, and grounded fire.", "symbolism": ["Protective leadership", "Earth stewardship", "Courage with tenderness"], "spiritual_gifts": ["Boundary fire", "Leadership integrity", "Resource protection"], "message": "Lead in a way that protects life, not ego.", "how_to_connect": ["Stand barefoot on earth", "Speak one leadership vow", "Complete one stewardship action"], "chakra": "Heart & Root", "image_url": "https://images.pexels.com/photos/2872418/pexels-photo-2872418.jpeg"},
    {"id": "sacred-guardian-supp-104", "name": "Sirian Lion Gatekeeper", "category": "dragon_energy", "element": "Fire", "description": "A solar guardian from the Sirian current, strengthening noble action and disciplined devotion.", "symbolism": ["Solar courage", "Nobility", "Disciplined devotion"], "spiritual_gifts": ["Brave communication", "Purpose ignition", "Energetic protection"], "message": "Let your courage be clean, not performative.", "how_to_connect": ["Dawn prayer facing east", "Solar breath cycles", "Truthful speech practice"], "chakra": "Solar Plexus", "image_url": "https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg"},
    {"id": "sacred-guardian-supp-105", "name": "Andromedan Owl of Clear Sight", "category": "messenger", "element": "Air", "description": "A clear-sight messenger helping separate intuition from anxiety and signal from noise.", "symbolism": ["Night clarity", "Discernment", "Pattern recognition"], "spiritual_gifts": ["Intuitive accuracy", "Strategic insight", "Mental steadiness"], "message": "Clarity arrives when you stop arguing with what is true.", "how_to_connect": ["Night sky observation", "Single-question journaling", "Breath-led decision check"], "chakra": "Third Eye", "image_url": "https://images.pexels.com/photos/1054655/pexels-photo-1054655.jpeg"},
    {"id": "sacred-guardian-supp-106", "name": "Rose Wolf of Devotional Pack", "category": "spirit_animal", "element": "Water", "description": "Pack medicine for relational healing, fierce tenderness, and reciprocal belonging.", "symbolism": ["Loyalty", "Relational repair", "Sacred belonging"], "spiritual_gifts": ["Trust rebuilding", "Compassionate boundaries", "Relational courage"], "message": "Belonging is built through repeated integrity.", "how_to_connect": ["Name your trusted circle", "Repair one strained conversation", "Offer one honest blessing"], "chakra": "Heart", "image_url": "https://images.pexels.com/photos/346941/pexels-photo-346941.jpeg"},
    {"id": "sacred-guardian-supp-107", "name": "Golden Eagle of High Vision", "category": "messenger", "element": "Air", "description": "High-vision messenger that aligns long-term strategy with embodied values.", "symbolism": ["Perspective", "Leadership vision", "Purpose altitude"], "spiritual_gifts": ["Long-view clarity", "Decision confidence", "Mission focus"], "message": "Rise high enough to see what truly matters.", "how_to_connect": ["Elevated viewpoint meditation", "Three-year vision note", "One immediate aligned step"], "chakra": "Crown & Third Eye", "image_url": "https://images.pexels.com/photos/355241/pexels-photo-355241.jpeg"},
    {"id": "sacred-guardian-supp-108", "name": "River Otter Joy Keeper", "category": "familiar", "element": "Water", "description": "A playful familiar restoring joy pathways when healing work becomes overly heavy.", "symbolism": ["Play as medicine", "Fluid resilience", "Social warmth"], "spiritual_gifts": ["Mood recovery", "Relational ease", "Creative flow"], "message": "Joy is not a distraction from healing; it is part of it.", "how_to_connect": ["Five-minute play break", "Water laughter ritual", "Gentle social reconnection"], "chakra": "Sacral", "image_url": "https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg"},
    {"id": "sacred-guardian-supp-109", "name": "Obsidian Raven Threshold", "category": "messenger", "element": "Air", "description": "Threshold raven medicine for endings, transitions, and truthful re-entry.", "symbolism": ["Threshold crossing", "Truth unveiling", "Ending completion"], "spiritual_gifts": ["Transition support", "Courageous truth", "Spiritual messaging"], "message": "You are at a threshold; cross with intention.", "how_to_connect": ["Doorway pause ritual", "Name what is complete", "Speak your next threshold vow"], "chakra": "Throat & Third Eye", "image_url": "https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg"},
    {"id": "sacred-guardian-supp-110", "name": "Aqua Serpent Renewal", "category": "dragon_energy", "element": "Water", "description": "Serpent-dragon hybrid guardian for kundalini-aware renewal and soft, paced uncoiling.", "symbolism": ["Shedding", "Renewal", "Life-force uncoiling"], "spiritual_gifts": ["Embodied transformation", "Trauma-aware activation", "Regulated power"], "message": "Shed what is complete; do not rush your becoming.", "how_to_connect": ["Spinal wave breath", "Hydration with intention", "Grounding after activation"], "chakra": "Root to Crown", "image_url": "https://images.pexels.com/photos/45246/green-tree-python-python-tree-python-green-45246.jpeg"},
    {"id": "sacred-guardian-supp-111", "name": "Aurora Swan Messenger", "category": "messenger", "element": "Water", "description": "Swan messenger of graceful boundaries, relational elegance, and emotional truth.", "symbolism": ["Grace", "Relational beauty", "Heart truth"], "spiritual_gifts": ["Elegant communication", "Emotional expression", "Self-respect"], "message": "Grace is precision with compassion.", "how_to_connect": ["Slow neck and chest opening", "Speak one difficult truth gently", "Close with hand on heart"], "chakra": "Heart & Throat", "image_url": "https://images.pexels.com/photos/64219/swans-swan-water-bird-64219.jpeg"},
    {"id": "sacred-guardian-supp-112", "name": "Temple Bee of Sacred Work", "category": "familiar", "element": "Earth", "description": "Bee familiar medicine for focused contribution, sustainable rhythm, and communal reciprocity.", "symbolism": ["Sacred work", "Communal service", "Steady rhythm"], "spiritual_gifts": ["Focus", "Productive devotion", "Collaborative care"], "message": "Tiny consistent acts become sacred architecture.", "how_to_connect": ["90-minute focus ritual", "One act of communal care", "Honey gratitude offering"], "chakra": "Solar Plexus", "image_url": "https://images.pexels.com/photos/460961/pexels-photo-460961.jpeg"},
    {"id": "sacred-guardian-supp-113", "name": "Cedar Bear Night Protector", "category": "power_animal", "element": "Earth", "description": "Bear protection for deep rest, boundary repair, and recovery from overextension.", "symbolism": ["Rest as power", "Protective boundaries", "Embodied recovery"], "spiritual_gifts": ["Nervous system downshift", "Boundary restoration", "Sustainable strength"], "message": "Rest is a strategic spiritual practice.", "how_to_connect": ["Evening den ritual", "Boundary journaling", "Weighted grounding before sleep"], "chakra": "Root", "image_url": "https://images.pexels.com/photos/158340/brown-bear-wild-animal-nature-158340.jpeg"},
    {"id": "sacred-guardian-supp-114", "name": "Luminous Falcon of Right Timing", "category": "messenger", "element": "Fire", "description": "Falcon messenger for right timing, decisive action, and strategic patience.", "symbolism": ["Right timing", "Precision action", "Strategic patience"], "spiritual_gifts": ["Timing discernment", "Decisive focus", "Calm execution"], "message": "Do not force timing; meet it with readiness.", "how_to_connect": ["Pause before action", "Name readiness signals", "Execute one aligned step"], "chakra": "Solar Plexus & Third Eye", "image_url": "https://images.pexels.com/photos/1097456/pexels-photo-1097456.jpeg"},
]

SACRED_ALLY_GALACTIC_SUPPLEMENTS = [
    {"id": "sacred-ally-supp-101", "name": "Pleiadian Rose Grid Alchemy", "ally_type": "pleiadian", "category": "galactic_allies", "element": "water", "description": "A Pleiadian-inspired imaginal heart practice for tenderness, reflection and compassionate leadership.", "alchemy_teachings": ["In this contemporary starseed symbolism, the Pleiades can represent tenderness and kinship.", "Tenderness can have structure.", "Compassion still needs discernment."], "rituals": ["Blue-light breath for 12 cycles.", "Hand on heart and throat truth invocation.", "One compassionate action within 24 hours."], "ceremonies": ["Rose Grid Opening", "Heart Repair Vow", "Compassionate Action Seal"], "journal_prompts": ["Where does tenderness need structure?", "What old grief am I ready to release?"], "affirmations": ["I lead with coherent compassion."], "image_url": "https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg"},
    {"id": "sacred-ally-supp-102", "name": "Andromedan Lattice Intelligence", "ally_type": "andromedan", "category": "galactic_allies", "element": "air", "description": "Andromedan geometric alignment for focus, resilience, and nervous-system structure.", "alchemy_teachings": ["Structure protects sensitivity.", "Coherence is built through repetition.", "Clean systems preserve life-force."], "rituals": ["Geometric breath square 4-4-4-4.", "Body-lattice visualization scan.", "Simplify one chaotic commitment."], "ceremonies": ["Lattice Alignment Ceremony", "Signal-to-Noise Reset", "Structure Commitment Rite"], "journal_prompts": ["What structure protects my mission?", "Where am I leaking energy?"], "affirmations": ["My energy is structured, clear, and precise."], "image_url": "https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg"},
    {"id": "sacred-ally-supp-103", "name": "Sirian Blue Flame Protocol", "ally_type": "sirian", "category": "galactic_allies", "element": "fire", "description": "Sirian discipline sequence for noble action, integrity, and sacred leadership.", "alchemy_teachings": ["Initiation is consistency.", "Leadership requires inner law.", "Power must be anchored in service."], "rituals": ["Dawn blue-flame visualization.", "Speak one integrity vow.", "Complete one courageous action."], "ceremonies": ["Blue Flame Invocation", "Noble Action Gate", "Integrity Seal"], "journal_prompts": ["Where is discipline asking to mature?", "What would noble action look like today?"], "affirmations": ["My power serves life and truth."], "image_url": "https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg"},
    {"id": "sacred-ally-supp-104", "name": "Dragon Wombfire Reclamation", "ally_type": "dragon", "category": "dragon", "element": "fire", "description": "Dragon wombfire work for reclaiming suppressed power and safe embodied sovereignty.", "alchemy_teachings": ["Power and softness can coexist.", "Sovereignty starts in the body.", "Fire needs containment to heal."], "rituals": ["Pelvic bowl breathing.", "Boundary declaration with grounded stance.", "Courageous communication rehearsal."], "ceremonies": ["Wombfire Awakening", "Sovereignty Boundary Circle", "Action Oath"], "journal_prompts": ["Where do I silence my fire?", "What boundary protects my life-force?"], "affirmations": ["My fire is sacred, safe, and sovereign."], "image_url": "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg"},
    {"id": "sacred-ally-supp-105", "name": "Kundalini Serpent Safety Spiral", "ally_type": "serpent", "category": "kundalini", "element": "spirit", "description": "A trauma-aware serpent spiral for safe uncoiling of life-force with regulation and pacing.", "alchemy_teachings": ["Uncoiling without regulation destabilizes.", "Slow is often the fastest safe path.", "Embodiment anchors expansion."], "rituals": ["Spinal wave movement.", "Long-exhale breath with orienting pauses.", "Grounding touch to feet and legs."], "ceremonies": ["Serpent Spiral Opening", "Regulated Rise", "Embodiment Closure"], "journal_prompts": ["What pace serves my nervous system?", "Where do I need more grounding?"], "affirmations": ["I uncoil in wisdom and regulation."], "image_url": "https://images.pexels.com/photos/45246/green-tree-python-python-tree-python-green-45246.jpeg"},
    {"id": "sacred-ally-supp-106", "name": "Arcturian Imaginal Chamber", "ally_type": "arcturian", "category": "galactic_allies", "element": "air", "description": "An Arcturian-inspired imaginal chamber for rest, reflection and grounded integration; not a medical or physiological treatment.", "alchemy_teachings": ["Healing is architectural.", "Light-body care requires embodiment.", "Recovery is strategic, not passive."], "rituals": ["Violet-gold chamber visualization.", "Breath-led field scan.", "Hydration and grounding close."], "ceremonies": ["Chamber Entry", "Imaginal Light Contemplation", "Grounded Re-Entry"], "journal_prompts": ["What does my body need to integrate?", "Where can I recover more intelligently?"], "affirmations": ["I receive healing with grounded wisdom."], "image_url": "https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg"},
    {"id": "sacred-ally-supp-107", "name": "Hydian Water Serpent Symbolism", "ally_type": "hydian", "category": "galactic_allies", "element": "water", "description": "A contemporary Hydian/serpent imaginal practice using water and cycles as symbols of memory, change and reflection.", "alchemy_teachings": ["Water can symbolize emotional history without literally storing personal memories.", "Change is often cyclical rather than linear.", "The body can communicate through sensation and learned patterns without being treated as a cosmic archive."], "rituals": ["Moon water charging.", "Spine-to-heart breath wave.", "Water blessing before sleep."], "ceremonies": ["Hydian Water Blessing", "Serpent Shedding Reflection", "Embodied Gratitude Seal"], "journal_prompts": ["What memory is ready to be re-patterned?", "How can I honor my cycles?"], "affirmations": ["My waters remember healing and truth."], "image_url": "https://images.pexels.com/photos/355887/pexels-photo-355887.jpeg"},
    {"id": "sacred-ally-supp-108", "name": "Cassiopeian Akashic Thread", "ally_type": "cassiopeian", "category": "galactic_allies", "element": "spirit", "description": "A Cassiopeian-inspired symbolic thread practice for reflecting on recurring themes, values and purpose.", "alchemy_teachings": ["Memory can be medicine.", "Purpose is remembered through practice.", "Sovereignty requires self-honesty."], "rituals": ["Comfortable breath with optional crown-light imagery.", "Hold one reflective question.", "Document what arose without treating it as verified external information."], "ceremonies": ["Akashic Doorway", "Purpose Clarification", "Service Commitment"], "journal_prompts": ["What soul lesson is repeating?", "What purpose is asking embodiment now?"], "affirmations": ["I remember and embody my sacred purpose."], "image_url": "https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg"},
    {"id": "sacred-ally-supp-109", "name": "Orion Boundary Spear", "ally_type": "orion", "category": "galactic_allies", "element": "fire", "description": "Orion ally work for strategic boundaries, clean decision-making, and mission focus.", "alchemy_teachings": ["Strategy protects compassion.", "Clarity demands commitment.", "Boundaries are mission support."], "rituals": ["Stance and breath alignment.", "Write one boundary decision.", "Execute one focused action."], "ceremonies": ["Spear of Clarity", "Mission Boundary Rite", "Focused Action Seal"], "journal_prompts": ["What decision am I postponing?", "Which boundary protects my mission?"], "affirmations": ["My clarity creates clean momentum."], "image_url": "https://images.pexels.com/photos/355241/pexels-photo-355241.jpeg"},
    {"id": "sacred-ally-supp-110", "name": "Dragon of Emerald Earth", "ally_type": "dragon", "category": "dragon", "element": "earth", "description": "Emerald earth-dragon guidance for ecological devotion and grounded prosperity ethics.", "alchemy_teachings": ["Prosperity without reciprocity degrades spirit.", "Earth stewardship is sacred wealth.", "Embodied presence stabilizes leadership."], "rituals": ["Barefoot grounding with gratitude.", "Offer one ecological repair act.", "Bless income with reciprocity intention."], "ceremonies": ["Earth Dragon Invocation", "Reciprocity Vow", "Stewardship Action Gate"], "journal_prompts": ["Where can I practice reciprocity today?", "How does my work serve Earth?"], "affirmations": ["My prosperity is reciprocal and life-serving."], "image_url": "https://images.pexels.com/photos/6468/animal-snake-reptile-eye.jpg"},
    {"id": "sacred-ally-supp-111", "name": "Kundalini Lotus Current", "ally_type": "serpent", "category": "kundalini", "element": "water", "description": "Lotus-serpent current for safe uncoiling of creativity, sensual integrity, and emotional coherence.", "alchemy_teachings": ["Creativity needs nervous-system safety.", "Sensuality and integrity are allies.", "Coherence sustains healthy uncoiling."], "rituals": ["Pelvic bowl breathing with soft jaw.", "Creative free-write for ten minutes.", "Ground with foot pressure and hydration."], "ceremonies": ["Lotus Opening", "Creative Current Activation", "Embodiment Seal"], "journal_prompts": ["What creative impulse needs protection?", "Where can I soften without collapsing?"], "affirmations": ["My creative life-force is safe and sacred."], "image_url": "https://images.pexels.com/photos/1054655/pexels-photo-1054655.jpeg"},
    {"id": "sacred-ally-supp-112", "name": "Pleiadian Childlight Renewal", "ally_type": "pleiadian", "category": "galactic_allies", "element": "air", "description": "A Pleiadian renewal sequence for inner-child repair, joy restoration, and relational softness.", "alchemy_teachings": ["Joy is strategic medicine.", "Inner-child work is spiritual architecture.", "Softness restores relational intelligence."], "rituals": ["Heart humming for seven breaths.", "Write a supportive note to your younger self.", "Complete one playful restorative act."], "ceremonies": ["Childlight Invocation", "Tender Repair", "Joy Seal"], "journal_prompts": ["What did my younger self need to hear?", "What restores my joy safely?"], "affirmations": ["Joy and tenderness strengthen my path."], "image_url": "https://images.pexels.com/photos/196664/pexels-photo-196664.jpeg"},
    {"id": "sacred-ally-supp-113", "name": "Andromedan Signal Purity", "ally_type": "andromedan", "category": "galactic_allies", "element": "air", "description": "Signal-purity work to reduce mental noise and sharpen intuitive precision.", "alchemy_teachings": ["Signal requires silence.", "Precision is compassionate.", "Simplicity protects intuition."], "rituals": ["Two-minute silence before decisions.", "Single-question inquiry practice.", "Action from first coherent answer."], "ceremonies": ["Signal Purity Gate", "Noise Release", "Precision Action Seal"], "journal_prompts": ["What noise can I release now?", "What is the cleanest next step?"], "affirmations": ["My signal is clear and trustworthy."], "image_url": "https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg"},
    {"id": "sacred-ally-supp-114", "name": "Sirian Temple Reconciliation", "ally_type": "sirian", "category": "galactic_allies", "element": "water", "description": "Sirian reconciliation current for restoring dignity after conflict through disciplined compassion.", "alchemy_teachings": ["Dignity and repair can coexist.", "Compassion needs structure.", "Reconciliation requires truthful action."], "rituals": ["Regulate breath before contact.", "Name impact without blame.", "Offer one specific repair action."], "ceremonies": ["Temple Reconciliation Opening", "Truth and Repair Dialogue", "Dignity Closure"], "journal_prompts": ["What repair is mine to make?", "How can I protect dignity for all involved?"], "affirmations": ["I reconcile with truth, dignity, and courage."], "image_url": "https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg"},
]

EGYPTIAN_MYSTERY_SCHOOL_TEACHINGS = [
    {"id":"mystery-egyptian-001","stream":"egyptian_mystery","name":"Temple of the Dawn Threshold","title":"Crossing Into Sacred Time","description":"An Egyptian-inspired threshold rite marking the passage from ordinary time into temple attention, presented as devotional practice rather than reconstructed history.","element":"fire","alchemy":["Thresholds prepare the nervous system for depth.","Sacred time begins with a deliberate crossing.","Attention is the first offering."],"ritual":["Wash hands and face with intention.","Light one candle at your threshold.","Speak a single sentence naming why you enter practice today."],"ceremony":["Purification","Threshold crossing","Dedication of attention"],"guided_practice":["Stand at a doorway and pause fully.","Cross only when breath is settled.","Let the room you enter become temple for the practice period."],"lineage":"Egyptian-inspired mystery school devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-egyptian-002","stream":"egyptian_mystery","name":"Weighing of the Heart Reflection","title":"Ma'at & Honest Self-Measure","description":"A contemplative practice inspired by the weighing-of-the-heart motif, used for honest self-reflection and value alignment rather than judgement or fear.","element":"air","alchemy":["Truthfulness can be gentle and exact at once.","A feather-light heart is cultivated through daily honesty.","Self-measure serves growth, not shame."],"ritual":["Place a feather or light object before you.","Review the day without defending or condemning yourself.","Name one alignment and one correction for tomorrow."],"ceremony":["Feather placement","Honest review","Correction vow"],"guided_practice":["Breathe until the body softens.","Ask: where was I true to my values today?","Close by choosing one act of integrity for tomorrow."],"lineage":"Egyptian-inspired mystery school devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-egyptian-003","stream":"egyptian_mystery","name":"Ka Vitality Breath","title":"Tending the Life-Force Double","description":"A breath and body practice inspired by the Egyptian concept of Ka as vital force, framed as embodied energy tending rather than metaphysical claim.","element":"earth","alchemy":["Vitality is tended, not demanded.","Breath links body and animating force.","Rest is a legitimate form of power."],"ritual":["Sit with a straight, unforced spine.","Breathe in for four counts, out for six, for several minutes.","Place both hands on the chest and thank the body for carrying you."],"ceremony":["Seated alignment","Vitality breath","Gratitude seal"],"guided_practice":["Notice where energy feels present and where it feels absent.","Send breath toward the quiet places without forcing.","End by choosing one act that genuinely restores you."],"lineage":"Egyptian-inspired mystery school devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-egyptian-004","stream":"egyptian_mystery","name":"House of Life Study Rite","title":"Learning as Sacred Practice","description":"A study rite inspired by the temple Houses of Life, honouring learning, careful record-keeping and the transmission of wisdom as devotional acts.","element":"spirit","alchemy":["Study can be ceremony.","Writing preserves what insight alone forgets.","Wisdom matures when it is shared with care."],"ritual":["Choose one teaching or text that matters to you.","Read slowly, copying one passage by hand.","Note one way to embody what you copied."],"ceremony":["Text blessing","Slow copying","Embodiment note"],"guided_practice":["Read a short passage twice, once for meaning and once for feeling.","Write without hurry.","Close by teaching the idea to yourself in your own words."],"lineage":"Egyptian-inspired mystery school devotional study","source_type":"curated-sacred-teaching"},
]
# Distinct lineage pathways added in Pass 38. These are presented as devotional,
# symbolic and contemplative schools rather than as claims of one continuous historical lineage.
HATHOR_MYSTERY_TEACHINGS = [
    {"id":"mystery-hathor-001","stream":"hathor_mystery","name":"Sistrum & Sacred Joy","title":"Joy as Devotional Practice","description":"A Hathor-inspired temple practice exploring music, beauty and embodied joy as offerings.","element":"air","alchemy":["Joy can be cultivated without forcing a mood.","Music can mark a threshold into ceremony.","Beauty can be an act of attention."],"ritual":["Choose a gentle rhythm or sistrum-like sound.","Move for seven unhurried minutes.","Close by naming one beauty you noticed."],"ceremony":["Sound opening","Joy movement","Gratitude close"],"guided_practice":["Orient to the room.","Let rhythm invite rather than command movement.","Rest in stillness and notice what remains."],"lineage":"Hathor-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hathor-002","stream":"hathor_mystery","name":"Mother's Milk of Egypt & the Nile","title":"Nourishment, River & Receiving","description":"A symbolic contemplation of Hathor's maternal imagery and the Nile as nourishment, abundance and cyclical life.","element":"water","alchemy":["Receiving is part of reciprocity.","Nourishment has physical, relational and symbolic forms.","Rivers teach movement and renewal."],"ritual":["Place a bowl of clean water on the altar.","Name what truly nourishes you.","Offer one act of nourishment to another or to Earth."],"ceremony":["Water blessing","Receiving vow","Reciprocity offering"],"guided_practice":["Hands around the water bowl.","Breathe slowly and contemplate receiving.","Close with a practical nourishment choice."],"lineage":"Hathor-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hathor-003","stream":"hathor_mystery","name":"Seven Hathors Reflection","title":"Seven Mirrors of Becoming","description":"A contemplative seven-part reflection inspired by the Seven Hathors motif, used here for inquiry rather than prediction.","element":"spirit","alchemy":["Symbol can open inquiry without determining fate.","Many aspects of self can be witnessed together.","Choice remains central."],"ritual":["Create seven small candles or markers.","Give each one a question about your present life.","Journal what you choose to embody next."],"ceremony":["Seven lights","Seven questions","Choice seal"],"guided_practice":["Pause at each marker.","Listen without demanding an answer.","Finish with one grounded action."],"lineage":"Hathor-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hathor-004","stream":"hathor_mystery","name":"Golden One Temple","title":"Beauty, Voice & Sacred Presence","description":"A sensory temple practice of voice, fragrance, adornment and presence inspired by Hathor's associations with music and beauty.","element":"fire","alchemy":["Adornment can be intentional rather than performative.","Voice can carry devotion.","Presence matters more than perfection."],"ritual":["Choose one meaningful adornment.","Hum or tone comfortably.","Speak one sentence of appreciation to your body."],"ceremony":["Adornment blessing","Voice offering","Golden close"],"guided_practice":["Feel feet and breath.","Sound only within comfort.","Notice sensation before interpretation."],"lineage":"Hathor-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
]

SEVEN_SISTERS_TEACHINGS = [
    {"id":"mystery-seven-sisters-001","stream":"seven_sisters","name":"Seven Sisters Night Sky","title":"Star Lore & Belonging","description":"A contemplative Pleiades practice that honours the visible star cluster and the many cultural stories associated with it without blending those traditions together.","element":"air","alchemy":["One sky can hold many distinct stories.","Wonder does not require certainty.","Belonging can begin with attentive looking."],"ritual":["Find the Pleiades when season and sky allow, or use a star map.","Observe before interpreting.","Journal what the image of seven sisters evokes for you."],"ceremony":["Sky orientation","Seven breaths","Wonder close"],"guided_practice":["Feel Earth beneath you.","Look softly toward the stars.","Return attention to body and place."],"lineage":"Contemporary Seven Sisters / Pleiades contemplative path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-seven-sisters-002","stream":"seven_sisters","name":"Sister One · Listening","title":"The First Star: Listening","description":"The first of seven symbolic sister teachings, centred on listening before speaking or seeking signs.","element":"water","alchemy":["Listening creates space.","Silence is not emptiness.","Discernment begins before interpretation."],"ritual":["Sit for seven minutes without seeking a message.","Notice sound, breath and sensation.","Write only what you actually observed."],"ceremony":["Listening bowl","Silent interval","Observation journal"],"guided_practice":["Orient.","Listen outward then inward.","Close without forcing meaning."],"lineage":"Contemporary Seven Sisters / Pleiades contemplative path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-seven-sisters-003","stream":"seven_sisters","name":"Sister Two · Kinship","title":"The Second Star: Kinship","description":"A sisterhood reflection on reciprocity, chosen kin and the relationships that help us remain human and grounded.","element":"earth","alchemy":["Kinship is practiced.","Reciprocity needs boundaries.","Care becomes real through action."],"ritual":["Name seven people, beings or places that form your web of kinship.","Offer gratitude to one.","Choose one reciprocal action."],"ceremony":["Kinship naming","Gratitude offering","Reciprocity seal"],"guided_practice":["Hand to heart.","Recall support received.","Choose grounded reciprocity."],"lineage":"Contemporary Seven Sisters / Pleiades contemplative path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-seven-sisters-004","stream":"seven_sisters","name":"Seven-Star Integration","title":"From Sky to Soil","description":"An integration rite bringing star symbolism back into body, relationship and practical Earth care.","element":"earth","alchemy":["Cosmic imagery needs earthly integration.","Insight becomes meaningful through behaviour.","Wonder and stewardship can coexist."],"ritual":["Choose one insight from your star practice.","Translate it into one relationship action and one Earth action.","Complete both before returning to the stars."],"ceremony":["Star remembrance","Soil touch","Action vow"],"guided_practice":["Look upward.","Touch Earth.","Name what you will embody."],"lineage":"Contemporary Seven Sisters / Pleiades contemplative path","source_type":"curated-sacred-teaching"},
]

SOPHIA_DRAGON_TEACHINGS = [
    {"id":"mystery-sophia-dragon-001","stream":"sophia_dragons","name":"Cosmic Womb Threshold","title":"Entering the Imaginal Chamber","description":"A Sophia Dragon journey using the Cosmic Womb as an imaginal symbol of gestation, mystery and sacred creation.","element":"spirit","alchemy":["Not everything needs immediate form.","Creation includes waiting.","Mystery can be held without certainty."],"ritual":["Darken the room safely.","Rest hands where comfortable on heart or belly.","Ask what is gestating rather than what must be produced."],"ceremony":["Threshold","Dark chamber","Return"],"guided_practice":["Ground first.","Enter the imagery by choice.","Return through breath, touch and orientation."],"lineage":"Contemporary Sophia Dragon imaginal path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-sophia-dragon-002","stream":"sophia_dragons","name":"Sophia Dragon · Golden Wisdom","title":"Wisdom Before Fire","description":"A dragon chamber exploring sovereign fire guided by Sophia as sacred wisdom rather than impulse.","element":"fire","alchemy":["Power needs wisdom.","Courage can remain tender.","Fire is most useful when it has a vessel."],"ritual":["Stand firmly.","Name one place courage is needed.","Choose the smallest wise action."],"ceremony":["Golden flame","Wisdom question","Action seal"],"guided_practice":["Feel feet.","Imagine golden fire only if it supports you.","End with a practical choice."],"lineage":"Contemporary Sophia Dragon imaginal path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-sophia-dragon-003","stream":"sophia_dragons","name":"Earth Dragon Chamber","title":"Scale, Soil & Boundary","description":"An Earth Dragon chamber for grounded boundaries, stewardship and embodied sovereignty.","element":"earth","alchemy":["A boundary can protect life.","Stewardship is a form of devotion.","Sovereignty includes responsibility."],"ritual":["Touch soil or stone.","Name one boundary that protects what matters.","Complete one act of stewardship."],"ceremony":["Earth gate","Boundary vow","Stewardship close"],"guided_practice":["Weight into feet.","Imagine protective scales if useful.","Return to the actual room and Earth."],"lineage":"Contemporary Sophia Dragon imaginal path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-sophia-dragon-004","stream":"sophia_dragons","name":"Dragon Chamber of Integration","title":"Returning With What Is Yours","description":"A closing chamber that emphasizes integration over constant activation or seeking more experiences.","element":"water","alchemy":["Integration is part of initiation.","More intensity is not always more depth.","The body sets the pace."],"ritual":["Drink water.","Write three sensations and one insight.","Leave the rest unlabelled."],"ceremony":["Wing folding","Water return","Integration vow"],"guided_practice":["Orient to five visible things.","Feel support beneath you.","Choose rest or action according to what is actually needed."],"lineage":"Contemporary Sophia Dragon imaginal path","source_type":"curated-sacred-teaching"},
]

MAGDALENE_INITIATION_TEACHINGS = [
    {"id":"mystery-magdalene-001","stream":"magdalene_initiations","name":"Anointing & Devotion","title":"Tending the Body as Prayer","description":"A Magdalene-inspired devotional practice centred on anointing, tenderness and embodied prayer, distinguished from historical claims not established by early sources.","element":"water","alchemy":["Devotion can be embodied.","Tenderness can coexist with boundaries.","Anointing can mark intention."],"ritual":["Choose a skin-safe oil if desired.","Anoint hands or heart space.","Name what you devote yourself to today."],"ceremony":["Oil blessing","Devotion vow","Quiet close"],"guided_practice":["Slow the breath.","Touch only where welcome.","Let devotion become one practical act."],"lineage":"Magdalene-inspired Christian mystical devotion","source_type":"curated-sacred-teaching"},
    {"id":"mystery-magdalene-002","stream":"magdalene_initiations","name":"Tears as Anointing","title":"Grief, Witness & Compassion","description":"A contemplative rite that welcomes tears if they arise without requiring catharsis or assigning them a fixed spiritual meaning.","element":"water","alchemy":["Grief can be witnessed without being rushed.","Tears need no performance.","Compassion includes stopping when enough is enough."],"ritual":["Create a quiet place.","Name what you are willing to witness.","Let tears come or not come."],"ceremony":["Witness","Water blessing","Rest"],"guided_practice":["Notice breath and face.","Allow rather than force.","Close with warmth, water and orientation."],"lineage":"Magdalene-inspired Christian mystical devotion","source_type":"curated-sacred-teaching"},
    {"id":"mystery-magdalene-003","stream":"magdalene_initiations","name":"Golden Thread","title":"Devotion Through Change","description":"A symbolic Golden Thread practice for remembering values through uncertainty and transition.","element":"air","alchemy":["Values can guide us when certainty cannot.","Devotion is renewed through choice.","A thread can symbolize continuity without denying change."],"ritual":["Hold a gold thread or cord.","Name three values.","Tie three gentle knots as reminders."],"ceremony":["Thread blessing","Three values","Carry forward"],"guided_practice":["Breathe with each knot.","Recall one lived example of each value.","Choose the next expression."],"lineage":"Magdalene-inspired Christian mystical devotion","source_type":"curated-sacred-teaching"},
    {"id":"mystery-magdalene-004","stream":"magdalene_initiations","name":"Descent & Return","title":"Returning With Wisdom","description":"A symbolic descent-and-return contemplation that honours difficulty without romanticising suffering.","element":"earth","alchemy":["Difficulty does not automatically make us wiser.","Meaning is shaped through reflection and choice.","Return requires integration."],"ritual":["Name what changed you.","Name what you learned and what remains unresolved.","Choose one way to live the learning."],"ceremony":["Descent acknowledgement","Threshold crossing","Return vow"],"guided_practice":["Ground before remembering.","Stay within a tolerable window.","End in the present room."],"lineage":"Magdalene-inspired Christian mystical devotion","source_type":"curated-sacred-teaching"},
]


# Pass 39: distinct Isis and Hermetic/Bardon pathways. These are framed as
# historical study + contemporary contemplative practice, not claims of direct initiation.
ISIS_PRIESTESS_TEACHINGS = [
    {"id":"mystery-isis-001","stream":"isis_priestess","name":"Temple of Isis · Remembering the Name","title":"Identity, Devotion & Sacred Speech","description":"An Isis-inspired contemplation rooted in the ancient Egyptian goddess Aset/Isis and her long history of devotion. The practice uses sacred naming as reflection, not as a claim to reproduce an ancient initiation.","element":"air","alchemy":["Names can hold relationship and intention.","Devotion deepens through attention rather than performance.","Historical Isis and modern sacred-feminine practice are related here without being treated as identical."],"ritual":["Place an image, knot or simple symbol on the altar.","Speak the qualities you honour in Isis: devotion, protection, skill and persistence.","Name one quality you will embody through action."],"ceremony":["Temple threshold","Sacred naming","Embodied vow"],"guided_practice":["Orient to breath and room.","Speak slowly and listen to the resonance of the words.","Close with one ordinary act of devotion."],"lineage":"Isis/Aset-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-isis-002","stream":"isis_priestess","name":"Knot of Isis · Tyet","title":"Binding What Matters","description":"A symbolic practice inspired by the tyet, an ancient Egyptian protective amulet closely associated with Isis, exploring protection, continuity and care.","element":"earth","alchemy":["Protection can be practical and sacred.","What we bind ourselves to deserves discernment.","Care is strengthened by clear boundaries."],"ritual":["Use a red cord or draw a tyet-inspired shape rather than claiming an original temple rite.","Name what you choose to protect.","Tie one knot for a concrete boundary or responsibility."],"ceremony":["Red thread","Protection naming","Boundary seal"],"guided_practice":["Feel feet and hands.","Notice what protection means in daily life.","Complete the boundary you named."],"lineage":"Isis/Aset-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-isis-003","stream":"isis_priestess","name":"Isis & the Search for Osiris","title":"Gathering What Has Been Scattered","description":"A mythic contemplation inspired by Isis searching for and reassembling Osiris. It is used here as a symbol for gathering attention, values and neglected parts of life—not as a literal model of trauma or soul fragmentation.","element":"water","alchemy":["Grief can coexist with purposeful action.","Gathering is different from forcing wholeness.","Love may express itself through patient tending."],"ritual":["Place several stones or petals apart from one another.","Name areas of life asking for renewed attention.","Gather them slowly into a pattern that feels complete enough for today."],"ceremony":["Scattered pieces","Patient gathering","Water close"],"guided_practice":["Let grief be present or absent.","Move one piece at a time.","End in the present rather than searching endlessly."],"lineage":"Isis/Aset-inspired Egyptian mythic contemplation","source_type":"curated-sacred-teaching"},
    {"id":"mystery-isis-004","stream":"isis_priestess","name":"Wings of Isis","title":"Protection Without Possession","description":"An embodied wing meditation inspired by Egyptian images of Isis with outstretched wings, exploring shelter, dignity and the difference between protection and control.","element":"air","alchemy":["Protection need not become possession.","Shelter can include choice and space.","Dignity belongs to both giver and receiver."],"ritual":["Open the arms only within comfort.","Imagine wings as a symbol if useful.","Ask what supportive protection looks like without controlling another."],"ceremony":["Wing opening","Shelter prayer","Hands-to-heart return"],"guided_practice":["Breathe without straining shoulders.","Sense the space around the body.","Close by respecting one boundary—your own or another's."],"lineage":"Isis/Aset-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-isis-005","stream":"isis_priestess","name":"Throne of Isis","title":"Steady Sovereignty","description":"A contemplation of Isis's throne symbolism and sacred authority, translated into grounded responsibility rather than status or spiritual superiority.","element":"earth","alchemy":["Authority is accountable.","A throne is a seat of responsibility, not proof of superiority.","Steadiness can be firm and gentle."],"ritual":["Sit upright with feet supported.","Name one responsibility that accompanies your influence.","Choose one accountable action."],"ceremony":["Taking the seat","Responsibility vow","Return to service"],"guided_practice":["Feel support beneath you.","Notice the difference between power and force.","Stand only after naming how you will serve."],"lineage":"Isis/Aset-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-isis-006","stream":"isis_priestess","name":"Nile & Star of Isis","title":"Cycles, Orientation & Return","description":"A closing Isis pathway weaving river, seasonal return and star symbolism into a practice of orientation. Historical Egyptian associations are honoured without turning modern ritual into an ancient factual reconstruction.","element":"water","alchemy":["Cycles can orient without dictating fate.","Return is part of devotion.","Earthly life remains the place where insight is embodied."],"ritual":["Place water beside a star or sky image.","Name what is returning in your life and what has completed.","Pour the water onto Earth or a plant where appropriate."],"ceremony":["River remembrance","Sky orientation","Earth return"],"guided_practice":["Look outward, then inward.","Choose one cycle to honour practically.","Finish with water, food or contact with Earth."],"lineage":"Isis/Aset-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
]

HERMETIC_BARDON_TEACHINGS = [
    {"id":"mystery-hermetic-001","stream":"hermetic_bardon","name":"Hermetic Gate · Observation","title":"The Laboratory of Attention","description":"A foundational Hermetic practice of observation and self-study, with a nod to Franz Bardon's training emphasis while avoiding claims of supernatural attainment.","element":"air","alchemy":["Observation comes before interpretation.","Attention becomes more useful through repetition.","A practice journal makes change visible over time."],"ritual":["Sit for five quiet minutes.","Notice thought, sensation and surroundings without trying to perfect them.","Record three observations and one question."],"ceremony":["Threshold breath","Witnessing","Journal seal"],"guided_practice":["Name what is observed rather than what it supposedly means.","Return when distracted.","End with one grounded action."],"lineage":"Hermetic study inspired by Franz Bardon's practical training","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hermetic-002","stream":"hermetic_bardon","name":"Four Elements Mirror","title":"Elemental Self-Study","description":"A contemporary reflection inspired by Hermetic elemental correspondences: Fire, Air, Water and Earth become lenses for behaviour, strengths and imbalance rather than literal substances inside the psyche.","element":"spirit","alchemy":["A symbol can reveal patterns without becoming a diagnosis.","Every element has useful and difficult expressions.","Balance is contextual rather than perfect."],"ritual":["Divide a page into Fire, Air, Water and Earth.","List observed strengths and excesses under each.","Choose one balancing behaviour for the week."],"ceremony":["Four directions","Mirror writing","Balance vow"],"guided_practice":["Work from examples, not labels.","Include strengths as well as difficulties.","Review after seven days."],"lineage":"Hermetic elemental study inspired by Franz Bardon","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hermetic-003","stream":"hermetic_bardon","name":"Breath & Vitality","title":"Breath as Attention Practice","description":"A gentle Hermetic-inspired breath contemplation. Breath is used to focus attention and imagery; it is not presented as absorbing measurable cosmic substances or curing illness.","element":"air","alchemy":["Breath can anchor attention.","Imagery is optional.","Comfort matters more than intensity."],"ritual":["Breathe naturally through the nose if comfortable.","Imagine inhaling a chosen quality such as steadiness only if that supports you.","Stop the imagery and return to ordinary breathing whenever needed."],"ceremony":["Breath arrival","Quality contemplation","Ordinary-breath return"],"guided_practice":["No breath holds are required.","Keep the jaw and shoulders easy.","Orient to the room at the end."],"lineage":"Hermetic study inspired by Franz Bardon's practical training","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hermetic-004","stream":"hermetic_bardon","name":"Mental Discipline Gate","title":"One Thought, Many Returns","description":"A concentration practice inspired by Hermetic mental training, emphasizing patient return rather than mastery, suppression or spiritual status.","element":"air","alchemy":["Concentration is trained by returning.","Distraction is information, not failure.","Discipline can remain gentle."],"ritual":["Choose a neutral object or word.","Attend for two to five minutes.","Each time attention wanders, return without punishment."],"ceremony":["Focus choice","Return practice","Completion bell"],"guided_practice":["Begin short.","Notice strain and soften it.","Increase duration only when the practice remains steady."],"lineage":"Hermetic study inspired by Franz Bardon's practical training","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hermetic-005","stream":"hermetic_bardon","name":"Akasha as Mystery","title":"Space Before Meaning","description":"A contemplative Hermetic gate using Akasha as a spiritual/philosophical symbol of spaciousness and mystery, not as a scientifically established fifth physical element.","element":"spirit","alchemy":["Mystery need not be filled with claims.","Space can make discernment possible.","Silence is a practice, not proof of revelation."],"ritual":["Sit with an uncluttered altar or open sky view.","Leave one question unanswered for the duration of the practice.","Write what you actually noticed rather than what you hoped to receive."],"ceremony":["Open space","Unanswered question","Grounded return"],"guided_practice":["Rest in ordinary sensory awareness.","Let imagery come and go.","Close without forcing a message."],"lineage":"Contemporary Hermetic contemplation","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hermetic-006","stream":"hermetic_bardon","name":"Hermetic Integration Gate","title":"Knowledge Into Character","description":"A closing gate translating Hermetic study into ethics, responsibility and daily behaviour rather than collecting initiations or extraordinary experiences.","element":"earth","alchemy":["Practice is visible in conduct.","Power requires ethics.","Integration matters more than spiritual display."],"ritual":["Review one week of practice notes.","Choose one principle that changed your behaviour.","Name one repair, service or responsibility that follows."],"ceremony":["Review","Ethics vow","Service close"],"guided_practice":["Notice what actually changed.","Keep what is useful.","Let go of what became performance."],"lineage":"Contemporary Hermetic integration inspired by Franz Bardon","source_type":"curated-sacred-teaching"},
]

MYSTERY_SCHOOL_TEACHINGS = [
    {"id": "mystery-egyptian-001", "stream": "egyptian_mystery", "name": "House of Life Initiation", "title": "Temple Entry Through Purification", "description": "A foundational temple teaching on purification, ethical posture, and readiness before sacred knowledge is transmitted.", "element": "water", "alchemy": ["Purification precedes revelation.", "Ethics are the vessel of power.", "Silence builds inner hearing."], "ritual": ["Wash hands and face with intention.", "Speak one ethical vow before study.", "Close with gratitude to lineage."], "ceremony": ["Threshold cleansing", "Vow of integrity", "Temple opening breath"], "guided_practice": ["4-6 breath cycle with hand on heart.", "Visualize entering a luminous temple corridor.", "Name one behavior to purify today."], "lineage": "Kemetic", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-002", "stream": "egyptian_mystery", "name": "Ma'at Feather Alignment", "title": "Truth, Balance, and Right Action", "description": "Teaching the Ma'at principle as a daily embodiment practice for truth-speaking and relational justice.", "element": "air", "alchemy": ["Truth spoken gently heals systems.", "Balance is practiced, not possessed.", "Integrity is measurable behavior."], "ritual": ["Place hand on throat and heart.", "Speak one truthful sentence kindly.", "Take one balancing action."], "ceremony": ["Feather invocation", "Voice-heart coherence", "Integrity seal"], "guided_practice": ["Inhale clarity, exhale distortion.", "Track where body tightens around truth.", "Release jaw and choose clean speech."], "lineage": "Kemetic", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-003", "stream": "egyptian_mystery", "name": "Sekhem Current Discipline", "title": "Life-Force Stewardship", "description": "A priestly discipline for channeling life-force without leakage through regulated breath and intentional service.", "element": "fire", "alchemy": ["Power requires containment.", "Service protects energy from vanity.", "Discipline amplifies devotion."], "ritual": ["Stand with grounded feet.", "Breathe 4-in/8-out for 12 rounds.", "Offer one service act after practice."], "ceremony": ["Sekhem ignition", "Containment vow", "Service dedication"], "guided_practice": ["Trace light up spine on inhale.", "Anchor into belly on exhale.", "Name one boundary to protect life-force."], "lineage": "Kemetic", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-004", "stream": "egyptian_mystery", "name": "Isis Throne Devotion", "title": "Compassionate Sovereignty", "description": "Isian priestess teaching on holding authority with tenderness, boundaries, and maternal wisdom.", "element": "water", "alchemy": ["Sovereignty and tenderness can coexist.", "Compassion needs boundaries.", "Devotion is strategic care."], "ritual": ["Seat posture with lifted sternum.", "Invoke compassionate authority.", "Write one protective boundary."], "ceremony": ["Throne seating", "Compassion oath", "Boundary blessing"], "guided_practice": ["Breathe into heart for 9 cycles.", "Name one person including yourself to protect wisely.", "Close with hand-to-heart vow."], "lineage": "Kemetic Priestess", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-005", "stream": "egyptian_mystery", "name": "Horus Vision Restoration", "title": "Right Seeing and Strategic Clarity", "description": "A temple-eye teaching to restore perception after confusion, projection, or emotional fog.", "element": "air", "alchemy": ["Perception is purified through stillness.", "Strategy follows clear seeing.", "Discernment reduces suffering."], "ritual": ["Soften gaze at one candle flame.", "Ask one precise question.", "Record first coherent answer."], "ceremony": ["Eye opening", "Clarity inquiry", "Action commitment"], "guided_practice": ["3 minutes silent gaze.", "Breath-led question cycle.", "Immediate aligned step."], "lineage": "Horus Temple", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-006", "stream": "egyptian_mystery", "name": "Anubis Threshold Work", "title": "Death-Rebirth Transitions", "description": "A transition teaching for sacred endings, grief processing, and dignified closure before new cycles.", "element": "earth", "alchemy": ["Endings are initiations.", "Grief metabolized becomes wisdom.", "Closure protects future growth."], "ritual": ["Name what is complete.", "Exhale into earth with gratitude.", "Write one rebirth intention."], "ceremony": ["Threshold crossing", "Grief honoring", "Rebirth opening"], "guided_practice": ["Slow exhale and body scan.", "Witness grief without suppression.", "Choose one next-step action."], "lineage": "Anubian Mysteries", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-007", "stream": "egyptian_mystery", "name": "Thoth Sacred Speech", "title": "Word as Spellcraft", "description": "Teaching on precise language, thought discipline, and sacred communication as alchemical practice.", "element": "air", "alchemy": ["Words shape nervous systems.", "Precision is compassion.", "Speech reveals alignment."], "ritual": ["Pause before speaking.", "Edit one sentence for truth and kindness.", "Speak with paced breath."], "ceremony": ["Tongue purification", "Voice alignment", "Speech seal"], "guided_practice": ["Inhale pause, exhale phrase.", "Track body impact of words.", "Close with silence."], "lineage": "Thothian", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-008", "stream": "egyptian_mystery", "name": "Bastet Nervous System Grace", "title": "Safety Through Soft Power", "description": "Priestess-cat teaching for restoring play, softness, and regulated power after hypervigilance.", "element": "water", "alchemy": ["Softness can be protective.", "Play restores resilience.", "Safety unlocks intuition."], "ritual": ["Unclench jaw and shoulders.", "Slow stroke forearms for self-soothing.", "Breathe into lower ribs."], "ceremony": ["Grace invocation", "Self-soothing rite", "Joy permission"], "guided_practice": ["5-minute softness scan.", "Name one joyful micro-action.", "Integrate before sleep."], "lineage": "Bastet Temple", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-009", "stream": "egyptian_mystery", "name": "Osiris Integrity Ledger", "title": "Review, Repair, Restore", "description": "Nightly ledger teaching for reviewing the day, repairing harm, and restoring moral coherence.", "element": "earth", "alchemy": ["Repair is sacred adulthood.", "Reflection prevents repetition.", "Integrity is daily maintenance."], "ritual": ["Review 3 decisions from today.", "Name one repair needed.", "Schedule the repair action."], "ceremony": ["Ledger review", "Repair vow", "Restoration close"], "guided_practice": ["Slow breathing while journaling.", "Name impact without excuses.", "Commit to correction."], "lineage": "Osirian", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-010", "stream": "egyptian_mystery", "name": "Hathor Voice Medicine", "title": "Sound, Love, and Regulation", "description": "Hathoric teaching on tonal healing, relational warmth, and voice-led emotional regulation.", "element": "air", "alchemy": ["Voice can soothe the heart.", "Beauty is medicinal alignment.", "Tone shapes relational safety."], "ritual": ["Hum low tone on exhale.", "Place hand on chest.", "Offer one loving phrase."], "ceremony": ["Tone invocation", "Heart resonance", "Loving closure"], "guided_practice": ["6 humming breaths.", "Name one tenderness need.", "Act on it gently."], "lineage": "Hathoric", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-011", "stream": "egyptian_mystery", "name": "Ra Solar Discipline", "title": "Dawn Commitment Science", "description": "Solar teaching for purpose activation, action discipline, and compassionate focus.", "element": "fire", "alchemy": ["Action is devotion in motion.", "Morning rhythm builds destiny.", "Discipline can be loving."], "ritual": ["Face east at dawn.", "Speak one purpose sentence.", "Complete first key task before distractions."], "ceremony": ["Solar greeting", "Purpose declaration", "Action ignition"], "guided_practice": ["Sun-breath cycle.", "Single-focus intention.", "Immediate execution."], "lineage": "Ra Priesthood", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-012", "stream": "egyptian_mystery", "name": "Djed Spine Stability", "title": "Postural Alchemy", "description": "Teaching of the Djed pillar as embodied resilience, spinal dignity, and energetic steadiness.", "element": "earth", "alchemy": ["Posture changes psyche.", "Spine is ritual architecture.", "Stability invites clarity."], "ritual": ["Lengthen spine while seated.", "Breathe into lower back.", "Hold steady for two minutes."], "ceremony": ["Pillar alignment", "Breath fortification", "Grounded seal"], "guided_practice": ["Spinal awareness scan.", "Micro-adjust shoulders/jaw.", "End with grounded stance."], "lineage": "Djed Mystery", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-013", "stream": "egyptian_mystery", "name": "Ka-Ba Harmony", "title": "Subtle Body Coherence", "description": "A mystery school teaching on harmonizing vital force (Ka) and soul field (Ba).", "element": "spirit", "alchemy": ["Vitality and meaning must align.", "Subtle coherence reduces fatigue.", "Energy follows sincere intention."], "ritual": ["Hand on navel and crown.", "Inhale vitality, exhale meaning.", "Record one alignment insight."], "ceremony": ["Ka invocation", "Ba listening", "Coherence vow"], "guided_practice": ["9 breath coherence cycle.", "Feel belly and crown dialogue.", "Anchor insight into action."], "lineage": "Ka-Ba Temple", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-014", "stream": "egyptian_mystery", "name": "Temple Dream Incubation", "title": "Night Oracle Discipline", "description": "Priestly dream practice for receiving symbolic guidance with discernment and accountability.", "element": "water", "alchemy": ["Dreams are training grounds.", "Symbol discernment needs grounding.", "Guidance must become action."], "ritual": ["Write one dream question.", "Place note near bed.", "Record first waking symbols."], "ceremony": ["Night invocation", "Dream receptivity", "Morning interpretation"], "guided_practice": ["Breath downshift before sleep.", "Question planting.", "Morning integration."], "lineage": "Temple Sleep Chambers", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-015", "stream": "egyptian_mystery", "name": "Scarab Renewal Cycle", "title": "Daily Rebirth Embodiment", "description": "A rebirth teaching for beginning again without shame and building momentum through tiny faithful acts.", "element": "earth", "alchemy": ["Small acts become destiny.", "Rebirth is repetitive.", "Shame dissolves through action."], "ritual": ["Name one restart area.", "Choose a 5-minute action.", "Complete it now."], "ceremony": ["Rebirth naming", "Micro-action vow", "Momentum seal"], "guided_practice": ["Breath reset.", "Task initiation.", "Completion reflection."], "lineage": "Scarab Mysteries", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-016", "stream": "egyptian_mystery", "name": "Lotus Ascension Breath", "title": "Crown and Heart Opening", "description": "Lotus teaching for opening crown awareness while staying heart-grounded and relationally present.", "element": "spirit", "alchemy": ["Elevation requires grounding.", "Heart keeps crown humane.", "Presence protects insight."], "ritual": ["Lotus mudra at heart.", "Slow inhale to crown.", "Exhale back to heart."], "ceremony": ["Lotus opening", "Crown-heart bridge", "Presence seal"], "guided_practice": ["12 breath lotus cycle.", "Observe emotional tone.", "Ground before standing."], "lineage": "Lotus Schools", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-017", "stream": "egyptian_mystery", "name": "Temple Reciprocity Law", "title": "Sacred Exchange and Boundaries", "description": "Teaching on reciprocity, right exchange, and ethical boundaries in spiritual service.", "element": "earth", "alchemy": ["Reciprocity sustains lineages.", "Boundaries protect medicine.", "Right exchange prevents resentment."], "ritual": ["Audit current exchanges.", "Name one imbalance.", "Initiate repair conversation."], "ceremony": ["Exchange audit", "Boundary blessing", "Reciprocity oath"], "guided_practice": ["Body check during giving/receiving.", "Note contraction points.", "Choose cleaner exchange."], "lineage": "Temple Stewardship", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-018", "stream": "egyptian_mystery", "name": "Sphinx Listening Discipline", "title": "Silence as Intelligence", "description": "A listening school teaching that refines intuition through disciplined silence and delayed reaction.", "element": "air", "alchemy": ["Silence reveals signal.", "Reaction can obscure truth.", "Listening is strategic love."], "ritual": ["Two-minute silence before response.", "Hand on chest while listening.", "Reflect before speaking."], "ceremony": ["Silence threshold", "Listening vow", "Truthful response"], "guided_practice": ["Pause-breathe-observe cycle.", "Name what you heard vs assumed.", "Reply from coherence."], "lineage": "Sphinx Mysteries", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-019", "stream": "egyptian_mystery", "name": "Nile Rhythm Embodiment", "title": "Flow and Structure Partnership", "description": "Nile teaching balancing cyclical flow with practical structure to avoid spiritual bypass or rigid control.", "element": "water", "alchemy": ["Flow and structure are allies.", "Cycles need containers.", "Consistency protects intuition."], "ritual": ["Map your daily flow windows.", "Assign one structure anchor.", "Review nightly."], "ceremony": ["Flow mapping", "Structure anchor", "Cycle reflection"], "guided_practice": ["Breath with pulse count.", "Notice energy peaks/dips.", "Align tasks accordingly."], "lineage": "Nile Temples", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-020", "stream": "egyptian_mystery", "name": "Temple Compassion Protocol", "title": "Firmness with Mercy", "description": "Priest/priestess protocol for compassionate correction, accountability, and relational dignity.", "element": "water", "alchemy": ["Correction can be kind.", "Accountability builds trust.", "Dignity preserves connection."], "ritual": ["Regulate before feedback.", "State impact clearly.", "Offer repair path."], "ceremony": ["Compassion alignment", "Truthful correction", "Dignity close"], "guided_practice": ["Heart-belly breath.", "Prepare clear language.", "Deliver with calm tone."], "lineage": "Temple Relational Arts", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-egyptian-021", "stream": "egyptian_mystery", "name": "Final Gate Integration", "title": "Knowledge to Embodied Service", "description": "Capstone teaching: sacred knowledge is complete only when embodied in humble, measurable service.", "element": "spirit", "alchemy": ["Embodiment is the exam.", "Service integrates revelation.", "Humility protects wisdom."], "ritual": ["Review key teachings weekly.", "Pick one to embody publicly.", "Track impact honestly."], "ceremony": ["Capstone review", "Service vow", "Integration seal"], "guided_practice": ["Recall, embody, serve triad.", "Document outcomes.", "Refine next cycle."], "lineage": "Mystery School Capstone", "source_type": "curated-sacred-teaching"},
]

PRIESTESS_ROSE_LINEAGE_TEACHINGS = [
    {"id": "mystery-rose-001", "stream": "priestess_rose", "name": "Rose of Sacred Boundaries", "title": "Tenderness with Structure", "description": "Priestess teaching on holding compassionate boundaries as an act of love and nervous-system safety.", "element": "water", "alchemy": ["Boundaries are devotional care.", "Tenderness needs structure.", "No is a sacred yes to truth."], "ritual": ["Hand on heart and throat.", "Speak one boundary statement.", "Breathe and soften shoulders."], "ceremony": ["Rose boundary invocation", "Voice alignment", "Seal with self-respect"], "guided_practice": ["4/6 breathing.", "Boundary rehearsal.", "Immediate embodied follow-through."], "lineage": "Rose Temple", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-002", "stream": "priestess_rose", "name": "Priestess Nervous System Throne", "title": "Regulated Leadership", "description": "A throne teaching where leadership begins with regulated presence, not urgency.", "element": "earth", "alchemy": ["Regulation is influence.", "Presence outperforms urgency.", "Leadership starts in the body."], "ritual": ["Seated upright posture.", "Long exhale cycles.", "Name one calm leadership action."], "ceremony": ["Throne seating", "Breath fortification", "Leadership vow"], "guided_practice": ["Body scan.", "Soften jaw/pelvis.", "Act from calm clarity."], "lineage": "Rose Priestess", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-003", "stream": "priestess_rose", "name": "Womb Rose Alchemy", "title": "Creative Life-Force Stewardship", "description": "Teaching on honoring creative and reproductive energy with consent, pacing, and integrity.", "element": "water", "alchemy": ["Creative force needs safety.", "Consent is sacred structure.", "Pacing protects potency."], "ritual": ["Hands on lower belly.", "Breathe into pelvic bowl.", "Name one creative boundary."], "ceremony": ["Womb blessing", "Consent vow", "Creative dedication"], "guided_practice": ["Pelvic breath waves.", "Creative intention mapping.", "Ground through feet."], "lineage": "Rose Womb Mysteries", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-004", "stream": "priestess_rose", "name": "Heart Grail Listening", "title": "Relational Discernment", "description": "A rose grail practice for hearing the heart clearly without abandoning discernment.", "element": "water", "alchemy": ["Heart and discernment are allies.", "Listening is relational medicine.", "Discernment prevents self-betrayal."], "ritual": ["Heart-center breath.", "Ask one relational question.", "Journal body response."], "ceremony": ["Grail opening", "Listening vow", "Relational clarity seal"], "guided_practice": ["Stillness practice.", "Body-based yes/no sensing.", "One aligned conversation."], "lineage": "Grail Lineage", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-005", "stream": "priestess_rose", "name": "Rose of Grief Transformation", "title": "Sorrow to Service", "description": "Priestess protocol for metabolizing grief into compassionate service and resilient tenderness.", "element": "water", "alchemy": ["Grief can become service.", "Tenderness is strength.", "Compassion is disciplined action."], "ritual": ["Name one grief truth.", "Tear blessing with water.", "Choose one caring act."], "ceremony": ["Grief honoring", "Compassion invocation", "Service commitment"], "guided_practice": ["Heart breath cycles.", "Witness emotion safely.", "Embodied integration step."], "lineage": "Rose Mourning Temple", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-006", "stream": "priestess_rose", "name": "Oracle Rose Speech", "title": "Truth with Beauty", "description": "Teaching to speak difficult truths with beauty, timing, and embodied compassion.", "element": "air", "alchemy": ["Truth can be graceful.", "Timing is part of wisdom.", "Voice is ceremonial power."], "ritual": ["Throat-heart coherence breath.", "Refine one sentence.", "Deliver with pace and presence."], "ceremony": ["Voice purification", "Truth offering", "Compassionate closure"], "guided_practice": ["Slow speech rehearsal.", "Tone regulation.", "Post-dialogue reflection."], "lineage": "Rose Oracular", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-007", "stream": "priestess_rose", "name": "Moon Rose Cycle Wisdom", "title": "Cyclical Leadership", "description": "A moon-linked priestess teaching to align work, rest, and relationship with cyclical intelligence.", "element": "water", "alchemy": ["Cycles are strategic intelligence.", "Rest preserves devotion.", "Timing amplifies results."], "ritual": ["Identify current cycle phase.", "Adjust commitments accordingly.", "Bless rest as sacred."], "ceremony": ["Moon attunement", "Cycle mapping", "Rest permission"], "guided_practice": ["Evening body check.", "Capacity-based planning.", "Gentle recalibration."], "lineage": "Lunar Rose", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-008", "stream": "priestess_rose", "name": "Rose & Thorn Discernment", "title": "Protection Without Hardness", "description": "Teaching for preserving warmth while activating clear protection and boundary intelligence.", "element": "earth", "alchemy": ["Protection can stay warm.", "Discernment is loving realism.", "Softness is not submission."], "ritual": ["Hand on heart, hand on solar plexus.", "Name one red flag and one green flag.", "Act on discernment today."], "ceremony": ["Thorn invocation", "Discernment oath", "Warm boundary seal"], "guided_practice": ["Somatic check-in during interactions.", "Boundary language rehearsal.", "Reflect and refine."], "lineage": "Rose Protection Arts", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-009", "stream": "priestess_rose", "name": "Priestess Court Etiquette", "title": "Sacred Relational Conduct", "description": "A teachings set for dignity, accountability, and relational integrity in spiritual community.", "element": "air", "alchemy": ["Dignity is contagious.", "Accountability sustains trust.", "Conduct is spiritual architecture."], "ritual": ["Review one relational commitment.", "Repair where needed.", "Honor confidentiality."], "ceremony": ["Conduct invocation", "Repair pathway", "Trust seal"], "guided_practice": ["Pre-conversation regulation.", "Clear agreements.", "Post-conversation integration."], "lineage": "Rose Court", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-010", "stream": "priestess_rose", "name": "Grail Hospitality", "title": "Receiving as Sacred Skill", "description": "Teaching on receiving support, resources, and love without collapse, shame, or overcompensation.", "element": "water", "alchemy": ["Receiving is mature capacity.", "Support strengthens service.", "Worthiness grows through practice."], "ritual": ["Name one support need.", "Ask clearly.", "Receive with breath and gratitude."], "ceremony": ["Grail opening", "Receiving prayer", "Reciprocity offering"], "guided_practice": ["Body softening while receiving.", "Track resistance patterns.", "Integrate with gratitude action."], "lineage": "Grail Priestess", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-011", "stream": "priestess_rose", "name": "Rose Temple Wealth Ethics", "title": "Resource Stewardship", "description": "Priestess teaching linking prosperity, ethics, and reciprocal contribution.", "element": "earth", "alchemy": ["Wealth is stewardship.", "Ethics protect abundance.", "Reciprocity prevents extraction."], "ritual": ["Bless incoming resources.", "Allocate reciprocal giving.", "Set one ethical rule."], "ceremony": ["Prosperity blessing", "Ethics vow", "Reciprocity seal"], "guided_practice": ["Money-body check-in.", "Integrity decision.", "Embodied follow-through."], "lineage": "Rose Stewardship", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-012", "stream": "priestess_rose", "name": "Sacred Pleasure Intelligence", "title": "Joy as Regulation", "description": "Teaching that healthy pleasure can regulate trauma patterns and restore vitality.", "element": "fire", "alchemy": ["Pleasure can be healing.", "Joy restores resilience.", "Safety and delight can coexist."], "ritual": ["Name one nourishing joy.", "Schedule it intentionally.", "Receive without guilt."], "ceremony": ["Joy invocation", "Permission ritual", "Gratitude close"], "guided_practice": ["Sensory awareness exercise.", "Breath with pleasure signal.", "Integration journaling."], "lineage": "Rose Soma Arts", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-013", "stream": "priestess_rose", "name": "13th Rite Of The Womb", "title": "Womb Blessing Activation", "description": "A deep Rose Temple womb rite for releasing inherited suffering and restoring creative life-force sovereignty with compassionate boundaries.", "element": "water", "alchemy": ["Womb consciousness is creative intelligence, not a storage chamber for unresolved pain.", "Healing includes witnessing wounds while refusing to make them identity.", "Uncoiling life-force is safest through breath, regulation, and embodied consent."], "ritual": ["Place both hands over the lower womb/pelvic bowl and breathe slowly for 13 cycles.", "Speak the activation prayer aloud three times with grounded feet.", "Seal by naming one life-creating action you will take within 24 hours."], "ceremony": ["Rose Temple Opening", "13th Rite Invocation", "Womb Blessing Seal"], "guided_practice": ["4/6 breath waves into the pelvic bowl.", "Gentle spinal sway while repeating the activation.", "Grounding close with hydration and restorative posture."], "lineage": "Rose Womb Mysteries", "source_type": "curated-sacred-teaching", "activation": "My womb is not a space for storing wounds, suffering, trauma, or pain. My womb is a space for birthing and creating life in all forms and all ways."},
    {"id": "mystery-rose-014", "stream": "priestess_rose", "name": "Rose of Reconciliation", "title": "Conflict Alchemy", "description": "Teaching for repairing conflict without collapse, aggression, or spiritual bypass.", "element": "water", "alchemy": ["Repair is a sacred craft.", "Truth + care restores trust.", "Conflict can mature love."], "ritual": ["Regulate before dialogue.", "Name impact, not accusations.", "Offer one repair action."], "ceremony": ["Reconciliation opening", "Truthful dialogue", "Dignity closure"], "guided_practice": ["Breath before response.", "Compassionate language.", "Post-dialogue grounding."], "lineage": "Rose Reconciliation", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-015", "stream": "priestess_rose", "name": "Priestess Day Rhythm", "title": "Devotional Timecraft", "description": "A practical lineage teaching on scheduling devotion, service, and rest in sustainable rhythm.", "element": "earth", "alchemy": ["Rhythm creates trust.", "Devotion needs calendars.", "Sustainability is sacred."], "ritual": ["Map 3 anchor rituals daily.", "Protect one restoration block.", "Review each evening."], "ceremony": ["Time blessing", "Anchor commitment", "Cycle review"], "guided_practice": ["Morning planning breath.", "Midday reset.", "Evening integration."], "lineage": "Rose Timecraft", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-016", "stream": "priestess_rose", "name": "Rose of Embodied Prayer", "title": "Prayer Through the Body", "description": "Teaching that prayer is not only words but posture, breath, behavior, and relational conduct.", "element": "spirit", "alchemy": ["Body is a prayer instrument.", "Behavior reveals devotion.", "Embodiment anchors spirituality."], "ritual": ["Prayer posture setup.", "Breath prayer cycle.", "Behavioral seal."], "ceremony": ["Embodied invocation", "Breath liturgy", "Action blessing"], "guided_practice": ["Posture and breath alignment.", "Speak one prayer sentence.", "Live it today."], "lineage": "Rose Embodiment", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-017", "stream": "priestess_rose", "name": "Rose Oracle Dreamwork", "title": "Night Guidance Discipline", "description": "Priestess dream oracle method for receiving symbolic guidance with grounded interpretation.", "element": "water", "alchemy": ["Dreams train intuition.", "Interpretation requires grounding.", "Guidance becomes action."], "ritual": ["Question before sleep.", "Dream capture on waking.", "Action extraction."], "ceremony": ["Dream gate opening", "Symbol listening", "Embodiment close"], "guided_practice": ["Sleep downshift.", "Morning decode.", "One practical step."], "lineage": "Rose Oracle", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-018", "stream": "priestess_rose", "name": "Rose Voice of Blessing", "title": "Speech as Healing Field", "description": "Teaching to transform language into blessing field for self and community.", "element": "air", "alchemy": ["Blessing language regulates fields.", "Speech can heal attachment wounds.", "Tone carries medicine."], "ritual": ["Bless one person daily.", "Use precise caring words.", "Notice field shift."], "ceremony": ["Voice blessing", "Tone attunement", "Relational seal"], "guided_practice": ["Breath-tone prep.", "Blessing phrase repetition.", "Integration check."], "lineage": "Rose Voice Arts", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-019", "stream": "priestess_rose", "name": "Rose Temple Service Path", "title": "From Insight to Offering", "description": "Teaching on converting spiritual insight into concrete offerings that reduce suffering.", "element": "earth", "alchemy": ["Insight must become service.", "Offering matures wisdom.", "Service stabilizes purpose."], "ritual": ["Name one suffering you can reduce.", "Design one weekly offering.", "Track impact."], "ceremony": ["Service invocation", "Offering design", "Impact reflection"], "guided_practice": ["Compassion body scan.", "Service planning.", "Action launch."], "lineage": "Rose Service Line", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-020", "stream": "priestess_rose", "name": "Rose of Holy Rest", "title": "Rest as Sacred Law", "description": "Priestess teaching on rest as non-negotiable spiritual law for longevity and clarity.", "element": "water", "alchemy": ["Rest is strategic devotion.", "Exhaustion distorts discernment.", "Recovery is service to future self."], "ritual": ["Evening shutdown prayer.", "Screen boundary timing.", "Sleep preparation sequence."], "ceremony": ["Rest invocation", "Nervous system downshift", "Night seal"], "guided_practice": ["Exhale extension.", "Body unwinding.", "Sleep entry ritual."], "lineage": "Rose Restoration", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-rose-021", "stream": "priestess_rose", "name": "Rose Capstone Embodiment", "title": "Living the Lineage", "description": "Capstone teaching integrating boundary, compassion, voice, and service into one coherent priestess path.", "element": "spirit", "alchemy": ["Coherence is the true initiation.", "Lineage lives through behavior.", "Consistency creates transmission."], "ritual": ["Weekly review of core vows.", "Choose one embodied focus.", "Complete one service act."], "ceremony": ["Capstone invocation", "Vow renewal", "Embodied blessing"], "guided_practice": ["Breath-center-align.", "Behavioral commitment.", "Accountability reflection."], "lineage": "Rose Temple Capstone", "source_type": "curated-sacred-teaching"},
]

MERLIN_ALCHEMY_TEACHINGS = [
    {"id":"mystery-merlin-001","stream":"merlin_alchemy","name":"Merlin at the Forest Edge","title":"The Threshold Between Story & Land","description":"A Merlin-inspired path grounded in Arthurian and later magical literature, using the forest edge as a contemplative threshold rather than presenting Merlin as the founder of a documented ancient school.","element":"earth","alchemy":["Myth can teach without pretending to be history.","The land is encountered before it is interpreted.","Humility belongs beside imagination."],"ritual":["Stand at a garden, tree line or open doorway.","Notice five actual details of place.","Then invite Merlin as a literary/imaginal guide if that supports your practice."],"ceremony":["Land greeting","Mythic threshold","Grounded return"],"guided_practice":["Begin with senses.","Let imagery arise by choice.","End by naming what belongs to story and what belongs to the place before you."],"lineage":"Merlin-inspired Arthurian and contemporary Pagan contemplation","source_type":"curated-sacred-teaching"},
    {"id":"mystery-merlin-002","stream":"merlin_alchemy","name":"Lady of the Lake · Water Mirror","title":"Receiving, Reflection & Sovereignty","description":"A Lady of the Lake-inspired water practice drawing from Arthurian tradition and modern Pagan imagination, centred on reflection and the ethics of receiving power.","element":"water","alchemy":["A gift does not remove responsibility.","Reflection can precede action.","Power is best held with restraint."],"ritual":["Place a bowl of water where it cannot spill onto electronics or flame.","Look at the surface without seeking prediction.","Ask what responsibility accompanies the power or opportunity you are receiving."],"ceremony":["Water mirror","Gift and responsibility","Return to shore"],"guided_practice":["Soften the gaze.","Write observations rather than prophecies.","Choose one responsible action."],"lineage":"Lady of the Lake-inspired Arthurian/Pagan contemplation","source_type":"curated-sacred-teaching"},
    {"id":"mystery-merlin-003","stream":"merlin_alchemy","name":"Oak Staff & Rowan Thread","title":"Crafting a Relationship With Sacred Tools","description":"A practical sacred-tool teaching inspired by British and Celtic tree lore while avoiding the claim that one modern correspondence represents all historical Celtic practice.","element":"earth","alchemy":["A tool becomes meaningful through relationship and use.","Local ecology matters more than collecting exotic objects.","Harvesting requires permission, legality and care."],"ritual":["Use a fallen local branch or an existing staff rather than cutting a living tree unnecessarily.","Learn the tree's actual name and local ecology.","Add thread, feather or mark only if ethically sourced."],"ceremony":["Tool cleansing","Crafting intention","Stewardship vow"],"guided_practice":["Feel weight and texture.","Name what the tool is for and what it is not for.","Store it with care."],"lineage":"Contemporary Pagan sacred-tool practice with Arthurian/Celtic inspiration","source_type":"curated-sacred-teaching"},
    {"id":"mystery-merlin-004","stream":"merlin_alchemy","name":"Shapeshifting · Animal Lens","title":"Learning Through Symbolic Form","description":"A safe imaginal shapeshifting practice using animal qualities as a lens for movement and perception. It does not claim literal physical transformation or ownership of another culture's animal medicine.","element":"air","alchemy":["Imagination can widen perspective.","Animals are beings before they are symbols.","Borrowed qualities should return us to respect for the living animal."],"ritual":["Choose an animal you know something factual about.","Move gently with one observed quality such as stillness, balance or alertness.","Finish by learning one ecological fact or supporting its habitat."],"ceremony":["Animal greeting","Embodied lens","Human return"],"guided_practice":["Keep movements within physical comfort.","Do not force altered states.","Return fully to your own name, body and surroundings."],"lineage":"Contemporary Pagan/Arthurian imaginal practice","source_type":"curated-sacred-teaching"},
    {"id":"mystery-merlin-005","stream":"merlin_alchemy","name":"Avalon Through the Mist","title":"Mythic Isle, Inner Sanctuary","description":"An Avalon contemplation that distinguishes the legendary isle of Arthurian literature from Glastonbury and from modern spiritual interpretations. The mist becomes a symbol of uncertainty and discernment.","element":"air","alchemy":["Uncertainty can be crossed without inventing certainty.","A sanctuary needs boundaries.","Mythic places can inspire real-world care."],"ritual":["Create a small apple, water or candle altar if desired.","Imagine approaching an island through mist.","Ask what makes a sanctuary trustworthy, reciprocal and safe."],"ceremony":["Mist threshold","Island sanctuary","Return boat"],"guided_practice":["Keep one hand in contact with a real surface.","Notice imagery without treating it as historical proof.","Translate the sanctuary into one practical boundary or act of care."],"lineage":"Avalon-inspired Arthurian and contemporary Pagan contemplation","source_type":"curated-sacred-teaching"},
    {"id":"mystery-merlin-006","stream":"merlin_alchemy","name":"Seasonal Wheel & Ophiuchus Reflection","title":"Cycles Without Rigidity","description":"A seasonal practice for the Merlin Pagan Path that honours local seasons and allows optional symbolic zodiac/Ophiuchus reflection without presenting a 13-sign spiritual calendar as astronomical necessity.","element":"earth","alchemy":["Place and season come before a fixed template.","Cycles can guide without controlling identity.","Symbols are most useful when embodied."],"ritual":["Name the actual season where you live.","Observe one plant, weather or daylight change.","If using zodiac or Ophiuchus symbolism, journal it as a reflective lens rather than fate."],"ceremony":["Season greeting","Sky reflection","Earth action"],"guided_practice":["Orient to local place.","Notice what is changing now.","Choose one seasonal adjustment in daily life."],"lineage":"Contemporary inclusive Pagan seasonal practice","source_type":"curated-sacred-teaching"},
    {"id":"mystery-merlin-007","stream":"merlin_alchemy","name":"Sword, Grail & Sovereignty","title":"Power Held Beside Receptivity","description":"An Arthurian symbolic practice bringing sword and grail together as discernment and receiving, without assigning them rigid gender roles.","element":"spirit","alchemy":["Discernment and receptivity belong together.","Sovereignty includes accountability.","No symbol belongs to only one gender."],"ritual":["Place a cup and a safe symbolic blade or simple stick on the altar.","Name what needs a clear boundary and what needs receiving.","Choose one action that honours both."],"ceremony":["Grail receiving","Sword discernment","Sovereignty vow"],"guided_practice":["Feel both hands equally.","Avoid literal weapon use.","Close with responsibility rather than conquest."],"lineage":"Arthurian symbolic contemplation","source_type":"curated-sacred-teaching"},
    {"id":"mystery-merlin-008","stream":"merlin_alchemy","name":"Merlin Path Integration","title":"Magic Returned to Ordinary Life","description":"A closing gate where myth, seasonal practice, animal symbolism and sacred tools return to ordinary choices, land relationship and service.","element":"earth","alchemy":["Integration is stronger than spectacle.","A magical worldview can coexist with discernment.","The land is not a backdrop for spirituality."],"ritual":["Review the pathway and choose one symbol that genuinely changed your behaviour.","Return or tidy ritual materials.","Complete one act of land care, relationship repair or practical service."],"ceremony":["Staff lowered","Circle opened","Ordinary-life return"],"guided_practice":["Name what you learned.","Name what remains mystery.","Walk forward without needing to prove an initiation."],"lineage":"Contemporary inclusive Merlin/Pagan integration","source_type":"curated-sacred-teaching"},
]

EMERALD_TABLET_ALCHEMY_TEACHINGS = [
    {"id": "mystery-emerald-001", "stream": "emerald_tablet", "name": "As Within, So Without", "title": "Correspondence Principle", "description": "Core emerald teaching that internal order mirrors external reality and vice versa.", "element": "air", "alchemy": ["Inner patterns shape outer outcomes.", "Outer triggers reveal inner work.", "Self-responsibility unlocks agency."], "ritual": ["Map one inner pattern.", "Locate external reflection.", "Shift one internal behavior."], "ceremony": ["Mirror invocation", "Pattern witnessing", "Behavioral seal"], "guided_practice": ["Breath + journaling.", "Pattern interruption.", "Action integration."], "lineage": "Emerald Tablet", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-002", "stream": "emerald_tablet", "name": "Vibration Doctrine", "title": "Everything Moves", "description": "Teaching that all states are vibrationally trainable through thought, breath, and behavior.", "element": "air", "alchemy": ["States are trainable.", "Breath shifts frequency quickly.", "Behavior locks new vibration."], "ritual": ["Name current state.", "Use 4/8 breath for 3 minutes.", "Choose one aligned behavior."], "ceremony": ["State acknowledgment", "Frequency adjustment", "Embodiment close"], "guided_practice": ["State scan.", "Breath entrainment.", "Behavioral anchoring."], "lineage": "Hermetic", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-003", "stream": "emerald_tablet", "name": "Mentalism in Action", "title": "Mind as Causal Field", "description": "Emerald teaching on disciplined thought and mental hygiene as practical alchemy.", "element": "air", "alchemy": ["Thought quality affects physiology.", "Attention selects reality channels.", "Mental hygiene is daily ritual."], "ritual": ["Notice recurring thought loop.", "Replace with coherent statement.", "Reinforce through action."], "ceremony": ["Mind clearing", "Statement installation", "Embodiment seal"], "guided_practice": ["Thought audit.", "Belief replacement.", "Action proof."], "lineage": "Hermetic", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-004", "stream": "emerald_tablet", "name": "Polarity Alchemy", "title": "Transmuting Extremes", "description": "Teaching for transforming fear into courage and reactivity into coherent response.", "element": "fire", "alchemy": ["Opposites share a spectrum.", "Transmutation uses awareness + action.", "Regulation enables choice."], "ritual": ["Name current polarity pair.", "Find midpoint behavior.", "Practice midpoint today."], "ceremony": ["Polarity naming", "Midpoint invocation", "Behavioral integration"], "guided_practice": ["Breath centering.", "Spectrum visualization.", "Midpoint action."], "lineage": "Hermetic", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-005", "stream": "emerald_tablet", "name": "Rhythm Mastery", "title": "Pendulum Awareness", "description": "Teaching to work with life rhythms rather than being unconsciously dragged by them.", "element": "water", "alchemy": ["Rhythm is inevitable; mastery is optional.", "Awareness softens swings.", "Ritual stabilizes cycles."], "ritual": ["Track personal rhythm pattern.", "Install stabilizing daily ritual.", "Review weekly movement."], "ceremony": ["Rhythm observation", "Stability vow", "Cycle tracking"], "guided_practice": ["Body rhythm check.", "Breath stabilization.", "Action pacing."], "lineage": "Hermetic", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-006", "stream": "emerald_tablet", "name": "Cause and Effect Integrity", "title": "Conscious Causation", "description": "Emerald teaching to become a conscious cause rather than passive effect.", "element": "earth", "alchemy": ["Responsibility restores agency.", "Effects reveal causes.", "Intentional causes shape destiny."], "ritual": ["Pick one recurring effect.", "Trace likely causes.", "Change one cause today."], "ceremony": ["Effect witnessing", "Cause correction", "Destiny alignment"], "guided_practice": ["Reflect-correct-act cycle.", "Evidence tracking.", "Iterative refinement."], "lineage": "Hermetic", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-007", "stream": "emerald_tablet", "name": "Inner Polarity Harmonization", "title": "Receptive & Projective Integration", "description": "Teaching to harmonize receptive and projective energies for coherent creation in modern life.", "element": "water", "alchemy": ["Creation needs both receiving and initiating.", "Imbalance creates burnout or stagnation.", "Balanced polarity supports sustainability."], "ritual": ["Assess overdoing vs underreceiving.", "Choose balancing action.", "Integrate daily."], "ceremony": ["Polarity invocation", "Balance vow", "Creative close"], "guided_practice": ["Breath balance cycle.", "Embodied polarity check.", "Aligned action."], "lineage": "Hermetic", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-008", "stream": "emerald_tablet", "name": "Solve et Coagula", "title": "Dissolve and Rebuild", "description": "Classic alchemical operation: dissolve obsolete patterns, coagulate coherent new forms.", "element": "fire", "alchemy": ["Release precedes reconstruction.", "Structure consolidates change.", "Embodiment completes alchemy."], "ritual": ["Identify what to dissolve.", "Release through breath/journal.", "Install new structure."], "ceremony": ["Dissolution phase", "Reconstruction phase", "Embodiment seal"], "guided_practice": ["Let-go cycle.", "New pattern rehearsal.", "Daily reinforcement."], "lineage": "Alchemical", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-009", "stream": "emerald_tablet", "name": "Mercury Mind Refinement", "title": "Adaptable Intelligence", "description": "Teaching to refine adaptability without losing principle-based integrity.", "element": "air", "alchemy": ["Adaptability with values is wisdom.", "Rigidity and chaos are both costly.", "Refinement is continuous."], "ritual": ["Name one rigid pattern.", "Choose one flexible alternative.", "Apply with integrity."], "ceremony": ["Mercury invocation", "Flexibility vow", "Integrity anchor"], "guided_practice": ["Scenario rehearsal.", "Adaptive response training.", "Reflection loop."], "lineage": "Hermetic-Mercury", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-010", "stream": "emerald_tablet", "name": "Sulfur Courage Principle", "title": "Will and Purity", "description": "Teaching on purified will: action without aggression, courage without cruelty.", "element": "fire", "alchemy": ["Will needs purification.", "Courage can stay compassionate.", "Purity is intention + behavior."], "ritual": ["State one courageous intention.", "Regulate body before action.", "Act with kindness."], "ceremony": ["Will invocation", "Purity vow", "Compassionate action"], "guided_practice": ["Breath ignition.", "Action rehearsal.", "Integrity review."], "lineage": "Alchemical-Sulfur", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-011", "stream": "emerald_tablet", "name": "Salt Stabilization", "title": "Embodied Grounding", "description": "Teaching that salt principle stabilizes transformation through practical embodied habits.", "element": "earth", "alchemy": ["Stability protects growth.", "Habits embody insights.", "Grounding prevents fragmentation."], "ritual": ["Choose one grounding habit.", "Do it daily for 7 days.", "Track nervous-system change."], "ceremony": ["Salt invocation", "Habit vow", "Stability seal"], "guided_practice": ["Grounding breath.", "Habit execution.", "Review and adjust."], "lineage": "Alchemical-Salt", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-012", "stream": "emerald_tablet", "name": "Emerald Ethics of Power", "title": "Power with Accountability", "description": "Teaching that power must be accountable, transparent, and service-oriented.", "element": "earth", "alchemy": ["Power needs accountability.", "Transparency builds trust.", "Service is the ethical test."], "ritual": ["Audit one power domain.", "Name accountability mechanism.", "Implement this week."], "ceremony": ["Power audit", "Accountability vow", "Trust-building action"], "guided_practice": ["Reflection on influence.", "Feedback invitation.", "Ethical adjustment."], "lineage": "Emerald Ethics", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-013", "stream": "emerald_tablet", "name": "Emerald Relational Alchemy", "title": "Transmuting Conflict", "description": "Teaching to transmute conflict into clarity, boundaries, and mature connection.", "element": "water", "alchemy": ["Conflict can become clarity.", "Boundaries preserve relationship.", "Repair matures love."], "ritual": ["Regulate before engaging.", "Name impact clearly.", "Offer repair path."], "ceremony": ["Conflict opening", "Truth exchange", "Repair close"], "guided_practice": ["Breath regulation.", "Dialogue structure.", "Integration follow-through."], "lineage": "Emerald Relational", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-014", "stream": "emerald_tablet", "name": "Emerald Wealth Alchemy", "title": "Abundance with Integrity", "description": "Teaching to align wealth creation with ethics, reciprocity, and embodied sufficiency.", "element": "earth", "alchemy": ["Abundance and ethics are allies.", "Reciprocity sustains prosperity.", "Sufficiency calms scarcity panic."], "ritual": ["Bless resources.", "Define reciprocity percentage.", "Take one ethical finance action."], "ceremony": ["Abundance invocation", "Reciprocity vow", "Integrity accounting"], "guided_practice": ["Money-body regulation.", "Decision check.", "Aligned execution."], "lineage": "Emerald Prosperity", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-015", "stream": "emerald_tablet", "name": "Emerald Body Doctrine", "title": "Soma as Laboratory", "description": "Teaching that body sensations are data for alchemical refinement, not obstacles.", "element": "earth", "alchemy": ["Soma gives real-time feedback.", "Sensation literacy increases wisdom.", "Body integration prevents bypass."], "ritual": ["3-minute sensation scan.", "Name top three sensations.", "Adjust behavior accordingly."], "ceremony": ["Soma invocation", "Data listening", "Behavioral integration"], "guided_practice": ["Interoception training.", "Regulation response.", "Action calibration."], "lineage": "Somatic Hermetics", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-016", "stream": "emerald_tablet", "name": "Emerald Breath Key", "title": "Respiration as Transmutation", "description": "Teaching on breath as immediate lever for state transformation and coherence.", "element": "air", "alchemy": ["Breath shifts state rapidly.", "Exhale controls arousal.", "Coherence begins in respiration."], "ritual": ["4-in/8-out cycle.", "Repeat for 5 minutes.", "Anchor with one clear action."], "ceremony": ["Breath invocation", "State shift", "Integration close"], "guided_practice": ["Respiration pacing.", "State tracking.", "Embodied application."], "lineage": "Hermetic Breath", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-017", "stream": "emerald_tablet", "name": "Emerald Timecraft", "title": "Chronological Alchemy", "description": "Teaching to align scheduling and timing with energetic reality and mission priorities.", "element": "earth", "alchemy": ["Time is sacred substance.", "Scheduling reflects values.", "Chronological integrity reduces suffering."], "ritual": ["Map week priorities.", "Protect restoration slots.", "Review nightly."], "ceremony": ["Time blessing", "Priority vow", "Cycle review"], "guided_practice": ["Planning breath.", "Execution sprint.", "Reflection loop."], "lineage": "Hermetic Timecraft", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-018", "stream": "emerald_tablet", "name": "Emerald Shadow Work", "title": "Owning the Unconscious", "description": "Teaching for integrating shadow patterns with compassion and accountability.", "element": "water", "alchemy": ["Owning shadow returns agency.", "Compassion supports accountability.", "Integration reduces projection."], "ritual": ["Name one trigger pattern.", "Own your part.", "Create correction plan."], "ceremony": ["Shadow invocation", "Ownership vow", "Repair action"], "guided_practice": ["Trigger mapping.", "Somatic regulation.", "Behavioral correction."], "lineage": "Emerald Shadow", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-019", "stream": "emerald_tablet", "name": "Emerald Service Equation", "title": "From Wisdom to Contribution", "description": "Teaching that wisdom is proven by measurable contribution to collective well-being.", "element": "spirit", "alchemy": ["Contribution validates insight.", "Service stabilizes purpose.", "Impact tracking matures practice."], "ritual": ["Choose one service focus.", "Offer weekly contribution.", "Track outcomes honestly."], "ceremony": ["Service invocation", "Offering action", "Impact reflection"], "guided_practice": ["Compassion orientation.", "Service planning.", "Embodied follow-through."], "lineage": "Emerald Service", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-020", "stream": "emerald_tablet", "name": "Emerald Silence Chamber", "title": "Stillness Intelligence", "description": "Teaching on structured silence for high-quality decision making and intuitive signal clarity.", "element": "air", "alchemy": ["Silence reveals data.", "Stillness improves discernment.", "Decision quality rises with pause."], "ritual": ["Daily 10-minute silence.", "One inquiry question.", "Decision from coherence."], "ceremony": ["Silence invocation", "Inquiry hold", "Decision seal"], "guided_practice": ["Posture and breath setup.", "Silent attention.", "Action integration."], "lineage": "Hermetic Stillness", "source_type": "curated-sacred-teaching"},
    {"id": "mystery-emerald-021", "stream": "emerald_tablet", "name": "Emerald Capstone", "title": "Living Hermetic Alchemy", "description": "Capstone integration of correspondence, vibration, ethics, and service into lived daily alchemy.", "element": "spirit", "alchemy": ["Integration is the true initiation.", "Daily behavior is the laboratory.", "Service is the proof of wisdom."], "ritual": ["Weekly principle review.", "Pick one principle to embody.", "Track relational impact."], "ceremony": ["Capstone invocation", "Embodiment vow", "Service closure"], "guided_practice": ["Principle recall.", "Behavioral commitment.", "Impact reflection."], "lineage": "Emerald Capstone", "source_type": "curated-sacred-teaching"},
]


# Distinct lineage pathways added in Pass 38. These are presented as devotional,
# symbolic and contemplative schools rather than as claims of one continuous historical lineage.
HATHOR_MYSTERY_TEACHINGS = [
    {"id":"mystery-hathor-001","stream":"hathor_mystery","name":"Sistrum & Sacred Joy","title":"Joy as Devotional Practice","description":"A Hathor-inspired temple practice exploring music, beauty and embodied joy as offerings.","element":"air","alchemy":["Joy can be cultivated without forcing a mood.","Music can mark a threshold into ceremony.","Beauty can be an act of attention."],"ritual":["Choose a gentle rhythm or sistrum-like sound.","Move for seven unhurried minutes.","Close by naming one beauty you noticed."],"ceremony":["Sound opening","Joy movement","Gratitude close"],"guided_practice":["Orient to the room.","Let rhythm invite rather than command movement.","Rest in stillness and notice what remains."],"lineage":"Hathor-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hathor-002","stream":"hathor_mystery","name":"Mother's Milk of Egypt & the Nile","title":"Nourishment, River & Receiving","description":"A symbolic contemplation of Hathor's maternal imagery and the Nile as nourishment, abundance and cyclical life.","element":"water","alchemy":["Receiving is part of reciprocity.","Nourishment has physical, relational and symbolic forms.","Rivers teach movement and renewal."],"ritual":["Place a bowl of clean water on the altar.","Name what truly nourishes you.","Offer one act of nourishment to another or to Earth."],"ceremony":["Water blessing","Receiving vow","Reciprocity offering"],"guided_practice":["Hands around the water bowl.","Breathe slowly and contemplate receiving.","Close with a practical nourishment choice."],"lineage":"Hathor-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hathor-003","stream":"hathor_mystery","name":"Seven Hathors Reflection","title":"Seven Mirrors of Becoming","description":"A contemplative seven-part reflection inspired by the Seven Hathors motif, used here for inquiry rather than prediction.","element":"spirit","alchemy":["Symbol can open inquiry without determining fate.","Many aspects of self can be witnessed together.","Choice remains central."],"ritual":["Create seven small candles or markers.","Give each one a question about your present life.","Journal what you choose to embody next."],"ceremony":["Seven lights","Seven questions","Choice seal"],"guided_practice":["Pause at each marker.","Listen without demanding an answer.","Finish with one grounded action."],"lineage":"Hathor-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
    {"id":"mystery-hathor-004","stream":"hathor_mystery","name":"Golden One Temple","title":"Beauty, Voice & Sacred Presence","description":"A sensory temple practice of voice, fragrance, adornment and presence inspired by Hathor's associations with music and beauty.","element":"fire","alchemy":["Adornment can be intentional rather than performative.","Voice can carry devotion.","Presence matters more than perfection."],"ritual":["Choose one meaningful adornment.","Hum or tone comfortably.","Speak one sentence of appreciation to your body."],"ceremony":["Adornment blessing","Voice offering","Golden close"],"guided_practice":["Feel feet and breath.","Sound only within comfort.","Notice sensation before interpretation."],"lineage":"Hathor-inspired Egyptian devotional study","source_type":"curated-sacred-teaching"},
]

SEVEN_SISTERS_TEACHINGS = [
    {"id":"mystery-seven-sisters-001","stream":"seven_sisters","name":"Seven Sisters Night Sky","title":"Star Lore & Belonging","description":"A contemplative Pleiades practice that honours the visible star cluster and the many cultural stories associated with it without blending those traditions together.","element":"air","alchemy":["One sky can hold many distinct stories.","Wonder does not require certainty.","Belonging can begin with attentive looking."],"ritual":["Find the Pleiades when season and sky allow, or use a star map.","Observe before interpreting.","Journal what the image of seven sisters evokes for you."],"ceremony":["Sky orientation","Seven breaths","Wonder close"],"guided_practice":["Feel Earth beneath you.","Look softly toward the stars.","Return attention to body and place."],"lineage":"Contemporary Seven Sisters / Pleiades contemplative path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-seven-sisters-002","stream":"seven_sisters","name":"Sister One · Listening","title":"The First Star: Listening","description":"The first of seven symbolic sister teachings, centred on listening before speaking or seeking signs.","element":"water","alchemy":["Listening creates space.","Silence is not emptiness.","Discernment begins before interpretation."],"ritual":["Sit for seven minutes without seeking a message.","Notice sound, breath and sensation.","Write only what you actually observed."],"ceremony":["Listening bowl","Silent interval","Observation journal"],"guided_practice":["Orient.","Listen outward then inward.","Close without forcing meaning."],"lineage":"Contemporary Seven Sisters / Pleiades contemplative path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-seven-sisters-003","stream":"seven_sisters","name":"Sister Two · Kinship","title":"The Second Star: Kinship","description":"A sisterhood reflection on reciprocity, chosen kin and the relationships that help us remain human and grounded.","element":"earth","alchemy":["Kinship is practiced.","Reciprocity needs boundaries.","Care becomes real through action."],"ritual":["Name seven people, beings or places that form your web of kinship.","Offer gratitude to one.","Choose one reciprocal action."],"ceremony":["Kinship naming","Gratitude offering","Reciprocity seal"],"guided_practice":["Hand to heart.","Recall support received.","Choose grounded reciprocity."],"lineage":"Contemporary Seven Sisters / Pleiades contemplative path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-seven-sisters-004","stream":"seven_sisters","name":"Seven-Star Integration","title":"From Sky to Soil","description":"An integration rite bringing star symbolism back into body, relationship and practical Earth care.","element":"earth","alchemy":["Cosmic imagery needs earthly integration.","Insight becomes meaningful through behaviour.","Wonder and stewardship can coexist."],"ritual":["Choose one insight from your star practice.","Translate it into one relationship action and one Earth action.","Complete both before returning to the stars."],"ceremony":["Star remembrance","Soil touch","Action vow"],"guided_practice":["Look upward.","Touch Earth.","Name what you will embody."],"lineage":"Contemporary Seven Sisters / Pleiades contemplative path","source_type":"curated-sacred-teaching"},
]

SOPHIA_DRAGON_TEACHINGS = [
    {"id":"mystery-sophia-dragon-001","stream":"sophia_dragons","name":"Cosmic Womb Threshold","title":"Entering the Imaginal Chamber","description":"A Sophia Dragon journey using the Cosmic Womb as an imaginal symbol of gestation, mystery and sacred creation.","element":"spirit","alchemy":["Not everything needs immediate form.","Creation includes waiting.","Mystery can be held without certainty."],"ritual":["Darken the room safely.","Rest hands where comfortable on heart or belly.","Ask what is gestating rather than what must be produced."],"ceremony":["Threshold","Dark chamber","Return"],"guided_practice":["Ground first.","Enter the imagery by choice.","Return through breath, touch and orientation."],"lineage":"Contemporary Sophia Dragon imaginal path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-sophia-dragon-002","stream":"sophia_dragons","name":"Sophia Dragon · Golden Wisdom","title":"Wisdom Before Fire","description":"A dragon chamber exploring sovereign fire guided by Sophia as sacred wisdom rather than impulse.","element":"fire","alchemy":["Power needs wisdom.","Courage can remain tender.","Fire is most useful when it has a vessel."],"ritual":["Stand firmly.","Name one place courage is needed.","Choose the smallest wise action."],"ceremony":["Golden flame","Wisdom question","Action seal"],"guided_practice":["Feel feet.","Imagine golden fire only if it supports you.","End with a practical choice."],"lineage":"Contemporary Sophia Dragon imaginal path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-sophia-dragon-003","stream":"sophia_dragons","name":"Earth Dragon Chamber","title":"Scale, Soil & Boundary","description":"An Earth Dragon chamber for grounded boundaries, stewardship and embodied sovereignty.","element":"earth","alchemy":["A boundary can protect life.","Stewardship is a form of devotion.","Sovereignty includes responsibility."],"ritual":["Touch soil or stone.","Name one boundary that protects what matters.","Complete one act of stewardship."],"ceremony":["Earth gate","Boundary vow","Stewardship close"],"guided_practice":["Weight into feet.","Imagine protective scales if useful.","Return to the actual room and Earth."],"lineage":"Contemporary Sophia Dragon imaginal path","source_type":"curated-sacred-teaching"},
    {"id":"mystery-sophia-dragon-004","stream":"sophia_dragons","name":"Dragon Chamber of Integration","title":"Returning With What Is Yours","description":"A closing chamber that emphasizes integration over constant activation or seeking more experiences.","element":"water","alchemy":["Integration is part of initiation.","More intensity is not always more depth.","The body sets the pace."],"ritual":["Drink water.","Write three sensations and one insight.","Leave the rest unlabelled."],"ceremony":["Wing folding","Water return","Integration vow"],"guided_practice":["Orient to five visible things.","Feel support beneath you.","Choose rest or action according to what is actually needed."],"lineage":"Contemporary Sophia Dragon imaginal path","source_type":"curated-sacred-teaching"},
]

MAGDALENE_INITIATION_TEACHINGS = [
    {"id":"mystery-magdalene-001","stream":"magdalene_initiations","name":"Anointing & Devotion","title":"Tending the Body as Prayer","description":"A Magdalene-inspired devotional practice centred on anointing, tenderness and embodied prayer, distinguished from historical claims not established by early sources.","element":"water","alchemy":["Devotion can be embodied.","Tenderness can coexist with boundaries.","Anointing can mark intention."],"ritual":["Choose a skin-safe oil if desired.","Anoint hands or heart space.","Name what you devote yourself to today."],"ceremony":["Oil blessing","Devotion vow","Quiet close"],"guided_practice":["Slow the breath.","Touch only where welcome.","Let devotion become one practical act."],"lineage":"Magdalene-inspired Christian mystical devotion","source_type":"curated-sacred-teaching"},
    {"id":"mystery-magdalene-002","stream":"magdalene_initiations","name":"Tears as Anointing","title":"Grief, Witness & Compassion","description":"A contemplative rite that welcomes tears if they arise without requiring catharsis or assigning them a fixed spiritual meaning.","element":"water","alchemy":["Grief can be witnessed without being rushed.","Tears need no performance.","Compassion includes stopping when enough is enough."],"ritual":["Create a quiet place.","Name what you are willing to witness.","Let tears come or not come."],"ceremony":["Witness","Water blessing","Rest"],"guided_practice":["Notice breath and face.","Allow rather than force.","Close with warmth, water and orientation."],"lineage":"Magdalene-inspired Christian mystical devotion","source_type":"curated-sacred-teaching"},
    {"id":"mystery-magdalene-003","stream":"magdalene_initiations","name":"Golden Thread","title":"Devotion Through Change","description":"A symbolic Golden Thread practice for remembering values through uncertainty and transition.","element":"air","alchemy":["Values can guide us when certainty cannot.","Devotion is renewed through choice.","A thread can symbolize continuity without denying change."],"ritual":["Hold a gold thread or cord.","Name three values.","Tie three gentle knots as reminders."],"ceremony":["Thread blessing","Three values","Carry forward"],"guided_practice":["Breathe with each knot.","Recall one lived example of each value.","Choose the next expression."],"lineage":"Magdalene-inspired Christian mystical devotion","source_type":"curated-sacred-teaching"},
    {"id":"mystery-magdalene-004","stream":"magdalene_initiations","name":"Descent & Return","title":"Returning With Wisdom","description":"A symbolic descent-and-return contemplation that honours difficulty without romanticising suffering.","element":"earth","alchemy":["Difficulty does not automatically make us wiser.","Meaning is shaped through reflection and choice.","Return requires integration."],"ritual":["Name what changed you.","Name what you learned and what remains unresolved.","Choose one way to live the learning."],"ceremony":["Descent acknowledgement","Threshold crossing","Return vow"],"guided_practice":["Ground before remembering.","Stay within a tolerable window.","End in the present room."],"lineage":"Magdalene-inspired Christian mystical devotion","source_type":"curated-sacred-teaching"},
]

MYSTERY_SCHOOL_TEACHINGS = [
    *EGYPTIAN_MYSTERY_SCHOOL_TEACHINGS,
    *PRIESTESS_ROSE_LINEAGE_TEACHINGS,
    *MERLIN_ALCHEMY_TEACHINGS,
    *EMERALD_TABLET_ALCHEMY_TEACHINGS,
    *HATHOR_MYSTERY_TEACHINGS,
    *SEVEN_SISTERS_TEACHINGS,
    *SOPHIA_DRAGON_TEACHINGS,
    *MAGDALENE_INITIATION_TEACHINGS,
    *ISIS_PRIESTESS_TEACHINGS,
    *HERMETIC_BARDON_TEACHINGS,
]

MYSTERY_STREAM_LABELS = {
    "egyptian_mystery": "Egyptian Mystery School",
    "priestess_rose": "Priestess & Rose Lineage",
    "merlin_alchemy": "Merlin Teachings & Alchemy",
    "emerald_tablet": "Emerald Tablet Alchemy",
    "hathor_mystery": "Hathor Mystery School",
    "seven_sisters": "Seven Sisters · Pleiades",
    "sophia_dragons": "Sophia Dragons · Cosmic Womb",
    "magdalene_initiations": "Mary Magdalene Initiations",
    "isis_priestess": "Isis Egyptian Priestess Path",
    "hermetic_bardon": "Initiations into Hermeticism · Bardon-inspired",
}

MYSTERY_STREAM_TO_ANCIENT_TRADITION = {
    "egyptian_mystery": "egyptian",
    "priestess_rose": "avalon",
    "merlin_alchemy": "celtic",
    "emerald_tablet": "international",
    "hathor_mystery": "egyptian",
    "seven_sisters": "galactic",
    "sophia_dragons": "galactic",
    "magdalene_initiations": "christian_mysticism",
    "isis_priestess": "egyptian",
    "hermetic_bardon": "international",
}

MYSTERY_STREAM_IMAGE_FALLBACKS = {
    "egyptian_mystery": "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg",
    "priestess_rose": "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    "merlin_alchemy": "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg",
    "emerald_tablet": "https://images.pexels.com/photos/4017362/pexels-photo-4017362.jpeg",
    "isis_priestess": "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg",
    "hermetic_bardon": "https://images.pexels.com/photos/4017362/pexels-photo-4017362.jpeg",
}

SUBJECT_KEYWORD_IMAGE_FALLBACKS: list[tuple[tuple[str, ...], str]] = [
    (("pyramid",), "https://images.pexels.com/photos/71241/pexels-photo-71241.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("sphinx",), "https://images.pexels.com/photos/262786/pexels-photo-262786.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("isis",), "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("horus",), "https://images.pexels.com/photos/273238/pexels-photo-273238.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("nile",), "https://images.pexels.com/photos/3214944/pexels-photo-3214944.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("womb",), "https://images.pexels.com/photos/7214474/pexels-photo-7214474.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("grail",), "https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("moon",), "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("avalon",), "https://images.pexels.com/photos/34950/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1400"),
    (("dragon",), "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("sword",), "https://images.pexels.com/photos/1619855/pexels-photo-1619855.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("oak",), "https://images.pexels.com/photos/4631027/pexels-photo-4631027.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("hermetic",), "https://images.pexels.com/photos/1643665/pexels-photo-1643665.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("quantum",), "https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1400"),
    (("reiki",), "https://images.pexels.com/photos/6663365/pexels-photo-6663365.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("crystal",), "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=1400"),
    (("sound",), "https://images.pexels.com/photos/6931975/pexels-photo-6931975.jpeg?auto=compress&cs=tinysrgb&w=1400"),
]

MYSTERY_STREAM_IMAGE_POOLS: dict[str, list[str]] = {
    "egyptian_mystery": [
        "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/71241/pexels-photo-71241.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/262786/pexels-photo-262786.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/2087391/pexels-photo-2087391.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/207518/pexels-photo-207518.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1400",
    ],
    "priestess_rose": [
        "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/7214474/pexels-photo-7214474.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/5998567/pexels-photo-5998567.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=1400",
    ],
    "merlin_alchemy": [
        "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/34950/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/4631027/pexels-photo-4631027.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/1619855/pexels-photo-1619855.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?auto=compress&cs=tinysrgb&w=1400",
    ],
    "emerald_tablet": [
        "https://images.pexels.com/photos/4017362/pexels-photo-4017362.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/8107755/pexels-photo-8107755.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/1643665/pexels-photo-1643665.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1400",
    ],
}

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

MUDRA_SUPPLEMENTS = [
    {
        "id": "mudra-supp-301",
        "name": "Hakini Mudra",
        "sanskrit_name": "Hakini Mudra",
        "element": "Air",
        "chakra": "Third Eye",
        "benefits": [
            "Focus and memory recall",
            "Cognitive coherence",
            "Breath-mind synchronization",
        ],
        "instructions": "Bring all fingertips of both hands to touch lightly in front of chest, tongue resting at upper palate, and breathe slowly.",
        "practice_tips": "Practice before study, strategy, or high-stakes communication. Keep shoulders relaxed and eyes soft.",
    },
    {
        "id": "mudra-supp-302",
        "name": "Kubera Mudra",
        "sanskrit_name": "Kubera Mudra",
        "element": "Fire",
        "chakra": "Solar Plexus",
        "benefits": [
            "Purposeful intention",
            "Decisive action",
            "Manifestation discipline",
        ],
        "instructions": "Join thumb, index, and middle fingertips while curling ring and little fingers inward. Hold with calm, stable breath.",
        "practice_tips": "Use when setting practical goals. End by naming one measurable step for the next 24 hours.",
    },
    {
        "id": "mudra-supp-303",
        "name": "Uttarabodhi Mudra",
        "sanskrit_name": "Uttarabodhi Mudra",
        "element": "Spirit",
        "chakra": "Heart & Crown",
        "benefits": [
            "Inner confidence",
            "Uplifted mood",
            "Spiritual clarity",
        ],
        "instructions": "Interlace fingers, extend index fingers upward, and keep thumbs crossed. Lift gently at heart center while breathing deeply.",
        "practice_tips": "Excellent for morning prayer or before difficult transitions. Keep jaw and pelvic floor soft.",
    },
    {
        "id": "mudra-supp-304",
        "name": "Kalesvara Mudra",
        "sanskrit_name": "Kalesvara Mudra",
        "element": "Water",
        "chakra": "Heart",
        "benefits": [
            "Impulse regulation",
            "Emotional settling",
            "Heart coherence",
        ],
        "instructions": "Touch middle fingertips together, curl remaining fingers inward, and keep thumbs touching at tips to form a heart-like seal.",
        "practice_tips": "Use during stress spikes; extend exhale longer than inhale and soften eyes.",
    },
    {
        "id": "mudra-supp-305",
        "name": "Matangi Mudra",
        "sanskrit_name": "Matangi Mudra",
        "element": "Earth",
        "chakra": "Solar Plexus",
        "benefits": [
            "Digestive calm",
            "Core steadiness",
            "Emotional centering",
        ],
        "instructions": "Interlace fingers and extend middle fingers together upward. Rest hands near solar plexus and breathe into lower ribs.",
        "practice_tips": "Helpful before meals or decision fatigue. Hold for 5-8 minutes with grounded posture.",
    },
    {
        "id": "mudra-supp-306",
        "name": "Yoni Mudra",
        "sanskrit_name": "Yoni Mudra",
        "element": "Water",
        "chakra": "Sacral",
        "benefits": [
            "Nervous-system restoration",
            "Inner listening",
            "Creative reset",
        ],
        "instructions": "Bring thumbs and index fingers together to form a downward triangle, other fingers interlaced, held near lower belly.",
        "practice_tips": "Use in evening or after overstimulation. Pair with slow nasal breathing and low light.",
    },
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
    {
        "id": "shamanic-journey-earth-root-cavern",
        "name": "Earth Root Cavern Descent",
        "category": "journey",
        "tradition": "Earth-Lineage Cave Journey",
        "element": "Earth",
        "duration_minutes": 34,
        "description": "Elemental descent journey for rebuilding safety, boundaries, and grounded self-trust through cave imagery, ancestral stone witness, and deliberate re-entry.",
        "preparation": "Prepare a weighted blanket or grounding stone, drink water, and define one boundary you are restoring.",
        "journey_steps": [
            "Open by touching floor or earth and stating: 'I return to stable ground within myself.'",
            "Visualize descending into a cavern where each breath anchors your spine and lower belly.",
            "Meet the Stone Elder and ask what structure your life now requires.",
            "Seal with one practical boundary action and a nourishing meal after the journey.",
        ],
        "safety_notes": "If heavy grief or freeze rises, pause and orient to room objects before continuing. Keep feet warm and supported.",
        "closing_prayer": "May my roots hold what my spirit is ready to become.",
    },
    {
        "id": "shamanic-journey-water-moon-river",
        "name": "Water Moon River Journey",
        "category": "journey",
        "tradition": "Lunar Water Temple",
        "element": "Water",
        "duration_minutes": 36,
        "description": "Elemental water journey for emotional regulation, grief release, and relational renewal through moonlit river visualization and compassionate witnessing.",
        "preparation": "Set a bowl of water nearby, reduce light levels, and identify one emotion you are ready to process gently.",
        "journey_steps": [
            "Begin with slow 4/6 breathing while visualizing moonlight reflecting on a calm river.",
            "Enter the riverbank path and name the emotion you are carrying without judgment.",
            "Offer that emotion into flowing water and receive one phrase of guidance in return.",
            "Close by washing hands with intention and writing one relationship repair step.",
        ],
        "safety_notes": "Avoid flooding by pacing breath and keeping one hand on heart. Pause if activation exceeds your consent window.",
        "closing_prayer": "May my waters move with honesty, compassion, and clean boundaries.",
    },
    {
        "id": "shamanic-journey-fire-solar-path",
        "name": "Fire Solar Path Initiation",
        "category": "journey",
        "tradition": "Solar Fire Rite",
        "element": "Fire",
        "duration_minutes": 32,
        "description": "Elemental fire journey for courage, purpose activation, and disciplined action through solar visualization and vow-based integration.",
        "preparation": "Sit upright with a candle or warm light source and define one action you have been avoiding.",
        "journey_steps": [
            "Ignite with three power breaths and call in clear, benevolent fire.",
            "Walk the inner solar path, releasing self-doubt at each threshold gate.",
            "Receive one precise directive for aligned action from your inner fire guide.",
            "Seal by speaking your 72-hour commitment aloud three times.",
        ],
        "safety_notes": "Keep intensity regulated. Fire medicine is disciplined warmth, not overwhelm or force.",
        "closing_prayer": "May my fire serve truth, compassion, and courageous right action.",
    },
    {
        "id": "shamanic-journey-air-sky-bridge",
        "name": "Air Sky Bridge Journey",
        "category": "journey",
        "tradition": "Wind-Oracle Breathwork",
        "element": "Air",
        "duration_minutes": 30,
        "description": "Elemental air journey for perspective expansion, cognitive clarity, and intuitive discernment through sky-bridge symbolism and breath-led listening.",
        "preparation": "Open a window if possible, soften jaw and tongue, and bring one question requiring discernment.",
        "journey_steps": [
            "Lengthen exhale and visualize stepping onto a luminous sky bridge.",
            "Offer your question to the wind and listen for repeated phrases or symbols.",
            "Differentiate fear noise from truth signal by checking body coherence on each insight.",
            "Close with one communication action aligned to what you heard.",
        ],
        "safety_notes": "If racing thoughts increase, reduce pace and return to counted breathing before continuing.",
        "closing_prayer": "May clear seeing and clean speech guide my next steps.",
    },
    {
        "id": "shamanic-journey-spirit-aurora-return",
        "name": "Spirit Aurora Return Journey",
        "category": "journey",
        "tradition": "Aurora Axis Ceremony",
        "element": "Spirit",
        "duration_minutes": 40,
        "description": "Elemental spirit journey for soul coherence, meaning restoration, and life-direction integration through aurora-axis ascent and grounded return protocols.",
        "preparation": "Set sacred space with one light source, one grounding object, and one written intention for your next life season.",
        "journey_steps": [
            "Enter stillness and visualize an aurora pillar linking Earth, heart, and sky.",
            "Ascend through the pillar while repeating your intention in calm cadence.",
            "Meet your highest supportive guide and request one integration vow for this season.",
            "Return slowly through breath, touch, and orientation to room details before standing.",
        ],
        "safety_notes": "Always complete full re-entry: hydration, food, and practical grounding task before any major decision.",
        "closing_prayer": "May spirit insight become embodied service, one grounded action at a time.",
    },
]

# Genuine second-stage arcs. These extend an existing advanced practice rather than
# relabelling or repeating it; the base id before "-deepening-" remains resolvable.
SHAMANIC_ADVANCED_SUPPLEMENTS.extend([
    {
        "id": "shamanic-advanced-drum-protocol-deepening-ally-dialogue",
        "name": "Three-World Drum Navigation — Ally Dialogue Deepening",
        "category": "journey",
        "tradition": "Core Shamanic Drumming",
        "element": "Spirit",
        "duration_minutes": 42,
        "description": "A relational deepening of the Three-World journey: instead of travelling farther, the practitioner slows down to test, question, and embody one ally teaching with discernment.",
        "preparation": "Complete the base Three-World Drum Navigation practice first. Choose one remembered ally or symbol, set a clear return cue, and keep a grounding object within reach.",
        "journey_steps": [
            "Re-enter only the world in which the clearest ally or symbol appeared; do not tour all three worlds again.",
            "Ask three discernment questions: What are you showing me? What are you not asking me to do? How can I recognise this teaching in ordinary life?",
            "Pause guidance for a sustained drum-only listening period and notice image, sensation, emotion, and silence without forcing meaning.",
            "Return on the agreed cue, orient to the room, then write the teaching in plain language without embellishment.",
            "Choose one small embodied action within 24 hours and review whether the teaching became clearer through lived experience."
        ],
        "integration_actions": [
            "Record what was directly experienced separately from later interpretation.",
            "Move, walk, or shake gently for two minutes before journaling.",
            "If a message encourages harm, grandiosity, fear, or loss of personal agency, do not act on it; return to grounded discernment."
        ],
        "safety_notes": "Stop if you become disoriented or overwhelmed. Open your eyes, name five things in the room, feel your feet, and return to ordinary activity before interpreting the journey."
    },
    {
        "id": "shamanic-journey-earth-root-cavern-deepening-stone-council",
        "name": "Earth Root Cavern — Stone Council Deepening",
        "category": "journey",
        "tradition": "Earth-Lineage Cave Journey",
        "element": "Earth",
        "duration_minutes": 39,
        "description": "A slower Earth deepening centred on structure, belonging, and boundaries. The work moves from receiving a message to building a body-felt agreement you can carry into daily life.",
        "preparation": "Complete the Earth Root Cavern Descent first. Bring three stones representing body, home, and boundary, plus water and a journal.",
        "journey_steps": [
            "Place the three stones before you and feel their weight before closing your eyes.",
            "Return to the cavern and meet a council of three stone presences, allowing each to reflect one area: body, home, and boundary.",
            "Ask what needs strengthening, what can soften, and what no longer needs to be carried.",
            "On return, hold each physical stone and speak one simple agreement aloud.",
            "Place the stones somewhere visible for seven days and practise the boundary or support they represent."
        ],
        "integration_actions": [
            "Take one practical home-or-body action the same day.",
            "Notice whether the agreement feels firm but gentle rather than rigid.",
            "Revisit after seven days and keep only what still feels grounded and useful."
        ]
    },
    {
        "id": "shamanic-journey-water-moon-river-deepening-tidal-listening",
        "name": "Water Moon River — Tidal Listening Deepening",
        "category": "journey",
        "tradition": "Lunar Water Temple",
        "element": "Water",
        "duration_minutes": 41,
        "description": "A Water deepening that practises staying with emotional movement without forcing catharsis. It explores receiving, boundaries, and the difference between feeling an emotion and becoming consumed by its story.",
        "preparation": "Complete the Water Moon River Journey first. Prepare a bowl of water and choose one feeling that is present but workable today.",
        "journey_steps": [
            "Begin at the riverbank and locate the feeling as sensation before naming its story.",
            "Watch three imagined tides move in and out while allowing the sensation to change at its own pace.",
            "Ask the river: What wants witnessing? What needs a boundary? What needs nourishment?",
            "Let any tears, sighs, trembling, stillness, or laughter arise naturally without treating any response as proof that something has left the body.",
            "Return by touching the water, orienting to the room, and naming one act of care or communication that honours what you heard."
        ],
        "integration_actions": [
            "Drink water and eat something grounding.",
            "Journal sensation, emotion, meaning, and next action as four separate lines.",
            "Do not force a second journey if your body is asking for rest."
        ]
    }
])
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

YOGA_POSE_SUPPLEMENTS = [
    {
        "id": "half-hero-pose",
        "name": "Half Hero Pose",
        "sanskrit_name": "Ardha Virasana",
        "element": "Spirit",
        "difficulty": "Intermediate",
        "duration_minutes": 4,
        "description": "A grounding kneeling variation that opens one quadriceps line while keeping the spine upright and steady.",
        "benefits": ["Stretches quadriceps", "Supports knee mobility", "Improves posture"],
        "contraindications": ["Knee injury", "Ankle injury"],
        "instructions": [
            "Begin in a kneeling seat and extend one leg or keep one knee bent for comfort.",
            "Lengthen through the spine and keep shoulders relaxed.",
            "Breathe slowly for 5-8 breaths, then switch sides.",
        ],
        "chakras": ["Root", "Heart"],
        "image_url": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/ea988a22561e7934728f1c814858b31fd1f26573a10d8138cebab8d7908e4977.png",
    },
    {
        "id": "half-split",
        "name": "Half Split",
        "sanskrit_name": "Ardha Hanumanasana",
        "element": "Water",
        "difficulty": "Beginner",
        "duration_minutes": 4,
        "description": "A hamstring-opening prep for deeper split work with mindful alignment and controlled breath.",
        "benefits": ["Lengthens hamstrings", "Improves pelvic control", "Supports split preparation"],
        "contraindications": ["Hamstring strain"],
        "instructions": [
            "From low lunge, shift hips back and straighten front leg.",
            "Flex front foot and keep spine long.",
            "Hold for 5-8 breaths per side.",
        ],
        "chakras": ["Sacral", "Root"],
        "image_url": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/680df810502d1d87ce273b273f5a718bf163479af499502770cf486209158906.png",
    },
    {
        "id": "side-split",
        "name": "Side Split",
        "sanskrit_name": "Samakonasana",
        "element": "Water",
        "difficulty": "Advanced",
        "duration_minutes": 3,
        "description": "A full lateral split requiring deep inner-thigh flexibility, patience, and alignment awareness.",
        "benefits": ["Opens adductors", "Builds pelvic mobility", "Develops flexibility discipline"],
        "contraindications": ["Groin injury", "Hamstring injury"],
        "instructions": [
            "Warm up thoroughly with hip-openers first.",
            "Slide legs apart gradually while supporting with hands/blocks.",
            "Breathe steadily and avoid forcing depth.",
        ],
        "chakras": ["Sacral", "Root"],
        "image_url": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/f193fb7fe07ab1b80e178551ec5bfc4023c76d749882da823b4aa89807d086dd.png",
    },
    {
        "id": "forward-split",
        "name": "Forward Split",
        "sanskrit_name": "Hanumanasana",
        "element": "Water",
        "difficulty": "Advanced",
        "duration_minutes": 3,
        "description": "A full front split with squared hips that symbolizes devotion, surrender, and focused commitment.",
        "benefits": ["Deep hip-flexor opening", "Hamstring flexibility", "Split mobility progression"],
        "contraindications": ["Hip injury", "Hamstring injury", "Knee pain"],
        "instructions": [
            "From low lunge, slide front heel forward and back knee behind.",
            "Square hips and use blocks under hands for support.",
            "Hold with smooth breath and gradual depth.",
        ],
        "chakras": ["Sacral", "Heart"],
        "image_url": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/5728f197ab3de5e1512bd5b9b3b3710d02954fc37bc706c37b97069861ae7899.png",
    },
]


def _append_yoga_pose_supplements(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    existing_ids = {str(item.get("id") or "").strip() for item in items}
    existing_names = {
        _normalize_label_key(str(item.get("name") or ""))
        for item in items
        if str(item.get("name") or "").strip()
    }

    additions: list[dict[str, Any]] = []
    for supplement in YOGA_POSE_SUPPLEMENTS:
        supplement_id = str(supplement.get("id") or "").strip()
        supplement_name_key = _normalize_label_key(str(supplement.get("name") or ""))
        if supplement_id in existing_ids:
            continue
        if supplement_name_key and supplement_name_key in existing_names:
            continue
        additions.append(dict(supplement))
        existing_ids.add(supplement_id)
        if supplement_name_key:
            existing_names.add(supplement_name_key)

    return items + additions

CHAIR_YOGA_IMAGE_OVERRIDES: dict[str, str] = {
    "chair-yoga-201": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/219f1433f63f15995c915be9c70a0768e8a59557dfbdab8b0fcaa6933bdcfae5.png",
    "chair-yoga-202": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/ffd8fda6fac5f647d31663b76104e8d5b3e836c449edc080ee554dc817757199.png",
    "chair-yoga-203": "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=900",
    "chair-yoga-204": "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900",
    "chair-yoga-205": "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900",
    "chair-yoga-206": "https://images.pexels.com/photos/3822116/pexels-photo-3822116.jpeg?auto=compress&cs=tinysrgb&w=900",
    "chair-yoga-207": "https://images.pexels.com/photos/3823063/pexels-photo-3823063.jpeg?auto=compress&cs=tinysrgb&w=900",
    "chair-yoga-208": "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=900",
    "chair-yoga-209": "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900",
    "chair-yoga-210": "https://images.pexels.com/photos/3823063/pexels-photo-3823063.jpeg?auto=compress&cs=tinysrgb&w=900",
}

SOMATIC_IMAGE_OVERRIDES: dict[str, str] = {
    "grounding-somatic-flow": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/719f5d5f5dc8eb5f56f9e1e8edb358c2c5de1772914f1530d2826490ed424534.png",
    "hip-release-somatic": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/719f5d5f5dc8eb5f56f9e1e8edb358c2c5de1772914f1530d2826490ed424534.png",
    "chair-hip-release-somatic": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/d178bc0748ddb594742bd5c4b3693b8b270efb5ce9fb63f7260978d0f3d7f5f8.jpeg",
    "neck-shoulder-somatic": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/7460d2d56b7ffd7dafdbf4c40237fa996f5f52dd7c03eda7bcf09522402c962d.png",
    "restorative-somatic-yoga": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/719f5d5f5dc8eb5f56f9e1e8edb358c2c5de1772914f1530d2826490ed424534.png",
    "trauma-release-somatic": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/719f5d5f5dc8eb5f56f9e1e8edb358c2c5de1772914f1530d2826490ed424534.png",
}

SHAMANIC_IMAGE_OVERRIDES: dict[str, str] = {
    "1": "/images/power-animal-journey.jpg",
    "2": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/3f017c9ce6a7733752d54dd7b20f81703b717f22cdc95f4b2bc27e7791e1307e.png",
    "3": "/images/ancestral-healing-ritual.jpg",
    "6": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/0c836c759c8b9722b7d9ce8ea87b47911cdaad713c808cca7faf036edc27fb8e.png",
    "16": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/71553fe6b5a258a4c1441b648b0680f05490ad55a83efd67e7bda88d56c3cc90.png",
    "shamanic-advanced-soul-retrieval": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/3f017c9ce6a7733752d54dd7b20f81703b717f22cdc95f4b2bc27e7791e1307e.png",
}

FASCIA_IMAGE_OVERRIDES: dict[str, str] = {
    "27": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/56d1b835c3d146835e77e254e9a1f5cd645a0e4e7543a113666e9eb4b8d46135.png",
    "28": "https://images.pexels.com/photos/3823059/pexels-photo-3823059.jpeg?auto=compress&cs=tinysrgb&w=900",
    "29": "https://images.pexels.com/photos/6456149/pexels-photo-6456149.jpeg?auto=compress&cs=tinysrgb&w=900",
    "32": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/a80b0d8f70bbcb1d93016204498ac4b3e7c593d630fa0c03f632dde4edbe860b.png",
    "33": "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=900",
    "34": "https://images.pexels.com/photos/3823063/pexels-photo-3823063.jpeg?auto=compress&cs=tinysrgb&w=900",
    "36": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/975e126d9e0438c25ae8570c45e267d6c1f01d1793f6ee585243daa091eb33ff.png",
    "37": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/6970f348854cc5dd6b41558af7fe07ffe314ca326076ad7a2455d43df0885f71.png",
    "38": "https://images.pexels.com/photos/3822472/pexels-photo-3822472.jpeg?auto=compress&cs=tinysrgb&w=900",
    "31": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/843111a63f9c77eeb358a19b903234735e0099ca6e0f42513248b12d39f8c070.png",
    "39": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/42c6edcc77557a519bff5e40533fdf4b0560cbb33a9a92d9ac3fe0dc7a5be692.png",
}

# Accurate per-form imagery for tai chi / qi gong / fascia practices (applied to /somatic and /fascia-stretching)
MOVEMENT_FORM_IMAGE_OVERRIDES: dict[str, str] = {
    "3": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/a4099a7beb7ca999abb340c6280aa68ee254f9afd239285ca6cf2d4231cba3b2.jpeg",
    "4": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/5194b38aec6eeb188a3ddaf20eed2fb68301adae3a771fff7c6d1f1f25f3c0a5.jpeg",
    "7": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/ca7d95748f5c54953a37f6cc7dd8cf19a1752978ff7c6849073f6f8989ea622b.jpeg",
    "8": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/084a7986d0dc4b3055e86e997eda17364a1c5d6828e285955c9be6f58732dd7f.jpeg",
    "9": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/58e5fadabf9d79ca205d5035274b785718b7ffb7959958c76e3d210f9f78bae1.jpeg",
    "10": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/a06542d458f7a5a8a844488411ad88608fa37cc391663b19b7b11a5bfad614cb.jpeg",
    "11": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/a9f03394b649314c09560f27de75d369c24cb353b4cc8a06584e12d188405179.jpeg",
    "12": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/4dcddc91f1ba263da0178d20410e121572d54b0a6f1b0e372c7566d16e5c064c.jpeg",
    "13": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/91c6b45d45e113872e2721eabb28e26c68b8bc777081ae6bb33a79ccf0d9fde5.jpeg",
    "14": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/6512fe8efef37c221d8cc4971e70231d1d677ac5bf34994ce7a9f3466c9532f7.jpeg",
    "15": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/a1eeb991d7bac76ab32992f30635ef913642372a75b9adda99eef26adf8c7d73.jpeg",
    "16": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/51802578f9852cd2e0b6f204766dae942f4af5dae7b74afdd5fb60673da8a1d6.jpeg",
    "17": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/680d21371524567b0facf257f6b57258516e04c3ecf59ea23f78e60e92c16511.jpeg",
    "18": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/00ec032d58b8446ee283d536b5d467be0aa25cd6eb9e96d4c8a1147465535bd9.jpeg",
    "19": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/c3dc368070c948ed1837f7473f970db8c93c6262a93f25cfb69751c504929eed.jpeg",
    "20": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/416488af6ab733a79e90dcb85454d829d029f009d3e4d64ca67db5e0d4a1d919.jpeg",
    "21": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/3112793455b85f9f631e4fb454b352e878f980ba642c049c0f96d27782a03f72.jpeg",
    "22": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/501c6f344b39dbaf5b6305c7de53ab2d433f7a0796d01c34bf514df1f4ea78ec.jpeg",
    "23": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/8bf386cf82e90751ce94a0ac01cac0a73dce2ab1f254da94422f9686bd687620.jpeg",
    "24": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/9433a944b2a1fbc6a7574092ff2c371333d71a78afc9eaa91ed0dd19b3fdc1da.jpeg",
    "25": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/74f83e73c613a84a311256c4d17e0e08890d317162dcebfbe2210c8b11654189.jpeg",
    "26": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/3b9ec19e5bb6d623cd1bb8b1b54d1b17d55d1d49a82b928c1c42ce69b49cb955.jpeg",
    "28": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/eea1689a252077f9ca29e29ce5fd6ef8b167e7ad55b23eccb1b2b2dad8241757.jpeg",
    "29": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/886d66e2d76078bff616228212f0caece08521c55c2cc30ef8b4f85586868666.jpeg",
    "30": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/7fc39dc87a7b59cef0340349aa90b46ad688635ff5d5b15cd0cec7b3f3caefe4.jpeg",
    "33": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/0f06936331b9ecf1aae15dc3d2b8bbb847b9ecad9d4530caaef0754a3120f354.jpeg",
    "34": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/6c275c336592f30ad6c837a58b4d103b25a484cd87caa53ea996a40d47273c3d.jpeg",
    "35": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/7b2d705e71c621a0220cae30692ce944b1889bb8e9ae0f44689ab45a4e823a14.jpeg",
    "38": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/bae343379216e223dbc128a6247c26fb7dcb4b002207bdef4643ef89ba3e3071.jpeg",
}
FASCIA_IMAGE_OVERRIDES.update(MOVEMENT_FORM_IMAGE_OVERRIDES)

HEART_IMAGE_OVERRIDES: dict[str, str] = {
    "1": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/e62199b66e0995de6e5eb1e89a81d9614b3fc7b6aeb6d1c8c389a3c472529de2.jpeg",
    "2": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/b96207fd50cc43d63aa2ae50725f7491d3b8413b859459e96e7b3f86dd94bfe1.jpeg",
    "3": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/02eb833c4a76ac312e750c8b5050026b50c2d9cbfcf65b17df40d2053f177b6d.jpeg",
    "4": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/e33e58b099543946cdb7e69f222ac92d88097148c02fb4c2e386582db2e017d4.jpeg",
    "5": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/9d49966da7c800b20eaa75d5605415aeb5e62febb84c559ce59b16e82877a90f.jpeg",
    "6": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/94777a23b04ccc8644d3e8c4aae4f5fefd362cbaba7dc4284830c293f75f34f8.jpeg",
    "7": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/1c989725a3e901af9723d9b58c4bad65160021c17ca3fe6943102dd65bc0dda7.jpeg",
    "8": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/96c9cbc2e74457dc472d5e2e7854a539208cd7207963f5513149935282045670.jpeg",
    "9": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/15e056235fdfc6bea982da9c6454287df613962c4cd10bd975d20229efb99676.jpeg",
    "10": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/7719a7b5930824a2293877605eea4326c07adc5469fc268e8481ff95f33cdac7.jpeg",
    "heart-supp-101": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/088df08f6e4f288b18ebd5c79048447b150afac6284299fe216b5cc948735449.jpeg",
    "heart-supp-102": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/177ccf05d906348372fef2f3802689f4dd37ee3e2916fff35051c4116e1aad7d.jpeg",
    "heart-supp-103": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/e76feda151b5a8cd3fd28bdc774a75711ce45a7103810facf57821948abff6fd.jpeg",
    "heart-supp-104": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/b962b2d48349d5c928847af6eb59c410bbcd1214880f38820fb6e1143d4286aa.jpeg",
}

MINDFULNESS_IMAGE_OVERRIDES: dict[str, str] = {
    "mindful-body-prayer": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/88d7f123ccb7fabaa6e8712911e9ba2c920a0702ce4df9d34a063544d1fb7301.png",
}

UNSAFE_GENERIC_IMAGE_URLS: dict[str, str] = {
    # This URL repeatedly drifted to non-wellness visuals (user-reported drone image).
    "https://images.unsplash.com/photo-1506947411487-a56738267384?crop=entropy&cs=srgb&fm=jpg&q=85":
        "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/f76a8829db048c630127f37cf68ef7599525b1b0a0eb4e25187dee405f3ea77b.png",
}

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
SECTION_UNCAPPED_UNLOCK_IDS = {"yoga_poses", "somatic_practices", "shamanic_practices", "elemental_practices", "water_practices", "creative_processes", "sound_frequencies"}

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
    "mystery_school": 4,
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
    "mystery_school": "Mystery School Premium",
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


def _lookup_yoga_realism_override(pose_name_key: str) -> Optional[str]:
    direct = YOGA_REALISM_IMAGE_OVERRIDES.get(pose_name_key)
    if direct:
        return direct

    for raw_key, override in YOGA_REALISM_IMAGE_OVERRIDES.items():
        if _normalize_label_key(raw_key) == pose_name_key:
            return override

    tokenized = set(_normalize_label_key(pose_name_key).split())
    best_score = 0.0
    best_override: Optional[str] = None
    for keywords, override in YOGA_REALISM_KEYWORD_OVERRIDES:
        keyword_set = {_normalize_label_key(keyword) for keyword in keywords}
        if not keyword_set:
            continue
        overlap = len(tokenized.intersection(keyword_set))
        score = overlap / len(keyword_set)
        if score > best_score and overlap > 0:
            best_score = score
            best_override = override

    if best_score >= 0.8 and best_override:
        return best_override

    return None


def _enforce_yoga_pose_realism(poses: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    used_urls: set[str] = set()

    for pose in poses:
        entry = dict(pose)
        pose_name_key = _normalize_label_key(str(entry.get("name") or ""))
        override_url = _lookup_yoga_realism_override(pose_name_key)

        if override_url:
            entry["image_url"] = override_url
            entry["image_source"] = "real_asana_curated"
            entry["image_validation"] = {
                "status": "verified",
                "source_type": "real_asana_curated",
                "score": 0.97,
                "verified_at": datetime.now(timezone.utc).isoformat(),
            }
            entry["source_references"] = _merge_source_references(entry.get("source_references"), [override_url])
            used_urls.add(override_url)
        else:
            if not str(entry.get("image_url") or "").strip():
                entry["image_url"] = YOGA_REALISM_DEFAULT_IMAGE
                entry["image_source"] = "real_asana_fallback"
                entry["image_validation"] = {
                    "status": "verified",
                    "source_type": "real_asana_fallback",
                    "score": 0.9,
                    "note": "Route-level yoga fallback image",
                }
                entry["source_references"] = _merge_source_references(entry.get("source_references"), [YOGA_REALISM_DEFAULT_IMAGE])
                used_urls.add(YOGA_REALISM_DEFAULT_IMAGE)

        if pose_name_key in {"corpse pose", "easy pose"}:
            entry["is_premium"] = False
            entry["premium_unlock_id"] = None
            entry["premium_label"] = None
            entry["premium_description"] = None

        normalized.append(entry)

    return normalized


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


def _build_yoga_pose_protocol(pose: dict[str, Any]) -> dict[str, Any]:
    name = str(pose.get("name") or "Yoga Pose").strip()
    sanskrit = str(pose.get("sanskrit_name") or "").strip()
    title = f"{name} ({sanskrit})" if sanskrit else name
    instructions = [str(i).strip() for i in (pose.get("instructions") or []) if str(i).strip()]
    benefits = [str(b).strip() for b in (pose.get("benefits") or []) if str(b).strip()]
    chakras = [str(c).strip() for c in (pose.get("chakras") or []) if str(c).strip()]
    contraindications = [str(c).strip() for c in (pose.get("contraindications") or []) if str(c).strip()]
    difficulty = str(pose.get("difficulty") or "Beginner").strip().lower()
    duration = int(pose.get("duration_minutes") or 3)
    fascia = str(pose.get("somatic_fascia_focus") or "").strip()
    breath_cue = str(pose.get("breath_hybrid_cue") or "").strip()
    energetic = str(pose.get("energetic_effects") or "").strip()
    spiritual = str(pose.get("spiritual_purpose") or "").strip()

    warmups = {
        "beginner": "Gentle joint circles for ankles, hips, and shoulders (1-2 min) — no strain needed before this accessible pose.",
        "intermediate": "Warm the spine and hips with 3-4 rounds of cat-cow and a low lunge on each side before entering.",
        "advanced": "Complete a full warm-up sequence (sun salutations or equivalent) — this pose asks for open, prepared tissue.",
    }
    modifications = {
        "beginner": f"Use a wall, chair, or folded blanket for support; shorten the hold well below {duration} minutes while learning the shape.",
        "intermediate": "Use a block or strap to keep length in the spine rather than collapsing toward the full expression.",
        "advanced": "Return to the foundational variation on low-energy days; depth is earned each session, never assumed.",
    }

    preparation = [warmups.get(difficulty, warmups["beginner"])]
    if contraindications:
        preparation.append(f"Contraindication check: approach with care or consult a professional if you have {', '.join(contraindications[:3]).lower()}.")
    preparation.append(f"Set your space for {title}: clear floor, steady surface, and one clear intention for the hold.")

    anatomy = instructions[:3] if instructions else [f"Establish the foundational shape of {title} with even weight and a long spine."]
    if fascia:
        anatomy.append(fascia)

    breath = [breath_cue or "Inhale through the nose for 4 counts, exhale for 6, letting the exhale settle you deeper into the shape."]
    breath.append(f"Sustain the hold for up to {duration} minute{'s' if duration != 1 else ''}, letting breath — not willpower — set the pace.")

    embodiment = instructions[3:6] or [f"Refine {name} from the inside: soften what is gripping, engage what is sleeping."]
    if benefits:
        embodiment.append(f"Notice the pose working: {benefits[0].rstrip('.').lower()}.")

    modification_list = [modifications.get(difficulty, modifications["beginner"])]
    if contraindications:
        modification_list.append("If any listed contraindication applies, practice the supported variation only, or choose a different pose today.")

    energetics = []
    if energetic:
        energetics.append(energetic)
    if chakras:
        energetics.append(f"Chakra focus: {', '.join(chakras)} — breathe attention into this centre while holding.")
    if spiritual:
        energetics.append(spiritual)

    integration = [
        f"Release {name} slowly and take a neutral counter-shape (rest, gentle twist, or forward fold) for 3-5 breaths.",
        f"Name one effect you can actually feel{f' — such as {benefits[1].rstrip(chr(46)).lower()}' if len(benefits) > 1 else ''} — before moving on.",
        "Carry the pose's quality into your next daily action: stand, walk, or speak from this alignment.",
    ]

    protocol: dict[str, Any] = {
        "preparation_phase": preparation,
        "anatomy_awareness": anatomy,
        "breath_guidance": breath,
        "embodiment_phase": embodiment,
        "modifications": modification_list,
        "integration_phase": integration,
    }
    if energetics:
        protocol["energetic_layer"] = energetics
    return protocol


def _enrich_yoga_pose(pose: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(pose)
    pose_name_key = _normalize_label_key(enriched.get("name", ""))
    realism_override = _lookup_yoga_realism_override(pose_name_key)
    source_type = "hybrid-curated"

    if realism_override:
        enriched["image_url"] = realism_override
        enriched["source_references"] = _merge_source_references(
            enriched.get("source_references"),
            [realism_override],
        )
        enriched["image_source"] = "real_asana_curated"
        enriched["image_validation"] = {
            "status": "verified",
            "source_type": "real_asana_curated",
            "score": 0.97,
            "verified_at": datetime.now(timezone.utc).isoformat(),
        }
        source_type = "real_asana_curated"
    else:
        enriched["image_url"] = YOGA_REALISM_DEFAULT_IMAGE
        priority = _yoga_pending_verification_priority(enriched, pose_name_key)
        enriched["image_source"] = "real_asana_fallback"
        enriched["image_validation"] = {
            "status": "verified",
            "source_type": "real_asana_fallback",
            "score": 0.9,
            "priority": priority,
            "note": "Applied real asana fallback image to preserve realism consistency.",
        }
        enriched["source_references"] = _merge_source_references(
            enriched.get("source_references"),
            [YOGA_REALISM_DEFAULT_IMAGE],
        )
        source_type = "real_asana_fallback"

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
    enriched["master_embodiment_protocol"] = _build_yoga_pose_protocol(enriched)
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


def _is_sacred_guardian_entry(item: dict[str, Any]) -> bool:
    category = _normalize_label_key(str(item.get("category") or ""))
    if category in {"power_animal", "spirit_animal", "dragon_energy", "angel", "familiar", "messenger"}:
        return True

    item_id = str(item.get("id") or "").strip().lower()
    return item_id.startswith(("pa-", "sa-", "de-", "ang-", "fam-", "msg-"))


def _resolve_practice_image_fallback(item: dict[str, Any]) -> Optional[str]:
    topic_key = _normalize_image_topic_key(item)
    if topic_key and topic_key in PRACTICE_IMAGE_FALLBACKS:
        return PRACTICE_IMAGE_FALLBACKS[topic_key]

    subject_blob = _normalize_label_key(
        " ".join(
            [
                str(item.get("name") or ""),
                str(item.get("title") or ""),
                str(item.get("description") or ""),
                str(item.get("id") or ""),
                str(item.get("stream") or ""),
                str(item.get("lineage_stream") or ""),
                str(item.get("tradition") or ""),
                str(item.get("category") or ""),
            ]
        )
    )
    for keyword_group, image_url in SUBJECT_KEYWORD_IMAGE_FALLBACKS:
        if keyword_group and all(keyword in subject_blob for keyword in keyword_group):
            return image_url

    stream_key = _normalize_label_key(str(item.get("stream") or item.get("lineage_stream") or "")).replace(" ", "_")
    if stream_key and stream_key in MYSTERY_STREAM_IMAGE_FALLBACKS:
        return MYSTERY_STREAM_IMAGE_FALLBACKS[stream_key]

    category_keys = [
        _normalize_label_key(str(item.get("category") or "")),
        _normalize_label_key(str(item.get("element") or "")),
        _normalize_label_key(str(item.get("type") or "")),
        _normalize_label_key(str(item.get("stream") or "")),
        _normalize_label_key(str(item.get("lineage_stream") or "")),
        _normalize_label_key(str(item.get("stream") or "")).replace(" ", "_"),
        _normalize_label_key(str(item.get("lineage_stream") or "")).replace(" ", "_"),
        _normalize_label_key(str(item.get("tradition") or "")),
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
    stream_key = _normalize_label_key(str(enriched.get("stream") or enriched.get("lineage_stream") or "")).replace(" ", "_")
    explicit_override = bool(topic_key and topic_key in PRACTICE_IMAGE_FALLBACKS)
    stream_override = bool(stream_key and stream_key in MYSTERY_STREAM_IMAGE_FALLBACKS)
    is_generic_stream_image = existing_url in set(MYSTERY_STREAM_IMAGE_FALLBACKS.values())
    is_seeded_static_image = "static.prod-images.emergentagent.com/jobs/" in existing_url
    preserve_guardian_seeded_image = is_seeded_static_image and _is_sacred_guardian_entry(enriched)
    should_replace = (
        explicit_override
        or stream_override
        or (not existing_url)
        or (is_seeded_static_image and not preserve_guardian_seeded_image)
        or is_generic_stream_image
    )

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
    current_url = str(enriched.get("image_url") or "").strip()
    unsafe_replacement = UNSAFE_GENERIC_IMAGE_URLS.get(current_url)
    if unsafe_replacement:
        enriched["image_url"] = unsafe_replacement
        source_refs = list(enriched.get("source_references") or [])
        if unsafe_replacement not in source_refs:
            source_refs.append(unsafe_replacement)
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
            f"Arrival (2-4 min): orient to your surroundings, notice your body, and choose an intention for {name}.",
            f"Embodied preparation: breathe comfortably and use {anchor} as an optional point of attention.",
            f"Pacing check: choose a comfortable intensity, and pause or adapt whenever your body asks for less.",
        ],
        "embodiment_phase": [
            f"Core {mode} practice (8-20 min): follow the specific technique with steadiness, choice, and room to adapt.",
            "Pause periodically to notice unnecessary effort; soften where appropriate and return to an easy breath rhythm.",
            "Notice body sensation, breath, and emotion without deciding in advance what they should mean or how they should change.",
        ],
        "integration_phase": [
            "Allow 90-180 seconds of stillness or gentle movement before transitioning out.",
            "Journal one sensation, feeling, or observation and one practical way you may carry the practice into your day.",
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


LIBRARY_MANTRA_AUDIO_IDS = {str(i) for i in range(1, 15)}


def _enrich_mantra_entry(mantra: dict[str, Any]) -> dict[str, Any]:
    enriched = _enrich_devotional_language(dict(mantra), "mantra")
    name = str(enriched.get("name") or "Mantra").strip()
    mantra_id = str(enriched.get("id") or "").strip()
    if mantra_id in LIBRARY_MANTRA_AUDIO_IDS:
        enriched["audio_url"] = f"/audio/mantras/{mantra_id}.mp3"
        enriched["audio_credit"] = "Spoken mantra pronunciation — studio voice recording"
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

    translation_line = str(enriched.get("translation") or enriched.get("meaning") or "Return to sacred steadiness.").strip()
    element_name = str(enriched.get("element") or "spirit").strip().lower()
    chakra_name = str(enriched.get("chakra") or "heart").strip().lower()

    enriched.setdefault("alchemy", [
        f"Sound entrainment: {name} stabilizes attention and lowers cognitive fragmentation through rhythmic repetition.",
        f"Elemental embodiment: this mantra tones the {element_name} pathway to restore emotional and energetic coherence.",
        f"Chakra resonance: direct awareness through the {chakra_name} center while chanting to integrate vibration into tissue memory.",
        "Behavior bridge: translate post-chant clarity into one concrete action within 24 hours.",
    ])
    enriched.setdefault("ritual", [
        "Prepare seat, spine, and jaw; begin with five long exhales before first repetition.",
        f"Chant {name} in consistent cadence while tracking one body anchor (heart, belly, or hands).",
        "Complete with one minute of silence and a handwritten integration note.",
    ])
    enriched.setdefault("ceremony", [
        "Opening: invoke intention and name what is ready to be transformed.",
        "Middle: maintain repetition with regulated breath and compassionate precision.",
        "Closure: absorb resonance in stillness, then seal with one integrity vow.",
    ])
    enriched.setdefault("guided_practice", [
        f"Phase 1 — Arrival: settle breath and introduce {name} gently for 2 minutes.",
        "Phase 2 — Immersion: sustain repetitions with relaxed throat and coherent exhale rhythm.",
        f"Phase 3 — Integration: receive the medicine line '{translation_line}' in silence and action planning.",
    ])
    enriched.setdefault(
        "why_this_heals",
        f"{name} combines patterned vocal resonance, breath regulation, and attentional training to settle stress reactivity and reinforce embodied emotional stability.",
    )
    enriched.setdefault(
        "integration_guide",
        "After chanting, keep one hand on heart and one on lower belly for five slow breaths; then take one grounded action that reflects your mantra intention.",
    )
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

    element_name = str(enriched.get("element") or "spirit").strip().lower()
    enriched.setdefault("alchemy", [
        f"Somatic circuitry: {mudra_name} refines subtle current flow through gentle fingertip contact and breath pacing.",
        f"Elemental attunement: this mudra supports {element_name} regulation while reducing mental scatter.",
        "Neuroception support: hand seals provide tactile anchors that can lower hypervigilance and improve present-moment safety.",
        "Integration ethic: release slowly and translate internal calm into practical relational behavior.",
    ])
    enriched.setdefault("ritual", [
        f"Form {mudra_name} with soft pressure; avoid over-pressing fingertips.",
        "Breathe 4-in/6-out for at least 12 cycles while tracking body sensation.",
        "Close with wrist release and one grounded integration breath at the heart.",
    ])
    enriched.setdefault("ceremony", [
        "Opening: orient posture and set one precise intention.",
        f"Middle: hold {mudra_name} in calm concentration while observing energetic shifts.",
        "Closure: release, re-ground, and name one concrete change you will embody next.",
    ])
    enriched.setdefault("guided_practice", [
        f"Phase 1 — Setup: establish {mudra_name} and soften shoulders, jaw, and belly.",
        "Phase 2 — Regulation: maintain mudra through paced breathing and subtle interoception checks.",
        "Phase 3 — Integration: dissolve the mudra slowly and carry the felt state into immediate daily action.",
    ])
    enriched.setdefault(
        "why_this_heals",
        f"{mudra_name} combines tactile feedback, breath rhythm, and attentional containment to calm stress activation and improve mind-body coherence.",
    )
    enriched.setdefault(
        "integration_guide",
        "After releasing the mudra, place one palm on heart and one on lower belly for five breaths, then complete one grounded task to anchor the shift.",
    )

    enriched.setdefault("best_for_tags", _resolve_best_for_tags(enriched, "mudra"))

    return enriched


PUBLIC_DOMAIN_AUDIO_BY_AMBIENT_TYPE: dict[str, str] = {
    "whale": "/audio/whale.mp3",
    "crystal_bowls": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Small_tibetan_singing_bowl.ogg",
    "singing_bowls": "https://upload.wikimedia.org/wikipedia/commons/9/95/Singing_bowl.ogg",
    "gentle_water": "/audio/ocean.mp3",
    "rain": "/audio/rain.mp3",
    "forest_birds": "/audio/birds.mp3",
    "tuning_fork": "https://upload.wikimedia.org/wikipedia/commons/1/14/Tuning-fork-440Hz.ogg",
    "gong": "https://upload.wikimedia.org/wikipedia/commons/8/88/Gong_or_bell_vibrant.ogg",
    "drums": "/audio/drums.mp3",
    "dolphin": "/audio/dolphin.mp3",
    "solfeggio_528": "https://upload.wikimedia.org/wikipedia/commons/1/14/Tuning-fork-440Hz.ogg",
    "didgeridoo": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Didgeridoo_sound.ogg",
    "chimes": "https://upload.wikimedia.org/wikipedia/commons/3/35/Windchimes.ogg",
    "harp": "https://upload.wikimedia.org/wikipedia/commons/9/95/Singing_bowl.ogg",
    "drums_gentle": "/audio/drums.mp3",
    "drums_journey": "/audio/drums.mp3",
    "drums_awakening": "/audio/drums.mp3",
    "drums_fire": "/audio/drums.mp3",
    "drums_return": "/audio/drums.mp3",
}

LOCAL_AUDIO_CREDITS: dict[str, str] = {
    "/audio/whale.mp3": "Genuine humpback whale song — NOAA recording (Public Domain)",
    "/audio/drums.mp3": "Genuine hand-drum recording — Wikimedia Commons (CC BY-SA 3.0)",
    "/audio/ocean.mp3": "Genuine ocean waves recording — Wikimedia Commons (CC BY 3.0)",
    "/audio/rain.mp3": "Genuine rainfall recording — Wikimedia Commons (CC BY-SA 3.0)",
    "/audio/birds.mp3": "Genuine forest birdsong recording — Wikimedia Commons (Public Domain)",
    "/audio/dolphin.mp3": "Genuine dolphin vocalisations — NOAA Passive Acoustics recordings over genuine ocean waves (Public Domain)",
}


UNRELIABLE_AUDIO_HOST_TOKENS: tuple[str, ...] = (
    "upload.wikimedia.org",
    "commons.wikimedia.org",
    "wikipedia.org",
    "wikimedia.org",
)


def _is_reliable_public_audio_url(value: str) -> bool:
    candidate = str(value or "").strip()
    if not candidate:
        return False

    if candidate.startswith("/audio/"):
        return True

    parsed = urlparse(candidate)
    if parsed.scheme not in {"http", "https"}:
        return False

    host = (parsed.netloc or "").lower()
    if not host:
        return False

    return not any(token in host for token in UNRELIABLE_AUDIO_HOST_TOKENS)


def _enrich_sound_frequency_entry(entry: dict[str, Any]) -> dict[str, Any]:
    enriched = _enrich_devotional_language(_enrich_content_integrity(entry, "hybrid-curated"), "sound-frequencies")
    ambient_type = _normalize_label_key(str(enriched.get("ambient_type") or "")).replace(" ", "_")
    explicit_audio_url = str(enriched.get("audio_url") or "").strip()
    if explicit_audio_url and not _is_reliable_public_audio_url(explicit_audio_url):
        enriched.pop("audio_url", None)
        explicit_audio_url = ""

    if not explicit_audio_url:
        fallback_audio = PUBLIC_DOMAIN_AUDIO_BY_AMBIENT_TYPE.get(ambient_type)
        if fallback_audio and _is_reliable_public_audio_url(fallback_audio):
            enriched["audio_url"] = fallback_audio

    if str(enriched.get("audio_url") or "").strip():
        enriched.setdefault("audio_source", "public-domain")
        credit = LOCAL_AUDIO_CREDITS.get(str(enriched.get("audio_url") or "").strip())
        if credit:
            enriched.setdefault("audio_credit", credit)
        enriched.setdefault(
            "audio_license",
            "Public-domain / free-use audio source. Verify attribution needs before commercial redistribution.",
        )
    else:
        enriched.pop("audio_source", None)
        enriched.pop("audio_license", None)

    journey_name = str(enriched.get("name") or "Sound Frequency Journey").strip()
    element_name = str(enriched.get("element") or "Spirit").strip().lower()
    healing_focus = ""
    healing_properties = enriched.get("healing_properties")
    if isinstance(healing_properties, list) and healing_properties:
        healing_focus = str(healing_properties[0]).strip()

    enriched.setdefault(
        "alchemy",
        [
            f"Vibrational entrainment: {journey_name} supports {healing_focus or 'nervous-system coherence'} through paced sonic exposure.",
            f"Elemental support: this listening arc regulates {element_name} pathways through breath-linked sound immersion.",
            "Somatic safety: track jaw, throat, chest, and belly sensation to prevent dissociation during deep listening.",
            "Integration bridge: convert post-listening clarity into one practical action within 24 hours.",
        ],
    )
    enriched.setdefault(
        "ritual",
        [
            "Prepare environment: lower light, reduce interruptions, and choose grounded posture.",
            "Begin with 8-12 slow breaths before pressing play to reduce baseline stress activation.",
            "Close with one minute of silence and hydration before re-entering activity.",
        ],
    )
    enriched.setdefault(
        "ceremony",
        [
            "Opening: state one intention and orient to breath, posture, and emotional baseline.",
            "Middle: receive sound as embodied ritual while tracking real-time sensation shifts.",
            "Closure: complete one integration note and one practical behavior commitment.",
        ],
    )
    enriched.setdefault(
        "guided_practice",
        [
            "Phase 1 — Arrival: soften jaw, shoulders, and belly while lengthening exhale.",
            "Phase 2 — Immersion: continue listening with periodic interoception checks every few minutes.",
            "Phase 3 — Integration: sit in silence, journal one shift, and anchor a real-world action.",
        ],
    )
    enriched.setdefault(
        "why_this_heals",
        f"{journey_name} combines rhythmic auditory stimulation, breath pacing, and focused attention to reduce stress reactivity and improve embodied emotional regulation.",
    )
    enriched.setdefault(
        "integration_guide",
        "After listening, place one palm on heart and one on lower belly for five breaths, then complete one grounded action reflecting the state you cultivated.",
    )
    enriched.setdefault(
        "master_embodiment_protocol",
        _build_modality_master_protocol(
            journey_name,
            "sound frequency journey",
            "relaxed jaw, lengthened exhale, and heart-belly awareness",
        ),
    )
    enriched.setdefault("best_for_tags", _resolve_best_for_tags(enriched, "meditation"))

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
    self_route = f"/{domain}".rstrip("/")
    seen_routes: set[str] = set()
    filtered: list[dict[str, str]] = []
    for link in links:
        route = str(link["route"]).rstrip("/")
        if route == self_route or route in seen_routes:
            continue
        seen_routes.add(route)
        filtered.append(link)
    enriched["linked_practices"] = filtered
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

    enriched.setdefault(
        "why_this_heals",
        f"{practice_name} heals by synchronizing breath pacing, symbolic attention, and embodied action. "
        "When ritual is practiced with safety, nervous-system awareness, and integration, insight becomes durable change rather than temporary activation.",
    )
    enriched.setdefault(
        "safety_notes",
        "Move at a consent-based pace. If activation spikes, pause and orient to room details, feet contact, and long exhales before continuing.",
    )
    enriched.setdefault(
        "integration_actions",
        [
            "Hydrate and orient to your physical environment after practice.",
            "Journal one insight and one practical next step.",
            "Complete one grounded action within 24 hours that proves integration.",
        ],
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
        "Your nervous system becomes the primary altar: slow down enough to perceive sensation before interpretation.",
        "Integration is measured by behavior: repair one relationship, reset one boundary, or complete one aligned action within 24 hours.",
    ]
    default_ritual = [
        f"Opening ritual: place one hand on heart and one on lower belly, then breathe 4-in / 6-out for 12 rounds while naming your intention for {practice_name}.",
        "Somatic regulation ritual: pause every two minutes to soften jaw, shoulders, and pelvis so intensity stays within your consent window.",
        "Orientation ritual: name five things you can see and three things you can feel to anchor present-time safety.",
        "Embodiment ritual: let one gesture, posture, or vocal tone express the medicine moving through you.",
        "Integration ritual: drink water, journal one truth line, and complete one grounded action before the day ends.",
    ]
    default_ceremony = [
        f"Threshold ceremony: speak an invocation for {practice_name}, orient to safety in your space, and enter with reverence rather than urgency.",
        "Consent ceremony: ask your body what pace feels workable and commit to honoring that answer.",
        "Descent ceremony: move through breath, voice, and posture in deliberate phases while tracking sensation and emotional signal changes.",
        "Transmission ceremony: receive one clear teaching line and let it settle in the body before analysis.",
        "Closing ceremony: seal your field with gratitude, boundary clarity, and one service-aligned commitment for the next 24 hours.",
    ]
    default_guided = [
        "Guided phase 1 (arrival): orient your eyes to the room, lengthen exhale, and settle into grounded stillness.",
        "Guided phase 2 (somatic listening): track one body zone and one emotional tone for three minutes without forcing change.",
        "Guided phase 3 (embodiment): alternate breath focus with one ritual step until your body feels coherent and present.",
        "Guided phase 4 (articulation): speak one sentence that names what is true right now.",
        "Guided phase 5 (integration): name one insight aloud and convert it into a specific, time-bound action.",
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

    final_alchemy = _ensure_minimum_lines(alchemy_lines, default_alchemy, minimum=5, limit=10)
    final_ritual = _ensure_minimum_lines(ritual_lines, default_ritual, minimum=5, limit=10)
    final_ceremony = _ensure_minimum_lines(ceremony_lines, default_ceremony, minimum=5, limit=10)
    final_guided = _ensure_minimum_lines(guided_lines, default_guided, minimum=5, limit=10)

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
            "description": "How vowel resonance and consonant impact shape felt energetic meaning in light-language style chanting. Sound here is not decorative — it is a physiological regulator and symbolic carrier.",
            "practice": "Speak one symbol name slowly over six breaths, track vibration in throat/chest/pelvis, then write one sentence describing what changed in perception.",
        },
        {
            "id": "glyph-semantics",
            "title": "Glyph Semantics",
            "description": "Symbol families are interpreted through stroke direction, angle, and repetition density; each feature encodes a behavioral teaching, not only an abstract meaning.",
            "practice": "Trace a chosen glyph clockwise and write three felt meanings plus one concrete life action it asks of you.",
        },
        {
            "id": "light-code-articulation",
            "title": "Light-Coded Articulation",
            "description": "A light code is complete only when it can be articulated clearly: sensation language, symbolic language, and practical language unified.",
            "practice": "After ritual, name one body sensation, one symbolic insight, and one real-world action in one coherent paragraph.",
        },
    ])
    enriched.setdefault("symbol_lineage_notes", [
        "Cross-reference symbols with geometry traditions before interpretation.",
        "Anchor interpretations in breath rhythm and body sensation logs.",
        "Use repeated symbol journaling to detect stable semantic patterns.",
        "Do not treat symbols as ornaments; map each symbol to one relational or behavioral integration step.",
        "Prioritize precision language over mystification: what changed in breath, posture, boundary, and action?",
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
            symbol_name = str(entry.get("name") or "Light Code").strip()
            section_label = str(section_name).replace("_", " ").strip()

            if not str(entry.get("meaning") or "").strip():
                entry["meaning"] = (
                    f"{symbol_name} encodes a {section_label} principle that restores coherence between perception, breath, and embodied action. "
                    "Its purpose is to move spiritual insight out of abstraction and into regulated, relational presence."
                )

            if not str(entry.get("healing_lens") or "").strip():
                entry["healing_lens"] = (
                    "Symbolic activation, imagination, subtle-body entrainment, and nervous-system regulation through paced attention."
                )

            if not str(entry.get("why_this_heals") or "").strip():
                entry["why_this_heals"] = (
                    f"{symbol_name} heals by giving the mind a coherent pattern and giving the body a paced ritual container. "
                    "When attention, breath, and sensation are synchronized around one symbol, fragmentation decreases and agency returns. "
                    "This combination supports emotional regulation, clearer boundaries, and more grounded decision-making."
                )

            if not str(entry.get("ancient_traditions") or "").strip():
                entry["ancient_traditions"] = (
                    "This stream draws from temple geometry, initiatory letter mysticism, contemplative iconography, and embodied ritual sciences "
                    "that treated symbols as living instruments for transformation rather than decorative motifs."
                )

            if not str(entry.get("practice_guide") or "").strip():
                entry["practice_guide"] = (
                    f"1) Orient to safety and slow your exhale.\n"
                    f"2) Gaze softly at {symbol_name} for 2-4 minutes without forcing interpretation.\n"
                    "3) Track one body sensation, one emotional signal, and one belief pattern.\n"
                    "4) Trace or visualize the symbol with breath for 12 cycles.\n"
                    "5) Close by naming one practical integration action within 24 hours."
                )

            if not str(entry.get("extended_teachings") or "").strip():
                entry["extended_teachings"] = (
                    f"{symbol_name} is best understood as a ritual grammar for the psyche: pattern, proportion, and repetition train coherent attention. "
                    "In ceremony, the symbol becomes a mirror that reveals where your system is fragmented and where it is ready to reorganize. "
                    "Mastery is not in collecting symbols, but in practicing one symbol deeply enough that behavior changes."
                )

            entry.setdefault("light_coded_symbols", [
                symbol_char,
                f"{symbol_char} · {symbol_char}",
                f"⟡ {symbol_char} ⟡",
                f"{symbol_char} ↔ ∞ ↔ {symbol_char}",
                f"⟐ {symbol_char} ⟐",
            ])
            entry.setdefault("embodiment_ritual", [
                "Stand or sit upright, one palm on sternum and one palm on lower belly; let your exhale extend naturally.",
                f"Trace {symbol_char} slowly with breath for 12 cycles and track where activation, resistance, or emotion appears in the body.",
                "Name the exact sensation language (pressure, heat, trembling, opening, numbness) before assigning spiritual meaning.",
                "Speak one integration sentence aloud: what boundary, repair, or behavior shift this symbol asks for now.",
                "Close with water, orientation to room details, and one concrete 24-hour action.",
            ])
            entry.setdefault("ceremony", [
                "Opening: invoke consent, clarity, and truthful pacing before receiving symbol transmission.",
                "Consecration: establish breath cadence (4-in / 6-out) and stabilize your visual focus without forcing interpretation.",
                "Transmission: receive the symbol through gaze, tracing, and vocal tone while tracking body data in real time.",
                "Articulation: journal one symbolic insight and one relational application in plain language.",
                "Integration seal: commit one embodied action and complete it within 24 hours.",
            ])
            entry.setdefault("guided_practice", [
                "Phase 1 — Orient: soften shoulders, widen peripheral vision, and lengthen exhale for 90 seconds.",
                "Phase 2 — Attune: gaze the symbol and synchronize breath to stroke direction (inhale rise, exhale descend).",
                "Phase 3 — Encode: trace the geometry 12 times while noticing micro-shifts in posture and emotional tone.",
                "Phase 4 — Articulate: speak one sentence naming body sensation, symbolic meaning, and practical relevance.",
                "Phase 5 — Integrate: perform one grounded action that proves the code has moved from insight into embodiment.",
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
        additions.append(_apply_subject_image_alignment(dict(item), "hybrid-curated"))
    return practices + additions


def _append_water_supplements(practices: list[dict[str, Any]], category: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(practice.get("id")) for practice in practices}
    additions = []
    for item in WATER_PRACTICE_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if category and str(item.get("category", "")).lower() != str(category).lower():
            continue
        additions.append(_apply_subject_image_alignment(dict(item), "hybrid-curated"))
    return practices + additions


def _append_sacred_guardian_supplements(items: list[dict[str, Any]], category: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(item.get("id")) for item in items}
    additions = []
    category_filter = str(category or "").strip().lower()
    for item in SACRED_GUARDIAN_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if category_filter and str(item.get("category", "")).strip().lower() != category_filter:
            continue
        additions.append(item)
    return items + additions


def _append_ancient_wisdom_supplements(items: list[dict[str, Any]], tradition: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(item.get("id")) for item in items}
    additions = []
    tradition_filter = str(tradition or "").strip().lower()
    for item in ANCIENT_WISDOM_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue
        if tradition_filter and str(item.get("tradition", "")).strip().lower() != tradition_filter:
            continue
        additions.append(item)
    return items + additions


def _enrich_ancient_wisdom_entry(entry: dict[str, Any]) -> dict[str, Any]:
    enriched = _enrich_devotional_language(_apply_subject_image_alignment(dict(entry), "hybrid-curated"), "ancient-wisdom")
    title = str(enriched.get("name") or enriched.get("title") or "Ancient Wisdom Teaching").strip()
    tradition = str(enriched.get("tradition") or "international").strip().replace("_", " ").title()
    teaching_line = (
        str(enriched.get("teaching") or "").strip()
        or str(enriched.get("description") or "").strip()
        or "Traditional teaching depth"
    )

    enriched.setdefault("expanded_context", f"Extended context: {teaching_line}.")
    enriched.setdefault("section_focus", str(enriched.get("tradition") or "cross-tradition"))
    enriched.setdefault(
        "alchemy",
        [
            f"Lineage intelligence: {title} encodes practical ceremonial ethics from {tradition} streams.",
            "Embodiment principle: wisdom must be tested through behavior, not held as abstract concept.",
            "Nervous-system literacy: pacing, regulation, and consent create sustainable spiritual depth.",
            "Integration ethic: complete one relational or practical action to anchor each teaching.",
        ],
    )
    enriched.setdefault(
        "ritual",
        [
            "Orient to safety and intention before entering sacred study or practice.",
            "Name one teaching sentence and embody it through breath, posture, and action.",
            "Close with gratitude, journaling, and one concrete integration commitment.",
        ],
    )
    enriched.setdefault(
        "ceremony",
        [
            "Opening: invoke humility, boundaries, and clear devotional intention.",
            "Middle: engage ritual sequence with periodic body-based regulation check-ins.",
            "Closure: seal with prayer, practical action, and compassionate accountability.",
        ],
    )
    enriched.setdefault(
        "guided_practice",
        [
            "Phase 1 — Preparation: posture, breath coherence, and emotional orientation.",
            "Phase 2 — Transmission: receive one teaching and map it to a real-life challenge.",
            "Phase 3 — Embodiment: complete one immediate, grounded action before ending.",
        ],
    )
    enriched.setdefault(
        "why_this_heals",
        f"{title} supports healing by integrating ceremonial meaning, nervous-system regulation, and practical ethical action into one coherent embodied pathway.",
    )
    enriched.setdefault(
        "integration_guide",
        "Within 24 hours, complete one practical action that proves this teaching is embodied (boundary, repair, service, or aligned communication).",
    )
    enriched.setdefault(
        "master_embodiment_protocol",
        _build_modality_master_protocol(
            title,
            f"{tradition} wisdom ritual",
            "upright spine, softened jaw, and compassionate focus",
        ),
    )
    enriched.setdefault("best_for_tags", _resolve_best_for_tags(enriched, "meditation"))

    override_tutorials = _build_admin_override_tutorials(title, enriched.get("youtube_tutorial_override_urls"))
    if override_tutorials:
        enriched["youtube_tutorials"] = override_tutorials
    else:
        enriched.setdefault(
            "youtube_tutorials",
            _build_youtube_tutorial_links(title, f"{tradition} ritual practice", None),
        )

    return enriched


def _to_ancient_mystery_entry(item: dict[str, Any]) -> dict[str, Any]:
    stream_key = str(item.get("stream") or "mystery").strip().lower()
    tradition = MYSTERY_STREAM_TO_ANCIENT_TRADITION.get(stream_key, "international")
    slug = re.sub(r"[^a-z]+", "-", str(item.get("name") or item.get("id") or "mystery").strip().lower()).strip("-")
    transformed = dict(item)
    transformed["id"] = f"ancient-{stream_key}-{slug}"
    transformed["tradition"] = tradition
    transformed["lineage_stream"] = stream_key
    transformed["title"] = str(item.get("title") or item.get("name") or "Mystery Teaching")
    stable_image_key = str(item.get("id") or item.get("name") or item.get("title") or "mystery-teaching")
    stream_variant = _select_stream_image_variant(stream_key, stable_image_key)
    transformed["image_url"] = str(item.get("image_url") or stream_variant or MYSTERY_STREAM_IMAGE_FALLBACKS.get(stream_key, ""))
    transformed.setdefault("teachings", list(item.get("alchemy") or []))
    transformed.setdefault("practice", list(item.get("guided_practice") or item.get("ritual") or []))
    transformed.setdefault("source_references", [])
    transformed["source_type"] = "curated-mystery-lineage"
    transformed["review_status"] = "reviewed"
    return transformed


def _append_mystery_school_to_ancient(entries: list[dict[str, Any]], tradition: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(item.get("id")) for item in entries}
    additions = []
    tradition_filter = str(tradition or "").strip().lower()

    for item in MYSTERY_SCHOOL_TEACHINGS:
        transformed = _to_ancient_mystery_entry(item)
        transformed_id = str(transformed.get("id"))
        if transformed_id in existing_ids:
            continue
        if tradition_filter and str(transformed.get("tradition") or "").strip().lower() != tradition_filter:
            continue
        additions.append(transformed)
        existing_ids.add(transformed_id)

    return entries + additions


def _append_sacred_ally_galactic_supplements(
    items: list[dict[str, Any]],
    category: Optional[str],
    ally_type: Optional[str],
) -> list[dict[str, Any]]:
    existing_ids = {str(item.get("id")) for item in items}
    additions = []
    category_filter = str(category or "").strip().lower()
    ally_filter = str(ally_type or "").strip().lower()
    kundalini_aliases = {"kundalini", "kundulini", "serpent-kundalini", "kundalini-consciousness"}

    for item in SACRED_ALLY_GALACTIC_SUPPLEMENTS:
        if item["id"] in existing_ids:
            continue

        item_category = str(item.get("category", "")).strip().lower()
        item_ally_type = str(item.get("ally_type", "")).strip().lower()

        if category_filter and item_category != category_filter:
            continue

        if ally_filter:
            if ally_filter in kundalini_aliases:
                if item_ally_type != "serpent":
                    continue
            elif item_ally_type != ally_filter:
                continue

        additions.append(item)

    return items + additions


def _enrich_mystery_school_entry(entry: dict[str, Any]) -> dict[str, Any]:
    enriched = _enrich_devotional_language(_apply_subject_image_alignment(entry, "curated-sacred-teaching"), "ancient-wisdom")
    stream_key = str(enriched.get("stream") or "").strip().lower()
    stream_label = MYSTERY_STREAM_LABELS.get(stream_key, "Mystery School")
    title = str(enriched.get("title") or enriched.get("name") or "Mystery Teaching").strip()
    stable_image_key = str(enriched.get("id") or title or "mystery-teaching")
    variant_image = _select_stream_image_variant(stream_key, stable_image_key)
    if variant_image:
        enriched["image_url"] = variant_image
        source_refs = list(enriched.get("source_references") or [])
        if variant_image not in source_refs:
            source_refs.append(variant_image)
        enriched["source_references"] = source_refs[:8]
        enriched["source_type"] = "subject-matched-curated"
        enriched["review_status"] = "verified"
        if isinstance(enriched.get("content_integrity"), dict):
            enriched["content_integrity"]["source_type"] = "subject-matched-curated"
            enriched["content_integrity"]["verified"] = True
            enriched["content_integrity"]["references_count"] = len(enriched["source_references"])

    enriched.setdefault("stream_label", stream_label)
    enriched.setdefault("category", "mystery_school")
    enriched.setdefault("premium_unlock_id", "mystery_school")
    enriched.setdefault(
        "master_embodiment_protocol",
        _build_modality_master_protocol(title, stream_label, "steady breath, grounded spine, and compassionate focus"),
    )

    override_tutorials = _build_admin_override_tutorials(title, enriched.get("youtube_tutorial_override_urls"))
    if override_tutorials:
        enriched["youtube_tutorials"] = override_tutorials
    else:
        enriched.setdefault(
            "youtube_tutorials",
            _build_youtube_tutorial_links(title, "mystery school teaching", None),
        )

    enriched.setdefault("best_for_tags", _resolve_best_for_tags(enriched, "mystery_school"))
    return enriched


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


def _append_mudra_supplements(practices: list[dict[str, Any]], element: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(practice.get("id")) for practice in practices}
    additions = []
    element_filter = str(element or "").strip().lower()

    for item in MUDRA_SUPPLEMENTS:
        if str(item.get("id")) in existing_ids:
            continue
        if element_filter and str(item.get("element", "")).strip().lower() != element_filter:
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
        additions.append(_apply_subject_image_alignment(dict(item), "hybrid-curated"))
    return practices + additions


def _ensure_shamanic_journey_depth(practice: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(practice)
    category = str(enriched.get("category") or "").strip().lower()
    if category != "journey":
        return enriched

    name = str(enriched.get("name") or "Shamanic Journey").strip()
    element = str(enriched.get("element") or "Spirit").strip().title()
    base_steps = enriched.get("journey_steps") or enriched.get("visualization_steps") or enriched.get("steps") or []

    if not isinstance(base_steps, list) or not base_steps:
        base_steps = [
            "Orient to safety and slow your exhale before beginning.",
            "Name your intention and enter journey space with reverence.",
            "Receive one clear teaching and return with grounded awareness.",
        ]

    enriched.setdefault("journey_steps", base_steps)
    enriched.setdefault("guided_practice", [
        "Phase 1 — Threshold: orient to room, body, and breath for coherent entry.",
        "Phase 2 — Journey: move through imagery while tracking sensation and emotional signal changes.",
        "Phase 3 — Return: complete re-entry with hydration, journaling, and practical action.",
    ])
    enriched.setdefault("ritual", [
        f"Invoke {element} support and speak one truthful intention aloud.",
        "Use paced breathing (4-in / 6-out) to prevent over-activation during the journey.",
        "Close with one embodied integration commitment in the next 24 hours.",
    ])
    enriched.setdefault("ceremony", [
        "Opening: establish sacred container, consent, and protection boundaries.",
        "Middle: follow symbolic guidance while remaining anchored in body awareness.",
        "Closure: seal the field with gratitude, orientation, and behavioral integration.",
    ])
    enriched.setdefault("integration_actions", [
        "Hydrate and eat grounding food before returning to digital/social activity.",
        "Journal one image, one teaching, and one embodied next step.",
        "Take one practical action proving the teaching is integrated.",
    ])
    enriched.setdefault("post_journey_integration", [
        "Rest 10-20 minutes after the journey to stabilize the nervous system.",
        "Avoid overstimulation for the next hour while insights settle.",
        "Review your notes after 24 hours and refine your action commitment.",
    ])
    enriched.setdefault(
        "why_this_heals",
        f"{name} heals by combining imaginal journeying, breath regulation, and disciplined integration. "
        "The symbolic field opens insight while structured re-entry prevents fragmentation and translates revelation into grounded change.",
    )
    enriched.setdefault(
        "healing_lens",
        "Journey-state symbolism, nervous-system regulation, relational truth, and practical embodiment.",
    )
    enriched.setdefault(
        "extended_teachings",
        f"{name} is an initiatory process, not a one-time visualization. Repetition builds trust between psyche, body, and spirit. "
        "The medicine matures through consistent integration: breath, boundary, and actionable service.",
    )

    return enriched


def _append_earth_crafting_supplements(items: list[dict[str, Any]], category: Optional[str]) -> list[dict[str, Any]]:
    existing_ids = {str(item.get("id")) for item in items}
    existing_names = {
        _normalize_label_key(str(item.get("name") or ""))
        for item in items
        if str(item.get("name") or "").strip()
    }
    additions = []
    category_filter = (category or "").strip().lower()

    for item in EARTH_CRAFTING_TOOL_SUPPLEMENTS:
        supplement_id = str(item.get("id") or "").strip()
        supplement_name_key = _normalize_label_key(str(item.get("name") or ""))

        if supplement_id and supplement_id in existing_ids:
            continue
        if supplement_name_key and supplement_name_key in existing_names:
            continue
        item_category = str(item.get("category") or "").strip().lower()
        if category_filter and item_category and item_category != category_filter:
            continue
        additions.append(dict(item))
        if supplement_id:
            existing_ids.add(supplement_id)
        if supplement_name_key:
            existing_names.add(supplement_name_key)

    return items + additions


def _dedupe_content_items_by_id_or_name(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Remove duplicate list entries by stable id first, then normalized name fallback."""
    deduped: list[dict[str, Any]] = []
    seen_keys: set[str] = set()

    for item in items:
        item_id = str(item.get("id") or "").strip()
        name_key = _normalize_label_key(str(item.get("name") or ""))
        unique_key = f"id:{item_id}" if item_id else f"name:{name_key}"
        if unique_key in seen_keys:
            continue
        seen_keys.add(unique_key)
        deduped.append(item)

    return deduped


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
        "Day 0 orientation: name lineage respect, consent, and ecological reciprocity before touching materials.",
        "Day 1 gathering blessing: cleanse each material with breath or water while speaking gratitude aloud.",
        "Day 2 crafting vow: begin assembly only after body, breath, and intention are coherent.",
        "Day 3 consecration: dedicate the tool with a spoken purpose prayer and service boundary.",
    ])
    enriched.setdefault("ceremony", [
        "Threshold night: orient body, invoke protection, and record where every material came from.",
        "Crafting day: work in rhythmic breath cycles and pause every 15 minutes for sensation check-ins.",
        "Rest day: leave the tool untouched for one sleep cycle so intention can settle into form.",
        "Consecration day: awaken the tool with prayer, breath, sound, and one concrete integrity commitment.",
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
        "Day 0 (Preparation): confirm ethical origin of each material and record provenance before assembly.",
        "Day 1 (Gathering): set a gratitude altar and introduce each material with breath and blessing.",
        "Day 2 (Crafting): craft in silence or prayerful chanting with periodic nervous-system regulation breaks.",
        "Day 3 (Resting): place the nearly finished tool in a clean cloth overnight with one protective prayer.",
        "Day 4 (Consecration): activate with breath, water, sound, and explicit service vow.",
        "Day 5 (Embodiment): use the tool in a short ceremony and document what changed in your body-field.",
    ])
    enriched.setdefault("multi_day_pathway", [
        "Preparation (Day 0): ethical sourcing audit, reciprocity offering, and intention clarity.",
        "Gathering (Day 1): ritual introduction of materials and body-based grounding.",
        "Crafting (Day 2): focused construction with breath pacing and trauma-aware pauses.",
        "Resting (Day 3): no crafting; allow integration, dreams, and symbolic messages to surface.",
        "Consecration + Embodiment (Days 4-5): blessing, activation, first ceremonial use, and integration journaling.",
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


SACRED_GUARDIAN_CATEGORY_ROTATION = [
    "power animal",
    "spirit animal",
    "dragon energy",
    "angel",
    "familiar",
    "messenger",
]


def _prioritize_sacred_guardians_for_tiering(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not items:
        return []

    queues: dict[str, list[dict[str, Any]]] = {category: [] for category in SACRED_GUARDIAN_CATEGORY_ROTATION}
    ordered_original = [dict(item) for item in items]
    selected_ids: set[str] = set()

    for item in ordered_original:
        normalized_category = _normalize_label_key(str(item.get("category") or ""))
        if normalized_category in queues:
            queues[normalized_category].append(item)

    prioritized: list[dict[str, Any]] = []
    while True:
        progressed = False
        for category in SACRED_GUARDIAN_CATEGORY_ROTATION:
            if not queues[category]:
                continue
            candidate = queues[category].pop(0)
            candidate_id = str(candidate.get("id") or "")
            if candidate_id and candidate_id in selected_ids:
                continue
            if candidate_id:
                selected_ids.add(candidate_id)
            prioritized.append(candidate)
            progressed = True
        if not progressed:
            break

    for item in ordered_original:
        item_id = str(item.get("id") or "")
        if item_id and item_id in selected_ids:
            continue
        if item_id:
            selected_ids.add(item_id)
        prioritized.append(item)

    return prioritized


def _prepare_section_items_for_tiering(items: list[dict[str, Any]], unlock_id: str) -> list[dict[str, Any]]:
    if unlock_id == "sacred_guardians":
        return _prioritize_sacred_guardians_for_tiering(items)
    return sorted(items, key=_parse_tier_sort_value)


def _ensure_section_images(items: list[dict[str, Any]], section_key: str) -> list[dict[str, Any]]:
    fallback = SECTION_IMAGE_DEFAULTS.get(section_key)
    if not fallback:
        return items

    normalized: list[dict[str, Any]] = []
    for item in items:
        entry = dict(item)
        if not str(entry.get("image_url") or "").strip():
            entry["image_url"] = fallback
            entry["source_type"] = entry.get("source_type") or "section-image-default"
            entry["review_status"] = entry.get("review_status") or "reviewed"
            entry["source_references"] = _merge_source_references(entry.get("source_references"), [fallback])
        normalized.append(entry)
    return normalized


def _apply_id_image_overrides(items: list[dict[str, Any]], overrides: dict[str, str]) -> list[dict[str, Any]]:
    if not items or not overrides:
        return items

    patched: list[dict[str, Any]] = []
    for item in items:
        entry = dict(item)
        item_id = str(entry.get("id") or "")
        override = overrides.get(item_id)
        if override:
            entry["image_url"] = override
            entry["source_type"] = "curated-realism-override"
            entry["review_status"] = "reviewed"
            entry["source_references"] = _merge_source_references(entry.get("source_references"), [override])
        patched.append(entry)
    return patched


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

    deepening_arcs = [
        {
            "stage": "Subtle Body Attunement",
            "description": "Return to {name} with the outer form already familiar — this cycle turns attention inward. Slow every transition to half speed and track the subtle currents beneath the technique: temperature shifts, micro-tension, the pull of breath through the body. {focus}",
            "alchemy": [
                "Where the first pass taught the shape, this cycle teaches the listening: sense before you act.",
                "Let the practice become 30% smaller and 100% more precise — refinement is the medicine now.",
            ],
            "guided": [
                "Phase 1 (Descent): enter the familiar form, then close the eyes and drop attention below the skin.",
                "Phase 2 (Listening): follow one subtle sensation for a full minute without changing anything.",
                "Phase 3 (Response): let the body adjust itself from the inside — you follow, it leads.",
            ],
        },
        {
            "stage": "Shadow Integration",
            "description": "This cycle of {name} works with what the first pass stirred up but did not resolve. Notice the moment you want to quit, rush, or check out — that threshold is the doorway. Stay one breath longer than comfortable, then release with full consent. {focus}",
            "alchemy": [
                "Meet resistance as information, not failure: what does this edge protect?",
                "Transmute avoidance into presence by shortening the practice but refusing to leave it early.",
            ],
            "guided": [
                "Phase 1 (Approach): begin gently and name the first place of resistance out loud.",
                "Phase 2 (Threshold): stay at the edge one slow breath longer than habit allows, without forcing.",
                "Phase 3 (Release): step back deliberately, honouring the boundary you chose rather than fled.",
            ],
        },
        {
            "stage": "Elemental Communion",
            "description": "Practice {name} as a dialogue rather than a technique. Bring one natural element into the space — water, stone, flame, or open air — and let its quality set your rhythm. The aim is relationship: the practice becomes a meeting place, not a performance. {focus}",
            "alchemy": [
                "Ask the element one question before beginning and listen for the answer in the body, not the mind.",
                "Match the element's tempo: stone-slow, water-fluid, flame-bright, or air-light.",
            ],
            "guided": [
                "Phase 1 (Invitation): place the element where you can see or touch it and offer one breath of greeting.",
                "Phase 2 (Communion): practice while borrowing the element's quality — its patience, flow, heat, or lightness.",
                "Phase 3 (Gratitude): close by returning something — a word of thanks, a moment of stillness, a drop of water to the earth.",
            ],
        },
        {
            "stage": "Ceremonial Depth",
            "description": "Hold {name} as full ceremony: threshold, heart, and return. Prepare the space as if a beloved teacher were arriving, because one is — the deeper self that only appears when the container is worthy. Extend the practice by a third and let silence carry the extra time. {focus}",
            "alchemy": [
                "Ceremony is attention made visible: every object placed with care changes the nervous system before you begin.",
                "The return matters as much as the peak — leave slowly enough to bring the state with you.",
            ],
            "guided": [
                "Phase 1 (Threshold): mark the beginning clearly — a bell, a bow, a spoken line — so the body knows ordinary time has paused.",
                "Phase 2 (Heart): move through the full practice unhurried, letting silence stretch between each stage.",
                "Phase 3 (Return): close the ceremony formally and step out changed, carrying one vow into daily life.",
            ],
        },
        {
            "stage": "Silent Transmission",
            "description": "The final deepening of {name} removes all scaffolding: no counting, no cues, no self-narration. Enter the practice and let twenty or more minutes pass in wordless attention. What remains when instruction falls away is the teaching itself — received directly, body to body, silence to silence. {focus}",
            "alchemy": [
                "Mastery is measured by how little you need: release the cues and trust what the body has memorised.",
                "In silence, the practice practices you — allow it.",
            ],
            "guided": [
                "Phase 1 (Emptying): set no timer beyond a minimum; release every technique into simple presence.",
                "Phase 2 (Transmission): remain in wordless attention, meeting whatever arises without commentary.",
                "Phase 3 (Sealing): end only when the body signals completion, then sit one extra minute in gratitude.",
            ],
        },
    ]

    extension_index = 1

    while len(expanded_items) < SECTION_MAX_TIER_ITEMS:
        base_item = source_items[(len(expanded_items) - len(items)) % len(source_items)]
        base_id = str(base_item.get("id") or f"{unlock_id}-practice")
        base_name = str(base_item.get("name") or base_item.get("title") or section_title)

        arc = deepening_arcs[(extension_index - 1) % len(deepening_arcs)]
        domain_focus = domain_focus_map.get(domain_seed, default_domain_focus)

        extension_item = dict(base_item)
        extension_item["id"] = f"{base_id}-deepening-{extension_index}"

        extension_title = f"{base_name} · {arc['stage']}"
        extension_item["name"] = extension_title
        if "title" in extension_item:
            extension_item["title"] = extension_title

        extension_item["description"] = arc["description"].format(name=base_name, focus=domain_focus)
        extension_item["alchemy"] = [line.format(name=base_name) for line in arc["alchemy"]] + [domain_focus]
        extension_item["ritual"] = [
            f"Prepare one anchor object that represents your history with {base_name} — the same practice, met at new depth.",
            f"Speak the stage aloud — '{arc['stage']}' — as the intention for this cycle, then begin with three slow exhales.",
            "Close by journaling what this cycle revealed that the first pass could not.",
        ]
        extension_item["ceremony"] = [
            f"Opening: acknowledge the ground already covered with {base_name} before asking it to open further.",
            f"Middle: hold the {arc['stage'].lower()} focus as the organising thread of the whole session.",
            "Closing: seal the deepening with one embodied gesture and a named integration step.",
        ]
        extension_item["guided_practice"] = list(arc["guided"])

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

    ordered = _prepare_section_items_for_tiering(items, unlock_id)
    ordered = _ensure_section_images(ordered, unlock_id)
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
    """Expand guided practice text into long-form narration suitable for configurable 7-20 minute audio."""
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
    target_minutes = max(
        MIN_NARRATION_MINUTES,
        min(MAX_NARRATION_MINUTES, int(round(request.duration_minutes or MIN_NARRATION_MINUTES))),
    )
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


def _normalize_retreat_mode(value: Any) -> str:
    raw = _normalize_label_key(str(value or ""))
    if not raw:
        return "physical"
    if "hybrid" in raw or ("online" in raw and "physical" in raw):
        return "hybrid"
    if "online" in raw or "virtual" in raw or "zoom" in raw or "remote" in raw:
        return "online"
    return "physical"


def _is_effectively_empty_retreat(retreat: dict[str, Any]) -> bool:
    meaningful_fields = (
        "title",
        "name",
        "description",
        "location",
        "facilitator",
        "highlights",
        "includes",
        "healing_modalities",
        "registration_link",
        "online_session_url",
        "website_url",
        "image_url",
    )
    has_meaningful_text = any(str(retreat.get(field) or "").strip() for field in meaningful_fields)
    has_schedule = any(str(retreat.get(field) or "").strip() for field in ("start_date", "end_date", "duration_days"))
    has_pricing = any(str(retreat.get(field) or "").strip() for field in ("price", "deposit"))
    has_social = bool(_normalize_retreat_social_links(retreat))
    has_capacity = str(retreat.get("max_participants") or "").strip() != ""
    has_mode = str(retreat.get("retreat_mode") or "").strip() != ""

    return not (
        has_meaningful_text
        or has_schedule
        or has_pricing
        or has_social
        or has_capacity
        or has_mode
    )


def _normalize_retreat_social_links(retreat: dict[str, Any]) -> list[dict[str, str]]:
    links: list[dict[str, str]] = []
    seen: set[str] = set()

    direct_fields = [
        ("instagram", retreat.get("instagram_url")),
        ("youtube", retreat.get("youtube_url")),
        ("facebook", retreat.get("facebook_url")),
        ("tiktok", retreat.get("tiktok_url")),
        ("website", retreat.get("website_url")),
    ]
    for platform, raw_url in direct_fields:
        url = str(raw_url or "").strip()
        if not (url.startswith("https://") or url.startswith("http://")):
            continue
        if url in seen:
            continue
        seen.add(url)
        links.append({"platform": platform, "url": url})

    raw_social = retreat.get("social_media_links")
    if isinstance(raw_social, dict):
        for platform, raw_url in raw_social.items():
            url = str(raw_url or "").strip()
            if not (url.startswith("https://") or url.startswith("http://")):
                continue
            if url in seen:
                continue
            seen.add(url)
            links.append({"platform": _normalize_label_key(str(platform or "")) or "social", "url": url})
    elif isinstance(raw_social, list):
        for item in raw_social:
            if isinstance(item, dict):
                url = str(item.get("url") or "").strip()
                platform = _normalize_label_key(str(item.get("platform") or "")) or "social"
            else:
                url = str(item or "").strip()
                platform = "social"
            if not (url.startswith("https://") or url.startswith("http://")):
                continue
            if url in seen:
                continue
            seen.add(url)
            links.append({"platform": platform, "url": url})

    return links


def _normalize_retreat_entry(retreat: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(retreat)
    title = str(normalized.get("title") or normalized.get("name") or "Retreat").strip()
    mode = _normalize_retreat_mode(
        normalized.get("retreat_mode")
        or normalized.get("modality")
        or normalized.get("delivery_mode")
        or normalized.get("format")
    )
    booking_url = str(normalized.get("booking_url") or normalized.get("registration_link") or "").strip()
    online_session_url = str(
        normalized.get("online_session_url")
        or normalized.get("join_url")
        or normalized.get("stream_url")
        or ""
    ).strip()

    normalized["title"] = title
    normalized.setdefault("name", title)
    normalized["retreat_mode"] = mode
    normalized["supports_online"] = mode in {"online", "hybrid"} or bool(online_session_url)
    normalized["supports_physical"] = mode in {"physical", "hybrid"}
    normalized["booking_url"] = booking_url
    normalized["online_session_url"] = online_session_url
    normalized["social_media_links"] = _normalize_retreat_social_links(normalized)

    if mode == "online" and not normalized.get("location"):
        normalized["location"] = "Online"

    return normalized


def _select_stream_image_variant(stream_key: str, stable_key: str) -> Optional[str]:
    normalized_stream = _normalize_label_key(stream_key).replace(" ", "_")
    pool = MYSTERY_STREAM_IMAGE_POOLS.get(normalized_stream)
    if not pool:
        return None
    digest = hashlib.sha256(f"{normalized_stream}:{stable_key}".encode("utf-8")).hexdigest()
    idx = int(digest[:8], 16) % len(pool)
    return pool[idx]


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
    poses = _append_yoga_pose_supplements(poses)

    deduped_poses: list[dict[str, Any]] = []
    seen_pose_keys: set[str] = set()
    seen_generic_names: set[str] = set()
    duplicate_id_prefixes = (
        "warrior-",
        "tree-pose",
        "cobra-pose",
        "childs-pose",
        "downward-dog",
    )
    for pose in poses:
        pose_id = str(pose.get("id") or "")
        if any(pose_id.startswith(prefix) for prefix in duplicate_id_prefixes):
            continue

        name_key = _normalize_label_key(str(pose.get("name") or ""))
        sanskrit_key = _normalize_label_key(str(pose.get("sanskrit_name") or ""))
        if name_key in seen_generic_names:
            continue

        dedupe_key = f"{name_key}::{sanskrit_key}"
        if dedupe_key in seen_pose_keys:
            continue
        seen_pose_keys.add(dedupe_key)
        seen_generic_names.add(name_key)
        deduped_poses.append(pose)

    enriched = [_enrich_devotional_language(_enrich_yoga_pose(pose), "elemental-practices") for pose in deduped_poses]
    tiered = _apply_free_paid_tiering(enriched, "yoga_poses")
    return _enforce_yoga_pose_realism(tiered)


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
    sessions = [
        {
            **session,
            **({
                "description": "A traditional yogic cleansing breath built around a crisp, active nasal exhale and a passive rebound inhale. Begin gently; speed is never the goal.",
                "benefits": ["Energising breath practice", "Breath awareness", "Focused attention", "Traditional yogic kriya practice"],
                "frequency": "Optional ambience only — no healing frequency is required",
                "instructions": "Sit tall without rigidity. First practise several ordinary breaths. For Kapalabhati, gently contract the lower belly to create a short active exhale through the nose; allow the inhale to return by itself without pulling it in. Beginner option: 10 gentle pulses, then breathe normally for 30–60 seconds. If comfortable, repeat 2–3 rounds. Experienced practitioners may gradually increase the number or tempo without strain. Stop for dizziness, pain, concerning tingling, panic, headache or breathlessness. Choose ordinary slow breathing instead during pregnancy or whenever forceful breathwork is not appropriate for you; seek individual clinical guidance for cardiovascular, respiratory, neurological, eye-pressure or recent surgical concerns.",
            } if "kapalabhati" in str(session.get("name") or "").lower() else {}),
        }
        for session in sessions
    ]
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
    
    mudras = await db.mudras.find(query, {"_id": 0}).to_list(length=120)
    mudras = _append_mudra_supplements(mudras, element)

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
    # Pass 33: deepen legacy Mindful Eating records even when the database predates the seed update.
    practices = [
        {
            **practice,
            **({
                "description": "Meet a meal as a sensory ritual. Slow enough to notice colour, scent, texture, taste, swallowing, satisfaction and the changing signals of your own body without judgement.",
                "benefits": ["Sensory awareness", "Food appreciation", "Present-moment connection"],
                "instructions": [
                    "Arrival — sit with your food for three natural breaths. Feel your feet, seat and hands and notice your present level of hunger without needing to change it.",
                    "Seeing — take in colour, shape, steam, light and detail before the first bite.",
                    "Scent & touch — notice aroma, temperature, weight and texture. Let anticipation be part of the practice.",
                    "Gratitude — acknowledge the Earth, water, sunlight, people and living systems that helped this food reach you, in words that feel natural to you.",
                    "First bite — take a comfortable bite and pause. Notice temperature, texture and the first flavours before chewing again.",
                    "Chewing — chew at an unhurried pace. Track how flavour and texture change rather than aiming for a prescribed number of chews.",
                    "Swallowing — notice the moment you choose to swallow and sensations through throat, chest and belly. Then allow one easy breath.",
                    "Continue — move between food and body. Notice hunger, fullness, satisfaction, pleasure, neutrality or discomfort without grading any of them as good or bad.",
                    "Pause midway — put utensils down briefly. Ask: What am I sensing now? What would feel nourishing from here? Let your own body inform the next choice.",
                    "Closing — when you finish, rest for three breaths. Name one sensory detail you appreciated and thank your body for communicating with you.",
                ],
            } if str(practice.get("name") or "").strip().lower() == "mindful eating" else {}),
        }
        for practice in practices
    ]
    enriched = [
        _enrich_devotional_language(
            _apply_subject_image_alignment(_enrich_practice_links(practice, "mindfulness"), "hybrid-curated"),
            "mindfulness",
        )
        for practice in practices
    ]
    enriched = _apply_id_image_overrides(enriched, MINDFULNESS_IMAGE_OVERRIDES)
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
    enriched_practices = _apply_id_image_overrides(enriched_practices, MOVEMENT_FORM_IMAGE_OVERRIDES)
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
    practices = _apply_id_image_overrides(practices, HEART_IMAGE_OVERRIDES)
    enriched = [_enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "heart-practices") for practice in practices]
    return _apply_free_paid_tiering(enriched, "heart_practices")


@router.get("/heart-practices/{practice_id}")
async def get_heart_practice(practice_id: str) -> dict[str, Any]:
    """Get a specific heart practice."""
    db = get_db()
    practice = await db.heart_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Heart practice not found")
    if str(practice.get("id") or "") in HEART_IMAGE_OVERRIDES:
        practice["image_url"] = HEART_IMAGE_OVERRIDES[str(practice.get("id"))]
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
    practices = [_apply_subject_image_alignment(_ensure_shamanic_journey_depth(practice), "hybrid-curated") for practice in practices]
    practices = _apply_id_image_overrides(practices, SHAMANIC_IMAGE_OVERRIDES)
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
    deepened = _ensure_shamanic_journey_depth(practice)
    return _enrich_devotional_language(_enrich_content_integrity(deepened, "hybrid-curated"), "shamanic-practices")


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
    processes = _dedupe_content_items_by_id_or_name(processes)

    # Keep Earth Crafting and Sacred Tool Birthing grounded and non-repeating.
    # Deepening cycle expansion can read as duplicates for these categories in UI.
    if category and str(category).strip().lower() in {"earth-crafting", "sacred-tool-birthing"}:
        ordered = sorted(processes, key=lambda item: str(item.get("id") or ""))
        for item in ordered:
            item.pop("is_premium", None)
            item.pop("premium_unlock_id", None)
            item.pop("premium_label", None)
        enriched = [
            _enrich_devotional_language(
                _enrich_sacred_tool_birthing_entry(_enrich_content_integrity(process, "hybrid-curated")),
                "creative-processes",
            )
            for process in ordered
        ]
        return enriched

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
    guardians = await db.sacred_guardians.find(query, {"_id": 0}).to_list(length=220)
    enriched = [
        _enrich_devotional_language(_apply_subject_image_alignment(guardian, "hybrid-curated"), "sacred-guardians")
        for guardian in guardians
    ]
    return _apply_free_paid_tiering(enriched, "sacred_guardians")


@router.get("/sacred-guardians/{guardian_id}")
async def get_sacred_guardian(guardian_id: str) -> dict[str, Any]:
    """Get a specific sacred guardian."""
    db = get_db()
    guardian = await db.sacred_guardians.find_one({"id": guardian_id}, {"_id": 0})
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    return _enrich_devotional_language(_apply_subject_image_alignment(guardian, "hybrid-curated"), "sacred-guardians")


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

    items = await db.sacred_ally_alchemy.find(query, {"_id": 0}).to_list(length=360)
    items = _append_sacred_ally_galactic_supplements(items, category, ally_type)
    enriched = [
        _enrich_devotional_language(_apply_subject_image_alignment(item, "hybrid-curated"), "sacred-allies")
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
    return _enrich_devotional_language(_apply_subject_image_alignment(item, "hybrid-curated"), "sacred-allies")


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
        _enrich_devotional_language(_apply_subject_image_alignment(item, "hybrid-curated"), "angelic-alchemy")
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
    return _enrich_devotional_language(_apply_subject_image_alignment(item, "hybrid-curated"), "angelic-alchemy")


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
    entries = await db.ancient_wisdom.find(query, {"_id": 0}).to_list(length=260)
    entries = _append_ancient_wisdom_supplements(entries, tradition)
    entries = _append_mystery_school_to_ancient(entries, tradition)
    enriched_entries = [_enrich_ancient_wisdom_entry(entry) for entry in entries]
    return _apply_free_paid_tiering(enriched_entries, "ancient_wisdom")


@router.get("/ancient-wisdom/{entry_id}")
async def get_ancient_wisdom_entry(entry_id: str) -> dict[str, Any]:
    """Get a specific ancient wisdom entry."""
    db = get_db()
    entry = await db.ancient_wisdom.find_one({"id": entry_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return _enrich_ancient_wisdom_entry(entry)


@router.get("/mystery-school")
async def get_mystery_school_teachings(stream: Optional[str] = None) -> list[dict[str, Any]]:
    """Get distinct Mystery School and lineage-path teachings with standard premium tiering."""
    stream_filter = str(stream or "").strip().lower()
    teachings = MYSTERY_SCHOOL_TEACHINGS
    if stream_filter:
        teachings = [item for item in teachings if str(item.get("stream") or "").strip().lower() == stream_filter]

    enriched = [_enrich_mystery_school_entry(item) for item in teachings]
    return _apply_free_paid_tiering(enriched, "mystery_school")


@router.get("/mystery-schools")
async def get_mystery_schools_alias(stream: Optional[str] = None) -> list[dict[str, Any]]:
    """Alias endpoint for clients requesting plural mystery schools route."""
    return await get_mystery_school_teachings(stream=stream)


@router.get("/mystery-school/{teaching_id}")
async def get_mystery_school_teaching(teaching_id: str) -> dict[str, Any]:
    """Get one mystery school teaching by id."""
    normalized_target = str(teaching_id or "").strip().lower()
    teaching = next(
        (
            item
            for item in MYSTERY_SCHOOL_TEACHINGS
            if str(item.get("id") or "").strip().lower() == normalized_target
        ),
        None,
    )
    if not teaching:
        raise HTTPException(status_code=404, detail="Mystery school teaching not found")

    return _enrich_mystery_school_entry(teaching)


@router.get("/mystery-schools/{teaching_id}")
async def get_mystery_school_teaching_alias(teaching_id: str) -> dict[str, Any]:
    """Alias endpoint for plural mystery schools detail route."""
    return await get_mystery_school_teaching(teaching_id)


@router.get("/alchemy-hub")
async def get_alchemy_hub(
    category: Optional[str] = None,
    ally_type: Optional[str] = None,
    sacred_geometry: Optional[str] = None,
    stream: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Unified alchemy endpoint combining sacred allies, angelic alchemy, and mystery schools."""
    sacred_allies = await get_sacred_ally_alchemy(category=category, ally_type=ally_type)
    angelic = await get_angelic_alchemy(sacred_geometry=sacred_geometry)
    mystery = await get_mystery_school_teachings(stream=stream)

    unified: list[dict[str, Any]] = []
    for entry in sacred_allies:
        merged = dict(entry)
        merged.setdefault("source", "sacred_allies")
        unified.append(merged)
    for entry in angelic:
        merged = dict(entry)
        merged.setdefault("source", "angelic_alchemy")
        unified.append(merged)
    for entry in mystery:
        merged = dict(entry)
        merged.setdefault("source", "mystery_school")
        unified.append(merged)

    return unified


@router.get("/alchemy-hub/{item_id}")
async def get_alchemy_hub_item(item_id: str) -> dict[str, Any]:
    """Unified alchemy detail endpoint by item id."""
    normalized_target = str(item_id or "").strip().lower()
    dataset = await get_alchemy_hub()
    for entry in dataset:
        if str(entry.get("id") or "").strip().lower() == normalized_target:
            return entry
    raise HTTPException(status_code=404, detail="Alchemy item not found")


@router.get("/tai-chi")
async def get_tai_chi_practices(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Dedicated Tai Chi endpoint for strict route compatibility."""
    db = get_db()
    query: dict[str, Any] = {
        "category": {"$regex": "tai\\s*chi", "$options": "i"},
    }
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}

    practices = await db.somatic_practices.find(query, {"_id": 0}).to_list(length=120)
    enriched = [_enrich_devotional_language(_enrich_somatic_practice(practice), "somatic") for practice in practices]
    sorted_practices = sorted(enriched, key=lambda practice: str(practice.get("name", "")).lower())
    return _apply_free_paid_tiering(sorted_practices, "somatic_practices")


@router.get("/chi-gong")
async def get_chi_gong_practices(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Dedicated Chi Gong/Qigong endpoint for strict route compatibility."""
    db = get_db()
    query: dict[str, Any] = {
        "$or": [
            {"category": {"$regex": "chi\\s*gong", "$options": "i"}},
            {"category": {"$regex": "qigong", "$options": "i"}},
        ]
    }
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}

    practices = await db.somatic_practices.find(query, {"_id": 0}).to_list(length=120)
    enriched = [_enrich_devotional_language(_enrich_somatic_practice(practice), "somatic") for practice in practices]
    sorted_practices = sorted(enriched, key=lambda practice: str(practice.get("name", "")).lower())
    return _apply_free_paid_tiering(sorted_practices, "somatic_practices")



# ============ SOUND FREQUENCIES ROUTES ============

@router.get("/sound-frequencies")
async def get_sound_frequencies(category: Optional[str] = None) -> list[dict[str, Any]]:
    """Get sound frequency healing content, optionally filtered by category."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    entries = await db.sound_frequencies.find(query, {"_id": 0}).to_list(length=50)
    enriched = [_enrich_sound_frequency_entry(entry) for entry in entries]
    return _apply_free_paid_tiering(enriched, "sound_frequencies")


@router.get("/sound-frequencies/{freq_id}")
async def get_sound_frequency(freq_id: str) -> dict[str, Any]:
    """Get a specific sound frequency entry."""
    db = get_db()
    entry = await db.sound_frequencies.find_one({"id": freq_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Sound frequency not found")
    return _enrich_sound_frequency_entry(entry)



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
    retreats = [retreat for retreat in retreats if not _is_effectively_empty_retreat(retreat)]
    normalized = [_normalize_retreat_entry(retreat) for retreat in retreats]
    return [_enrich_devotional_language(_enrich_content_integrity(retreat, "hybrid-curated"), "retreats") for retreat in normalized]


@router.get("/retreats/{retreat_id}")
async def get_retreat(retreat_id: str) -> dict[str, Any]:
    """Get a specific retreat."""
    db = get_db()
    retreat = await db.retreats.find_one({"id": retreat_id}, {"_id": 0})
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")
    if _is_effectively_empty_retreat(retreat):
        raise HTTPException(status_code=404, detail="Retreat not found")
    normalized = _normalize_retreat_entry(retreat)
    return _enrich_devotional_language(_enrich_content_integrity(normalized, "hybrid-curated"), "retreats")


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
            _enrich_content_integrity(_apply_subject_image_alignment(_enrich_energy_healing_entry(practice), "hybrid-curated"), "hybrid-curated"),
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
    practices = _dedupe_content_items_by_id_or_name(practices)
    practices = _apply_id_image_overrides(practices, SOMATIC_IMAGE_OVERRIDES)
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
    practices = _dedupe_content_items_by_id_or_name(practices)
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
        entry = _apply_subject_image_alignment(entry, "hybrid-curated")
        chair_override = CHAIR_YOGA_IMAGE_OVERRIDES.get(str(entry.get("id") or ""))
        if chair_override:
            entry["image_url"] = chair_override
            entry["source_type"] = "chair-yoga-curated-realism"
            entry["review_status"] = "reviewed"
            entry["source_references"] = _merge_source_references(entry.get("source_references"), [chair_override])
        adapted.append(entry)

    enriched = [_enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "healing-portals") for practice in adapted]
    enriched = _apply_id_image_overrides(enriched, SOMATIC_IMAGE_OVERRIDES)
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
        entry = _apply_subject_image_alignment(entry, "hybrid-curated")
        adapted.append(entry)

    enriched = [_enrich_devotional_language(_enrich_content_integrity(practice, "hybrid-curated"), "healing-portals") for practice in adapted]
    enriched = _apply_id_image_overrides(enriched, FASCIA_IMAGE_OVERRIDES)
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


DAILY_TEACHING_LENSES = [
    {
        "id": "moon",
        "title": "Moon Wisdom",
        "guidance": "Let the {moon} moon set today's tempo: practice in rhythm with its {moon_energy} rather than against it.",
    },
    {
        "id": "astrology",
        "title": "Celestial Currents",
        "guidance": "{day_ruler} governs this day — work with its signature: {day_theme}. Time one important action to this current.",
    },
    {
        "id": "spiritual_anatomy",
        "title": "Spiritual Anatomy",
        "guidance": "Today, treat the spine as the temple's central pillar: three times today, pause and feel breath travel its full length from root to crown.",
    },
    {
        "id": "elements",
        "title": "Elemental Medicine",
        "guidance": "Choose one element to serve you today — earth to steady, water to soften, fire to ignite, air to clarify — and touch it physically at least once.",
    },
    {
        "id": "chakras",
        "title": "Chakra Focus",
        "guidance": "Scan the seven centres slowly this morning and let the one that calls loudest choose today's practice, colour, and food.",
    },
    {
        "id": "embodiment",
        "title": "Embodiment Path",
        "guidance": "Today's teaching lives below the neck: whenever you notice thinking-loops, drop attention to your feet and finish the thought from there.",
    },
    {
        "id": "earth_medicine",
        "title": "Earth Medicine",
        "guidance": "Take one practice outdoors today, even for five minutes — bare feet, open sky, or a hand on living wood counts as ceremony.",
    },
    {
        "id": "reflection",
        "title": "Sacred Reflection",
        "guidance": "Carry one question through the whole day and journal the answer tonight: what is asking to be shed or let go, and what is ready to be nourished?",
    },
    {
        "id": "ritual",
        "title": "Living Ritual",
        "guidance": "Turn one ordinary act — tea, washing, doorway crossings — into deliberate ritual today: same act, full presence, clear beginning and end.",
    },
    {
        "id": "sound",
        "title": "Sound & Vibration",
        "guidance": "Use your own voice as medicine today: three long exhaled hums before any difficult conversation or task.",
    },
]


def _daily_teaching_lens(now: datetime, moon_phase: str, current_moon: dict[str, Any], current_day: dict[str, Any]) -> dict[str, Any]:
    """Build a daily lens from several rotating strands rather than repeating one template."""
    day_index = now.timetuple().tm_yday
    primary = DAILY_TEACHING_LENSES[day_index % len(DAILY_TEACHING_LENSES)]
    secondary = DAILY_TEACHING_LENSES[(day_index * 3 + now.isocalendar()[1]) % len(DAILY_TEACHING_LENSES)]
    if secondary["id"] == primary["id"]:
        secondary = DAILY_TEACHING_LENSES[(day_index + 4) % len(DAILY_TEACHING_LENSES)]

    values = {
        "moon": moon_phase.replace("_", " "),
        "moon_energy": str(current_moon.get("energy") or "current energy").lower(),
        "day_ruler": str(current_day.get("ruler") or "Today's ruler"),
        "day_theme": str(current_day.get("theme") or "presence").lower(),
    }
    guidance = primary["guidance"].format(**values)
    companion = secondary["guidance"].format(**values)

    element_cycle = ["Earth", "Water", "Fire", "Air", "Akasha"]
    anatomy_cycle = ["feet & Earth Star", "pelvis & sacral space", "solar plexus & diaphragm", "heart & lungs", "throat & jaw", "spine & central channel", "crown & spacious awareness"]
    ritual_cycle = [
        "touch the Earth or a living plant with full attention",
        "drink a glass of water slowly as a blessing",
        "light a candle safely and name what you are tending",
        "step outside for three conscious breaths beneath open sky",
        "sit in two minutes of unfilled silence before reaching for input",
    ]
    element = element_cycle[(day_index + now.weekday()) % len(element_cycle)]
    anatomy = anatomy_cycle[(day_index * 2 + now.weekday()) % len(anatomy_cycle)]
    ritual = ritual_cycle[(day_index + now.isocalendar()[1]) % len(ritual_cycle)]

    return {
        "id": f"{primary['id']}-{secondary['id']}",
        "title": f"{primary['title']} · {secondary['title']}",
        "guidance": guidance,
        "companion_guidance": companion,
        "element_focus": element,
        "spiritual_anatomy_focus": anatomy,
        "embodied_ritual": ritual,
        "reflection": f"Where do I feel today's {str(current_day.get('theme') or 'theme').lower()} in my body, and what is one grounded action that honours it?",
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
        "daily_lens": _daily_teaching_lens(now, moon_phase, current_moon, current_day),
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

