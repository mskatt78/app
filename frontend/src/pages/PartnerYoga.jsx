import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Heart, Star, ChevronDown, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";

const partnerPoses = [
  {
    id: "p1",
    name: "Partner Seated Forward Fold",
    sanskrit: "Sahana Paschimottanasana",
    element: "Water",
    difficulty: "Beginner",
    duration: 5,
    image_url: "https://images.pexels.com/photos/4127317/pexels-photo-4127317.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Sit back-to-back or facing each other and gently assist your partner into a deep forward fold. This builds trust and deepens the stretch for both.",
    instructions: [
      "Sit facing each other with legs extended straight, feet touching or overlapping",
      "Hold each other's wrists or hands",
      "Partner A leans back while Partner B folds forward, using gentle tension to deepen the stretch",
      "Hold for 5-10 breaths, then switch — Partner B leans back while A folds forward",
      "Maintain steady eye contact or close your eyes and breathe together"
    ],
    benefits: ["Deep hamstring and spine stretch", "Builds trust and communication", "Synchronizes breath between partners", "Releases tension in lower back"],
    modifications: ["Use a strap between you if you can't reach each other's hands", "Bend knees slightly if hamstrings are tight"],
    color: { text: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20" }
  },
  {
    id: "p2",
    name: "Double Boat Pose",
    sanskrit: "Sahana Navasana",
    element: "Fire",
    difficulty: "Intermediate",
    duration: 3,
    image_url: "https://images.pexels.com/photos/7593000/pexels-photo-7593000.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Sit facing your partner, hold hands, and lift both sets of legs to create a diamond shape between you. Builds core strength and requires synchronized effort.",
    instructions: [
      "Sit facing your partner, knees bent, toes touching",
      "Hold each other's wrists or hands firmly",
      "Lean back slightly and lift your feet, pressing soles against your partner's",
      "Slowly straighten legs as much as comfortable, creating a diamond or V shape",
      "Find balance together by equalizing weight through your hands",
      "Hold for 5-10 breaths"
    ],
    benefits: ["Strengthens core, hip flexors, and legs", "Requires and builds synchronized effort", "Fun and playful energy exchange", "Strengthens grip and arm connection"],
    modifications: ["Keep knees bent for a gentler version", "Use a strap if you can't hold each other's hands"],
    color: { text: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/20" }
  },
  {
    id: "p3",
    name: "Partner Tree Pose",
    sanskrit: "Sahana Vrksasana",
    element: "Earth",
    difficulty: "Beginner",
    duration: 3,
    image_url: "https://images.pexels.com/photos/5837039/pexels-photo-5837039.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Stand side by side and balance together, with each person bringing the inner foot up and wrapping inner arms. Creates stability through connection.",
    instructions: [
      "Stand side by side with your inside shoulders touching",
      "Each person shifts weight to their outside foot",
      "Bring inside feet up to rest on inner ankle, calf, or inner thigh",
      "Wrap inside arms around each other's waists for support",
      "Extend outside arms upward or meet overhead to join hands",
      "Find your collective balance, hold for 5-10 breaths",
      "Switch sides"
    ],
    benefits: ["Improves balance through mutual support", "Builds teamwork and nonverbal communication", "Grounds and connects both practitioners", "Gentle hip opener"],
    modifications: ["Place inside foot on ankle only for an easier version", "Face each other and hold both hands instead"],
    color: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  },
  {
    id: "p4",
    name: "Flying Bow (AcroYoga)",
    sanskrit: "Akasa Dhanurasana",
    element: "Air",
    difficulty: "Advanced",
    duration: 5,
    image_url: "https://images.pexels.com/photos/4971855/pexels-photo-4971855.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "One partner (the base) lies on their back with feet raised; the flyer balances on the base's feet while arching into a backbend. Requires trust, core strength, and communication.",
    instructions: [
      "BASE: Lie on your back, arms extended alongside body, knees bent. Press feet toward the ceiling, slightly wider than hip-width",
      "SPOTTER: Stand to the side to catch the flyer if needed",
      "FLYER: Stand at base's shoulders, hands on their knees or feet",
      "BASE: Raise feet, placing them on flyer's hip bones/lower abdomen",
      "FLYER: Shift weight onto base's feet, finding balance",
      "FLYER: Slowly extend arms outward and lean into a bow/backbend",
      "Hold for 5 breaths, communicating throughout"
    ],
    benefits: ["Strengthens core and arms (base)", "Opens chest and hip flexors (flyer)", "Builds deep trust between partners", "Develops body awareness and communication"],
    modifications: ["Practice with spotter always present", "Flyer can keep hands on base's knees until comfortable", "Only for those with prior yoga/acro experience"],
    color: { text: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/20" }
  },
  {
    id: "p5",
    name: "Partner Camel",
    sanskrit: "Sahana Ustrasana",
    element: "Air",
    difficulty: "Beginner",
    duration: 3,
    image_url: "https://images.pexels.com/photos/7593022/pexels-photo-7593022.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Kneel back to back with your partner. As both partners arch backward, they support each other's upper back and create a beautiful heart-opening backbend.",
    instructions: [
      "Kneel back-to-back, hips pressed together, knees hip-width apart",
      "Both partners place hands on lower back or reach for heels",
      "Simultaneously begin to arch backward, letting your upper back rest against your partner's",
      "Allow your combined weight to support each other as you open your hearts upward",
      "Breathe together — let the shared support deepen your heart opening",
      "Hold for 5-10 breaths",
      "Come up slowly together"
    ],
    benefits: ["Deep heart opening for both partners", "Upper back support and stretch", "Builds synchronization and breath connection", "Opens throat and chest"],
    modifications: ["Keep hands on lower back rather than reaching for heels", "Place a folded blanket between you for cushioning"],
    color: { text: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/20" }
  },
  {
    id: "p6",
    name: "Partner Seated Twist",
    sanskrit: "Sahana Ardha Matsyendrasana",
    element: "Fire",
    difficulty: "Beginner",
    duration: 5,
    image_url: "https://images.unsplash.com/photo-1758599880222-550a42cb42bc?w=800&q=80",
    description: "Sit back-to-back in easy pose and twist in opposite directions, placing hands on each other's knees for a gentle assisted spinal twist.",
    instructions: [
      "Sit back-to-back in easy pose (crossed legs)",
      "Both partners sit tall and take a deep breath in to lengthen the spine",
      "Exhale and twist right, placing right hand on partner's left knee",
      "Left hand rests on your own right knee",
      "Your partner mirrors this twist in the opposite direction",
      "Hold for 5-10 breaths, then unwind and twist left",
      "Communication is key — ensure the pressure is comfortable for both"
    ],
    benefits: ["Assisted spinal rotation and detoxification", "Stretches shoulders and neck", "Partner's weight deepens the twist", "Creates playful, connected energy"],
    modifications: ["Sit on a cushion if hips are tight", "Legs can be extended straight if crossed legs is uncomfortable"],
    color: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20" }
  },
  {
    id: "p7",
    name: "Supported Fish",
    sanskrit: "Sahana Matsyasana",
    element: "Water",
    difficulty: "Beginner",
    duration: 5,
    image_url: "https://images.pexels.com/photos/7078131/pexels-photo-7078131.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "One partner lies across the other's legs/lap in a gentle supported backbend. A deeply receptive, trusting pose that opens the heart and allows complete surrender.",
    instructions: [
      "Partner A sits in a comfortable cross-legged position",
      "Partner B lies back over Partner A's lap, head resting near their knees",
      "Partner A can gently support B's head and upper back with their hands",
      "Partner B allows their chest to open, arms resting at sides or overhead",
      "Both partners breathe deeply — A offering support, B receiving and surrendering",
      "Hold for 3-5 minutes, then gently guide Partner B back up",
      "Switch roles and repeat"
    ],
    benefits: ["Deep heart opening in a supported, safe container", "Profound practice of giving and receiving", "Releases tension in chest and shoulders", "Deeply nurturing and therapeutic"],
    modifications: ["Place a bolster across A's lap for more height and comfort", "B can bend knees to protect lower back"],
    color: { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/20" }
  },
  {
    id: "p8",
    name: "Standing Forward Fold Assist",
    sanskrit: "Sahana Uttanasana",
    element: "Earth",
    difficulty: "Beginner",
    duration: 5,
    image_url: "https://images.pexels.com/photos/4127304/pexels-photo-4127304.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "One partner folds forward while the other provides gentle pressure on their sacrum and upper back to deepen the fold. Excellent for releasing tight hamstrings and lower back.",
    instructions: [
      "Partner A folds into Standing Forward Fold (Uttanasana)",
      "Partner B stands behind A and places one hand on A's sacrum (lower back, just above the tailbone)",
      "Partner B places the other hand gently between A's shoulder blades",
      "Apply gentle downward pressure — always ask 'how does this feel?'",
      "Hold for 10 breaths, slowly releasing pressure before Partner A rises",
      "Switch roles and repeat",
      "Communication is essential — check in regularly about pressure levels"
    ],
    benefits: ["Deepens hamstring and spine stretch", "Creates safety through touch", "Teaches giving and receiving support", "Releases lower back tension"],
    modifications: ["A can bend knees for a less intense stretch", "B can use a light towel between hands and partner's back"],
    color: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  }
];

const PartnerYoga = ({ user, api }) => {
  const navigate = useNavigate();
  const [selectedPose, setSelectedPose] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [showGuided, setShowGuided] = useState(false);

  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"];

  const filtered = difficultyFilter === "all"
    ? partnerPoses
    : partnerPoses.filter(p => p.difficulty === difficultyFilter);

  const difficultyColors = {
    Beginner: "bg-green-500/20 text-green-400 border-green-500/30",
    Intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const getWhyThisHeals = (pose) => {
    const elementInsights = {
      Water: "shared breath and co-regulation of the nervous system",
      Fire: "mutual activation of courage, focus, and embodied confidence",
      Earth: "relational safety, grounded balance, and trust through contact",
      Air: "heart opening and emotional spaciousness through synchronized movement",
    };

    const lens = elementInsights[pose.element] || "coherent movement and relational presence";
    return `This pose heals through ${lens}. Partner awareness helps each person soften protective patterns, communicate boundaries, and stay present in the body instead of overthinking.`;
  };

  const getIntegrationPrompt = (pose) => {
    if (pose.element === "Fire") return "After practice, each partner names one courageous action they will take this week.";
    if (pose.element === "Water") return "After practice, drink water together and share one feeling that moved during the pose.";
    if (pose.element === "Earth") return "After practice, hold eye contact for five breaths and state one grounded intention for your connection.";
    return "After practice, take a short silent walk together and notice what has softened in your body and heart.";
  };

  const buildGuidedPosePractice = (pose) => ({
    id: `partner-guided-${pose.id}`,
    name: pose.name,
    description: pose.description,
    element: pose.element,
    duration_minutes: pose.duration,
    steps: pose.instructions,
    affirmation: `We move as partners with presence, trust, and care in ${pose.name}.`,
  });

  return (
    <div className="min-h-screen bg-background" data-testid="partner-yoga">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Connected Practice</p>
              <h1 className="text-xl font-serif">Partner <span className="italic text-primary">Yoga</span></h1>
            </div>
          </div>
          <Users className="w-6 h-6 text-primary/40" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 pt-4"
        >
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-3">Partner <span className="italic text-primary">Yoga</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Deepen your practice and your connection. These poses use the weight, 
            support, and trust of a partner to explore new dimensions of each asana.
            Always communicate openly and listen to each other's bodies.
          </p>
        </motion.div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              data-testid={`filter-${d}`}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                difficultyFilter === d
                  ? d === "all"
                    ? "bg-primary/20 text-primary border-primary/30"
                    : difficultyColors[d]
                  : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
              }`}
            >
              {d === "all" ? "All Levels" : d}
            </button>
          ))}
        </div>

        {/* Pose Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((pose, index) => (
            <motion.div
              key={pose.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedPose(pose)}
              data-testid={`pose-card-${pose.id}`}
              className={`group cursor-pointer rounded-2xl border backdrop-blur-xl overflow-hidden
                         ${pose.color.border}
                         hover:scale-[1.02] transition-all duration-300`}
            >
              {/* Pose Image */}
              {pose.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pose.image_url}
                    alt={pose.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs border backdrop-blur-sm ${difficultyColors[pose.difficulty]}`}>
                    {pose.difficulty}
                  </span>
                </div>
              )}

              <div className={`p-5 ${pose.color.bg}`}>
                <h3 className="text-lg font-serif mb-1">{pose.name}</h3>
                <p className={`text-xs ${pose.color.text} mb-3 italic`}>{pose.sanskrit}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{pose.description}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{pose.duration} min</span>
                  </div>
                  <span className={pose.color.text}>{pose.element}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Safety Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20"
        >
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400 mb-1">Partner Practice Guidelines</p>
              <p className="text-sm text-muted-foreground">
                Always warm up individually before partner work. Communicate openly and frequently — 
                ask and check in on pressure, comfort, and depth. The goal is not to push your partner 
                deeper, but to create a safe container for mutual exploration. Respect each other's 
                boundaries and limitations. If either partner feels pain, come out of the pose immediately.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Pose Detail Modal */}
      <AnimatePresence>
        {selectedPose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedPose(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl max-w-2xl w-full my-8 overflow-hidden"
              data-testid="pose-detail-modal"
            >
              {/* Modal Image */}
              {selectedPose.image_url && (
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={selectedPose.image_url}
                    alt={selectedPose.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <button
                    onClick={() => setSelectedPose(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              )}

              <div className={`p-6 ${!selectedPose.image_url ? 'rounded-t-2xl' : ''} ${selectedPose.color.bg} border-b ${selectedPose.color.border}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-serif">{selectedPose.name}</h2>
                    <p className={`text-sm ${selectedPose.color.text} italic`}>{selectedPose.sanskrit}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${difficultyColors[selectedPose.difficulty]}`}>
                        {selectedPose.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />{selectedPose.duration} min
                      </span>
                    </div>
                  </div>
                  {!selectedPose.image_url && (
                    <button onClick={() => setSelectedPose(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{selectedPose.description}</p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-serif mb-3 flex items-center gap-2">
                    <Star className={`w-4 h-4 ${selectedPose.color.text}`} />
                    Instructions
                  </h3>
                  <ol className="space-y-2">
                    {selectedPose.instructions.map((step, i) => (
                      <li key={`${selectedPose.id || selectedPose.name}-instruction-${String(step).slice(0, 24)}-${i}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className={`w-6 h-6 rounded-full ${selectedPose.color.bg} border ${selectedPose.color.border} flex items-center justify-center text-xs ${selectedPose.color.text} flex-shrink-0`}>
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="font-serif mb-3">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPose.benefits.map((b, i) => (
                      <span key={`${selectedPose.id || selectedPose.name}-benefit-${String(b).slice(0, 24)}-${i}`} className={`px-3 py-1 rounded-full text-xs ${selectedPose.color.bg} ${selectedPose.color.text} border ${selectedPose.color.border}`}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-serif text-sm mb-2 text-muted-foreground">Modifications</h3>
                  <ul className="space-y-1">
                    {selectedPose.modifications.map((m, i) => (
                      <li key={`${selectedPose.id || selectedPose.name}-mod-${String(m).slice(0, 24)}-${i}`} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 md:grid-cols-2" data-testid="partner-yoga-depth-cards">
                  <article className="p-4 rounded-xl bg-primary/10 border border-primary/25" data-testid="partner-yoga-why-this-heals">
                    <h3 className="font-serif text-sm mb-2 text-primary">Why this heals</h3>
                    <p className="text-sm text-muted-foreground">{getWhyThisHeals(selectedPose)}</p>
                  </article>
                  <article className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="partner-yoga-integration-card">
                    <h3 className="font-serif text-sm mb-2 text-foreground">Integration</h3>
                    <p className="text-sm text-muted-foreground">{getIntegrationPrompt(selectedPose)}</p>
                  </article>
                </div>

                <Button
                  type="button"
                  onClick={() => setShowGuided(true)}
                  className="w-full"
                  data-testid="partner-yoga-begin-guided-practice-btn"
                >
                  Begin Guided Partner Practice
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showGuided && selectedPose && (
        <GuidedPracticeOverlay
          practice={buildGuidedPosePractice(selectedPose)}
          onExit={() => setShowGuided(false)}
        />
      )}
    </div>
  );
};

export default PartnerYoga;
