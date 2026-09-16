const FALLBACK_LIBRARY = {
  generic: "/assets_images_beautiful/beauty_main_menu.jpeg",
  sacred: "/images/power-animal-journey.jpg",
  healing: "/assets_images_beautiful/beauty_breathwork.jpeg",
  crystal: "/assets_images_beautiful/beauty_crystal_guide.jpeg",
};

const ROUTE_FALLBACKS = [
  {
    pattern: /(sacred-guardians|sacred-ally-alchemy|angelic-alchemy|shamanic-practices|ancient-wisdom|light-codes)/,
    image: FALLBACK_LIBRARY.sacred,
  },
  {
    pattern: /(breathwork|somatic|fascia|yoga|chakra|healing-portals|energy-healing|water-practices|sound-frequencies|meditations|mindfulness)/,
    image: FALLBACK_LIBRARY.healing,
  },
  {
    pattern: /(crystals|crystal-guide)/,
    image: FALLBACK_LIBRARY.crystal,
  },
  {
    pattern: /(menu|dashboard|community|courses|retreats|reviews)/,
    image: FALLBACK_LIBRARY.generic,
  },
];

const KEYWORD_FALLBACKS = [
  { pattern: /(guardian|dragon|angel|ally|mystery|oracle|ritual|ceremony)/, image: FALLBACK_LIBRARY.sacred },
  { pattern: /(breath|fascia|somatic|healing|meditat|yoga|chakra|sound|water)/, image: FALLBACK_LIBRARY.healing },
  { pattern: /(crystal|gem|stone|mineral)/, image: FALLBACK_LIBRARY.crystal },
];

const SKIP_PATTERNS = /(favicon|icon-|logo192|logo512|apple-touch-icon|browserconfig|manifest)/;

export const getCuratedFallbackImage = ({ pathname = "", currentSrc = "", alt = "" }) => {
  const src = String(currentSrc || "").toLowerCase();
  if (src.startsWith("data:")) return FALLBACK_LIBRARY.generic;
  if (SKIP_PATTERNS.test(src)) return null;

  const route = String(pathname || "").toLowerCase();
  for (const entry of ROUTE_FALLBACKS) {
    if (entry.pattern.test(route)) return entry.image;
  }

  const context = `${alt || ""} ${src}`.toLowerCase();
  for (const entry of KEYWORD_FALLBACKS) {
    if (entry.pattern.test(context)) return entry.image;
  }

  return FALLBACK_LIBRARY.generic;
};

export const clearImageSourceSet = (img) => {
  if (!img) return;
  if (img.srcset) img.srcset = "";
  if (img.getAttribute("srcset")) img.removeAttribute("srcset");
};
