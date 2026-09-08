import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Clock, Globe, Moon, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { AstrologyMonthDialog } from "../components/astrology/AstrologyMonthDialog";
import { SolarCyclePanel } from "./astrology/SolarCyclePanel";
import {
  TIMEZONES,
  elementColors,
  getLocalDate,
  getLocalTime,
  getTimezoneOptionKey,
} from "../components/astrology/astrologyCalendarConfig";
import { appLogger } from "../utils/logger";
import { getAstrologySkyImage } from "../utils/shamanicImageTheme";

const HEMISPHERE_PREF_KEY = "astrologyHemispherePreference";
const TIMEZONE_PREF_KEY = "astrologyTimezonePreference";

const AstrologyCalendar = ({ api }) => {
  const navigate = useNavigate();
  const [months, setMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewIndex, setViewIndex] = useState(0);
  const [hemisphere, setHemisphere] = useState("south");
  const [selectedTz, setSelectedTz] = useState(null);
  const [showTzDropdown, setShowTzDropdown] = useState(false);
  const tzRef = useRef(null);

  const inferHemisphereFromTimezone = (tz = "") => {
    const lower = tz.toLowerCase();
    const southPatterns = [
      "australia",
      "auckland",
      "wellington",
      "argentina",
      "sao_paulo",
      "santiago",
      "lima",
      "johannesburg",
      "cape",
      "mauritius",
      "new_zealand",
      "nz",
      "hobart",
      "adelaide",
      "perth",
    ];
    return southPatterns.some((pattern) => lower.includes(pattern)) ? "south" : "north";
  };

  const detectHemisphereByGeolocation = () => new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords?.latitude);
        if (Number.isFinite(latitude)) {
          resolve(latitude < 0 ? "south" : "north");
          return;
        }
        resolve(null);
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 60 * 60 * 1000 },
    );
  });

  const autoDetectTimezone = async () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const match = TIMEZONES.find((entry) => !entry.group && entry.tz === tz);

      const storedTz = localStorage.getItem(TIMEZONE_PREF_KEY);
      if (storedTz) {
        const storedTzMatch = TIMEZONES.find((entry) => !entry.group && entry.tz === storedTz);
        if (storedTzMatch) {
          setSelectedTz(storedTzMatch);
        }
      }

      const storedHemisphere = localStorage.getItem(HEMISPHERE_PREF_KEY);
      if (storedHemisphere === "south" || storedHemisphere === "north") {
        if (!storedTz && match) {
          setSelectedTz(match);
        }
        setHemisphere(storedHemisphere);
        return;
      }

      if (match) {
        setSelectedTz(match);
        setHemisphere(match.hemi);
        localStorage.setItem(TIMEZONE_PREF_KEY, match.tz);
        localStorage.setItem(HEMISPHERE_PREF_KEY, match.hemi);
        return;
      }

      const geolocatedHemisphere = await detectHemisphereByGeolocation();
      const detectedHemisphere = geolocatedHemisphere || inferHemisphereFromTimezone(tz) || "south";
      setHemisphere(detectedHemisphere);
      localStorage.setItem(HEMISPHERE_PREF_KEY, detectedHemisphere);
    } catch {
      setHemisphere("south");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [monthsRes, currentRes] = await Promise.all([
        api.get("/astrology/months"),
        api.get("/astrology/current"),
      ]);
      setMonths(monthsRes.data);
      setCurrentMonth(currentRes.data);

      const currentIndex = monthsRes.data.findIndex((month) => month.id === currentRes.data.id);
      if (currentIndex !== -1) {
        setViewIndex(Math.max(0, currentIndex - 1));
      }
    } catch (error) {
      appLogger.error("Failed to fetch astrology data", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
    void autoDetectTimezone();

    const handler = (event) => {
      if (tzRef.current && !tzRef.current.contains(event.target)) {
        setShowTzDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [fetchData]);

  const handleTzSelect = (tz) => {
    setSelectedTz(tz);
    setHemisphere(tz.hemi);
    localStorage.setItem(TIMEZONE_PREF_KEY, tz.tz);
    localStorage.setItem(HEMISPHERE_PREF_KEY, tz.hemi);
    setShowTzDropdown(false);
  };

  const handleHemisphereChange = (value) => {
    setHemisphere(value);
    localStorage.setItem(HEMISPHERE_PREF_KEY, value);
  };

  const getDescription = (month) => {
    if (hemisphere === "south" && month.description_south) return month.description_south;
    if (hemisphere === "north" && month.description_north) return month.description_north;
    return month.description;
  };

  const visibleMonths = months.slice(viewIndex, viewIndex + 3);
  const canScrollLeft = viewIndex > 0;
  const canScrollRight = viewIndex < months.length - 3;

  return (
    <div className="min-h-screen bg-background" data-testid="astrology-calendar">
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('${getAstrologySkyImage()}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-testid="astrology-cosmic-background-image"
      />

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button data-testid="back-btn" onClick={() => navigate("/dashboard")} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Solar & Lunar Wisdom</p>
              <h1 className="text-xl font-serif">Sun & Moon <span className="italic text-primary">Calendar</span></h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/astrology/charts")}
              className="px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-xs text-primary hover:bg-primary/25 transition-all"
              data-testid="astrology-open-charts-button"
            >
              Open Birth & Dragon Charts
            </button>
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => handleHemisphereChange("south")}
                data-testid="hemi-south"
                className={`px-3 py-1 rounded-full text-xs transition-all ${hemisphere === "south" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                🌿 Southern
              </button>
              <button
                onClick={() => handleHemisphereChange("north")}
                data-testid="hemi-north"
                className={`px-3 py-1 rounded-full text-xs transition-all ${hemisphere === "north" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                ☀️ Northern
              </button>
            </div>

            <div className="relative" ref={tzRef}>
              <button
                onClick={() => setShowTzDropdown((prev) => !prev)}
                data-testid="timezone-selector"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground hover:bg-white/10 transition-all"
              >
                <Clock className="w-3 h-3" />
                <span className="max-w-[140px] truncate">{selectedTz ? selectedTz.label.replace(/^[🌿☀️]\s/, "") : "Select timezone"}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showTzDropdown && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full mt-2 w-80 max-h-80 overflow-y-auto bg-card border border-white/15 rounded-xl shadow-2xl z-50">
                    {TIMEZONES.map((tz) => (
                      tz.group ? (
                        <div key={getTimezoneOptionKey(tz)} className="px-3 pt-3 pb-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{tz.label}</p>
                        </div>
                      ) : (
                        <button
                          key={getTimezoneOptionKey(tz)}
                          onClick={() => handleTzSelect(tz)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-white/5 transition-colors ${selectedTz?.tz === tz.tz ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                          data-testid={`timezone-option-${tz.tz.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
                        >
                          <span>{tz.label}</span>
                          <span className="text-muted-foreground/50 text-xs ml-2 flex-shrink-0">{getLocalTime(tz.tz)}</span>
                        </button>
                      )
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {selectedTz && (
          <div className="max-w-6xl mx-auto px-4 pb-2 flex items-center gap-2 text-xs text-muted-foreground/60" data-testid="timezone-status-strip">
            <Globe className="w-3 h-3" />
            <span>{selectedTz.label.replace(/^[🌿☀️]\s/, "")} — {getLocalDate(selectedTz.tz)} · {getLocalTime(selectedTz.tz)}</span>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs border ${hemisphere === "south" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10"}`}>
              {hemisphere === "south" ? "🌿 Southern Hemisphere" : "☀️ Northern Hemisphere"}
            </span>
          </div>
        )}
      </header>

      <main className="relative max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64" data-testid="astrology-loading-state">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <SolarCyclePanel />
            {currentMonth && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-8 rounded-2xl border backdrop-blur-xl mb-12 bg-gradient-to-br ${elementColors[currentMonth.element]?.gradient} ${elementColors[currentMonth.element]?.border}`}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${elementColors[currentMonth.element]?.bg}`}>
                      <Moon className={`w-12 h-12 ${elementColors[currentMonth.element]?.text}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="text-xs uppercase tracking-wider text-primary">Current Moon</span>
                    </div>
                    <h2 className="text-4xl font-serif mb-2">{currentMonth.name}</h2>
                    <p className="text-muted-foreground mb-1">{currentMonth.dates}</p>
                    <p className={`text-sm ${elementColors[currentMonth.element]?.text}`}>{currentMonth.element} Element • Symbol: {currentMonth.symbol}</p>
                    <p className="text-muted-foreground mt-4 leading-relaxed">{getDescription(currentMonth)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif">The <span className="italic text-primary">Sacred Wheel</span></h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setViewIndex(Math.max(0, viewIndex - 1))} disabled={!canScrollLeft} className="border-white/10" data-testid="month-scroll-left-btn">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setViewIndex(Math.min(months.length - 3, viewIndex + 1))} disabled={!canScrollRight} className="border-white/10" data-testid="month-scroll-right-btn">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleMonths.map((month, index) => {
                const colors = elementColors[month.element] || elementColors.Earth;
                const isCurrent = month.id === currentMonth?.id;
                return (
                  <motion.div
                    key={month.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer ${colors.bg} ${colors.border} ${isCurrent ? "ring-2 ring-primary" : ""} hover:scale-[1.02] transition-all duration-300`}
                    onClick={() => setSelectedMonth(month)}
                    data-testid={`month-card-${month.id}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-serif">{month.month_number}</span>
                      {isCurrent && (
                        <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">Current</span>
                      )}
                    </div>
                    <h4 className="text-xl font-serif mb-1">{month.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{month.dates}</p>
                    <p className={`text-xs ${colors.text}`}>{month.symbol} • {month.element}</p>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {month.themes?.slice(0, 2).map((theme, themeIndex) => (
                        <span key={`${month.id}-theme-${themeIndex}-${String(theme).slice(0, 18)}`} className="px-2 py-1 rounded-full bg-white/5 text-xs">{theme}</span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

          <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="sun-moon-depth-panels">
            <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5" data-testid="sun-moon-why-this-heals">
              <p className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Why this heals</p>
              <p className="text-sm text-emerald-100/85 leading-relaxed">
                Sun and moon tracking stabilizes life rhythm by aligning action cycles, emotional pacing, and nervous-system recovery with natural timing.
              </p>
            </article>

            <article className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5" data-testid="sun-moon-integration-guide">
              <p className="text-xs uppercase tracking-wider text-violet-300 mb-2">Integration guide</p>
              <p className="text-sm text-violet-100/85 leading-relaxed">
                Each day, choose one lunar-aligned behavior: protect energy, complete one purposeful action, and close with evening reflection.
              </p>
            </article>
          </section>

            <div className="mt-12">
              <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Full Wheel</h4>
              <div className="flex flex-wrap gap-2">
                {months.map((month) => {
                  const colors = elementColors[month.element] || elementColors.Earth;
                  const isCurrent = month.id === currentMonth?.id;
                  return (
                    <button
                      key={month.id}
                      onClick={() => setSelectedMonth(month)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${colors.bg} ${colors.border} border ${isCurrent ? "ring-1 ring-primary" : ""} hover:scale-105`}
                      data-testid={`full-wheel-month-${month.id}`}
                    >
                      <span className={colors.text}>{month.month_number}.</span> {month.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      <AstrologyMonthDialog
        selectedMonth={selectedMonth}
        onClose={() => setSelectedMonth(null)}
        elementColors={elementColors}
        hemisphere={hemisphere}
        setHemisphere={setHemisphere}
        getDescription={getDescription}
      />
    </div>
  );
};

export default AstrologyCalendar;
