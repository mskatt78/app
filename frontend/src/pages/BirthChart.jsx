import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Calendar, Clock, MapPin,
  Loader2, User
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { toast } from "sonner";
import {
  buildBirthDateOptions,
} from "./birthchart/birthChartUtils";
import { BirthChartResults } from "./birthchart/BirthChartResults";
import { appLogger } from "../utils/logger";

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
      appLogger.error("Failed to fetch zodiac signs:", error);
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
      let response;

      if (user) {
        try {
          response = await api.post("/birth-chart/save", formData);
        } catch (error) {
          const status = error?.response?.status;
          if (status === 401 || status === 403) {
            response = await api.post("/birth-chart/calculate", formData);
            toast.success("Birth chart calculated. Please sign in again to save it.");
          } else {
            throw error;
          }
        }
      } else {
        response = await api.post("/birth-chart/calculate", formData);
      }

      setChart(response.data);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      if (!user) {
        toast.success("Birth chart calculated with Swiss Ephemeris precision!");
      }
    } catch (error) {
      appLogger.error("Chart calculation error:", error);
      toast.error(error.response?.data?.detail || "Failed to calculate chart");
    } finally {
      setCalculating(false);
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

        {chart && (
          <BirthChartResults
            chart={chart}
            zodiacSigns={zodiacSigns}
            showAspects={showAspects}
            setShowAspects={setShowAspects}
            showHouses={showHouses}
            setShowHouses={setShowHouses}
            onNewChart={() => setChart(null)}
          />
        )}
      </div>
    </div>
  );
};

export default BirthChart;
