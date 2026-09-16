import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wind, Heart } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import { appLogger } from "../../utils/logger";

const WELCOME_PRACTICE = {
  id: "welcome-arrival",
  name: "Breath of Arrival",
  duration_minutes: 5,
  element: "Spirit",
  category: "welcome",
  steps: [
    "Welcome, sacred traveller. You have just crossed the threshold into the Soul Temple. Find a comfortable seat, soften your shoulders, and let your eyes gently close. There is nowhere else you need to be.",
    "Place one hand on your heart and one on your belly. Breathe in slowly through the nose for four counts... hold softly... and breathe out through the mouth for six. With each exhale, feel yourself arriving more fully into this moment, into this body, into this temple.",
    "Silently offer an intention for your journey here — one word is enough. Peace. Healing. Remembering. Whatever rises, let it settle into your heart like a seed into rich earth. This temple will help it grow.",
    "Slowly return your awareness to the room. Wiggle your fingers, take one deeper breath, and when you are ready, open your eyes. Your journey has begun — the temple doors are open, and every practice inside is a homecoming.",
  ],
};

export const WelcomeJourney = ({ api }) => {
  const [show, setShow] = useState(false);
  const [practice, setPractice] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("welcomeJourneyDone")) return;
    let cancelled = false;
    api.get("/practice-history/stats")
      .then(({ data }) => {
        if (!cancelled && (data?.total_sessions || 0) === 0) setShow(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [api]);

  const dismiss = () => {
    localStorage.setItem("welcomeJourneyDone", "1");
    setShow(false);
  };

  const handleBegin = () => {
    setShow(false);
    setPractice(WELCOME_PRACTICE);
  };

  const handleExit = () => {
    setPractice(null);
    localStorage.setItem("welcomeJourneyDone", "1");
    api.post("/practice-history", {
      practice_type: "meditation",
      practice_id: WELCOME_PRACTICE.id,
      duration_minutes: WELCOME_PRACTICE.duration_minutes,
      notes: "Completed Breath of Arrival — first practice",
    })
      .then(() => toast.success("Your journey has begun. Welcome home."))
      .catch((error) => appLogger.warn("Welcome practice log failed", error));
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[290] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
              data-testid="welcome-journey-overlay"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 120 }}
                className="max-w-md w-full text-center"
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-9 h-9 text-primary" strokeWidth={1.25} />
                </motion.div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">A gift for your arrival</p>
                <h2 className="text-3xl sm:text-4xl font-serif mb-3">
                  Welcome to the <span className="italic text-primary">Soul Temple</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  Before you explore, receive a short guided arrival practice — five minutes to land, breathe, and set your intention.
                </p>
                <p className="text-sm text-muted-foreground/80 mb-8 flex items-center justify-center gap-3">
                  <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> Guided voice</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> 5 minutes</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="rounded-full px-8" onClick={handleBegin} data-testid="welcome-journey-begin-btn">
                    Begin First Practice
                  </Button>
                  <Button size="lg" variant="ghost" className="rounded-full px-6 text-muted-foreground" onClick={dismiss} data-testid="welcome-journey-skip-btn">
                    Maybe later
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <AnimatePresence>
        {practice && (
          <GuidedPracticeOverlay practice={practice} stepsOverride={practice.steps} onExit={handleExit} />
        )}
      </AnimatePresence>
    </>
  );
};
