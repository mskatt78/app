/**
 * MeditationVisualizer - Calming visual effects for meditation practices
 * Includes floating particles, aurora effects, and mandala patterns
 */
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

const MeditationVisualizer = ({
  type = "particles", // particles, aurora, mandala, chakra, element
  element = "Spirit", // Earth, Water, Fire, Air, Spirit
  isActive = false,
  intensity = 0.5, // 0-1
  className = ""
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const elementColors = {
    Earth: { primary: "#22c55e", secondary: "#15803d", glow: "rgba(34, 197, 94, 0.3)" },
    Water: { primary: "#3b82f6", secondary: "#1d4ed8", glow: "rgba(59, 130, 246, 0.3)" },
    Fire: { primary: "#f97316", secondary: "#ea580c", glow: "rgba(249, 115, 22, 0.3)" },
    Air: { primary: "#06b6d4", secondary: "#0891b2", glow: "rgba(6, 182, 212, 0.3)" },
    Spirit: { primary: "#a855f7", secondary: "#7c3aed", glow: "rgba(168, 85, 247, 0.3)" }
  };

  const colors = elementColors[element] || elementColors.Spirit;
  const particleCount = Math.floor(20 * intensity);

  // Floating particles visualization
  const ParticlesViz = useMemo(() => {
    if (!mounted) return null;
    
    return (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(particleCount)].map((_, i) => {
          const size = Math.random() * 8 + 4;
          const startX = Math.random() * 100;
          const duration = Math.random() * 10 + 10;
          const delay = Math.random() * 5;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle, ${colors.primary}, transparent)`,
                left: `${startX}%`,
                bottom: "-20px",
                boxShadow: `0 0 ${size * 2}px ${colors.glow}`
              }}
              animate={{
                y: [0, -500 - Math.random() * 300],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, 0.8, 0.8, 0],
                scale: [0.5, 1, 1, 0.3]
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeOut"
              }}
            />
          );
        })}
      </div>
    );
  }, [mounted, particleCount, colors]);

  // Aurora/Northern Lights visualization
  const AuroraViz = useMemo(() => {
    if (!mounted) return null;
    
    return (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-48 opacity-30"
            style={{
              background: `linear-gradient(180deg, transparent, ${colors.primary}40, ${colors.secondary}40, transparent)`,
              filter: "blur(40px)",
              top: `${20 + i * 15}%`
            }}
            animate={{
              x: [-100, 100, -100],
              scaleY: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
        
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    );
  }, [mounted, colors]);

  // Mandala visualization
  const MandalaViz = useMemo(() => {
    if (!mounted) return null;
    
    const rings = 5;
    const petalsPerRing = [8, 12, 16, 20, 24];
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          style={{ width: 300, height: 300 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(rings)].map((_, ringIndex) => (
            <div key={ringIndex} className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="relative"
                style={{
                  width: 60 + ringIndex * 50,
                  height: 60 + ringIndex * 50
                }}
                animate={{ rotate: ringIndex % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 30 + ringIndex * 10, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(petalsPerRing[ringIndex])].map((_, petalIndex) => {
                  const angle = (petalIndex * 360) / petalsPerRing[ringIndex];
                  return (
                    <motion.div
                      key={petalIndex}
                      className="absolute w-3 h-8 rounded-full"
                      style={{
                        background: `linear-gradient(to bottom, ${colors.primary}, transparent)`,
                        left: "50%",
                        top: "50%",
                        transformOrigin: "center bottom",
                        transform: `translate(-50%, -100%) rotate(${angle}deg)`
                      }}
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                        scale: [0.8, 1, 0.8]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: petalIndex * 0.1
                      }}
                    />
                  );
                })}
              </motion.div>
            </div>
          ))}
          
          {/* Center glow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div
              className="w-16 h-16 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary}, transparent)`,
                boxShadow: `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}`
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }, [mounted, colors]);

  // Chakra visualization
  const ChakraViz = useMemo(() => {
    if (!mounted) return null;
    
    const chakras = [
      { color: "#ff0000", name: "Root", y: 85 },
      { color: "#ff7f00", name: "Sacral", y: 72 },
      { color: "#ffff00", name: "Solar", y: 58 },
      { color: "#00ff00", name: "Heart", y: 44 },
      { color: "#00bfff", name: "Throat", y: 30 },
      { color: "#0000ff", name: "Third Eye", y: 18 },
      { color: "#8b00ff", name: "Crown", y: 5 }
    ];
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-full">
          {/* Energy channel */}
          <motion.div
            className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2"
            style={{ background: "linear-gradient(to top, #ff0000, #ff7f00, #ffff00, #00ff00, #00bfff, #0000ff, #8b00ff)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Chakra points */}
          {chakras.map((chakra, i) => (
            <motion.div
              key={chakra.name}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: `${chakra.y}%` }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            >
              <div
                className="w-8 h-8 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${chakra.color}, transparent)`,
                  boxShadow: `0 0 20px ${chakra.color}80`
                }}
              />
            </motion.div>
          ))}
          
          {/* Rising energy */}
          <motion.div
            className="absolute left-1/2 w-4 h-4 rounded-full -translate-x-1/2"
            style={{ background: "white", filter: "blur(4px)" }}
            animate={{
              top: ["90%", "0%"],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    );
  }, [mounted]);

  // Element-specific visualization
  const ElementViz = useMemo(() => {
    if (!mounted) return null;
    
    switch (element) {
      case "Earth":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-emerald-500/30 rounded-lg"
                style={{
                  width: 40 + Math.random() * 60,
                  height: 40 + Math.random() * 60,
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 30}%`
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        );
      
      case "Water":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-20 bg-gradient-to-b from-blue-500/20 to-transparent"
                style={{ top: `${20 + i * 15}%` }}
                animate={{
                  x: [-50, 50, -50],
                  scaleY: [1, 1.2, 1]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );
      
      case "Fire":
        return (
          <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-orange-500 rounded-full blur-md"
                style={{
                  width: 20 + Math.random() * 40,
                  height: 40 + Math.random() * 80,
                  left: `${30 + Math.random() * 40}%`,
                  bottom: 0
                }}
                animate={{
                  y: [0, -100 - Math.random() * 100],
                  opacity: [0.8, 0],
                  scaleX: [1, 0.5]
                }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random()
                }}
              />
            ))}
          </div>
        );
      
      case "Air":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-20 h-0.5 bg-cyan-400/40"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 30 - 15}deg)`
                }}
                animate={{
                  x: [0, 200, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        );
      
      default:
        return ParticlesViz;
    }
  }, [mounted, element, ParticlesViz]);

  if (!isActive) return null;

  const visualizations = {
    particles: ParticlesViz,
    aurora: AuroraViz,
    mandala: MandalaViz,
    chakra: ChakraViz,
    element: ElementViz
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {visualizations[type] || ParticlesViz}
    </div>
  );
};

export default MeditationVisualizer;
