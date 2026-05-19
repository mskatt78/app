import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Hash, Calculator, Sparkles, Star, Calendar, User,
  Heart, Flame, Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";

const Numerology = ({ user, api }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [fullName, setFullName] = useState("");
  const [reading, setReading] = useState(null);
  const [lifePaths, setLifePaths] = useState({});
  const [pastReadings, setPastReadings] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLifePath, setSelectedLifePath] = useState(null);

  // Generate year options (1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  const months = [
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
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  // Update birthDate when components change
  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      setBirthDate(`${birthYear}-${birthMonth}-${birthDay}`);
    }
  }, [birthYear, birthMonth, birthDay]);

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };

  useEffect(() => {
    fetchLifePaths();
    fetchHistory();
  }, []);

  const fetchLifePaths = async () => {
    try {
      const response = await api.get("/numerology/life-paths");
      setLifePaths(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch life paths", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get("/numerology/readings");
      setPastReadings(response.data);
    } catch (error) {
      appLogger.warn("Failed to fetch numerology history", error);
    }
  };

  const calculateReading = async () => {
    if (!birthDate) {
      toast.error("Please enter your birth date");
      return;
    }

    setLoading(true);
    try {
      // Always use /calculate - it's public and returns the same data
      const response = await api.post("/numerology/calculate", {
        birth_date: birthDate,
        full_name: fullName || null,
      });
      setReading(response.data);
      toast.success("Your numerology reading is ready!");
    } catch (error) {
      appLogger.error("Failed to calculate numerology reading", error);
      toast.error("Could not calculate reading. Check your birth date format.");
    } finally {
      setLoading(false);
    }
  };

  const resetReading = () => {
    setReading(null);
    setBirthDate("");
    setBirthYear("");
    setBirthMonth("");
    setBirthDay("");
    setFullName("");
  };

  return (
    <div className="min-h-screen bg-background" data-testid="numerology-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => reading ? resetReading() : navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Numbers</p>
              <h1 className="text-xl font-serif">Numerology <span className="italic text-primary">Reading</span></h1>
            </div>
          </div>

          {!reading && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="border-white/10"
            >
              {showHistory ? "New Reading" : "Past Readings"}
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {reading ? (
          /* Reading Results */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Life Path - Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-8 rounded-2xl border backdrop-blur-xl
                         ${elementColors[reading.life_path?.element]?.bg} 
                         ${elementColors[reading.life_path?.element]?.border}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center
                               ${elementColors[reading.life_path?.element]?.bg}`}>
                  <span className={`text-4xl font-serif ${elementColors[reading.life_path?.element]?.text}`}>
                    {reading.life_path?.number}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Life Path Number</p>
                  <h2 className="text-3xl font-serif">{reading.life_path?.name}</h2>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {reading.life_path?.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {reading.life_path?.traits?.map((trait) => (
                  <span key={trait} className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    {trait}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-5 h-5 ${elementColors[reading.life_path?.element]?.text}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Crystal</p>
                    <p className="font-medium">{reading.life_path?.crystal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flame className={`w-5 h-5 ${elementColors[reading.life_path?.element]?.text}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Element</p>
                    <p className="font-medium">{reading.life_path?.element}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-primary">Your Mantra:</strong> "{reading.life_path?.mantra}"
                </p>
              </div>
            </motion.div>

            {/* Personal Year */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-card/50 border border-white/5"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-2xl font-serif text-orange-400">{reading.personal_year?.number}</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Personal Year</p>
                  <h3 className="text-xl font-serif">{reading.personal_year?.theme}</h3>
                </div>
              </div>
              <p className="text-muted-foreground">{reading.personal_year?.description}</p>
            </motion.div>

            {/* Expression & Soul Urge (if name provided) */}
            {(reading.expression || reading.soul_urge) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reading.expression && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-card/50 border border-white/5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-xl font-serif text-cyan-400">{reading.expression?.number}</span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Expression Number</p>
                        <h3 className="text-lg font-serif">Your Talents</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{reading.expression?.description}</p>
                  </motion.div>
                )}

                {reading.soul_urge && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-card/50 border border-white/5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <span className="text-xl font-serif text-pink-400">{reading.soul_urge?.number}</span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Soul Urge Number</p>
                        <h3 className="text-lg font-serif">Your Desires</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{reading.soul_urge?.description}</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* New Reading Button */}
            <div className="text-center pt-4">
              <Button variant="outline" onClick={resetReading} className="border-white/10">
                Calculate New Reading
              </Button>
            </div>
          </motion.div>
        ) : showHistory ? (
          /* Past Readings */
          <div className="space-y-4">
            <h2 className="text-2xl font-serif mb-6">Your <span className="italic text-primary">Past Readings</span></h2>
            {pastReadings.length === 0 ? (
              <div className="text-center py-12">
                <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No readings yet. Calculate your first one!</p>
              </div>
            ) : (
              pastReadings.map((r, index) => (
                <motion.div
                  key={r.reading_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-2xl bg-card/50 border border-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-2xl font-serif text-primary">
                          {r.reading?.life_path?.number}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-serif">{r.reading?.life_path?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReading(r.reading)}
                    >
                      View
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          /* Input Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Hash className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-serif mb-2">Discover Your <span className="italic text-primary">Numbers</span></h2>
              <p className="text-muted-foreground">
                Numerology reveals the hidden meaning behind the numbers in your life.
              </p>
            </div>

            <div className="space-y-6 p-8 rounded-2xl bg-card/50 border border-white/5">
              <div>
                <label className="block text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Birth Date (required)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={birthYear} onValueChange={setBirthYear}>
                    <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-year">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 bg-card border-white/10">
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={birthMonth} onValueChange={setBirthMonth}>
                    <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-month">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={birthDay} onValueChange={setBirthDay}>
                    <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-day">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 bg-card border-white/10">
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>{parseInt(day)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name (optional - for Expression & Soul Urge numbers)
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full birth name"
                  className="bg-card/50 border-white/10"
                  data-testid="full-name-input"
                />
              </div>

              <Button
                onClick={calculateReading}
                disabled={loading || !birthDate}
                className="w-full bg-primary"
                data-testid="calculate-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate My Numbers
                  </>
                )}
              </Button>
            </div>

            {/* Life Path Overview */}
            <div className="mt-12">
              <h3 className="text-xl font-serif mb-6 text-center">
                The <span className="italic text-primary">Life Paths</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(lifePaths).map(([num, data]) => (
                  <button
                    key={num}
                    onClick={() => setSelectedLifePath({ number: num, ...data })}
                    className={`p-4 rounded-xl text-center transition-all hover:scale-105
                               ${elementColors[data.element]?.bg} ${elementColors[data.element]?.border} border`}
                  >
                    <span className={`text-2xl font-serif ${elementColors[data.element]?.text}`}>{num}</span>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{data.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Life Path Detail Dialog */}
      <Dialog open={!!selectedLifePath} onOpenChange={() => setSelectedLifePath(null)}>
        <DialogContent className="bg-card border-white/10 max-w-lg">
          {selectedLifePath && (
            <>
              <DialogHeader>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               ${elementColors[selectedLifePath.element]?.bg} ${elementColors[selectedLifePath.element]?.text}`}>
                  Life Path {selectedLifePath.number}
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedLifePath.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground leading-relaxed">{selectedLifePath.description}</p>

                <div className="flex flex-wrap gap-2">
                  {selectedLifePath.traits?.map((trait) => (
                    <span key={trait} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                      {trait}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-xs text-muted-foreground">Crystal</p>
                    <p className="font-medium">{selectedLifePath.crystal}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Element</p>
                    <p className="font-medium">{selectedLifePath.element}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm italic text-muted-foreground">
                    "{selectedLifePath.mantra}"
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Numerology;
