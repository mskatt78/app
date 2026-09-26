import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pause, Play, SlidersHorizontal, Volume2, VolumeX, X } from "lucide-react";
import { resolveDurationMinutes } from "../../utils/durationUtils";
import { GUIDED_SPEED_OPTIONS, GUIDED_VOICE_PROFILES } from "../../utils/guidedVoiceSettings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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
  handleStartVoiceOnly,
  isPlaying,
  formatTime,
  minimumNarrationMinutes,
  ambientLabel,
  toningLabel,
  toningActive,
  playbackVoiceProfile,
  playbackSpeedOption,
  narrationDurationOptions,
  onNarrationDurationChange,
  onVoiceProfileChange,
  onSpeedOptionChange,
  customVoiceActive,
  customVoiceProfileName,
  voiceVolume,
  setVoiceVolume,
  ambientVolume,
  setAmbientVolume,
  resumedBookmark,
  onStartOver,
}) => {
  const [showFullNarration, setShowFullNarration] = useState(false);
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const effectiveDurationMinutes = resolveDurationMinutes(
    practice.duration_minutes ?? practice.duration,
    minimumNarrationMinutes,
  );
  const narrationTargetMinutes = Number(minimumNarrationMinutes) || 7;
  const availableNarrationDurationOptions = useMemo(() => {
    const options = Array.isArray(narrationDurationOptions) ? narrationDurationOptions : [];
    const sessionCap = Math.max(7, Math.min(20, Math.round(effectiveDurationMinutes || 7)));
    const filtered = options.filter((option) => option.minutes <= sessionCap);
    return filtered.length > 0 ? filtered : options;
  }, [effectiveDurationMinutes, narrationDurationOptions]);
  const selectedNarrationOptionMinutes = useMemo(() => {
    if (availableNarrationDurationOptions.length === 0) return narrationTargetMinutes;
    const supported = availableNarrationDurationOptions.map((option) => Number(option.minutes));
    if (supported.includes(narrationTargetMinutes)) return narrationTargetMinutes;
    return supported[supported.length - 1] || narrationTargetMinutes;
  }, [availableNarrationDurationOptions, narrationTargetMinutes]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    setShowFullNarration(false);
  }, [practice?.id, practice?.name]);

  const renderedNarrationParagraphs = useMemo(() => {
    if (showFullNarration) return narrationParagraphs;
    return narrationParagraphs.slice(0, 12);
  }, [narrationParagraphs, showFullNarration]);

  const hasHiddenNarration = narrationParagraphs.length > renderedNarrationParagraphs.length;
  const segmentDotWindow = useMemo(() => {
    const total = narrationSegments.length;
    if (total <= 18) {
      return narrationSegments.map((_, index) => index);
    }
    const active = Math.min(currentSegmentIndex, Math.max(0, total - 1));
    const start = Math.max(0, active - 4);
    const end = Math.min(total - 1, active + 4);
    const indexes = [];
    for (let index = start; index <= end; index += 1) indexes.push(index);
    return indexes;
  }, [currentSegmentIndex, narrationSegments]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] bg-gradient-to-b ${bgGradient} flex flex-col overscroll-contain`}
      data-testid="guided-practice-overlay"
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-3 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Guided Practice</p>
          <h2 className="text-lg font-serif text-white truncate" data-testid="guided-practice-title">{practice.name}</h2>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <button
            onClick={() => setShowVolumePanel((current) => !current)}
            className={`p-2 rounded-full transition-colors ${showVolumePanel ? "bg-white/25" : "bg-white/10 hover:bg-white/20"}`}
            aria-label="Volume mixer"
            data-testid="guided-volume-panel-btn"
          >
            <SlidersHorizontal className="w-4 h-4 text-white/80" />
          </button>
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

      {resumedBookmark && !isComplete && (
        <div className="px-5 pb-3 flex-shrink-0" data-testid="journey-resume-banner">
          <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 px-4 py-3 flex items-center justify-between gap-3 max-w-sm">
            <p className="text-xs text-amber-100/90 leading-snug">
              Resuming your journey from step {resumedBookmark.segmentIndex + 1} — press play to continue.
            </p>
            <button
              onClick={onStartOver}
              className="text-xs text-amber-200 underline underline-offset-2 whitespace-nowrap hover:text-amber-100"
              data-testid="journey-start-over-btn"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {showVolumePanel && (
        <div className="px-5 pb-3 flex-shrink-0" data-testid="guided-volume-panel">
          <div className="rounded-xl bg-black/30 border border-white/10 p-4 space-y-3 max-w-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/70 w-16">Voice</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round((voiceVolume ?? 1) * 100)}
                onChange={(event) => setVoiceVolume?.(Number(event.target.value) / 100)}
                className="flex-1 accent-amber-300"
                data-testid="guided-voice-volume-slider"
              />
              <span className="text-xs text-white/60 w-9 text-right">{Math.round((voiceVolume ?? 1) * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/70 w-16">Ambient</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round((ambientVolume ?? 1) * 100)}
                onChange={(event) => setAmbientVolume?.(Number(event.target.value) / 100)}
                className="flex-1 accent-cyan-300"
                data-testid="guided-ambient-volume-slider"
              />
              <span className="text-xs text-white/60 w-9 text-right">{Math.round((ambientVolume ?? 1) * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 px-5 flex flex-col pb-4 overflow-y-auto overscroll-contain touch-pan-y [touch-action:pan-y] [-webkit-overflow-scrolling:touch]" data-testid="guided-practice-scroll-container">
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
                You have completed {effectiveDurationMinutes} minutes of sacred practice. Carry this energy with you.
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
            <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-h-0 flex flex-col pb-16 sm:pb-8">
              <div className="text-center mt-6 mb-4">
                <p className={`text-7xl font-serif font-light ${elColor} tabular-nums`}>
                  <span data-testid="guided-practice-timer">{formatTime(timeRemaining)}</span>
                </p>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
                  {hasStarted
                    ? "remaining"
                    : scriptLoading
                      ? "Preparing long-form guidance..."
                      : `${effectiveDurationMinutes} min session · ${narrationTargetMinutes} min narration · ${ambientLabel}`}
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
              {customVoiceActive && (
                <div className={`text-center text-xs ${elColor} mb-4`} data-testid="guided-custom-voice-active-status">
                  Custom voice active: {customVoiceProfileName || "My Custom Voice"} (AI voice is bypassed)
                </div>
              )}

              {!ttsPlaying && !ttsLoading && hasStarted && (
                <div className="mb-4" data-testid="guided-voice-controls-hint-wrap">
                  <p className="text-xs text-white/60 sm:col-span-2 text-center" data-testid="guided-voice-controls-hint">
                    Voice is paused. Use Play Voice Guidance to resume narration.
                  </p>
                </div>
              )}
              {ttsPlaying && !ttsLoading && (
                <div className={`text-center text-xs ${elColor} mb-4`} data-testid="guided-segment-indicator">
                  Guided narration playing • segment {Math.min(currentSegmentIndex + 1, narrationSegments.length)} of {narrationSegments.length}
                  <div className="flex items-center justify-center gap-1 mt-2" data-testid="guided-segment-dots">
                    {segmentDotWindow.map((index) => {
                      const isActive = index === Math.min(currentSegmentIndex, Math.max(0, narrationSegments.length - 1));
                      const isCompleteDot = index < currentSegmentIndex;
                      return (
                        <span
                          key={`guided-segment-dot-${index}`}
                          className={`h-1.5 rounded-full transition-all ${
                            isActive
                              ? "w-5 bg-white"
                              : isCompleteDot
                                ? "w-3 bg-white/80"
                                : "w-2 bg-white/30"
                          }`}
                        />
                      );
                    })}
                  </div>
                  {narrationSegments.length > segmentDotWindow.length && (
                    <p className="text-[10px] text-white/45 mt-2" data-testid="guided-segment-window-indicator">
                      Showing nearby segments for smoother playback view
                    </p>
                  )}
                </div>
              )}
              {toningActive && !ttsLoading && (
                <div className={`text-center text-xs ${elColor} mb-4`} data-testid="guided-toning-active-status">
                  {toningLabel}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4" data-testid="guided-practice-override-controls">
                <div className="text-xs text-white/70" data-testid="guided-practice-voice-override-control">
                  Voice
                  <Select
                    value={playbackVoiceProfile}
                    onValueChange={(value) => onVoiceProfileChange?.(value)}
                    disabled={customVoiceActive}
                  >
                    <SelectTrigger className="mt-1 w-full bg-white/10 border-white/20 text-xs text-white" data-testid="guided-practice-voice-override-select">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent className="z-[300]">
                      {Object.values(GUIDED_VOICE_PROFILES).map((profile) => (
                        <SelectItem key={profile.id} value={profile.id} data-testid={`guided-practice-voice-override-option-${profile.id}`}>
                          {profile.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-white/70" data-testid="guided-practice-speed-override-control">
                  Speed
                  <Select
                    value={playbackSpeedOption}
                    onValueChange={(value) => onSpeedOptionChange?.(value)}
                    disabled={customVoiceActive}
                  >
                    <SelectTrigger className="mt-1 w-full bg-white/10 border-white/20 text-xs text-white" data-testid="guided-practice-speed-override-select">
                      <SelectValue placeholder="Select speed" />
                    </SelectTrigger>
                    <SelectContent className="z-[300]">
                      {Object.values(GUIDED_SPEED_OPTIONS).map((speed) => (
                        <SelectItem key={speed.id} value={speed.id} data-testid={`guided-practice-speed-override-option-${speed.id}`}>
                          {speed.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-white/70" data-testid="guided-practice-duration-override-control">
                  Narration Target
                  <Select
                    value={String(selectedNarrationOptionMinutes)}
                    onValueChange={(value) => onNarrationDurationChange?.(Number(value))}
                    disabled={customVoiceActive}
                  >
                    <SelectTrigger className="mt-1 w-full bg-white/10 border-white/20 text-xs text-white" data-testid="guided-practice-duration-override-select">
                      <SelectValue placeholder="Select narration length" />
                    </SelectTrigger>
                    <SelectContent className="z-[300]">
                      {availableNarrationDurationOptions.map((durationOption) => (
                        <SelectItem
                          key={durationOption.id}
                          value={String(durationOption.minutes)}
                          data-testid={`guided-practice-duration-override-option-${durationOption.id}`}
                        >
                          {durationOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4" data-testid="guided-voice-controls-panel">
                <button
                  type="button"
                  onClick={handleStartVoiceOnly}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs"
                  data-testid="guided-play-voice-manual-btn"
                >
                  <Play className="w-3.5 h-3.5" />
                  {ttsPlaying ? "Restart Voice Guidance" : "Play Voice Guidance"}
                </button>
              </div>

              <div className="rounded-2xl bg-white/5 p-5 mb-6 max-h-none overflow-visible" data-testid="guided-practice-description">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Visualization Guide</p>
                <div className="space-y-3">
                  {renderedNarrationParagraphs.map((paragraph, index) => (
                    <p key={`${practice.id || practice.name}-${index}`} className="text-sm text-white/70 leading-relaxed">{paragraph.trim()}</p>
                  ))}
                </div>
                {hasHiddenNarration && (
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowFullNarration(true)}
                      className="text-xs text-white/70 hover:text-white underline underline-offset-4"
                      data-testid="guided-expand-full-script-button"
                    >
                      Show full narration script ({narrationParagraphs.length - renderedNarrationParagraphs.length} more paragraphs)
                    </button>
                  </div>
                )}
                {showFullNarration && narrationParagraphs.length > 12 && (
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowFullNarration(false)}
                      className="text-xs text-white/60 hover:text-white underline underline-offset-4"
                      data-testid="guided-collapse-full-script-button"
                    >
                      Collapse long script view
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center mb-6 mt-2">
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

              {!isPlaying && !ttsPlaying && !ttsLoading && (
                <div className="text-center mb-6" data-testid="guided-voice-helper-copy">
                  <p className="text-xs text-white/60">Need voice guidance? Tap <span className="text-white">Play Voice Guidance</span> above.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isComplete && (
        <div className="flex-shrink-0 px-5 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
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
