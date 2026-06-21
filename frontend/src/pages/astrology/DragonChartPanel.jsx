import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Flame, Loader2, Milestone, Sparkles, Star, Trash2, Wand2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "sonner";
import { buildBirthDateOptions } from "../birthchart/birthChartUtils";
import { appLogger } from "../../utils/logger";

const DragonChartPanel = ({ api, user }) => {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("12");
  const [birthMinute, setBirthMinute] = useState("00");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dragonData, setDragonData] = useState(null);
  const [history, setHistory] = useState([]);

  const isAuthenticated = Boolean(user?.user_id);

  const { years, months, days, hours, minutes } = useMemo(() => buildBirthDateOptions(), []);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await api.get("/birth-chart/dragon-chart/history");
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      appLogger.warn("Dragon chart history load failed", error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [api, isAuthenticated]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const calculateDragonChart = async () => {
    if (!birthYear || !birthMonth || !birthDay || !birthCity.trim() || !birthCountry.trim()) {
      toast.error("Please complete birth date, time, city and country");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        birth_date: `${birthYear}-${birthMonth}-${birthDay}`,
        birth_time: `${birthHour}:${birthMinute}`,
        birth_city: birthCity.trim(),
        birth_country: birthCountry.trim(),
      };

      if (isAuthenticated) {
        const response = await api.post("/birth-chart/dragon-chart/save", payload);
        setDragonData(response.data);
        setHistory((previous) => [response.data, ...previous]);
        toast.success("Dragon Chart revealed and saved");
      } else {
        const response = await api.post("/birth-chart/dragon-chart/calculate", payload);
        setDragonData(response.data);
        toast.success("Dragon Chart revealed");
      }
    } catch (error) {
      appLogger.error("Dragon chart error", error);
      toast.error(error?.response?.data?.detail || "Could not calculate Dragon Chart");
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (chartId) => {
    try {
      await api.delete(`/birth-chart/dragon-chart/history/${chartId}`);
      setHistory((previous) => previous.filter((item) => item.chart_id !== chartId));
      if (dragonData?.chart_id === chartId) {
        setDragonData(null);
      }
      toast.success("Dragon chart deleted");
    } catch (error) {
      appLogger.error("Dragon history delete failed", error);
      toast.error("Could not delete history item");
    }
  };

  const viewHistoryItem = (item) => {
    setDragonData(item);
    toast.success("Dragon chart loaded");
  };

  return (
    <div className="space-y-5" data-testid="dragon-chart-panel">
      {!dragonData && (
        <Card className="bg-card/60 border-white/10" data-testid="dragon-chart-form-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-300" /> Dragon Chart Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Birth Date</label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={birthYear} onValueChange={setBirthYear}>
                    <SelectTrigger data-testid="dragon-chart-year-select"><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent className="max-h-60">{years.map((v) => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={birthMonth} onValueChange={setBirthMonth}>
                    <SelectTrigger data-testid="dragon-chart-month-select"><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>{months.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={birthDay} onValueChange={setBirthDay}>
                    <SelectTrigger data-testid="dragon-chart-day-select"><SelectValue placeholder="Day" /></SelectTrigger>
                    <SelectContent className="max-h-60">{days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Birth Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={birthHour} onValueChange={setBirthHour}>
                    <SelectTrigger data-testid="dragon-chart-hour-select"><SelectValue placeholder="Hour" /></SelectTrigger>
                    <SelectContent className="max-h-60">{hours.map((h) => <SelectItem key={h} value={h}>{h}:00</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={birthMinute} onValueChange={setBirthMinute}>
                    <SelectTrigger data-testid="dragon-chart-minute-select"><SelectValue placeholder="Min" /></SelectTrigger>
                    <SelectContent className="max-h-60">{minutes.map((m) => <SelectItem key={m} value={m}>:{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Birth City</label>
                <Input value={birthCity} onChange={(e) => setBirthCity(e.target.value)} placeholder="e.g., London" data-testid="dragon-chart-city-input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Birth Country</label>
                <Input value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} placeholder="e.g., UK" data-testid="dragon-chart-country-input" />
              </div>
            </div>

            <Button onClick={calculateDragonChart} disabled={loading} className="w-full" data-testid="dragon-chart-calculate-button">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Calculating Dragon Chart...</> : <><Wand2 className="w-4 h-4 mr-2" />Reveal Dragon Chart</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {dragonData && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4" data-testid="dragon-chart-results">
          <Card className="bg-gradient-to-br from-amber-500/20 to-red-900/20 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-300" />Chinese Dragon Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p data-testid="dragon-animal-result">Animal: <span className="text-amber-200 font-medium">{dragonData.chinese_dragon_chart?.zodiac_animal}</span></p>
              <p data-testid="dragon-element-result">Element: <span className="text-amber-200 font-medium">{dragonData.chinese_dragon_chart?.zodiac_element}</span> ({dragonData.chinese_dragon_chart?.polarity})</p>
              <p className="text-sm text-muted-foreground" data-testid="dragon-cycle-message">{dragonData.chinese_dragon_chart?.dragon_cycle_message}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-slate-900/40 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Milestone className="w-5 h-5 text-cyan-300" />Dragon Head / Tail Axis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div data-testid="dragon-head-card">
                <p className="text-cyan-200 font-medium">Dragon Head ({dragonData.dragon_head_tail_chart?.dragon_head?.symbol})</p>
                <p className="text-sm">{dragonData.dragon_head_tail_chart?.dragon_head?.sign} • House {dragonData.dragon_head_tail_chart?.dragon_head?.house}</p>
                <p className="text-xs text-muted-foreground">{dragonData.dragon_head_tail_chart?.dragon_head?.message}</p>
              </div>
              <div data-testid="dragon-tail-card">
                <p className="text-rose-200 font-medium">Dragon Tail ({dragonData.dragon_head_tail_chart?.dragon_tail?.symbol})</p>
                <p className="text-sm">{dragonData.dragon_head_tail_chart?.dragon_tail?.sign} • House {dragonData.dragon_head_tail_chart?.dragon_tail?.house}</p>
                <p className="text-xs text-muted-foreground">{dragonData.dragon_head_tail_chart?.dragon_tail?.message}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="dragon-axis-summary">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Karmic Axis</p>
                <p className="text-sm text-primary">{dragonData.dragon_head_tail_chart?.karmic_axis}</p>
                <p className="text-xs text-muted-foreground">{dragonData.dragon_head_tail_chart?.axis_message}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardContent className="pt-4 flex flex-wrap gap-2 items-center justify-between">
              <p className="text-xs text-muted-foreground" data-testid="dragon-generated-at">Generated: {dragonData.generated_at}</p>
              <Button variant="outline" onClick={() => setDragonData(null)} data-testid="dragon-chart-recalculate-button">
                <Star className="w-4 h-4 mr-2" /> Calculate Another Dragon Chart
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isAuthenticated && (
        <Card className="bg-card/50 border-white/10" data-testid="dragon-chart-history-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-300" /> Saved Dragon Chart History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="dragon-history-loading">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading history...
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="dragon-history-empty">No saved Dragon charts yet.</p>
            ) : (
              <div className="space-y-2" data-testid="dragon-history-list">
                {history.map((item) => (
                  <div key={item.chart_id} className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid={`dragon-history-item-${item.chart_id}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {item.birth_input?.birth_date} {item.birth_input?.birth_time} • {item.birth_input?.birth_city}, {item.birth_input?.birth_country}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Axis: {item.dragon_head_tail_chart?.karmic_axis} • Chinese: {item.chinese_dragon_chart?.zodiac_element} {item.chinese_dragon_chart?.zodiac_animal}
                        </p>
                        <p className="text-xs text-muted-foreground">Saved: {item.saved_at || item.generated_at}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewHistoryItem(item)}
                          data-testid={`dragon-history-view-${item.chart_id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHistoryItem(item.chart_id)}
                          data-testid={`dragon-history-delete-${item.chart_id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-300" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DragonChartPanel;
