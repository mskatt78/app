import { Moon, Star, Sun } from "lucide-react";

export const SPREADS = [
  {
    id: "single",
    name: "Single Rune",
    description: "Daily guidance or quick insight",
    runeCount: 1,
    positions: ["guidance"],
    icon: Star,
  },
  {
    id: "three",
    name: "Three Norns",
    description: "Past, Present, Future reading",
    runeCount: 3,
    positions: ["past", "present", "future"],
    positionMeanings: ["What shaped this moment", "Your current energy", "Where this leads"],
    icon: Moon,
  },
  {
    id: "celtic-cross",
    name: "Celtic Cross",
    description: "Deep comprehensive reading",
    runeCount: 10,
    positions: ["present", "challenge", "past", "future", "above", "below", "advice", "external", "hopes_fears", "outcome"],
    icon: Sun,
  },
];

export const ELEMENT_COLORS = {
  Fire: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30" },
  Water: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30" },
  Earth: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
  Air: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30" },
  Spirit: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30" },
};

const POSITION_LABELS = {
  past: "Past",
  present: "Present Situation",
  future: "Future Outcome",
  challenge: "Challenge/Crossing",
  above: "Conscious Goal",
  below: "Subconscious",
  advice: "Advice",
  external: "External Influences",
  hopes_fears: "Hopes & Fears",
  outcome: "Final Outcome",
  guidance: "Your Guidance",
};

export const getPositionLabel = (position) => POSITION_LABELS[position] || position;

export const getSpreadGridClassName = (selectedSpread) => {
  if (selectedSpread?.id === "single") return "grid-cols-1 max-w-md mx-auto";
  if (selectedSpread?.id === "three") return "grid-cols-1 md:grid-cols-3";
  return "grid-cols-2 md:grid-cols-5";
};
