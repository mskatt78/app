import { motion } from "framer-motion";
import { Star } from "lucide-react";

export const SeasonalTempleWheelSection = ({ hemisphere, currentSabbat, sabbats, onSelectSabbat }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-10 pt-4" data-testid="seasonal-temple-wheel-section">
      <h2 className="text-3xl font-serif mb-2">The Eight <span className="italic text-amber-300">Sacred Gates</span></h2>
      <p className="text-muted-foreground text-sm max-w-xl mx-auto">
        The Wheel turns through 8 stations — 4 solar (solstices & equinoxes) and 4 fire festivals. Each gate is a doorway into a different quality of being.
        {" "}<span className={`text-xs px-2 py-0.5 rounded-full ${hemisphere === "south" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
          {hemisphere === "south" ? "🌿 Southern Hemisphere dates" : "☀️ Northern Hemisphere dates"}
        </span>
      </p>

      <div className="relative w-72 h-72 mx-auto my-10">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-4 rounded-full border border-white/5" />
        <div className="absolute inset-[44%] rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Star className="w-3 h-3 text-primary" />
        </div>
        {sabbats.map((sabbat) => {
          const angleRad = ((sabbat.angle - 90) * Math.PI) / 180;
          const radius = 108;
          const x = 144 + radius * Math.cos(angleRad);
          const y = 144 + radius * Math.sin(angleRad);
          const isCurrent = sabbat.id === currentSabbat;
          const Icon = sabbat.icon;
          return (
            <button
              key={sabbat.id}
              onClick={() => onSelectSabbat(sabbat)}
              data-testid={`wheel-${sabbat.id}`}
              style={{ left: x - 20, top: y - 20 }}
              className={`absolute w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${sabbat.color.bg} ${sabbat.color.border} ${isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110" : ""}`}
              title={`${sabbat.name} — ${sabbat.dates[hemisphere]}`}
            >
              <Icon className={`w-4 h-4 ${sabbat.color.text}`} />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
