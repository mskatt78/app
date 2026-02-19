import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Moon, Star, ChevronLeft, ChevronRight, Sparkles, Leaf } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const AstrologyCalendar = ({ user, api }) => {
  const navigate = useNavigate();
  const [months, setMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewIndex, setViewIndex] = useState(0);

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/20 to-emerald-900/10" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", gradient: "from-blue-500/20 to-blue-900/10" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", gradient: "from-orange-500/20 to-orange-900/10" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", gradient: "from-cyan-500/20 to-cyan-900/10" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", gradient: "from-purple-500/20 to-purple-900/10" },
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
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
        </div>
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
                    <p className="text-muted-foreground mt-4 leading-relaxed">{currentMonth.description}</p>
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
                <p className="text-muted-foreground leading-relaxed">{selectedMonth.description}</p>

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
