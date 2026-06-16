import { motion } from "framer-motion";
import { Gauge, Heart, Minus, Music, Pause, Play, Plus, Repeat, RotateCcw, SkipForward, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Slider } from "../../components/ui/slider";
import AmbientSoundPlayer from "../../components/AmbientSoundPlayer";

export const MantrasPlayer = ({
  selectedMantra,
  onClose,
  elementColors,
  favorites,
  toggleFavorite,
  isPlaying,
  audioError,
  currentRep,
  audioProgress,
  audioDuration,
  formatTime,
  isLooping,
  toggleLoop,
  toggleAudio,
  skipToNext,
  isMuted,
  toggleMute,
  volume,
  handleVolumeChange,
  selectedNaturalSound,
  handleNaturalSoundChange,
  naturalSoundOptions,
  isChanting,
  tempo,
  setTempo,
  tempoLabels,
  useGeneratedSound,
  setUseGeneratedSound,
  resetChanting,
  startChanting,
  stopChanting,
  tempoMultipliers,
  setVolume,
  setIsMuted,
  setGuidedPractice,
  createGuidedMantraPractice,
}) => {
  return (
    <Dialog open={!!selectedMantra} onOpenChange={onClose}>
      <DialogContent className="bg-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
        {selectedMantra && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                              ${elementColors[selectedMantra.element]?.bg} ${elementColors[selectedMantra.element]?.text}`}>
                  {selectedMantra.element} • {selectedMantra.chakra} Chakra
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => toggleFavorite(selectedMantra.id, e)}
                  className={favorites.has(selectedMantra.id) ? "text-primary" : "text-muted-foreground"}
                  data-testid="mantra-player-favorite-btn"
                >
                  <Heart className={`w-4 h-4 mr-1 ${favorites.has(selectedMantra.id) ? "fill-current" : ""}`} />
                  {favorites.has(selectedMantra.id) ? "Saved" : "Save"}
                </Button>
              </div>
              <DialogTitle className="text-2xl font-serif">{selectedMantra.name}</DialogTitle>
              <DialogDescription className="sr-only" data-testid="mantra-player-dialog-description">
                Mantra details, guided practice controls, and therapeutic context.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {selectedMantra.sanskrit && (
                <motion.div
                  className="text-center py-8 rounded-xl bg-white/5 relative overflow-hidden"
                  animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${elementColors[selectedMantra.element]?.gradient} to-transparent opacity-30`} />
                  <p className="text-5xl text-primary font-serif relative z-10">{selectedMantra.sanskrit}</p>
                </motion.div>
              )}

              <div>
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Translation</h4>
                <p className="text-lg italic text-foreground/90">&ldquo;{selectedMantra.translation}&rdquo;</p>
              </div>

              {selectedMantra.audio_url && !audioError ? (
                <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <h4 className="text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Audio Player
                  </h4>

                  <div className="text-center mb-4">
                    <p className="text-4xl font-serif text-primary">{currentRep}</p>
                    <p className="text-sm text-muted-foreground">repetitions completed</p>
                  </div>

                  <div className="mb-4">
                    <Progress value={audioProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime((audioProgress / 100) * audioDuration)}</span>
                      <span>{formatTime(audioDuration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleLoop}
                      className={`rounded-full ${isLooping ? "text-primary bg-primary/20" : "text-muted-foreground"}`}
                      title={isLooping ? "Loop On" : "Loop Off"}
                      data-testid="mantra-loop-btn"
                    >
                      <Repeat className="w-5 h-5" />
                    </Button>

                    <Button
                      size="lg"
                      onClick={toggleAudio}
                      className={`rounded-full w-16 h-16 ${isPlaying ? "bg-orange-500 hover:bg-orange-600" : "bg-primary"}`}
                      data-testid="audio-play-btn"
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipToNext}
                      className="rounded-full text-muted-foreground hover:text-primary"
                      title="Skip to next rep"
                      data-testid="mantra-skip-next-btn"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-muted-foreground hover:text-primary"
                      data-testid="mantra-mute-btn"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={1}
                      step={0.01}
                      className="flex-1"
                    />
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Natural Soundscape</span>
                      <span className="text-xs text-primary">{naturalSoundOptions.find((option) => option.id === selectedNaturalSound)?.label || "Ocean Waves"}</span>
                    </div>
                    <Select value={selectedNaturalSound} onValueChange={handleNaturalSoundChange}>
                      <SelectTrigger className="bg-card/50 border-white/10" data-testid="mantra-natural-sound-select-trigger">
                        <SelectValue placeholder="Select sound" />
                      </SelectTrigger>
                      <SelectContent>
                        {naturalSoundOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id} data-testid={`mantra-natural-sound-option-${option.id}`}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedNaturalSound !== "silence" && isPlaying && (
                      <div className="mt-3" data-testid="mantra-natural-sound-player">
                        <AmbientSoundPlayer
                          key={`mantra-audio-ambient-${selectedNaturalSound}-${isPlaying ? "on" : "off"}`}
                          soundType={selectedNaturalSound}
                          autoPlay={isPlaying}
                          showControls
                          volume={Math.max(volume, 0.45)}
                        />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {isLooping ? "Audio will loop continuously. Count your repetitions mentally." : "Audio will play once per repetition."}
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <h4 className="text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Chanting Timer with Sound
                  </h4>

                  <div className="text-center mb-4">
                    <p className="text-4xl font-serif text-primary">{currentRep}</p>
                    <p className="text-sm text-muted-foreground">of {selectedMantra.repetitions} repetitions</p>
                  </div>

                  <Progress value={isNaN(audioProgress) ? 0 : audioProgress} className="h-2 mb-4" />

                  <div className="mb-4 p-4 rounded-lg bg-black/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Gauge className="w-4 h-4" /> Pace Control
                      </span>
                      <span className="text-xs text-primary">{tempoLabels[tempo]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTempo("slow")}
                        disabled={isChanting}
                        className={`flex-1 text-xs ${tempo === "slow" ? "bg-blue-500/20 text-blue-400" : ""}`}
                        data-testid="mantra-tempo-slow-btn"
                      >
                        <Minus className="w-3 h-3 mr-1" /> Slow
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTempo("normal")}
                        disabled={isChanting}
                        className={`flex-1 text-xs ${tempo === "normal" ? "bg-primary/20 text-primary" : ""}`}
                        data-testid="mantra-tempo-normal-btn"
                      >
                        Normal
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTempo("fast")}
                        disabled={isChanting}
                        className={`flex-1 text-xs ${tempo === "fast" ? "bg-orange-500/20 text-orange-400" : ""}`}
                        data-testid="mantra-tempo-fast-btn"
                      >
                        Fast <Plus className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-sm flex items-center gap-2">
                      <Music className="w-4 h-4 text-primary" />
                      <span className="font-medium">Meditation Sound</span>
                    </span>
                    <Button
                      variant={useGeneratedSound ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setUseGeneratedSound(!useGeneratedSound)}
                      data-testid="mantra-sound-mode-toggle"
                      className={useGeneratedSound ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                    >
                      {useGeneratedSound ? "ON - Bells & Om" : "ON - Natural"}
                    </Button>
                  </div>

                  {!useGeneratedSound && (
                    <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">Natural Soundscape</span>
                        <span className="text-xs text-primary">{naturalSoundOptions.find((option) => option.id === selectedNaturalSound)?.label || "Ocean Waves"}</span>
                      </div>
                      <Select value={selectedNaturalSound} onValueChange={handleNaturalSoundChange}>
                        <SelectTrigger className="bg-card/50 border-white/10" data-testid="mantra-natural-sound-select-trigger">
                          <SelectValue placeholder="Select sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {naturalSoundOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id} data-testid={`mantra-natural-sound-option-${option.id}`}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedNaturalSound !== "silence" && isChanting && (
                        <div className="mt-3" data-testid="mantra-natural-sound-player">
                          <AmbientSoundPlayer
                            key={`mantra-timer-ambient-${selectedNaturalSound}-${isChanting ? "on" : "off"}`}
                            soundType={selectedNaturalSound}
                            autoPlay={isChanting}
                            showControls
                            volume={Math.max(volume, 0.45)}
                          />
                        </div>
                      )}

                      {selectedNaturalSound === "silence" && (
                        <p className="text-xs text-muted-foreground mt-2 text-center" data-testid="mantra-natural-sound-silence-note">
                          Silence selected — chants run without background nature audio.
                        </p>
                      )}
                    </div>
                  )}

                  {useGeneratedSound && (
                    <p className="text-xs text-primary/80 text-center mb-4 p-2 rounded bg-primary/5">
                      🔔 Bell tones & Om sounds will play during your practice. Make sure your device volume is up!
                    </p>
                  )}

                  {useGeneratedSound && (
                    <div className="flex items-center gap-3 mb-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-muted-foreground hover:text-primary"
                        data-testid="mantra-generated-mute-btn"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={([v]) => {
                          setVolume(v);
                          setIsMuted(false);
                        }}
                        max={1}
                        step={0.01}
                        className="flex-1"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={isChanting ? stopChanting : startChanting}
                      className={`rounded-full w-14 h-14 ${isChanting ? "bg-orange-500 hover:bg-orange-600" : "bg-primary"}`}
                      data-testid="chant-play-btn"
                    >
                      {isChanting ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={resetChanting}
                      className="rounded-full border-white/10"
                      data-testid="chant-reset-btn"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {useGeneratedSound
                      ? `Om tones & bells accompany your ${Math.round(selectedMantra.duration_seconds * tempoMultipliers[tempo])}s cycles.`
                      : `${naturalSoundOptions.find((option) => option.id === selectedNaturalSound)?.label || "Natural sound"} accompanies your ${Math.round(selectedMantra.duration_seconds * tempoMultipliers[tempo])} second cycles.`}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMantra.benefits?.map((benefit) => (
                    <span key={benefit} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedMantra.pronunciation && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
                    <h4 className="text-xs uppercase tracking-wider text-primary mb-2">Pronunciation</h4>
                    <p className="text-sm font-medium">{selectedMantra.pronunciation}</p>
                  </div>
                )}
                {selectedMantra.frequency_hz && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <h4 className="text-xs uppercase tracking-wider text-blue-400 mb-2">Frequency</h4>
                    <p className="text-sm font-medium">{selectedMantra.frequency_hz} Hz</p>
                    {selectedMantra.vibrational_note && (
                      <p className="text-xs text-muted-foreground mt-1">Note: {selectedMantra.vibrational_note}</p>
                    )}
                  </div>
                )}
              </div>

              {selectedMantra.music_recommendation && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recommended Music</h4>
                  <p className="text-sm text-foreground/80">{selectedMantra.music_recommendation}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-primary">Practice Tip:</strong> {selectedMantra.practice_tips || `Find a comfortable seated position.
                  Close your eyes and focus on the sound and vibration of the mantra.
                  Let each repetition deepen your connection to the ${selectedMantra.element.toLowerCase()} element
                  and your ${selectedMantra.chakra} chakra.`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20" data-testid="mantra-why-this-heals">
                  <h4 className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Why this heals</h4>
                  <p className="text-sm text-emerald-100/80 leading-relaxed">
                    Repetition at stable rhythm helps settle fight-or-flight activation, while vocal resonance supports vagal tone and emotional regulation.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20" data-testid="mantra-integration-guide">
                  <h4 className="text-xs uppercase tracking-wider text-violet-300 mb-2">Integration</h4>
                  <p className="text-sm text-violet-100/80 leading-relaxed">
                    After chanting, sit in silence for 1-3 minutes. Let the vibration settle before returning to activity.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setGuidedPractice(createGuidedMantraPractice(selectedMantra))}
                className="w-full py-6 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-black hover:opacity-90"
                data-testid="start-mantra-guided-practice-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Begin Guided Mantra Practice
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
