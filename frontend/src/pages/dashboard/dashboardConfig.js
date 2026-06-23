import {
  Leaf, Eye, Wind, Moon, Sparkles, Heart, Waves, Mountain,
  Sun, Star, Clock, Trophy, BookOpen,
  Brain, Compass, Hash, Shield, BarChart3, Palette, Feather, Zap, Radio, MapPin, CreditCard,
  Orbit,
} from "lucide-react";

export const ADMIN_EMAILS = [
  "skywatersacredembodiments@gmail.com",
  "mskatt78@gmail.com",
];

export const elementColors = {
  earth: "text-emerald-400",
  water: "text-blue-400",
  fire: "text-orange-400",
  air: "text-cyan-400",
  spirit: "text-purple-400",
};

export const elementBg = {
  earth: "bg-emerald-500/10 border-emerald-500/20",
  water: "bg-blue-500/10 border-blue-500/20",
  fire: "bg-orange-500/10 border-orange-500/20",
  air: "bg-cyan-500/10 border-cyan-500/20",
  spirit: "bg-purple-500/10 border-purple-500/20",
};

const BASE_NAV_ITEMS = [
  { icon: Leaf, label: "Yoga", path: "/yoga", element: "earth" },
  { icon: Eye, label: "Oracle", path: "/oracle", element: "spirit" },
  { icon: Wind, label: "Breathwork", path: "/breathwork", element: "air" },
  { icon: Brain, label: "Mindfulness", path: "/mindfulness", element: "air" },
  { icon: Compass, label: "Meditations", path: "/meditations", element: "spirit" },
  { icon: Moon, label: "Astrology", path: "/astrology", element: "water" },
  { icon: Star, label: "Astrology Charts", path: "/astrology/charts", element: "spirit" },
  { icon: Star, label: "Birth Chart", path: "/birth-chart", element: "spirit" },
  { icon: Hash, label: "Numerology", path: "/numerology", element: "fire" },
  { icon: Sparkles, label: "Crystals", path: "/crystals", element: "spirit" },
  { icon: Heart, label: "Mantras", path: "/mantras", element: "fire" },
  { icon: Sun, label: "Mudras", path: "/mudras", element: "fire" },
  { icon: Waves, label: "Somatic", path: "/somatic", element: "water" },
  { icon: Mountain, label: "Grounding", path: "/grounding", element: "earth" },
  { icon: Zap, label: "Elemental", path: "/elemental-practices", element: "spirit" },
  { icon: Mountain, label: "Altars", path: "/earth-altars", element: "earth" },
  { icon: Palette, label: "Creative", path: "/creative-processes", element: "spirit" },
  { icon: Heart, label: "Heart", path: "/heart-practices", element: "water" },
  { icon: Feather, label: "Shamanic", path: "/shamanic-practices", element: "spirit" },
  { icon: Sparkles, label: "Sacred Ally Alchemy", path: "/sacred-ally-alchemy", element: "spirit" },
  { icon: Orbit, label: "Healing Portals", path: "/healing-portals", element: "spirit" },
  { icon: BarChart3, label: "Practice Log", path: "/practice-log", element: "fire" },
  { icon: Star, label: "Favorites", path: "/favorites", element: "fire" },
  { icon: Clock, label: "Rituals", path: "/rituals", element: "spirit" },
  { icon: Trophy, label: "Achievements", path: "/achievements", element: "fire" },
  { icon: BookOpen, label: "Journal", path: "/journal", element: "water" },
  { icon: Radio, label: "Live", path: "/live", element: "fire" },
  { icon: MapPin, label: "Retreats", path: "/retreats", element: "earth" },
  { icon: BookOpen, label: "Book", path: "/books", element: "spirit" },
  { icon: CreditCard, label: "Membership", path: "/pricing", element: "fire" },
];

export const getNavItems = (isAdmin) => [
  ...BASE_NAV_ITEMS,
  ...(isAdmin ? [{ icon: Shield, label: "Admin CMS", path: "/admin", element: "spirit" }] : []),
];
