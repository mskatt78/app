import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Sunrise, Compass, CalendarDays } from "lucide-react";

const ZODIAC = [
  ["Capricorn", 0, 19], ["Aquarius", 0, 49], ["Pisces", 0, 79],
  ["Aries", 0, 109], ["Taurus", 0, 140], ["Gemini", 0, 171],
  ["Cancer", 0, 203], ["Leo", 0, 234], ["Virgo", 0, 266],
  ["Libra", 0, 296], ["Scorpio", 0, 326], ["Sagittarius", 0, 355],
];

const dayOfYear = (d) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);

const sunSignFor = (date) => {
  const doy = dayOfYear(date);
  const boundaries = ZODIAC.map(([name, , end]) => [name, end]);
  for (const [name, end] of boundaries) {
    if (doy <= end) return name;
  }
  return "Capricorn";
};

const solarEvents = (year) => [
  { name: "March Equinox", date: new Date(Date.UTC(year, 2, 20)), theme: "Balance of light & dark — new solar cycle of growth" },
  { name: "June Solstice", date: new Date(Date.UTC(year, 5, 21)), theme: "Peak solar power — fullest light of the year" },
  { name: "September Equinox", date: new Date(Date.UTC(year, 8, 22)), theme: "Harvest balance — gratitude & release" },
  { name: "December Solstice", date: new Date(Date.UTC(year, 11, 21)), theme: "Return of the light — deepest stillness" },
];

export const SolarCyclePanel = () => {
  const solar = useMemo(() => {
    const now = new Date();
    const events = [...solarEvents(now.getFullYear()), ...solarEvents(now.getFullYear() + 1)];
    const lastEvent = [...events].reverse().find((e) => e.date <= now) || solarEvents(now.getFullYear() - 1)[3];
    const nextEvent = events.find((e) => e.date > now);
    const daysToNext = Math.ceil((nextEvent.date - now) / 86400000);
    const cycleLength = (nextEvent.date - lastEvent.date) / 86400000;
    const cycleProgress = Math.min(100, Math.round(((now - lastEvent.date) / 86400000 / cycleLength) * 100));
    const month = now.getMonth();
    const season =
      month >= 2 && month <= 4 ? "Spring (Northern) / Autumn (Southern)"
      : month >= 5 && month <= 7 ? "Summer (Northern) / Winter (Southern)"
      : month >= 8 && month <= 10 ? "Autumn (Northern) / Spring (Southern)"
      : "Winter (Northern) / Summer (Southern)";
    const lightTrend = (month >= 11 || month <= 4) ? "Days lengthening in the North, shortening in the South"
      : "Days shortening in the North, lengthening in the South";
    return { sign: sunSignFor(now), season, lightTrend, lastEvent, nextEvent, daysToNext, cycleProgress };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent p-6 mb-8"
      data-testid="solar-cycle-panel"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/25">
          <Sun className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-amber-300/80">Solar Cycle</p>
          <h2 className="text-lg font-serif">The Sun's <span className="italic text-amber-200">Journey</span></h2>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3" data-testid="solar-sign-tile">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Compass className="w-3 h-3" /> Sun in</p>
          <p className="font-serif text-amber-100">{solar.sign}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3" data-testid="solar-season-tile">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Sunrise className="w-3 h-3" /> Season</p>
          <p className="text-sm text-foreground/90">{solar.season}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 sm:col-span-2" data-testid="solar-next-event-tile">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Next solar gateway</p>
          <p className="text-sm text-amber-100">
            {solar.nextEvent.name} — in {solar.daysToNext} days ({solar.nextEvent.date.toLocaleDateString(undefined, { month: "long", day: "numeric" })})
          </p>
          <p className="text-xs text-muted-foreground mt-1">{solar.nextEvent.theme}</p>
        </div>
      </div>

      <div className="mt-4" data-testid="solar-cycle-progress">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
          <span>{solar.lastEvent.name}</span>
          <span>{solar.cycleProgress}% through this quarter</span>
          <span>{solar.nextEvent.name}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${solar.cycleProgress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{solar.lightTrend}.</p>
      </div>
    </motion.section>
  );
};
