import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sun, Moon, Sunrise, Sunset, Clock, Play, X,
  Sparkles, Wind, Flame, Droplets, Heart, Mountain
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import PracticeTimer from "../components/PracticeTimer";

const SunriseSunsetPractices = ({ user, api }) => {
  const navigate = useNavigate();
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [activeTab, setActiveTab] = useState("sunrise");
  const [isPracticing, setIsPracticing] = useState(false);

  const sunrisePractices = [
    {
      id: "sunrise-1",
      name: "Sun Salutation Awakening",
      description: "Greet the rising sun with a sacred sequence of movements that honor the return of light and awaken your body's vital energy.",
      duration_minutes: 20,
      element: "Fire",
      best_time: "Within 30 minutes of sunrise",
      benefits: ["Energy activation", "Spine awakening", "Gratitude cultivation", "Solar plexus charging"],
      steps: [
        "Face east where the sun rises (or visualize if indoors)",
        "Stand in Mountain Pose, hands at heart center",
        "Inhale, sweep arms overhead, gaze up - 'I welcome the new day'",
        "Exhale, fold forward - 'I release what no longer serves'",
        "Inhale, halfway lift - 'I see clearly'",
        "Step back to plank, lower with control",
        "Inhale, Cobra or Upward Dog - 'I open my heart to possibilities'",
        "Exhale, Downward Dog - 'I am grounded and ready'",
        "Step forward, fold, rise with arms overhead",
        "Hands to heart - 'Thank you for this day'",
        "Repeat 3-12 rounds, breathing with each movement"
      ],
      affirmation: "I rise with the sun, full of life and possibility. Today is a gift I receive with open arms.",
      prayer: "Great Sun, Father Sky, I honor your return. Fill me with your warmth, your courage, your radiant light. May I carry your fire in my heart throughout this day. Aho."
    },
    {
      id: "sunrise-2",
      name: "Dawn Breathwork Ritual",
      description: "A powerful breathing practice to charge your energy body with the potent prana available at dawn - the liminal time between worlds.",
      duration_minutes: 15,
      element: "Air",
      best_time: "During the golden hour of sunrise",
      benefits: ["Prana absorption", "Mental clarity", "Energetic cleansing", "Third eye activation"],
      steps: [
        "Sit facing east, spine tall, shoulders relaxed",
        "Close eyes and feel the quality of dawn light even through eyelids",
        "Begin with 3 deep cleansing breaths - in through nose, out through mouth",
        "Shift to Breath of Fire: rapid belly pumps, equal inhale/exhale through nose",
        "Continue for 1-3 minutes, building energy in solar plexus",
        "Stop and hold breath in - visualize golden light filling your body",
        "Exhale slowly and feel energy radiating outward",
        "Return to natural breath",
        "Practice alternate nostril breathing for 5 minutes to balance",
        "End with 3 'OM' chants, feeling vibration in third eye",
        "Sit in stillness, absorbing the morning light"
      ],
      affirmation: "I breathe in light, I breathe out limitation. I am awake, alive, and aligned.",
      caution: "If you feel dizzy during Breath of Fire, return to normal breathing. This practice is energizing - avoid before sleep."
    },
    {
      id: "sunrise-3",
      name: "Morning Earth Connection",
      description: "Ground your energy into the earth while receiving the sun's blessing - becoming a channel between sky and earth.",
      duration_minutes: 15,
      element: "Earth",
      best_time: "As the sun clears the horizon",
      benefits: ["Grounding", "Energy circulation", "Nature connection", "Chakra alignment"],
      steps: [
        "Go outside if possible, stand barefoot on earth",
        "Face the rising sun with soft gaze or closed eyes",
        "Feel roots growing from your feet deep into the earth",
        "Feel a column of light descending from the sun into your crown",
        "Let these two energies meet in your heart",
        "Breathe earth energy up through your feet to your heart",
        "Breathe sun energy down through your crown to your heart",
        "Feel your heart glowing with combined energies",
        "Extend this light outward, blessing your day ahead",
        "Speak: 'I am a bridge between heaven and earth'",
        "Thank both sun and earth, wiggle toes, return to normal awareness"
      ],
      affirmation: "I am rooted in earth, reaching toward sky. I am the sacred bridge between worlds.",
      prayer: "Mother Earth, I feel you beneath me, steady and true. Father Sun, I feel you above me, warm and bright. I stand between you, a child of both worlds. Guide my steps today. Aho."
    },
    {
      id: "sunrise-4",
      name: "Sacred Morning Pages",
      description: "A contemplative writing practice to clear the mind and receive morning guidance from your higher self.",
      duration_minutes: 20,
      element: "Spirit",
      best_time: "Immediately upon waking, before checking devices",
      benefits: ["Mental clarity", "Intuition development", "Emotional processing", "Creative unblocking"],
      steps: [
        "Keep journal and pen beside your bed",
        "Upon waking, before rising, sit up and take 3 deep breaths",
        "Light a candle if desired to mark sacred time",
        "Open journal and write continuously for 3 pages",
        "Do not censor, edit, or reread - just let words flow",
        "Write whatever comes: dreams, worries, gratitude, nonsense",
        "If stuck, write 'I don't know what to write' until more comes",
        "After 3 pages, pause and ask: 'What do I need to know today?'",
        "Write whatever answer arises without judgment",
        "Close journal with gratitude",
        "Do not reread for at least 8 weeks"
      ],
      affirmation: "I clear the channel between my conscious and unconscious mind. Wisdom flows through me.",
      note: "This practice is about process, not product. The writing itself is the medicine."
    }
  ];

  const sunsetPractices = [
    {
      id: "sunset-1",
      name: "Evening Gratitude Ceremony",
      description: "Honor the closing day with a sacred gratitude practice that helps shed the day's energy and prepares the soul for rest.",
      duration_minutes: 15,
      element: "Water",
      best_time: "As the sun touches the horizon",
      benefits: ["Emotional shedding", "Gratitude cultivation", "Peaceful transition", "Heart opening"],
      steps: [
        "Find a quiet space, facing west if possible",
        "Light a candle to honor the departing sun",
        "Take 5 slow breaths, letting the day's tension shed away",
        "Place hands on heart and review your day without judgment",
        "Name 3 things you're grateful for from today, speaking them aloud",
        "Name 1 challenge and find something to appreciate within it",
        "Forgive yourself for any perceived failures: 'I did my best'",
        "Forgive anyone who may have caused difficulty",
        "Visualize releasing the day into the setting sun",
        "Say: 'I shed this day with love. I am complete.'",
        "Blow out candle, symbolizing the sun's departure"
      ],
      affirmation: "I shed this day with gratitude. What needed to happen, happened. I am at peace.",
      prayer: "Setting Sun, I thank you for the light you gave this day. Take with you all that I no longer need. I shed it to the West, to the waters, to be transformed and never return. I welcome the healing dark."
    },
    {
      id: "sunset-2",
      name: "Twilight Body Scan",
      description: "A gentle somatic practice to shed accumulated tension and prepare the body for restorative sleep.",
      duration_minutes: 20,
      element: "Earth",
      best_time: "After sunset, before dinner",
      benefits: ["Tension shedding", "Body awareness", "Nervous system calming", "Sleep preparation"],
      steps: [
        "Lie down in a comfortable position, perhaps with blanket",
        "Close eyes and take 5 deep breaths",
        "Bring attention to your feet - notice any sensation",
        "Consciously relax your feet, letting them grow heavy",
        "Move attention to ankles, calves, knees - relaxing each",
        "Continue up through thighs, hips, pelvis",
        "Notice your lower back - breathe into any tension",
        "Relax belly, chest, shoulders",
        "Shed tension in arms, hands, fingers",
        "Soften neck, jaw, face, scalp",
        "Feel your whole body heavy and supported by earth",
        "Rest here for 5 minutes, simply being",
        "Wiggle fingers and toes, return slowly"
      ],
      affirmation: "My body served me well today. I thank it with rest as I shed what it no longer needs.",
      note: "This practice can be done in bed if you wish to transition directly to sleep."
    },
    {
      id: "sunset-3",
      name: "Moon Water Blessing",
      description: "As the sun sets and moon rises, create blessed water to carry lunar energy for drinking, ritual, or blessing.",
      duration_minutes: 25,
      element: "Water",
      best_time: "From sunset until moon is visible",
      benefits: ["Lunar connection", "Intuition enhancement", "Emotional healing", "Sacred tool creation"],
      steps: [
        "Fill a clear glass or bowl with fresh water",
        "Take it outside or place on windowsill facing west/moon",
        "Hold the container and breathe peace into the water",
        "Speak intentions into the water - it receives vibration",
        "Say: 'I bless this water with the light of sun and moon'",
        "Place a crystal beside it if desired (clear quartz, moonstone)",
        "Leave water to absorb the sunset and emerging starlight",
        "After dark, bring inside and cover",
        "Use this water for: drinking, anointing, watering plants, ritual",
        "Moon water is most potent if made on full moon",
        "Store in glass container away from direct sunlight"
      ],
      affirmation: "I honor the sacred union of sun and moon within this water, within myself.",
      ritual_use: "Add to bath, anoint third eye before meditation, offer to plants or earth, use in ceremony."
    },
    {
      id: "sunset-4",
      name: "Evening Star Meditation",
      description: "Connect with the first evening star (Venus) for a meditation on beauty, love, and the divine feminine.",
      duration_minutes: 15,
      element: "Spirit",
      best_time: "When first star becomes visible",
      benefits: ["Peace", "Beauty appreciation", "Divine feminine connection", "Inner stillness"],
      steps: [
        "Go outside or sit by window as sky darkens",
        "Watch for the first star to appear (often Venus)",
        "When you see it, take a deep breath and make a wish",
        "This is an ancient tradition honored across cultures",
        "Soften your gaze on the star, breathing slowly",
        "Imagine a beam of starlight entering your third eye",
        "Feel the star's ancient light connecting you to cosmos",
        "Remember: that light left its source years ago to reach you now",
        "You are connected to something vast and timeless",
        "Send gratitude back to the star",
        "Sit in wonder for as long as feels right",
        "Carry the starlight in your heart into the evening"
      ],
      affirmation: "I am made of stardust. The light of ancient stars lives within me.",
      lore: "The evening star has been honored as Ishtar, Aphrodite, Venus - the goddess of love and beauty. Connecting with her brings grace."
    },
    {
      id: "sunset-5",
      name: "Shedding Fire Ritual",
      description: "Use the transformative power of fire at sunset to burn away what you're ready to shed from your life - permanently, without return.",
      duration_minutes: 20,
      element: "Fire",
      best_time: "As sun disappears below horizon",
      benefits: ["Energetic shedding", "Transformation", "Letting go permanently", "Renewal"],
      steps: [
        "Gather: paper, pen, fireproof container, matches",
        "Sit quietly and ask: 'What am I ready to shed?'",
        "Write on paper what you're releasing - fears, habits, beliefs, grief",
        "Be specific: not just 'fear' but 'fear of being seen'",
        "Hold paper to heart, feel the weight of carrying this",
        "Say: 'I thank you for what you taught me. I shed you now - you will not return.'",
        "Safely light the paper and place in fireproof container",
        "Watch it burn completely - this is transformation, not destruction",
        "As smoke rises, know the energy is transmuting",
        "When ash is cool, scatter to wind or bury in earth",
        "Say: 'It is done. I am free. Space is created for the new.'"
      ],
      affirmation: "I shed what no longer serves - it will not return. Fire transforms my pain into light.",
      safety: "Always practice fire safety. Have water nearby. Never leave fire unattended."
    }
  ];

  const currentPractices = activeTab === "sunrise" ? sunrisePractices : sunsetPractices;

  const logPractice = async (practice) => {
    if (!user) return;
    try {
      await api.post("/practice-history", {
        practice_type: activeTab === "sunrise" ? "sunrise_practice" : "sunset_practice",
        practice_id: practice.id,
        duration_minutes: practice.duration_minutes,
        element: practice.element,
        notes: `Completed ${practice.name}`
      });
      toast.success("Practice logged!");
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  const elementColors = {
    Fire: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", icon: Flame },
    Water: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: Droplets },
    Earth: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: Mountain },
    Air: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", icon: Wind },
    Spirit: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", icon: Sparkles }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="sunrise-sunset-practices">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/menu")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Daily Rhythms</p>
              <h1 className="text-xl font-serif">Sunrise & <span className="italic text-primary">Sunset</span></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 rounded-2xl bg-gradient-to-br from-orange-500/10 via-purple-500/5 to-blue-500/10 border border-white/10"
        >
          <div className="flex justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Sunrise className="w-8 h-8 text-orange-400" />
            </div>
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Sunset className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h2 className="text-3xl font-serif mb-4">Sacred <span className="italic text-primary">Transitions</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-6">
            Dawn and dusk are liminal times - thresholds between worlds where the veil is thin 
            and transformation is possible. Honor these sacred transitions with intentional practice.
          </p>
        </motion.div>

        {/* Tab Selector */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setActiveTab("sunrise")}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all ${
              activeTab === "sunrise" 
                ? "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 text-orange-300" 
                : "bg-card/50 border border-white/5 text-muted-foreground hover:border-white/10"
            }`}
            data-testid="sunrise-tab"
          >
            <Sunrise className="w-6 h-6" />
            <div className="text-left">
              <p className="font-medium">Sunrise</p>
              <p className="text-xs opacity-70">Awaken & Energize</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("sunset")}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all ${
              activeTab === "sunset" 
                ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300" 
                : "bg-card/50 border border-white/5 text-muted-foreground hover:border-white/10"
            }`}
            data-testid="sunset-tab"
          >
            <Sunset className="w-6 h-6" />
            <div className="text-left">
              <p className="font-medium">Sunset</p>
              <p className="text-xs opacity-70">Shed & Restore</p>
            </div>
          </button>
        </div>

        {/* Time Guidance */}
        <div className={`p-4 rounded-xl text-center ${
          activeTab === "sunrise" 
            ? "bg-orange-500/10 border border-orange-500/20" 
            : "bg-purple-500/10 border border-purple-500/20"
        }`}>
          <p className={`text-sm ${activeTab === "sunrise" ? "text-orange-300" : "text-purple-300"}`}>
            {activeTab === "sunrise" 
              ? "Best practiced in the hour surrounding dawn, when prana is most potent"
              : "Best practiced as daylight fades, honoring the transition to night"
            }
          </p>
        </div>

        {/* Practice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentPractices.map((practice, index) => {
            const colors = elementColors[practice.element] || elementColors.Spirit;
            const ElementIcon = colors.icon;
            
            return (
              <motion.div
                key={practice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} 
                           hover:border-opacity-50 transition-all duration-500 cursor-pointer`}
                onClick={() => setSelectedPractice(practice)}
                data-testid={`practice-${practice.id}`}
              >
                <div className={`p-6 bg-gradient-to-br ${colors.bg} to-transparent`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                      <ElementIcon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-xs`}>
                      {practice.element}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-serif mb-2 group-hover:text-primary transition-colors">
                    {practice.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {practice.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {practice.duration_minutes} min
                    </span>
                    <span className="opacity-70">{practice.best_time}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Wisdom Section */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 text-center">
          <Heart className="w-10 h-10 mx-auto mb-4 text-primary/50" />
          <blockquote className="text-lg font-serif italic text-foreground/80 max-w-2xl mx-auto">
            {activeTab === "sunrise" 
              ? "Every sunrise is an invitation to rise again, to begin again, to remember who you are before the world told you who to be."
              : "Every sunset is permission to let go, to shed the day's weight permanently, to trust that what needs to continue will still be there tomorrow."
            }
          </blockquote>
        </div>
      </main>

      {/* Practice Detail Modal */}
      <AnimatePresence>
        {selectedPractice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSelectedPractice(null); setIsPracticing(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              data-testid="practice-modal"
            >
              {/* Close button */}
              <button
                onClick={() => { setSelectedPractice(null); setIsPracticing(false); }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 overflow-y-auto p-6">
                {!isPracticing ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className={`p-6 rounded-xl bg-gradient-to-br ${elementColors[selectedPractice.element]?.bg} to-transparent`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${elementColors[selectedPractice.element]?.bg} ${elementColors[selectedPractice.element]?.text}`}>
                          {selectedPractice.element}
                        </span>
                        <span className="text-xs text-muted-foreground">{selectedPractice.duration_minutes} minutes</span>
                      </div>
                      <h2 className="text-2xl font-serif mb-2">{selectedPractice.name}</h2>
                      <p className="text-muted-foreground">{selectedPractice.description}</p>
                    </div>

                    {/* Best Time */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Best Time</p>
                        <p className="text-xs text-muted-foreground">{selectedPractice.best_time}</p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h3 className="font-medium mb-3">Benefits</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPractice.benefits.map((benefit, i) => (
                          <span key={i} className={`px-3 py-1 rounded-full text-sm ${elementColors[selectedPractice.element]?.bg} ${elementColors[selectedPractice.element]?.text}`}>
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <h3 className="font-medium mb-3">Practice Steps</h3>
                      <ol className="space-y-3">
                        {selectedPractice.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Affirmation */}
                    <div className={`p-4 rounded-xl ${elementColors[selectedPractice.element]?.bg} border ${elementColors[selectedPractice.element]?.border}`}>
                      <h3 className="font-medium mb-2">Affirmation</h3>
                      <p className="text-sm italic text-foreground/90">"{selectedPractice.affirmation}"</p>
                    </div>

                    {/* Prayer if exists */}
                    {selectedPractice.prayer && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <h3 className="font-medium mb-2">Sacred Prayer</h3>
                        <p className="text-sm italic text-muted-foreground">{selectedPractice.prayer}</p>
                      </div>
                    )}

                    {/* Notes/Cautions */}
                    {(selectedPractice.note || selectedPractice.caution || selectedPractice.safety) && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <h3 className="font-medium mb-2 text-amber-400">Note</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedPractice.note || selectedPractice.caution || selectedPractice.safety}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Timer Mode */
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${elementColors[selectedPractice.element]?.bg} flex items-center justify-center`}>
                        {activeTab === "sunrise" ? <Sunrise className="w-8 h-8 text-orange-400" /> : <Sunset className="w-8 h-8 text-purple-400" />}
                      </div>
                      <h2 className="text-2xl font-serif">{selectedPractice.name}</h2>
                    </div>

                    <PracticeTimer
                      segments={selectedPractice.steps.map((step, i) => ({
                        name: `Step ${i + 1}`,
                        description: step,
                        duration_seconds: Math.floor((selectedPractice.duration_minutes * 60) / selectedPractice.steps.length),
                      }))}
                      totalDuration={selectedPractice.duration_minutes * 60}
                      backgroundAudio="singing_bowls"
                      autoStartAudio={true}
                      practiceType={activeTab}
                      element={selectedPractice.element}
                      onComplete={async () => {
                        await logPractice(selectedPractice);
                        toast.success(`${selectedPractice.name} complete!`);
                        setIsPracticing(false);
                        setSelectedPractice(null);
                      }}
                    />

                    {/* Affirmation reminder */}
                    <div className={`p-4 rounded-xl ${elementColors[selectedPractice.element]?.bg} text-center`}>
                      <p className="text-sm italic">"{selectedPractice.affirmation}"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-4 border-t border-white/10 bg-card rounded-b-2xl">
                {!isPracticing ? (
                  <Button 
                    onClick={() => setIsPracticing(true)}
                    className={`w-full py-4 ${
                      activeTab === "sunrise" 
                        ? "bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700" 
                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    }`}
                    data-testid="begin-practice-btn"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Begin Practice
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setIsPracticing(false)}
                    className="w-full py-4 border-white/10"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Exit Practice
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SunriseSunsetPractices;
