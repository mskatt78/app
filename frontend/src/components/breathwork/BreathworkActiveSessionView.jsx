import { motion } from "framer-motion";
import { Progress } from "../ui/progress";
import { BreathworkControls } from "./BreathworkControls";
import { BreathworkSoundSelector } from "./BreathworkSoundSelector";
import { BREATH_PACE_OPTIONS } from "./useBreathworkEngine";

const scaleSeconds = (seconds, multiplier) => {
  const scaled = (seconds || 0) * (multiplier || 1);
  return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
};

export const BreathworkActiveSessionView = ({
  activeSession,
  isPlaying,
  breathPhase,
  phaseProgress,
  cycleCount,
  soundEnabled,
  selectedSound,
  setSelectedSound,
  togglePlay,
  resetSession,
  toggleSound,
  getBreathCircleSize,
  phaseLabels,
  elementColors,
  availableSoundOptions,
  pace,
  setPace,
  paceMultiplier,
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[70vh]" data-testid="breathwork-active-session-view">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-serif mb-2">{activeSession.name}</h2>
      <p className="text-muted-foreground">{activeSession.description}</p>
    </div>

    <div className="relative mb-12">
      <motion.div
        animate={{ width: getBreathCircleSize(), height: getBreathCircleSize() }}
        transition={{ duration: 0.1 }}
        className={`rounded-full flex items-center justify-center ${elementColors[activeSession.element]?.bg} ${elementColors[activeSession.element]?.border} border-2`}
        style={{ minWidth: 100, minHeight: 100 }}
      >
        <div className="text-center">
          <p className={`text-2xl font-serif ${elementColors[activeSession.element]?.text}`}>{phaseLabels[breathPhase]}</p>
          <p className="text-sm text-muted-foreground mt-1">{scaleSeconds(activeSession.pattern[breathPhase], paceMultiplier)}s</p>
        </div>
      </motion.div>
    </div>

    <div className="w-64 mb-8">
      <Progress value={phaseProgress} className="h-2" />
    </div>

    <div className="mb-6 text-center" data-testid="breath-pace-selector">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Breath pace</p>
      <div className="flex flex-wrap justify-center gap-2">
        {BREATH_PACE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setPace(option.id)}
            className={`px-4 py-1.5 rounded-full text-xs border transition-colors ${
              pace === option.id
                ? "bg-primary/25 border-primary/50 text-primary"
                : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
            }`}
            data-testid={`breath-pace-${option.id}-btn`}
          >
            {option.label}
            <span className="block text-[10px] opacity-70">{option.hint}</span>
          </button>
        ))}
      </div>
    </div>

    <BreathworkControls
      isPlaying={isPlaying}
      togglePlay={togglePlay}
      resetSession={resetSession}
      soundEnabled={soundEnabled}
      toggleSound={toggleSound}
    />

    <div className="w-full max-w-sm mb-8">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3 text-center">Breath soundscape</p>
      <BreathworkSoundSelector
        selectedSound={selectedSound}
        setSelectedSound={setSelectedSound}
        options={availableSoundOptions.filter((option) => option.id !== "tone" || activeSession.frequency)}
        soundEnabled={soundEnabled}
      />
      <p className="text-xs text-muted-foreground mt-3 text-center">Choose a nature sound, stay with the healing frequency tone, or practice in silence.</p>
    </div>

    <p className="text-muted-foreground">Cycles completed: <span className="text-primary font-medium">{cycleCount}</span></p>

    <div className="mt-8 flex gap-4 text-sm text-muted-foreground">
      <span>Inhale: {scaleSeconds(activeSession.pattern.inhale, paceMultiplier)}s</span>
      {activeSession.pattern.hold > 0 && <span>Hold: {scaleSeconds(activeSession.pattern.hold, paceMultiplier)}s</span>}
      <span>Exhale: {scaleSeconds(activeSession.pattern.exhale, paceMultiplier)}s</span>
      {activeSession.pattern.hold_empty > 0 && <span>Hold Empty: {scaleSeconds(activeSession.pattern.hold_empty, paceMultiplier)}s</span>}
    </div>

    {(activeSession.frequency || activeSession.instructions || activeSession.why_this_heals || activeSession.full_instructions) && (
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 max-w-xl text-left space-y-4">
        {activeSession.why_this_heals && (
          <div>
            <h4 className="text-sm font-medium text-amber-400 mb-2">Why This Heals</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{activeSession.why_this_heals}</p>
          </div>
        )}
        {activeSession.frequency && (
          <p className="text-sm text-primary">
            Frequency: {activeSession.frequency}
            
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Selected sound: <span className="text-primary">{availableSoundOptions.find((option) => option.id === selectedSound)?.label || "Silence"}</span>
          {soundEnabled && isPlaying && selectedSound !== "silence" && <span className="ml-2 text-xs text-emerald-400">(Playing)</span>}
        </p>
        {activeSession.full_instructions && (
          <div>
            <h4 className="text-sm font-medium text-violet-400 mb-2">Full Instructions</h4>
            <div className="text-xs text-muted-foreground whitespace-pre-line max-h-48 overflow-y-auto pr-2">{activeSession.full_instructions}</div>
          </div>
        )}
        {activeSession.instructions && !activeSession.full_instructions && <p className="text-xs text-muted-foreground">{activeSession.instructions}</p>}
        {activeSession.best_time && <p className="text-xs text-muted-foreground opacity-70">Best time: {activeSession.best_time}</p>}
      </div>
    )}

    {activeSession.master_embodiment_protocol && (
      <div className="mt-6 w-full max-w-xl p-4 rounded-xl bg-amber-500/10 border border-amber-500/20" data-testid="breathwork-master-embodiment-protocol">
        <h4 className="text-xs uppercase tracking-wider text-amber-300 mb-3">Master Embodiment Protocol</h4>
        <div className="space-y-3">
          {[
            { key: "preparation_phase", label: "Preparation" },
            { key: "embodiment_phase", label: "Embodiment" },
            { key: "integration_phase", label: "Integration" },
          ].map((section) => (
            <div key={section.key} className="p-3 rounded-lg bg-black/20 border border-white/10" data-testid={`breathwork-master-${section.key}`}>
              <p className="text-xs text-amber-200 font-medium mb-2">{section.label}</p>
              <ul className="space-y-1.5">
                {(activeSession.master_embodiment_protocol?.[section.key] || []).map((step, index) => (
                  <li key={`breathwork-${section.key}-${index}`} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-300">✦</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {(activeSession.master_embodiment_protocol?.seven_day_embodiment || []).length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-black/20 border border-white/10" data-testid="breathwork-master-seven-day">
            <p className="text-xs text-amber-200 font-medium mb-2">7-Day Embodiment Path</p>
            <ol className="space-y-1.5">
              {activeSession.master_embodiment_protocol.seven_day_embodiment.map((step, index) => (
                <li key={`breathwork-seven-day-${index}`} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-300">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    )}

    {(activeSession.best_for_tags || []).length > 0 && (
      <div className="mt-4 w-full max-w-xl p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20" data-testid="breathwork-best-for-tags-active">
        <h4 className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Best For</h4>
        <div className="flex flex-wrap gap-2">
          {activeSession.best_for_tags.map((tag) => (
            <span key={`breathwork-active-best-for-${tag}`} className="px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] text-emerald-100">
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}

    {activeSession.safety_notes && (
      <div className="mt-4 w-full max-w-xl p-4 rounded-xl bg-rose-500/10 border border-rose-500/20" data-testid="breathwork-safety-notes-active">
        <h4 className="text-xs uppercase tracking-wider text-rose-300 mb-2">Contraindications / Safety</h4>
        <p className="text-xs text-rose-100/90 leading-relaxed">{activeSession.safety_notes}</p>
      </div>
    )}

    {(activeSession.youtube_tutorials || []).length > 0 && (
      <div className="mt-6 w-full max-w-xl p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20" data-testid="breathwork-youtube-tutorials">
        <h4 className="text-xs uppercase tracking-wider text-cyan-300 mb-2">YouTube Tutorials</h4>
        <div className="space-y-2">
          {activeSession.youtube_tutorials.map((item, index) => (
            <a
              key={`breathwork-youtube-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-cyan-100 underline underline-offset-2 break-words"
              data-testid={`breathwork-youtube-link-active-${index}`}
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);
