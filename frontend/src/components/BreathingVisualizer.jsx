/**
 * BreathingVisualizer - Animated breathing guide for meditation
 * Shows expand/contract circle with breath phases
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BreathingVisualizer = ({
  pattern = { inhale: 4, hold: 4, exhale: 4, hold_empty: 0 },
  isActive = false,
  size = 200,
  color = "primary",
  showText = true,
  onCycleComplete = () => {}
}) => {
  const [phase, setPhase] = useState("ready"); // ready, inhale, hold, exhale, hold_empty
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const cyclesRef = useRef(0);
  const onCycleCompleteRef = useRef(onCycleComplete);

  const colorClasses = {
    primary: { ring: "border-primary", bg: "bg-primary/20", text: "text-primary" },
    earth: { ring: "border-emerald-500", bg: "bg-emerald-500/20", text: "text-emerald-400" },
    water: { ring: "border-blue-500", bg: "bg-blue-500/20", text: "text-blue-400" },
    fire: { ring: "border-orange-500", bg: "bg-orange-500/20", text: "text-orange-400" },
    air: { ring: "border-cyan-500", bg: "bg-cyan-500/20", text: "text-cyan-400" },
    spirit: { ring: "border-purple-500", bg: "bg-purple-500/20", text: "text-purple-400" }
  };

  const colors = colorClasses[color] || colorClasses.primary;

  const phaseConfig = useMemo(() => ({
    inhale: {
      duration: pattern.inhale,
      label: "Breathe In",
      scale: 1.3,
      next: pattern.hold > 0 ? "hold" : "exhale"
    },
    hold: {
      duration: pattern.hold,
      label: "Hold",
      scale: 1.3,
      next: "exhale"
    },
    exhale: {
      duration: pattern.exhale,
      label: "Breathe Out",
      scale: 1,
      next: pattern.hold_empty > 0 ? "hold_empty" : "inhale"
    },
    hold_empty: {
      duration: pattern.hold_empty,
      label: "Hold Empty",
      scale: 1,
      next: "inhale"
    }
  }), [pattern.exhale, pattern.hold, pattern.hold_empty, pattern.inhale]);

  useEffect(() => {
    onCycleCompleteRef.current = onCycleComplete;
  }, [onCycleComplete]);

  useEffect(() => {
    cyclesRef.current = cycles;
  }, [cycles]);

  // Start breathing cycle
  const startBreathing = useCallback(() => {
    setPhase("inhale");
    setCountdown(pattern.inhale);
  }, [pattern.inhale]);

  // Run the breathing cycle
  useEffect(() => {
    if (!isActive) {
      setPhase("ready");
      setCountdown(0);
      return;
    }

    if (phase === "ready") {
      startBreathing();
      return;
    }

    const config = phaseConfig[phase];
    if (!config) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhase = config.next;
          setPhase(nextPhase);
          
          // Track cycle completion
          if (nextPhase === "inhale") {
            setCycles((prev) => {
              const nextValue = prev + 1;
              cyclesRef.current = nextValue;
              onCycleCompleteRef.current(nextValue);
              return nextValue;
            });
          }
          
          return phaseConfig[nextPhase]?.duration || 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, phaseConfig, startBreathing]);

  const config = phaseConfig[phase] || { scale: 1, label: "Ready" };

  const particleAngles = useMemo(() => [0, 45, 90, 135, 180, 225, 270, 315], []);

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer ring */}
      <div 
        className={`absolute inset-0 rounded-full border-4 ${colors.ring} opacity-20`}
      />
      
      {/* Animated breathing circle */}
      <motion.div
        className={`rounded-full ${colors.bg} flex items-center justify-center`}
        animate={{
          scale: config.scale,
          opacity: phase === "hold" || phase === "hold_empty" ? 0.8 : 1
        }}
        transition={{
          duration: phaseConfig[phase]?.duration || 1,
          ease: "easeInOut"
        }}
        style={{
          width: size * 0.6,
          height: size * 0.6
        }}
      >
        {/* Inner glow */}
        <motion.div
          className={`rounded-full ${colors.bg}`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: size * 0.4,
            height: size * 0.4
          }}
        />
      </motion.div>

      {/* Text overlay */}
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <p className={`text-lg font-medium ${colors.text}`}>
                {config.label}
              </p>
              {isActive && phase !== "ready" && (
                <p className="text-3xl font-bold text-white mt-1">
                  {countdown}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Cycle counter */}
      {cycles > 0 && (
        <div className="absolute -bottom-8 text-center">
          <p className="text-xs text-muted-foreground">
            Cycle {cycles}
          </p>
        </div>
      )}

      {/* Decorative particles */}
      {isActive && (
        <>
          {particleAngles.map((angle) => (
            <motion.div
              key={`particle-angle-${angle}`}
              className={`absolute w-2 h-2 rounded-full ${colors.bg}`}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0],
                x: [0, Math.cos(angle * Math.PI / 180) * (size * 0.45)],
                y: [0, Math.sin(angle * Math.PI / 180) * (size * 0.45)]
              }}
              transition={{
                duration: phaseConfig[phase]?.duration || 4,
                repeat: Infinity,
                delay: (angle / 45) * 0.2
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default BreathingVisualizer;
