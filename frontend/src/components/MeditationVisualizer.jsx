import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const createRandomId = (prefix) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(16).slice(2)}`;
};

const useVisualizationState = ({ element, intensity }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const elementColors = {
    Earth: { primary: "#22c55e", secondary: "#15803d", glow: "rgba(34, 197, 94, 0.3)" },
    Water: { primary: "#3b82f6", secondary: "#1d4ed8", glow: "rgba(59, 130, 246, 0.3)" },
    Fire: { primary: "#f97316", secondary: "#ea580c", glow: "rgba(249, 115, 22, 0.3)" },
    Air: { primary: "#06b6d4", secondary: "#0891b2", glow: "rgba(6, 182, 212, 0.3)" },
    Spirit: { primary: "#a855f7", secondary: "#7c3aed", glow: "rgba(168, 85, 247, 0.3)" },
  };

  const colors = elementColors[element] || elementColors.Spirit;
  const particleCount = Math.floor(20 * intensity);

  const particleSpecs = useMemo(() => Array.from({ length: particleCount }, () => ({
    id: createRandomId("particle"),
    size: Math.random() * 8 + 4,
    startX: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    rise: 500 + Math.random() * 300,
    drift: (Math.random() - 0.5) * 100,
  })), [particleCount]);

  const auroraSpecs = useMemo(() => Array.from({ length: 5 }, (_, bandIndex) => ({
    id: `aurora-band-${20 + bandIndex * 15}`,
    top: 20 + bandIndex * 15,
    duration: 8 + bandIndex * 2,
    delay: bandIndex * 0.5,
  })), []);

  const starSpecs = useMemo(() => Array.from({ length: 30 }, () => ({
    id: createRandomId("star"),
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 2,
  })), []);

  const mandalaRings = useMemo(() => {
    const petalsPerRing = [8, 12, 16, 20, 24];
    return petalsPerRing.map((petalCount, ringIndex) => {
      const ringSize = 60 + ringIndex * 50;
      return {
        id: `mandala-ring-${ringSize}-${petalCount}`,
        ringSize,
        rotationDuration: 30 + ringIndex * 10,
        rotationDirection: ringIndex % 2 === 0 ? 360 : -360,
        petals: Array.from({ length: petalCount }, (_, petalIndex) => {
          const angle = (petalIndex * 360) / petalCount;
          return {
            id: `mandala-petal-${ringSize}-${Math.round(angle)}`,
            angle,
            delay: petalIndex * 0.1,
          };
        }),
      };
    });
  }, []);

  const earthSpecs = useMemo(() => Array.from({ length: 10 }, () => ({
    id: createRandomId("earth-fragment"),
    width: 40 + Math.random() * 60,
    height: 40 + Math.random() * 60,
    left: Math.random() * 100,
    bottom: Math.random() * 30,
    duration: 3 + Math.random() * 2,
  })), []);

  const waterSpecs = useMemo(() => Array.from({ length: 5 }, (_, waveIndex) => ({
    id: `water-wave-${20 + waveIndex * 15}`,
    top: 20 + waveIndex * 15,
    duration: 4 + waveIndex,
  })), []);

  const fireSpecs = useMemo(() => Array.from({ length: 15 }, () => ({
    id: createRandomId("fire-flame"),
    width: 20 + Math.random() * 40,
    height: 40 + Math.random() * 80,
    left: 30 + Math.random() * 40,
    rise: 100 + Math.random() * 100,
    duration: 1 + Math.random(),
    delay: Math.random(),
  })), []);

  const airSpecs = useMemo(() => Array.from({ length: 20 }, () => ({
    id: createRandomId("air-stream"),
    left: Math.random() * 100,
    top: Math.random() * 100,
    rotation: Math.random() * 30 - 15,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * 2,
  })), []);

  const chakraSpecs = useMemo(() => [
    { id: "chakra-root", color: "#ff0000", y: 85 },
    { id: "chakra-sacral", color: "#ff7f00", y: 72 },
    { id: "chakra-solar", color: "#ffff00", y: 58 },
    { id: "chakra-heart", color: "#00ff00", y: 44 },
    { id: "chakra-throat", color: "#00bfff", y: 30 },
    { id: "chakra-third-eye", color: "#0000ff", y: 18 },
    { id: "chakra-crown", color: "#8b00ff", y: 5 },
  ], []);

  return {
    mounted,
    colors,
    particleSpecs,
    auroraSpecs,
    starSpecs,
    mandalaRings,
    earthSpecs,
    waterSpecs,
    fireSpecs,
    airSpecs,
    chakraSpecs,
  };
};

const VisualizationCanvas = ({ type, element, state }) => {
  const {
    mounted,
    colors,
    particleSpecs,
    auroraSpecs,
    starSpecs,
    mandalaRings,
    earthSpecs,
    waterSpecs,
    fireSpecs,
    airSpecs,
    chakraSpecs,
  } = state;

  const particlesViz = useMemo(() => {
    if (!mounted) return null;
    return <div className="absolute inset-0 overflow-hidden">{particleSpecs.map((spec) => <motion.div key={spec.id} className="absolute rounded-full" style={{ width: spec.size, height: spec.size, background: `radial-gradient(circle, ${colors.primary}, transparent)`, left: `${spec.startX}%`, bottom: "-20px", boxShadow: `0 0 ${spec.size * 2}px ${colors.glow}` }} animate={{ y: [0, -spec.rise], x: [0, spec.drift], opacity: [0, 0.8, 0.8, 0], scale: [0.5, 1, 1, 0.3] }} transition={{ duration: spec.duration, repeat: Infinity, delay: spec.delay, ease: "easeOut" }} />)}</div>;
  }, [colors, mounted, particleSpecs]);

  const auroraViz = useMemo(() => {
    if (!mounted) return null;
    return (
      <div className="absolute inset-0 overflow-hidden">
        {auroraSpecs.map((spec) => (
          <motion.div key={spec.id} className="absolute w-full h-48 opacity-30" style={{ background: `linear-gradient(180deg, transparent, ${colors.primary}40, ${colors.secondary}40, transparent)`, filter: "blur(40px)", top: `${spec.top}%` }} animate={{ x: [-100, 100, -100], scaleY: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: spec.duration, repeat: Infinity, ease: "easeInOut", delay: spec.delay }} />
        ))}
        {starSpecs.map((star) => (
          <motion.div key={star.id} className="absolute w-1 h-1 bg-white rounded-full" style={{ left: `${star.left}%`, top: `${star.top}%` }} animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.2, 1] }} transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }} />
        ))}
      </div>
    );
  }, [auroraSpecs, colors, mounted, starSpecs]);

  const mandalaViz = useMemo(() => {
    if (!mounted) return null;
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div className="relative" style={{ width: 300, height: 300 }} animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
          {mandalaRings.map((ring) => (
            <div key={ring.id} className="absolute inset-0 flex items-center justify-center">
              <motion.div className="relative" style={{ width: ring.ringSize, height: ring.ringSize }} animate={{ rotate: ring.rotationDirection }} transition={{ duration: ring.rotationDuration, repeat: Infinity, ease: "linear" }}>
                {ring.petals.map((petal) => (
                  <motion.div key={petal.id} className="absolute w-3 h-8 rounded-full" style={{ background: `linear-gradient(to bottom, ${colors.primary}, transparent)`, left: "50%", top: "50%", transformOrigin: "center bottom", transform: `translate(-50%, -100%) rotate(${petal.angle}deg)` }} animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity, delay: petal.delay }} />
                ))}
              </motion.div>
            </div>
          ))}
          <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>
            <div className="w-16 h-16 rounded-full" style={{ background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary}, transparent)`, boxShadow: `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}` }} />
          </motion.div>
        </motion.div>
      </div>
    );
  }, [colors, mandalaRings, mounted]);

  const chakraViz = useMemo(() => {
    if (!mounted) return null;
    return <div className="absolute inset-0 flex items-center justify-center"><div className="relative w-24 h-full"><motion.div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2" style={{ background: "linear-gradient(to top, #ff0000, #ff7f00, #ffff00, #00ff00, #00bfff, #0000ff, #8b00ff)" }} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />{chakraSpecs.map((chakra, chakraIndex) => <motion.div key={chakra.id} className="absolute left-1/2 -translate-x-1/2" style={{ top: `${chakra.y}%` }} animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, delay: chakraIndex * 0.2 }}><div className="w-8 h-8 rounded-full" style={{ background: `radial-gradient(circle, ${chakra.color}, transparent)`, boxShadow: `0 0 20px ${chakra.color}80` }} /></motion.div>)}<motion.div className="absolute left-1/2 w-4 h-4 rounded-full -translate-x-1/2" style={{ background: "white", filter: "blur(4px)" }} animate={{ top: ["90%", "0%"], opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} /></div></div>;
  }, [chakraSpecs, mounted]);

  const elementViz = useMemo(() => {
    if (!mounted) return null;
    switch (element) {
      case "Earth":
        return <div className="absolute inset-0 overflow-hidden">{earthSpecs.map((fragment) => <motion.div key={fragment.id} className="absolute bg-emerald-500/30 rounded-lg" style={{ width: fragment.width, height: fragment.height, left: `${fragment.left}%`, bottom: `${fragment.bottom}%` }} animate={{ y: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: fragment.duration, repeat: Infinity }} />)}</div>;
      case "Water":
        return <div className="absolute inset-0 overflow-hidden">{waterSpecs.map((wave) => <motion.div key={wave.id} className="absolute w-full h-20 bg-gradient-to-b from-blue-500/20 to-transparent" style={{ top: `${wave.top}%` }} animate={{ x: [-50, 50, -50], scaleY: [1, 1.2, 1] }} transition={{ duration: wave.duration, repeat: Infinity, ease: "easeInOut" }} />)}</div>;
      case "Fire":
        return <div className="absolute inset-0 flex items-end justify-center overflow-hidden">{fireSpecs.map((flame) => <motion.div key={flame.id} className="absolute bg-orange-500 rounded-full blur-md" style={{ width: flame.width, height: flame.height, left: `${flame.left}%`, bottom: 0 }} animate={{ y: [0, -flame.rise], opacity: [0.8, 0], scaleX: [1, 0.5] }} transition={{ duration: flame.duration, repeat: Infinity, delay: flame.delay }} />)}</div>;
      case "Air":
        return <div className="absolute inset-0 overflow-hidden">{airSpecs.map((stream) => <motion.div key={stream.id} className="absolute w-20 h-0.5 bg-cyan-400/40" style={{ left: `${stream.left}%`, top: `${stream.top}%`, transform: `rotate(${stream.rotation}deg)` }} animate={{ x: [0, 200, 0], opacity: [0, 0.5, 0] }} transition={{ duration: stream.duration, repeat: Infinity, delay: stream.delay }} />)}</div>;
      default:
        return particlesViz;
    }
  }, [airSpecs, earthSpecs, element, fireSpecs, mounted, particlesViz, waterSpecs]);

  const visualizations = {
    particles: particlesViz,
    aurora: auroraViz,
    mandala: mandalaViz,
    chakra: chakraViz,
    element: elementViz,
  };

  return visualizations[type] || particlesViz;
};

const VisualizationControls = () => null;

const MeditationVisualizer = ({
  type = "particles",
  element = "Spirit",
  isActive = false,
  intensity = 0.5,
  className = "",
}) => {
  const visualizationState = useVisualizationState({ element, intensity });

  if (!isActive) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} data-testid="meditation-visualizer-canvas">
      <VisualizationCanvas type={type} element={element} state={visualizationState} />
      <VisualizationControls />
    </div>
  );
};

export default MeditationVisualizer;
