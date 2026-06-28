import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const resolveLegacyPath = (rawPathname) => {
  const cleaned = (rawPathname || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const legacyAliases = [
    { match: ["tarotreading", "tarotcards"], target: "/tarot" },
    { match: ["genekeys", "genekey"], target: "/gene-keys" },
    { match: ["humandesign"], target: "/human-design" },
    { match: ["iching"], target: "/i-ching" },
    { match: ["partneryoga"], target: "/partner-yoga" },
    { match: ["chairyoga"], target: "/somatic-yoga" },
    { match: ["fasciastretching", "fascia"], target: "/somatic" },
    { match: ["temples", "alltemples", "elementaltemples"], target: "/elemental-temples" },
    { match: ["earthartsacredtoolbirthing", "earthcrafting", "sacredtool"], target: "/creative?category=earth-crafting" },
    { match: ["soundhealing"], target: "/sound-frequencies" },
    { match: ["creativeexpression"], target: "/creative" },
    { match: ["ecstaticdance"], target: "/free-form-movement" },
    { match: ["kundaliniconsciousness", "kundalini"], target: "/sacred-ally-alchemy" },
    { match: ["voiceactivation"], target: "/sound-frequencies" },
    { match: ["sacredguardians"], target: "/sacred-guardians" },
    { match: ["sacredallies", "poweranimals", "spiritanimals", "galacticallies"], target: "/sacred-ally-alchemy" },
    { match: ["crystals"], target: "/crystals" },
    { match: ["mantras"], target: "/mantras" },
    { match: ["earthmedicines"], target: "/earth-altars" },
    { match: ["alchemy"], target: "/angelic-alchemy" },
    { match: ["mudras"], target: "/mudras" },
    { match: ["ancienttraditions", "ancientwisdom"], target: "/ancient-wisdom" },
    { match: ["runes", "runereadings"], target: "/rune-readings" },
    { match: ["sunmoon", "sunandmoon", "mooncalendar"], target: "/astrology" },
    { match: ["numerology"], target: "/numerology" },
  ];

  for (const alias of legacyAliases) {
    if (alias.match.some((token) => cleaned.includes(token))) {
      return alias.target;
    }
  }

  if (
    cleaned.includes("dailypractice") ||
    cleaned.includes("todaysguidance") ||
    cleaned.includes("dailysacredpractice")
  ) {
    return "/daily-practice";
  }

  if (cleaned.includes("humandesigncalculator") || cleaned.includes("hdcalculator")) {
    return "/profile-calculator";
  }

  return "/menu";
};

export default function SmartRouteResolver() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const target = resolveLegacyPath(location.pathname);
    navigate(target, { replace: true });
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6" data-testid="smart-route-resolver">
      <p className="text-sm text-muted-foreground">Taking you to the right page…</p>
    </div>
  );
}
