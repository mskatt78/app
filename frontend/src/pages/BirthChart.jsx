import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sun, Moon, Star, Sparkles, Calendar, Clock, MapPin,
  ChevronRight, Loader2, Save, User, TrendingUp, Circle, Triangle,
  Square, Hexagon, Info, ChevronDown
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  buildBirthDateOptions,
  formatDegree,
  getAspectColor,
  getElementBgColor,
  getElementColor,
} from "./birthchart/birthChartUtils";

const BirthChart = ({ user, api }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [chart, setChart] = useState(null);
  const [zodiacSigns, setZodiacSigns] = useState({});
  const [showAspects, setShowAspects] = useState(false);
  const [showHouses, setShowHouses] = useState(false);
  
  // Dropdown date state
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("12");
  const [birthMinute, setBirthMinute] = useState("00");
  
  const [formData, setFormData] = useState({
    birth_date: "",
    birth_time: "12:00",
    birth_city: "",
    birth_country: ""
  });

  // Generate dropdown options
  const { years, months, days, hours, minutes } = buildBirthDateOptions();

  // Update formData when date components change
  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      setFormData(prev => ({ 
        ...prev, 
        birth_date: `${birthYear}-${birthMonth}-${birthDay}`,
        birth_time: `${birthHour}:${birthMinute}`
      }));
    }
  }, [birthYear, birthMonth, birthDay, birthHour, birthMinute]);

  const fetchZodiacSigns = useCallback(async () => {
    try {
      const response = await api.get("/birth-chart/zodiac-signs");
      setZodiacSigns(response.data);
    } catch (error) {
      console.error("Failed to fetch zodiac signs:", error);
    }
  }, [api]);

  const fetchSavedChart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/birth-chart/my-chart");
      setChart(response.data);
    } catch (error) {
      // No saved chart - that's OK
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchZodiacSigns();
    if (user) {
      fetchSavedChart();
    }
  }, [fetchSavedChart, fetchZodiacSigns, user]);

  const calculateChart = async () => {
    if (!formData.birth_date || !formData.birth_city || !formData.birth_country) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCalculating(true);
    try {
      const endpoint = user ? "/birth-chart/save" : "/birth-chart/calculate";
      const response = await api.post(endpoint, formData);
      setChart(response.data);
      toast.success("Birth chart calculated with Swiss Ephemeris precision!");
    } catch (error) {
      console.error("Chart calculation error:", error);
      toast.error(error.response?.data?.detail || "Failed to calculate chart");
    } finally {
      setCalculating(false);
    }
  };


  const getPlanetIcon = (planet) => {
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-serif">Birth Chart</h1>
              <p className="text-xs text-muted-foreground">Swiss Ephemeris Precision</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Input Form */}
        {!chart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Calculate Your Birth Chart
                </CardTitle>
                <CardDescription>
                  Using Swiss Ephemeris for professional-grade accuracy (0.0001° precision)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your birth details to discover your complete natal chart including Sun sign, Moon sign, Rising sign (Ascendant), all planetary positions, house placements, and aspects.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" /> Birth Date *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={birthYear} onValueChange={setBirthYear}>
                        <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-year">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={birthMonth} onValueChange={setBirthMonth}>
                        <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-month">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={birthDay} onValueChange={setBirthDay}>
                        <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-day">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" /> Birth Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={birthHour} onValueChange={setBirthHour}>
                        <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-hour">
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {hours.map(h => <SelectItem key={h} value={h}>{h}:00</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={birthMinute} onValueChange={setBirthMinute}>
                        <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-minute">
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {minutes.map(m => <SelectItem key={m} value={m}>:{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Required for accurate Rising sign & houses</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" /> Birth City *
                    </label>
                    <Input
                      placeholder="e.g., New York"
                      value={formData.birth_city}
                      onChange={(e) => setFormData({ ...formData, birth_city: e.target.value })}
                      data-testid="birth-city-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" /> Birth Country *
                    </label>
                    <Input
                      placeholder="e.g., USA"
                      value={formData.birth_country}
                      onChange={(e) => setFormData({ ...formData, birth_country: e.target.value })}
                      data-testid="birth-country-input"
                    />
                  </div>
                </div>

                <Button
                  onClick={calculateChart}
                  disabled={calculating}
                  className="w-full"
                  data-testid="calculate-chart-btn"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating with Swiss Ephemeris...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Calculate My Birth Chart
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    <User className="w-3 h-3 inline mr-1" />
                    Sign in to save your chart
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Chart Display */}
        {chart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Big Three - Sun, Moon, Rising */}
            <Card className="bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-yellow-500/10 border-purple-500/30 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg">Your Big Three</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {/* Sun Sign */}
                  <div className="space-y-2">
                    <div className="text-4xl">{chart.sun_sign_info?.symbol || "☉"}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Sun</div>
                    <div className="font-serif text-lg text-yellow-400">{chart.sun_sign}</div>
                    <Badge variant="outline" className="text-xs">
                      {chart.sun_sign_info?.element}
                    </Badge>
                  </div>
                  
                  {/* Moon Sign */}
                  <div className="space-y-2">
                    <div className="text-4xl">{chart.moon_sign_info?.symbol || "☽"}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Moon</div>
                    <div className="font-serif text-lg text-slate-300">{chart.moon_sign}</div>
                    <Badge variant="outline" className="text-xs">
                      {chart.moon_sign_info?.element}
                    </Badge>
                  </div>
                  
                  {/* Rising Sign */}
                  <div className="space-y-2">
                    <div className="text-4xl">{chart.rising_sign_info?.symbol || "AC"}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Rising</div>
                    <div className="font-serif text-lg text-primary">{chart.rising_sign}</div>
                    <Badge variant="outline" className="text-xs">
                      {chart.rising_sign_info?.element}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Planetary Positions */}
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  Planetary Positions
                </CardTitle>
                <CardDescription>
                  All planets calculated with Swiss Ephemeris precision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chart.planets?.map((planet, index) => {
                    const signInfo = zodiacSigns[planet.sign] || {};
                    return (
                      <motion.div
                        key={planet.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-xl ${getElementBgColor(signInfo.element)} border border-white/5 hover:border-white/10 transition-colors`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getPlanetIcon(planet.name)}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{planet.name}</p>
                                {planet.retrograde && (
                                  <Badge variant="destructive" className="text-xs px-1 py-0">
                                    ℞ Rx
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {planet.meaning}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-lg">{planet.sign_symbol}</span>
                              <span className="font-medium">{planet.sign}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDegree(planet.degree, planet.minute)} • House {planet.house}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Ascendant & Midheaven */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 border-violet-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{chart.ascendant?.sign_symbol}</div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Ascendant (Rising)</h3>
                    <p className="text-xl font-serif text-primary">{chart.ascendant?.sign}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDegree(chart.ascendant?.degree, chart.ascendant?.minute)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {chart.ascendant?.meaning}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{chart.midheaven?.sign_symbol}</div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Midheaven (MC)</h3>
                    <p className="text-xl font-serif text-amber-400">{chart.midheaven?.sign}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDegree(chart.midheaven?.degree, chart.midheaven?.minute)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {chart.midheaven?.meaning}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Aspects Section */}
            <Card className="bg-card/50 border-white/10">
              <CardHeader 
                className="cursor-pointer" 
                onClick={() => setShowAspects(!showAspects)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Planetary Aspects ({chart.aspects?.length || 0})
                  </CardTitle>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showAspects ? 'rotate-180' : ''}`} />
                </div>
                <CardDescription>
                  Geometric relationships between planets
                </CardDescription>
              </CardHeader>
              <AnimatePresence>
                {showAspects && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {chart.aspects?.map((aspect, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${getAspectColor(aspect.aspect)} flex items-center justify-between`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{aspect.planet1}</span>
                              <span className="text-lg">{aspect.symbol}</span>
                              <span className="font-medium">{aspect.planet2}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{aspect.aspect}</p>
                              <p className="text-xs text-muted-foreground">
                                Orb: {aspect.orb}° {aspect.applying ? "(applying)" : "(separating)"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Element & Quality Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Elements */}
              <Card className="bg-card/50 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Element Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(chart.elements?.percentages || {}).map(([element, percent]) => (
                      <div key={element}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={getElementColor(element).split(" ")[0]}>{element}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full ${getElementColor(element).split(" ")[1]}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-center mt-3 text-muted-foreground">
                    Dominant: <span className="text-primary">{chart.elements?.dominant}</span>
                  </p>
                  {chart.elements?.interpretation && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {chart.elements.interpretation}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Qualities */}
              <Card className="bg-card/50 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quality Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(chart.qualities?.percentages || {}).map(([quality, percent]) => (
                      <div key={quality}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{quality}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-primary/50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-center mt-3 text-muted-foreground">
                    Dominant: <span className="text-primary">{chart.qualities?.dominant}</span>
                  </p>
                  {chart.qualities?.interpretation && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {chart.qualities.interpretation}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Houses */}
            <Card className="bg-card/50 border-white/10">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setShowHouses(!showHouses)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Hexagon className="w-5 h-5 text-primary" />
                    The 12 Houses
                  </CardTitle>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showHouses ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
              <AnimatePresence>
                {showHouses && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.values(chart.houses || {}).map((house, index) => {
                          const signInfo = zodiacSigns[house.sign] || {};
                          return (
                            <motion.div
                              key={house.number}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.03 }}
                              className={`p-3 rounded-xl ${getElementBgColor(signInfo.element)} border border-white/5`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-lg font-serif text-primary">{house.number}</span>
                                <span className="text-lg">{house.sign_symbol}</span>
                              </div>
                              <p className="text-xs font-medium">{house.theme}</p>
                              <p className="text-xs text-muted-foreground">{house.sign}</p>
                              <p className="text-xs text-muted-foreground/60">
                                {formatDegree(house.degree, house.minute)}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Calculation Info */}
            <Card className="bg-card/30 border-white/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-4 h-4" />
                  <span>
                    Calculated using {chart.calculation_method} • Precision: {chart.precision} • 
                    Julian Day: {chart.birth_data?.julian_day}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Calculate New Chart Button */}
            <Button
              variant="outline"
              onClick={() => setChart(null)}
              className="w-full"
              data-testid="new-chart-btn"
            >
              Calculate New Chart
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BirthChart;
