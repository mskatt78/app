import { motion } from "framer-motion";
import { Calendar, CheckCircle2, ChevronRight, Hexagon, Sparkles, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BodyGraph } from "./BodyGraph";
import { PROFILE_LINES, getTypeColor, stableHumanDesignKey } from "./humanDesignData";

export const HumanDesignChartTab = ({
  phase,
  hdProfile,
  chosenType,
  calculatingChart,
  birthYear,
  birthMonth,
  birthDay,
  birthTime,
  birthCity,
  birthCountry,
  years,
  months,
  days,
  setBirthYear,
  setBirthMonth,
  setBirthDay,
  setBirthTime,
  setBirthCity,
  setBirthCountry,
  handleCalcProfile,
  resetChart,
  calculatedAuthority,
  definedCenterCount,
  navigate,
}) => (
  <motion.div key="chart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-6">
    {phase === 1 && (
      <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 border border-indigo-500/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Hexagon className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-serif mb-2">Your <span className="italic text-primary">Human Design Chart</span></h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Enter your exact birth details. Your Profile and Type are calculated directly from birth data (no intuitive type-picking).
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Select value={birthYear} onValueChange={setBirthYear}>
                <SelectTrigger className="bg-card/50 border-white/10" data-testid="hd-birth-year">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-card border-white/10">
                  {years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={birthMonth} onValueChange={setBirthMonth}>
                <SelectTrigger className="bg-card/50 border-white/10" data-testid="hd-birth-month">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  {months.map((month) => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={birthDay} onValueChange={setBirthDay}>
                <SelectTrigger className="bg-card/50 border-white/10" data-testid="hd-birth-day">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-card border-white/10">
                  {days.map((day) => <SelectItem key={day} value={day}>{parseInt(day, 10)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Birth Time</label>
              <Input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} className="bg-card/50 border-white/10" data-testid="hd-birth-time" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Birth City</label>
              <Input value={birthCity} onChange={(event) => setBirthCity(event.target.value)} placeholder="e.g. London" className="bg-card/50 border-white/10" data-testid="hd-birth-city" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Birth Country</label>
              <Input value={birthCountry} onChange={(event) => setBirthCountry(event.target.value)} placeholder="e.g. UK" className="bg-card/50 border-white/10" data-testid="hd-birth-country" />
            </div>
          </div>

          <Button
            onClick={handleCalcProfile}
            disabled={calculatingChart || !birthYear || !birthMonth || !birthDay || !birthTime || !birthCity || !birthCountry}
            className="w-full"
            data-testid="hd-calculate-btn"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {calculatingChart ? "Calculating from Birth Data..." : "Calculate My Human Design"}
          </Button>
        </div>
      </div>
    )}

    {phase === 3 && hdProfile && chosenType && (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" data-testid="hd-results">
        <div className={`p-6 rounded-2xl bg-gradient-to-br ${getTypeColor(chosenType.color).split(" ").slice(0, 2).join(" ")} border ${getTypeColor(chosenType.color).split(" ")[2]}`}>
          <div className="flex items-center gap-4 mb-3">
            {(() => { const Icon = chosenType.icon; return <Icon className={`w-10 h-10 ${getTypeColor(chosenType.color).split(" ")[3]}`} />; })()}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Type</p>
              <h2 className="text-2xl font-serif">{chosenType.name}</h2>
            </div>
            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-mono bg-white/10 ${getTypeColor(chosenType.color).split(" ")[3]}`}>
              Profile {hdProfile.profile}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{chosenType.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4 text-center">BodyGraph</p>
            <BodyGraph definedCenters={hdProfile.definedCenters || []} definedChannels={hdProfile.definedChannels || []} />
            <p className="text-center text-xs text-muted-foreground mt-3">Colored = calculated defined centers/channels</p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Strategy", value: chosenType.strategy, color: "green" },
              { label: "Authority", value: calculatedAuthority || "—", color: "violet" },
              { label: "Aura", value: chosenType.aura, color: "blue" },
              { label: "Signature", value: chosenType.signature, color: "amber" },
              { label: "Not-Self", value: chosenType.notSelf, color: "red" },
              { label: "Defined Centers", value: String(definedCenterCount), color: "indigo" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                <p className={`text-xs text-${color}-400 uppercase tracking-wider mb-0.5`}>{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
          <p className="text-xs uppercase tracking-wider text-violet-400 mb-2">
            Profile {hdProfile.profile} — {PROFILE_LINES[hdProfile.sunLine]?.name} / {PROFILE_LINES[hdProfile.dLine]?.name}
          </p>
          <p className="text-sm text-muted-foreground">{PROFILE_LINES[hdProfile.sunLine]?.desc}</p>
          <p className="text-xs text-violet-200 mt-2" data-testid="hd-profile-name">{hdProfile.profileName}</p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20" data-testid="hd-precision-audit-panel">
          <p className="text-xs uppercase tracking-wider text-amber-300 mb-2">Calculation Audit</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Timezone</p>
              <p className="font-medium" data-testid="hd-audit-timezone">{hdProfile.audit?.timezone_name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Coordinates</p>
              <p className="font-medium" data-testid="hd-audit-coordinates">
                {hdProfile.audit?.latitude != null && hdProfile.audit?.longitude != null
                  ? `${Number(hdProfile.audit.latitude).toFixed(4)}, ${Number(hdProfile.audit.longitude).toFixed(4)}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Incarnation Cross</p>
              <p className="font-medium" data-testid="hd-audit-incarnation-cross">{hdProfile.incarnationCross?.name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Digestion / Cognition</p>
              <p className="font-medium" data-testid="hd-audit-digestion-cognition">{hdProfile.variables?.digestion || "—"} / {hdProfile.variables?.cognition || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Environment / Perspective</p>
              <p className="font-medium" data-testid="hd-audit-environment-perspective">{hdProfile.variables?.environment || "—"} / {hdProfile.variables?.perspective || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Motivation</p>
              <p className="font-medium" data-testid="hd-audit-motivation">{hdProfile.variables?.motivation || "—"}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground" data-testid="hd-audit-design-local-datetime">
            Design Local Datetime: {hdProfile.audit?.design_local_datetime || "—"}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Key Traits
          </h4>
          <div className="space-y-2">
            {chosenType.keyTraits.map((trait) => (
              <div key={stableHumanDesignKey(`chart-trait-${chosenType.id}`, trait)} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                {trait}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="text-sm font-semibold mb-2 text-indigo-300">Deconditioning Path</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{chosenType.deconditioning}</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
          <p className="text-lg font-serif italic">&ldquo;{chosenType.affirmation}&rdquo;</p>
        </div>

        <Button variant="outline" className="w-full border-white/10" onClick={resetChart} data-testid="hd-reset-btn">
          Calculate New Chart
        </Button>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Explore Your Gene Keys</p>
              <p className="text-xs text-muted-foreground">Profile {hdProfile.profile} unlocks your genetic wisdom</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Your Profile {hdProfile.profile} in Human Design corresponds directly to your Gene Keys Hologenetic Profile.
            Discover your Life&apos;s Work, Evolution, Radiance, and Purpose through the 64 Gene Keys —
            the Shadow, Gift, and Siddhi transformations that map your spiritual journey.
          </p>
          <Button
            onClick={() => navigate("/gene-keys")}
            className="w-full bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30"
            data-testid="hd-to-gk-btn"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Explore My Gene Keys
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>
      </motion.div>
    )}
  </motion.div>
);
