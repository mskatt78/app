import { motion } from "framer-motion";
import { Progress } from "../ui/progress";
import { BreathworkControls } from "./BreathworkControls";
import { BreathworkSoundSelector } from "./BreathworkSoundSelector";

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
          <p className="text-sm text-muted-foreground mt-1">{activeSession.pattern[breathPhase]}s</p>
        </div>
      </motion.div>
    </div>

    <div className="w-64 mb-8">
      <Progress value={phaseProgress} className="h-2" />
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
      <span>Inhale: {activeSession.pattern.inhale}s</span>
      {activeSession.pattern.hold > 0 && <span>Hold: {activeSession.pattern.hold}s</span>}
      <span>Exhale: {activeSession.pattern.exhale}s</span>
      {activeSession.pattern.hold_empty > 0 && <span>Hold Empty: {activeSession.pattern.hold_empty}s</span>}
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
            {soundEnabled && isPlaying && selectedSound === "tone" && <span className="ml-2 text-xs text-emerald-400">(Playing)</span>}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Selected sound: <span className="text-primary">{availableSoundOptions.find((option) => option.id === selectedSound)?.label || "Silence"}</span>
          {soundEnabled && isPlaying && selectedSound !== "tone" && selectedSound !== "silence" && <span className="ml-2 text-xs text-emerald-400">(Playing)</span>}
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
  </motion.div>
);
