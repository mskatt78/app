import {
  Circle,
  Hexagon,
  Moon,
  Sparkles,
  Square,
  Star,
  Sun,
  Triangle,
  TrendingUp,
} from "lucide-react";

export const buildBirthDateOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" }, { value: "03", label: "March" },
    { value: "04", label: "April" }, { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" }, { value: "09", label: "September" },
    { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return { years, months, days, hours, minutes };
};

export const getElementColor = (element) => {
  switch (element) {
    case "Fire": return "text-orange-400 bg-orange-500/20 border-orange-500/30";
    case "Earth": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    case "Air": return "text-cyan-400 bg-cyan-500/20 border-cyan-500/30";
    case "Water": return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    default: return "text-purple-400 bg-purple-500/20 border-purple-500/30";
  }
};

export const getElementBgColor = (element) => {
  switch (element) {
    case "Fire": return "bg-gradient-to-br from-orange-500/20 to-red-500/10";
    case "Earth": return "bg-gradient-to-br from-emerald-500/20 to-green-500/10";
    case "Air": return "bg-gradient-to-br from-cyan-500/20 to-sky-500/10";
    case "Water": return "bg-gradient-to-br from-blue-500/20 to-indigo-500/10";
    default: return "bg-gradient-to-br from-purple-500/20 to-violet-500/10";
  }
};

export const getAspectColor = (aspect) => {
  switch (aspect) {
    case "Conjunction": return "text-yellow-400 bg-yellow-500/20";
    case "Trine": return "text-green-400 bg-green-500/20";
    case "Sextile": return "text-cyan-400 bg-cyan-500/20";
    case "Square": return "text-red-400 bg-red-500/20";
    case "Opposition": return "text-orange-400 bg-orange-500/20";
    default: return "text-purple-400 bg-purple-500/20";
  }
};

export const formatDegree = (degree, minute) => `${degree}°${minute || 0}'`;

export const getPlanetIcon = (planet) => {
  const iconClass = "w-5 h-5";
  switch (planet) {
    case "Sun": return <Sun className={`${iconClass} text-yellow-400`} />;
    case "Moon": return <Moon className={`${iconClass} text-slate-300`} />;
    case "Mercury": return <Circle className={`${iconClass} text-amber-400`} />;
    case "Venus": return <Circle className={`${iconClass} text-pink-400`} />;
    case "Mars": return <Triangle className={`${iconClass} text-red-400`} />;
    case "Jupiter": return <Hexagon className={`${iconClass} text-orange-300`} />;
    case "Saturn": return <Square className={`${iconClass} text-amber-600`} />;
    case "Uranus": return <Sparkles className={`${iconClass} text-cyan-400`} />;
    case "Neptune": return <Sparkles className={`${iconClass} text-blue-400`} />;
    case "Pluto": return <Circle className={`${iconClass} text-purple-400`} />;
    case "North Node": return <TrendingUp className={`${iconClass} text-green-400`} />;
    case "South Node": return <TrendingUp className={`${iconClass} text-gray-400 rotate-180`} />;
    case "Chiron": return <Star className={`${iconClass} text-amber-400`} />;
    default: return <Star className={`${iconClass} text-purple-400`} />;
  }
};
