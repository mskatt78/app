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
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { appLogger } from "../utils/logger";
import { resolveDurationMinutes } from "../utils/durationUtils";

const SunriseSunsetPractices = ({ user, api }) => {
  const navigate = useNavigate();
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [activeTab, setActiveTab] = useState("sunrise");
  const [isPracticing, setIsPracticing] = useState(false);
  const [guidedPractice, setGuidedPractice] = useState(null);

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
    },
    {
      id: "sunrise-5",
      name: "Solar Meridian Tapping",
      description: "Activate morning energy channels with gentle tapping and breath synchronization to sharpen focus for the day.",
      duration_minutes: 12,
      element: "Fire",
      best_time: "5-20 minutes after sunrise",
      benefits: ["Meridian activation", "Mental focus", "Warmth circulation", "Motivation"],
      steps: [
        "Stand facing east and rub palms until warm.",
        "Tap sternum, collarbone, and outer arm lines for 60 seconds each.",
        "Inhale for 4, hold 2, exhale for 6 while tapping solar plexus.",
        "Finish with both palms over navel and one clear intention sentence.",
      ],
      affirmation: "I welcome focused fire into this day."
    },
    {
      id: "sunrise-6",
      name: "Sunrise Voice Alignment",
      description: "Use tone, humming, and breath to align throat-heart resonance before communication and service.",
      duration_minutes: 10,
      element: "Air",
      best_time: "During early sunrise light",
      benefits: ["Voice clarity", "Emotional regulation", "Heart-throat coherence"],
      steps: [
        "Sit upright and hum softly for 5 long exhales.",
        "Vocalize three vowel tones (A-E-O), each over 3 breaths.",
        "Name one truth you will speak clearly today.",
      ],
      affirmation: "My voice carries calm truth and aligned intention."
    },
    {
      id: "sunrise-7",
      name: "Golden Threshold Covenant",
      description: "A dawn covenant ritual to align body, boundaries, and service before entering the day.",
      duration_minutes: 14,
      element: "Spirit",
      best_time: "At first full sunlight",
      benefits: ["Boundary clarity", "Purpose alignment", "Embodied commitment"],
      steps: [
        "Stand facing sunrise with one hand on heart and one on lower belly.",
        "Breathe 4-in / 6-out for 12 cycles, softening jaw and shoulders.",
        "Speak one boundary, one blessing, and one service vow for this day.",
        "Seal by touching earth and naming one concrete action within 24 hours.",
      ],
      affirmation: "I cross this threshold in truth, coherence, and devoted action."
    },
    {
      id: "sunrise-8",
      name: "Solar Spine Ignition",
      description: "A focused sunrise spinal sequence that awakens life-force without overwhelming your system.",
      duration_minutes: 11,
      element: "Fire",
      best_time: "Within 20 minutes of sunrise",
      benefits: ["Spinal activation", "Motivation", "Embodied focus"],
      steps: [
        "Stand tall, inhale with arms overhead, exhale while softening knees.",
        "Trace slow spinal waves for 2 minutes while breathing 4-in / 6-out.",
        "Name one courageous action and bow toward the morning light.",
      ],
      affirmation: "My spine carries clear purpose and grounded courage."
    },
    {
      id: "sunrise-9",
      name: "Morning Lionheart Invocation",
      description: "A dawn voice-and-breath protocol for confidence and compassionate leadership.",
      duration_minutes: 10,
      element: "Air",
      best_time: "At first full daylight",
      benefits: ["Voice confidence", "Emotional steadiness", "Leadership alignment"],
      steps: [
        "Place one hand on throat and one on heart.",
        "Hum for five long exhales, then speak your daily truth sentence.",
        "Close with one integrity vow for the day.",
      ],
      affirmation: "I speak with courage, clarity, and kindness."
    },
    {
      id: "sunrise-10",
      name: "Dawn Water Crowning",
      description: "Bless and drink water at sunrise to crown your day with coherence and intention.",
      duration_minutes: 9,
      element: "Water",
      best_time: "As sunlight reaches your space",
      benefits: ["Hydration ritual", "Mental clarity", "Nervous system calm"],
      steps: [
        "Hold a glass of water at heart level and breathe for one minute.",
        "Speak one blessing and one boundary into the water.",
        "Drink in three slow rounds while tracking body sensation.",
      ],
      affirmation: "I begin this day clear, hydrated, and aligned."
    },
    {
      id: "sunrise-11",
      name: "Sun Gate Boundary Prayer",
      description: "A practical sunrise prayer to protect your energy and shape your day with integrity.",
      duration_minutes: 8,
      element: "Spirit",
      best_time: "Before entering work or digital spaces",
      benefits: ["Boundary clarity", "Stress prevention", "Intentional action"],
      steps: [
        "Stand at a doorway and place one hand on your sternum.",
        "Speak one sentence of what is welcome and what is not.",
        "Take three long exhales and cross the threshold with awareness.",
      ],
      affirmation: "I choose what enters my field and what leaves it."
    },
    {
      id: "sunrise-12",
      name: "Aurora Focus Grid",
      description: "A sunrise concentration ritual that channels attention into one high-impact priority.",
      duration_minutes: 12,
      element: "Air",
      best_time: "After hydration, before notifications",
      benefits: ["Focus", "Task clarity", "Reduced overwhelm"],
      steps: [
        "Write your single priority for the morning.",
        "Breathe for 12 cycles while visualizing completion.",
        "Start immediately with a 20-minute uninterrupted focus sprint.",
      ],
      affirmation: "My attention is sacred and purposefully directed."
    },
    {
      id: "sunrise-13",
      name: "Phoenix Dawn Recommitment",
      description: "A renewal ritual for mornings after burnout, grief, or emotional heaviness.",
      duration_minutes: 14,
      element: "Fire",
      best_time: "Any dawn when you need a reset",
      benefits: ["Renewal", "Resilience", "Self-forgiveness"],
      steps: [
        "Name what ended and thank it for its lesson.",
        "Breathe with hands on belly and heart for 2 minutes.",
        "State one simple recommitment and take the first small action.",
      ],
      affirmation: "I rise renewed with humility and strength."
    },
    {
      id: "sunrise-14",
      name: "Stellar Compass Alignment",
      description: "A sky-facing sunrise ritual that aligns daily choices with long-term soul direction.",
      duration_minutes: 13,
      element: "Spirit",
      best_time: "Clear-sky morning or near a window",
      benefits: ["Directionality", "Purpose coherence", "Emotional steadiness"],
      steps: [
        "Gaze upward softly and ask: 'What is mine to do today?'",
        "Receive one clear phrase and write it down.",
        "Anchor it by naming one concrete action and start within 10 minutes.",
      ],
      affirmation: "My daily steps honor my greater path."
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
    },
    {
      id: "sunset-6",
      name: "Parasympathetic Lantern Breath",
      description: "A nervous-system downshift ritual to transition from performance mode into restoration and sleep readiness.",
      duration_minutes: 12,
      element: "Air",
      best_time: "30-60 minutes before sleep",
      benefits: ["Stress release", "Heart-rate calming", "Sleep readiness"],
      steps: [
        "Dim lights and sit with one low candle or warm lamp.",
        "Breathe in for 4, out for 6 for 12 rounds.",
        "On each exhale, whisper: 'I release this day'.",
        "Close by placing one hand on heart and one on belly for 1 minute.",
      ],
      affirmation: "My body is safe to rest; I return to stillness."
    },
    {
      id: "sunset-7",
      name: "Twilight Integration Journal",
      description: "A structured sunset reflection to turn the day into wisdom and prevent emotional carryover into sleep.",
      duration_minutes: 10,
      element: "Spirit",
      best_time: "Immediately after sunset practice",
      benefits: ["Emotional integration", "Behavioral learning", "Intentional closure"],
      steps: [
        "Write: What did I complete today?",
        "Write: What did I carry that was not mine?",
        "Write: What one quality do I choose for tomorrow morning?",
      ],
      affirmation: "I close this day with clarity, compassion, and completion."
    },
    {
      id: "sunset-8",
      name: "Nightfall Cord-Cutting Integration",
      description: "A gentle sunset release for emotional residue, over-functioning, and unspoken tension.",
      duration_minutes: 16,
      element: "Water",
      best_time: "Just after sunset",
      benefits: ["Emotional release", "Nervous system downshift", "Sleep readiness"],
      steps: [
        "Sit with a bowl of water and name what you are releasing from the day.",
        "Trace a slow circle over heart and throat while exhaling for 8 counts.",
        "Dip fingertips into water and touch forehead, heart, and navel to reset your field.",
        "Close with gratitude and one line of self-forgiveness before rest.",
      ],
      affirmation: "I release with grace and rest in sacred peace."
    },
    {
      id: "sunset-9",
      name: "Moon Basin Emotional Reset",
      description: "A lunar water-basin ritual for decompressing emotional overload before sleep.",
      duration_minutes: 14,
      element: "Water",
      best_time: "After sunset and before devices",
      benefits: ["Emotional reset", "Nervous system softening", "Sleep readiness"],
      steps: [
        "Fill a small basin with cool water and place it in front of you.",
        "Dip fingertips and trace brow, throat, and heart.",
        "Name one emotion you are releasing and one need you are honoring tonight.",
      ],
      affirmation: "My emotions are honored, and I return to calm."
    },
    {
      id: "sunset-10",
      name: "Evening Boundary Closure",
      description: "Close the day with a boundary ritual so unresolved tension does not follow you into sleep.",
      duration_minutes: 9,
      element: "Earth",
      best_time: "Immediately after work transitions",
      benefits: ["Boundary repair", "Mental closure", "Rest quality"],
      steps: [
        "Stand at your doorway and exhale fully three times.",
        "Say: 'Work is complete. My body returns home.'",
        "Wash hands in warm water and release jaw and shoulders.",
      ],
      affirmation: "I close this chapter and return to myself."
    },
    {
      id: "sunset-11",
      name: "Starlight Nervous System Downshift",
      description: "A gentle body-led protocol for transitioning from stimulation to restoration.",
      duration_minutes: 12,
      element: "Air",
      best_time: "Before dinner or evening conversation",
      benefits: ["Parasympathetic activation", "Reduced reactivity", "Evening clarity"],
      steps: [
        "Inhale 4 counts, exhale 8 counts for ten rounds.",
        "Lengthen your exhale with a soft hum for five breaths.",
        "Place hands on ribs and thank your body for carrying the day.",
      ],
      affirmation: "I downshift with grace and return to steadiness."
    },
    {
      id: "sunset-12",
      name: "Dusk Gratitude to Grief Bridge",
      description: "A healing sunset bridge practice that allows gratitude and grief to coexist.",
      duration_minutes: 16,
      element: "Water",
      best_time: "When emotions feel mixed or heavy",
      benefits: ["Grief processing", "Heart opening", "Integration"],
      steps: [
        "Write one gratitude and one grief from today.",
        "Place both hands over heart and breathe with each line.",
        "Close by saying: 'Both can be true, and I can hold both.'",
      ],
      affirmation: "My heart is spacious enough for truth and tenderness."
    },
    {
      id: "sunset-13",
      name: "Twilight Spine Unwinding",
      description: "A brief spinal unwinding flow to release accumulated fascia tension before bed.",
      duration_minutes: 11,
      element: "Earth",
      best_time: "Post-dinner, pre-sleep",
      benefits: ["Fascia release", "Body comfort", "Sleep preparation"],
      steps: [
        "Move through slow cat-cow for 2 minutes.",
        "Add gentle side bends and seated twists with long exhale.",
        "Lie down and feel your spine settle for one minute.",
      ],
      affirmation: "I release the day from my spine and return to ease."
    },
    {
      id: "sunset-14",
      name: "Night Prayer of Completion",
      description: "A final completion prayer to end looping thoughts and enter sleep with trust.",
      duration_minutes: 8,
      element: "Spirit",
      best_time: "Lights low, right before bed",
      benefits: ["Mental closure", "Faithful surrender", "Restful sleep"],
      steps: [
        "Sit at bedside with one hand on heart and one on belly.",
        "Speak three lines: what I completed, what I release, what I trust.",
        "Take six long exhales and lie down without checking your phone.",
      ],
      affirmation: "This day is complete. I surrender into healing rest."
    },
    {
      id: "sunset-15",
      name: "Lunar Dream Gate Ritual",
      description: "Open your dream gate with intentional moon-phase listening and gentle subconscious priming.",
      duration_minutes: 13,
      element: "Water",
      best_time: "Last ritual before sleep",
      benefits: ["Dream clarity", "Subconscious integration", "Intuitive insight"],
      steps: [
        "Write one question you want dream guidance on.",
        "Touch moon water to forehead and heart.",
        "Repeat your question softly three times and sleep.",
      ],
      affirmation: "My dreams guide me with clarity, safety, and truth."
    }
  ];

  const enrichPracticeDepth = (practice, cycle) => {
    const defaults = cycle === "sunrise"
      ? {
          why_this_heals:
            "Sunrise practices heal by aligning circadian rhythm, breath chemistry, and intention-setting while the nervous system is naturally receptive to activation.",
          integration:
            "Anchor one sunrise insight into action before noon so the practice shapes your full day, not just the morning moment.",
        }
      : {
          why_this_heals:
            "Sunset practices heal by signaling safety to the body, completing stress cycles, and helping emotional residue leave before sleep.",
          integration:
            "Close your evening by naming one thing fully released and one quality you are carrying into tomorrow.",
        };

    return {
      ...practice,
      why_this_heals: practice.why_this_heals || defaults.why_this_heals,
      integration: practice.integration || defaults.integration,
    };
  };

  const currentPractices = (activeTab === "sunrise" ? sunrisePractices : sunsetPractices)
    .map((practice) => enrichPracticeDepth(practice, activeTab));

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
      appLogger.error("Failed to log practice:", error);
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
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={async () => {
          const completed = guidedPractice;
          setGuidedPractice(null);
          if (!completed) return;
          await logPractice(completed);
          toast.success(`${completed.name} complete!`);
        }}
      />

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
                          <span key={`${selectedPractice.id}-benefit-${String(benefit).slice(0, 24)}-${i}`} className={`px-3 py-1 rounded-full text-sm ${elementColors[selectedPractice.element]?.bg} ${elementColors[selectedPractice.element]?.text}`}>
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2" data-testid="sunrise-sunset-depth-cards">
                      <article
                        className={`p-4 rounded-xl ${elementColors[selectedPractice.element]?.bg} border ${elementColors[selectedPractice.element]?.border}`}
                        data-testid="sunrise-sunset-why-this-heals"
                      >
                        <h3 className="font-medium mb-2">Why this heals</h3>
                        <p className="text-sm text-muted-foreground">{selectedPractice.why_this_heals}</p>
                      </article>

                      <article className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="sunrise-sunset-integration">
                        <h3 className="font-medium mb-2">Integration</h3>
                        <p className="text-sm text-muted-foreground">{selectedPractice.integration}</p>
                      </article>
                    </div>

                    {/* Steps */}
                    <div>
                      <h3 className="font-medium mb-3">Practice Steps</h3>
                      <ol className="space-y-3">
                        {selectedPractice.steps.map((step, i) => (
                          <li key={`${selectedPractice.id}-step-${String(step).slice(0, 24)}-${i}`} className="flex items-start gap-3 text-sm">
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
                      <p className="text-sm italic text-foreground/90">&ldquo;{selectedPractice.affirmation}&rdquo;</p>
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
                      <p className="text-sm italic">&ldquo;{selectedPractice.affirmation}&rdquo;</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-4 border-t border-white/10 bg-card rounded-b-2xl">
                {!isPracticing ? (
                  <Button 
                    onClick={() => {
                      if (!selectedPractice) return;
                      setSelectedPractice(null);
                      setIsPracticing(false);
                      setGuidedPractice({
                        ...selectedPractice,
                        category: activeTab,
                        steps: selectedPractice.steps,
                        duration_minutes: resolveDurationMinutes(selectedPractice.duration_minutes, 15),
                      });
                    }}
                    className={`w-full py-4 ${
                      activeTab === "sunrise" 
                        ? "bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700" 
                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    }`}
                    data-testid="begin-practice-btn"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Begin Guided Practice
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
