import { useEffect, useMemo, useState } from "react";

const createRandomId = (prefix) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(16).slice(2)}`;
};

const ELEMENT_COLORS = {
  Earth: { primary: "#22c55e", secondary: "#15803d", glow: "rgba(34, 197, 94, 0.3)" },
  Water: { primary: "#3b82f6", secondary: "#1d4ed8", glow: "rgba(59, 130, 246, 0.3)" },
  Fire: { primary: "#f97316", secondary: "#ea580c", glow: "rgba(249, 115, 22, 0.3)" },
  Air: { primary: "#06b6d4", secondary: "#0891b2", glow: "rgba(6, 182, 212, 0.3)" },
  Spirit: { primary: "#a855f7", secondary: "#7c3aed", glow: "rgba(168, 85, 247, 0.3)" },
};

export const useVisualizationState = ({ element, intensity }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const colors = ELEMENT_COLORS[element] || ELEMENT_COLORS.Spirit;
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
