import { motion } from "framer-motion";
import { Calendar, Dna, Sparkles, User, Zap, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  KEY_ICONS,
  PROFILE_LINES,
  SPHERE_DESCRIPTIONS,
  geneKeysData,
  sphereColors,
} from "./geneKeysData";

export const GeneKeysProfileTab = ({
  profile,
  setProfile,
  birthYear,
  birthMonth,
  birthDay,
  setBirthYear,
  setBirthMonth,
  setBirthDay,
  years,
  months,
  days,
  handleCalculate,
  navigate,
  setSelectedKey,
}) => (
  <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl mx-auto">
    {!profile ? (
      <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Dna className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-2xl font-serif mb-2">Your <span className="italic text-primary">Hologenetic Profile</span></h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Enter your date of birth to discover your 4 personal Gene Keys — the Activation Sequence encoded in your DNA.
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
                <SelectTrigger className="bg-card/50 border-white/10" data-testid="gk-birth-year">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-card border-white/10">
                  {years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={birthMonth} onValueChange={setBirthMonth}>
                <SelectTrigger className="bg-card/50 border-white/10" data-testid="gk-birth-month">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  {months.map((month) => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={birthDay} onValueChange={setBirthDay}>
                <SelectTrigger className="bg-card/50 border-white/10" data-testid="gk-birth-day">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-card border-white/10">
                  {days.map((day) => <SelectItem key={day} value={day}>{parseInt(day, 10)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCalculate} disabled={!birthYear || !birthMonth || !birthDay} className="w-full" data-testid="gk-calculate-btn">
            <Sparkles className="w-4 h-4 mr-2" />
            Reveal My Gene Keys
          </Button>
        </div>
      </div>
    ) : (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" data-testid="gk-profile-results">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Dna className="w-7 h-7 text-violet-400" />
          </div>
          <h3 className="text-2xl font-serif mb-1">Your Hologenetic Profile</h3>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 mt-2">
            <User className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-sm text-violet-300">
              Profile {profile.profile} — {PROFILE_LINES[parseInt(profile.profile[0], 10)]?.name} / {PROFILE_LINES[parseInt(profile.profile[2], 10)]?.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto">
            {PROFILE_LINES[parseInt(profile.profile[0], 10)]?.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[profile.lifesWork, profile.evolution, profile.radiance, profile.purpose].map((sphere) => {
            const gk = geneKeysData.find((entry) => entry.key === sphere.key);
            const color = sphereColors[sphere.color];
            const Icon = KEY_ICONS[sphere.color];
            return (
              <motion.div
                key={sphere.role}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border ${color.bg} ${color.border} cursor-pointer hover:scale-[1.02] transition-all`}
                onClick={() => gk && setSelectedKey(gk)}
                data-testid={`gk-sphere-${sphere.role.toLowerCase().replace(/[' ]/g, "-")}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs uppercase tracking-wider ${color.text}`}>{sphere.sphere}</span>
                  <span className={`w-7 h-7 rounded-full ${color.badge} flex items-center justify-center text-xs ${color.text} font-mono`}>L{sphere.line}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${color.badge} flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xl font-serif ${color.text}`}>{sphere.key}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{sphere.role}</p>
                    {gk && <p className={`text-xs ${color.text}`}>{gk.gift}</p>}
                  </div>
                  <Icon className={`w-4 h-4 ${color.text}`} />
                </div>
                {gk && (
                  <>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{SPHERE_DESCRIPTIONS[sphere.role]}</p>
                    <div className="flex gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${color.bg} ${color.border} border ${color.text}`}>{gk.shadow}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">→ {gk.gift}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 italic">{gk.siddhi} ✦</p>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Your Contemplation Path
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "Begin with Gene Key {profile.lifesWork.key} — your Life&apos;s Work.
            Contemplate the shadow of <strong className="text-foreground">{geneKeysData.find((entry) => entry.key === profile.lifesWork.key)?.shadow}</strong> and
            how it wants to become the gift of <strong className="text-foreground">{geneKeysData.find((entry) => entry.key === profile.lifesWork.key)?.gift}</strong>.
            This single contemplation can transform your entire vocation."
          </p>
        </div>

        <Button variant="outline" className="w-full border-white/10" onClick={() => setProfile(null)} data-testid="gk-reset-btn">
          Calculate New Profile
        </Button>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Discover Your Human Design</p>
              <p className="text-xs text-muted-foreground">Your Profile {profile.profile} connects to your Human Design chart</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Gene Keys and Human Design share the same foundation. Your Profile number ({profile.profile})
            represents your conscious and unconscious personality traits in both systems.
            Explore your full Body Graph to understand your energy type and decision-making strategy.
          </p>
          <Button
            onClick={() => navigate("/human-design")}
            className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30"
            data-testid="gk-to-hd-btn"
          >
            <Zap className="w-4 h-4 mr-2" />
            View My Human Design Chart
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>
      </motion.div>
    )}
  </motion.div>
);
