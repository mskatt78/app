import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mountain, Clock, TreeDeciduous, Play, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import PracticeTimer from "../components/PracticeTimer";

const GroundingPractices = ({ user, api }) => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isPracticing, setIsPracticing] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await api.get("/grounding");
        setExercises(response.data);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [api]);

  return (
    <div className="min-h-screen bg-background" data-testid="grounding-practices">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Earth Connection</p>
              <h1 className="text-xl font-serif">Grounding <span className="italic text-primary">Practices</span></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 py-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border border-emerald-500/20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <TreeDeciduous className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-serif mb-4">Return to <span className="italic text-primary">Earth</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-6">
            Grounding practices help you connect with the stabilizing energy of Mother Earth. 
            Use these exercises when feeling scattered, anxious, or disconnected.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl 
                          cursor-pointer hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                onClick={() => setSelectedExercise(exercise)}
                data-testid={`exercise-card-${exercise.id}`}
              >
                {exercise.image_url && (
                  <div className="relative h-36 overflow-hidden">
                    <img src={exercise.image_url} alt={exercise.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-white">
                      <Clock className="w-3 h-3" />{exercise.duration_minutes} min
                    </span>
                  </div>
                )}
                <div className="p-6">
                  {!exercise.image_url && (
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10">
                        <Mountain className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{exercise.duration_minutes} min</span>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-serif mb-3">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{exercise.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {exercise.benefits?.slice(0, 2).map((benefit) => (
                      <span key={benefit} className="px-2 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-8 rounded-2xl bg-card/50 border border-white/5"
        >
          <h3 className="text-xl font-serif mb-4 text-emerald-400">Grounding Tips</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              <span>Practice barefoot outdoors when possible for maximum earth connection</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              <span>Combine grounding with breathwork for enhanced calming effects</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              <span>Use grounding crystals like Black Tourmaline or Smoky Quartz to amplify the practice</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              <span>Morning grounding sets a stable foundation for the entire day</span>
            </li>
          </ul>
        </motion.div>
      </main>

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => { setSelectedExercise(null); setIsPracticing(false); }}>
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                {selectedExercise.image_url && (
                  <div className="relative h-40 rounded-xl overflow-hidden mb-3 -mx-2">
                    <img src={selectedExercise.image_url} alt={selectedExercise.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               bg-emerald-500/10 text-emerald-400">
                  Earth Element
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedExercise.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {!isPracticing ? (
                  <>
                    <p className="text-muted-foreground leading-relaxed">{selectedExercise.description}</p>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-muted-foreground">{selectedExercise.duration_minutes} minutes</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise.benefits?.map((benefit) => (
                          <span key={benefit} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedExercise.instructions?.length > 0 && (
                      <div>
                        <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Steps</h4>
                        <ul className="space-y-2">
                          {selectedExercise.instructions.map((step, i) => (
                            <li key={`${selectedExercise.id}-step-${String(step).slice(0, 40)}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs flex-shrink-0">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        try { const AC = window.AudioContext || window.webkitAudioContext; const c = new AC(); const b = c.createBuffer(1, c.sampleRate * 0.1, c.sampleRate); const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); window.__warmAudioCtx = c; } catch(e) {}
                        setIsPracticing(true);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      data-testid="start-practice-btn"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Begin Practice with Timer
                    </Button>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-emerald-400">Remember:</strong> The Earth is always there to support you. 
                        You need only place your awareness on it to feel its grounding presence.
                      </p>
                    </div>
                  </>
                ) : (
                  /* Timer Mode */
                  <div className="space-y-6">
                    <PracticeTimer
                      segments={selectedExercise.timer_segments || []}
                      totalDuration={selectedExercise.duration_minutes * 60}
                      backgroundAudio={selectedExercise.background_audio || "nature"}
                      autoStartAudio={true}
                      practiceType="grounding"
                      onComplete={async () => {
                        try {
                          await api.post("/practice-history", {
                            practice_type: "grounding",
                            practice_id: selectedExercise.id,
                            duration_minutes: selectedExercise.duration_minutes,
                            notes: `Completed ${selectedExercise.name}`,
                          });
                          toast.success("Practice complete! You are grounded.");
                          setIsPracticing(false);
                        } catch (error) {
                          console.error("Failed to log practice:", error);
                          toast.success("Practice complete!");
                          setIsPracticing(false);
                        }
                      }}
                    />

                    <Button
                      variant="outline"
                      onClick={() => setIsPracticing(false)}
                      className="w-full"
                    >
                      Exit Practice
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroundingPractices;
