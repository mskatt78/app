import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Moon, Star, ChevronLeft, ChevronRight, Sparkles, Leaf, Globe, Clock, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

// World timezone groups for the selector
const TIMEZONES = [
  { label: "Southern Hemisphere", group: true },
  { label: "🌿 Queensland, AU (AEST UTC+10)", tz: "Australia/Brisbane", hemi: "south" },
  { label: "🌿 Sydney / Melbourne (AEST/AEDT)", tz: "Australia/Sydney", hemi: "south" },
  { label: "🌿 Perth, AU (AWST UTC+8)", tz: "Australia/Perth", hemi: "south" },
  { label: "🌿 Adelaide, AU (ACST/ACDT)", tz: "Australia/Adelaide", hemi: "south" },
  { label: "🌿 Auckland, NZ (NZST/NZDT)", tz: "Pacific/Auckland", hemi: "south" },
  { label: "🌿 Johannesburg, SA (SAST UTC+2)", tz: "Africa/Johannesburg", hemi: "south" },
  { label: "🌿 Buenos Aires, AR (ART UTC-3)", tz: "America/Argentina/Buenos_Aires", hemi: "south" },
  { label: "🌿 São Paulo, BR (BRT UTC-3)", tz: "America/Sao_Paulo", hemi: "south" },
  { label: "🌿 Santiago, CL (CLT UTC-4)", tz: "America/Santiago", hemi: "south" },
  { label: "🌿 Lima, PE (PET UTC-5)", tz: "America/Lima", hemi: "south" },
  { label: "Northern Hemisphere", group: true },
  { label: "☀️ London, UK (GMT/BST)", tz: "Europe/London", hemi: "north" },
  { label: "☀️ Paris / Berlin (CET/CEST UTC+1/+2)", tz: "Europe/Paris", hemi: "north" },
  { label: "☀️ Athens / Kyiv (EET UTC+2/+3)", tz: "Europe/Athens", hemi: "north" },
  { label: "☀️ Moscow, RU (MSK UTC+3)", tz: "Europe/Moscow", hemi: "north" },
  { label: "☀️ Dubai, UAE (GST UTC+4)", tz: "Asia/Dubai", hemi: "north" },
  { label: "☀️ New Delhi, IN (IST UTC+5:30)", tz: "Asia/Kolkata", hemi: "north" },
  { label: "☀️ Bangkok, TH (ICT UTC+7)", tz: "Asia/Bangkok", hemi: "north" },
  { label: "☀️ Singapore / KL (SGT UTC+8)", tz: "Asia/Singapore", hemi: "north" },
  { label: "☀️ Tokyo / Seoul (JST/KST UTC+9)", tz: "Asia/Tokyo", hemi: "north" },
  { label: "☀️ New York, US (EST/EDT UTC-5/-4)", tz: "America/New_York", hemi: "north" },
  { label: "☀️ Chicago, US (CST/CDT UTC-6/-5)", tz: "America/Chicago", hemi: "north" },
  { label: "☀️ Denver, US (MST/MDT UTC-7/-6)", tz: "America/Denver", hemi: "north" },
  { label: "☀️ Los Angeles, US (PST/PDT UTC-8/-7)", tz: "America/Los_Angeles", hemi: "north" },
  { label: "☀️ Anchorage, AK (AKST/AKDT)", tz: "America/Anchorage", hemi: "north" },
  { label: "☀️ Honolulu, HI (HST UTC-10)", tz: "America/Honolulu", hemi: "north" },
  { label: "☀️ Reykjavik (UTC+0)", tz: "Atlantic/Reykjavik", hemi: "north" },
  { label: "☀️ Toronto, CA (EST/EDT)", tz: "America/Toronto", hemi: "north" },
  { label: "☀️ Vancouver, CA (PST/PDT)", tz: "America/Vancouver", hemi: "north" },
  { label: "☀️ Mexico City, MX (CST/CDT)", tz: "America/Mexico_City", hemi: "north" },
  { label: "☀️ Cairo, EG (EET UTC+2)", tz: "Africa/Cairo", hemi: "north" },
  { label: "☀️ Nairobi, KE (EAT UTC+3)", tz: "Africa/Nairobi", hemi: "north" },
];

