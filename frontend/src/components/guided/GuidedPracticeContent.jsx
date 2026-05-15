import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";

export const GuidedPracticeContent = ({
  practice,
  onExit,
  muted,
  setMuted,
  isComplete,
  bgGradient,
  elColor,
  timeRemaining,
  hasStarted,
  scriptLoading,
  element,
  progress,
  ttsLoading,
  audioTapRequired,
  ttsPlaying,
  currentSegmentIndex,
  narrationSegments,
  narrationParagraphs,
  handlePlay,
  isPlaying,
  formatTime,
  minimumNarrationMinutes,
  ambientLabel,
  antiRepetitionMode,
  onAntiRepetitionModeChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] bg-gradient-to-b ${bgGradient} flex flex-col`}
      data-testid="guided-practice-overlay"
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-3 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Guided Practice</p>
          <h2 className="text-lg font-serif text-white truncate" data-testid="guided-practice-title">{practice.name}</h2>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <button
            onClick={() => setMuted((current) => !current)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={muted ? "Unmute" : "Mute"}
            data-testid="guided-mute-btn"
          >
            {muted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-white/80" />}
          </button>
          <button
            onClick={onExit}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            data-testid="guided-close-top"
            aria-label="Exit practice"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-5 flex flex-col">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-6"
              data-testid="practice-complete-screen"
            >
              <CheckCircle2 className="w-20 h-20 text-emerald-400" />
              <div>
                <h3 className="text-3xl font-serif text-white mb-3">Practice Complete</h3>
                <p className="text-white/60 text-sm">{practice.name}</p>
              </div>
              <p className="text-white/50 text-sm max-w-xs">
                You have completed {Math.max(minimumNarrationMinutes, practice.duration_minutes || minimumNarrationMinutes)} minutes of sacred practice. Carry this energy with you.
              </p>
              <button
                onClick={onExit}
                className="mt-2 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium"
                data-testid="guided-exit-complete"
              >
                Return
              </button>
            </motion.div>
          ) : (
            <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-h-0 flex flex-col">
              <div className="text-center mt-6 mb-4">
                <p className={`text-7xl font-serif font-light ${elColor} tabular-nums`}>
                  <span data-testid="guided-practice-timer">{formatTime(timeRemaining)}</span>
                </p>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
                  {hasStarted
                    ? "remaining"
                    : scriptLoading
                      ? "Preparing long-form guidance..."
                      : `${Math.max(minimumNarrationMinutes, practice.duration_minutes || minimumNarrationMinutes)} min · ${ambientLabel}`}
                </p>
              </div>

              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    element === "fire"
                      ? "from-orange-500 to-red-500"
                      : element === "water"
                        ? "from-blue-500 to-cyan-500"
                        : element === "earth"
                          ? "from-emerald-500 to-green-500"
                          : element === "air"
                            ? "from-sky-500 to-cyan-500"
                            : "from-violet-500 to-purple-500"
                  }`}
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>

              {ttsLoading && (
                <div className={`text-center text-xs ${elColor} mb-4 flex items-center justify-center gap-2`}>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Preparing your guide...
                </div>
              )}
              {scriptLoading && (
                <div className={`text-center text-xs ${elColor} mb-4`} data-testid="guided-script-expanding-status">
                  Weaving an expanded guided script for your full session...
                </div>
              )}
              {audioTapRequired && (
                <div className={`text-center text-xs ${elColor} mb-4`} data-testid="guided-audio-tap-required-status">
                  Audio is ready — tap play once to begin voice guidance.
                </div>
              )}
              {ttsPlaying && !ttsLoading && (
                <div className={`text-center text-xs ${elColor} mb-4`}>
                  Guided narration playing • section {Math.min(currentSegmentIndex + 1, narrationSegments.length)} of {narrationSegments.length}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-4" data-testid="guided-anti-repetition-mode-group">
                <button
                  type="button"
                  onClick={() => onAntiRepetitionModeChange?.("strict")}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    antiRepetitionMode === "strict"
                      ? "bg-white/25 border-white/60 text-white"
                      : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10"
                  }`}
                  data-testid="guided-mode-strict-btn"
                >
                  Strict anti-repeat
                </button>
                <button
                  type="button"
                  onClick={() => onAntiRepetitionModeChange?.("balanced")}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    antiRepetitionMode === "balanced"
                      ? "bg-white/25 border-white/60 text-white"
                      : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10"
                  }`}
                  data-testid="guided-mode-balanced-btn"
                >
                  Balanced flow
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl bg-white/5 p-5 mb-6" data-testid="guided-practice-description">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Visualization Guide</p>
                <div className="space-y-3">
                  {narrationParagraphs.map((paragraph, index) => (
                    <p key={`${practice.id || practice.name}-${index}`} className="text-sm text-white/70 leading-relaxed">{paragraph.trim()}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={handlePlay}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                    isPlaying
                      ? "bg-white/20 hover:bg-white/30"
                      : `bg-gradient-to-br ${
                          element === "fire"
                            ? "from-orange-500 to-red-600"
                            : element === "water"
                              ? "from-blue-500 to-cyan-600"
                              : element === "earth"
                                ? "from-emerald-500 to-green-600"
                                : element === "air"
                                  ? "from-sky-500 to-cyan-600"
                                  : "from-violet-500 to-purple-600"
                        } hover:opacity-90`
                  }`}
                  data-testid="guided-play-btn"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isComplete && (
        <div className="flex-shrink-0 px-5 pb-6 pt-2">
          <button
            onClick={onExit}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/40"
            data-testid="guided-exit-btn"
          >
            <X className="w-4 h-4" /> Exit Practice
          </button>
        </div>
      )}
    </motion.div>
  );
};
