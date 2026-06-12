export const NUMEROLOGY_ELEMENT_COLORS = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

export const NUMEROLOGY_MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const NUMEROLOGY_DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));

export const getNumerologyYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);
};

export const getNumerologyElementColors = (element) => {
  const normalized = element || "Spirit";
  return NUMEROLOGY_ELEMENT_COLORS[normalized] || NUMEROLOGY_ELEMENT_COLORS.Spirit;
};