const getTimezoneOptionKey = (tz) => {
  if (tz.group) {
    return `tz-group-${String(tz.label).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }
  return `tz-option-${tz.tz}`;
};

const getLocalTime = (tz) => {
  try {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short"
    });
  } catch { return ""; }
};

const getLocalDate = (tz) => {
  try {
    return new Date().toLocaleDateString("en-US", {
      timeZone: tz,
      weekday: "short",
      day: "numeric",
      month: "short"
    });
  } catch { return ""; }
};

const AstrologyCalendar = ({ user, api }) => {
  const navigate = useNavigate();
  const [months, setMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewIndex, setViewIndex] = useState(0);
  const [hemisphere, setHemisphere] = useState("north");
  const [selectedTz, setSelectedTz] = useState(null);
  const [showTzDropdown, setShowTzDropdown] = useState(false);
  const tzRef = useRef(null);

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/20 to-emerald-900/10" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", gradient: "from-blue-500/20 to-blue-900/10" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", gradient: "from-orange-500/20 to-orange-900/10" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", gradient: "from-cyan-500/20 to-cyan-900/10" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", gradient: "from-purple-500/20 to-purple-900/10" },
  };

  useEffect(() => {
    fetchData();
    autoDetectTimezone();
    // Close dropdown on outside click
    const handler = (e) => { if (tzRef.current && !tzRef.current.contains(e.target)) setShowTzDropdown(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const autoDetectTimezone = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const match = TIMEZONES.find(t => !t.group && t.tz === tz);
      if (match) {
        setSelectedTz(match);
        setHemisphere(match.hemi);
        return;
      }
      // Fallback: detect hemisphere from tz string
      const southPatterns = ['australia','auckland','wellington','argentina','sao_paulo','santiago','lima','johannesburg','cape','mauritius','new_zealand','nz'];
      const isSouth = southPatterns.some(p => tz.toLowerCase().includes(p));
      setHemisphere(isSouth ? "south" : "north");
    } catch { setHemisphere("north"); }
  };

  const handleTzSelect = (tz) => {
    setSelectedTz(tz);
    setHemisphere(tz.hemi);
    setShowTzDropdown(false);
  };

  // Helper to get hemisphere-appropriate description
  const getDescription = (month) => {
    if (hemisphere === "south" && month.description_south) {
      return month.description_south;
    }
    if (hemisphere === "north" && month.description_north) {
      return month.description_north;
    }
    return month.description; // Fallback to original
  };

  const fetchData = async () => {
    try {
      const [monthsRes, currentRes] = await Promise.all([
        api.get("/astrology/months"),
        api.get("/astrology/current"),
      ]);
      setMonths(monthsRes.data);
      setCurrentMonth(currentRes.data);
      
      // Set initial view to current month
      const currentIndex = monthsRes.data.findIndex(m => m.id === currentRes.data.id);
      if (currentIndex !== -1) {
        setViewIndex(Math.max(0, currentIndex - 1));
      }
    } catch (error) {
      console.error("Failed to fetch astrology data:", error);
    } finally {
      setLoading(false);
    }
  };

  const visibleMonths = months.slice(viewIndex, viewIndex + 3);

  const canScrollLeft = viewIndex > 0;
  const canScrollRight = viewIndex < months.length - 3;

  return (
    <div className="min-h-screen bg-background" data-testid="astrology-calendar">
      {/* Background */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1769921824705-ff05243792de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxuZWJ1bGElMjBzdGFycyUyMGdhbGF4eSUyMGRlZXAlMjBzcGFjZSUyMGNvbG9yZnVsfGVufDB8fHx8MTc3MTUwNDE3OHww&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Lunar Wisdom</p>
              <h1 className="text-xl font-serif">13-Moon <span className="italic text-primary">Calendar</span></h1>
            </div>
          </div>
          
          {/* Hemisphere + Timezone Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Hemisphere Toggle */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setHemisphere("south")}
                data-testid="hemi-south"
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  hemisphere === "south" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🌿 Southern
              </button>
              <button
                onClick={() => setHemisphere("north")}
                data-testid="hemi-north"
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  hemisphere === "north" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ☀️ Northern
              </button>
            </div>

            {/* Timezone Dropdown */}
            <div className="relative" ref={tzRef}>
              <button
                onClick={() => setShowTzDropdown(!showTzDropdown)}
                data-testid="timezone-selector"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground hover:bg-white/10 transition-all"
              >
                <Clock className="w-3 h-3" />
                <span className="max-w-[140px] truncate">
                  {selectedTz ? selectedTz.label.replace(/^[🌿☀️]\s/, '') : "Select timezone"}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showTzDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-80 max-h-80 overflow-y-auto bg-card border border-white/15 rounded-xl shadow-2xl z-50"
                  >
                    {TIMEZONES.map((tz) => (
                      tz.group ? (
                        <div key={getTimezoneOptionKey(tz)} className="px-3 pt-3 pb-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{tz.label}</p>
                        </div>
                      ) : (
                        <button
                          key={getTimezoneOptionKey(tz)}
                          onClick={() => handleTzSelect(tz)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-white/5 transition-colors ${
                            selectedTz?.tz === tz.tz ? "text-primary bg-primary/10" : "text-muted-foreground"
                          }`}
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

        {/* Current timezone strip */}
        {selectedTz && (
          <div className="max-w-6xl mx-auto px-4 pb-2 flex items-center gap-2 text-xs text-muted-foreground/60">
            <Globe className="w-3 h-3" />
            <span>{selectedTz.label.replace(/^[🌿☀️]\s/, '')} — {getLocalDate(selectedTz.tz)} · {getLocalTime(selectedTz.tz)}</span>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs border ${hemisphere === "south" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10"}`}>
              {hemisphere === "south" ? "🌿 Southern Hemisphere" : "☀️ Northern Hemisphere"}
            </span>
          </div>
        )}
      </header>

      <main className="relative max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Current Month Highlight */}
            {currentMonth && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 rounded-2xl border backdrop-blur-xl mb-12
                           bg-gradient-to-br ${elementColors[currentMonth.element]?.gradient}
                           ${elementColors[currentMonth.element]?.border}`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center
                                    ${elementColors[currentMonth.element]?.bg}`}>
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
                    <p className={`text-sm ${elementColors[currentMonth.element]?.text}`}>
                      {currentMonth.element} Element • Symbol: {currentMonth.symbol}
                    </p>
                    <p className="text-muted-foreground mt-4 leading-relaxed">
                      {hemisphere === "south" && currentMonth.description_south 
                        ? currentMonth.description_south 
                        : (hemisphere === "north" && currentMonth.description_north 
                          ? currentMonth.description_north 
                          : currentMonth.description)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif">The <span className="italic text-primary">Sacred Wheel</span></h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewIndex(Math.max(0, viewIndex - 1))}
                  disabled={!canScrollLeft}
                  className="border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewIndex(Math.min(months.length - 3, viewIndex + 1))}
                  disabled={!canScrollRight}
                  className="border-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Months Grid */}
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
                    className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer
                               ${colors.bg} ${colors.border}
                               ${isCurrent ? 'ring-2 ring-primary' : ''}
                               hover:scale-[1.02] transition-all duration-300`}
                    onClick={() => setSelectedMonth(month)}
                    data-testid={`month-card-${month.id}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-serif">{month.month_number}</span>
                      {isCurrent && (
                        <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-xl font-serif mb-1">{month.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{month.dates}</p>
                    <p className={`text-xs ${colors.text}`}>{month.symbol} • {month.element}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-1">
                      {month.themes?.slice(0, 2).map((theme) => (
                        <span key={theme} className="px-2 py-1 rounded-full bg-white/5 text-xs">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* All Months Mini */}
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
                      className={`px-3 py-2 rounded-lg text-sm transition-all
                                 ${colors.bg} ${colors.border} border
                                 ${isCurrent ? 'ring-1 ring-primary' : ''}
                                 hover:scale-105`}
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

      {/* Month Detail Dialog */}
      <Dialog open={!!selectedMonth} onOpenChange={() => setSelectedMonth(null)}>
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedMonth && (
            <>
              <DialogHeader>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               ${elementColors[selectedMonth.element]?.bg} ${elementColors[selectedMonth.element]?.text}`}>
                  {selectedMonth.element} • {selectedMonth.symbol}
                </div>
                <DialogTitle className="text-3xl font-serif">
                  {selectedMonth.month_number}. {selectedMonth.name}
                </DialogTitle>
                <p className="text-muted-foreground">{selectedMonth.dates}</p>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Hemisphere Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-muted-foreground">Your Hemisphere</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHemisphere("north")}
                      className={hemisphere === "north" ? "bg-primary/20 text-primary" : "text-muted-foreground"}
                    >
                      Northern
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHemisphere("south")}
                      className={hemisphere === "south" ? "bg-primary/20 text-primary" : "text-muted-foreground"}
                    >
                      Southern
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">{getDescription(selectedMonth)}</p>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMonth.themes?.map((theme) => (
                      <span key={theme} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Crystals
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMonth.crystals?.map((crystal) => (
                      <span key={crystal} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm">
                        {crystal}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Leaf className="w-4 h-4" /> Practices
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMonth.practices?.map((practice) => (
                      <span key={practice} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm">
                        {practice}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AstrologyCalendar;
