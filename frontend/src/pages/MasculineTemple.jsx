import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Sword, Crown, Heart, Mountain, TreePine, Zap, BookOpen, Star, ChevronRight, X, Eye, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import GuidedAudioButton from "../components/GuidedAudioButton";
import AddToJournal from "../components/AddToJournal";
import axios from "axios";
import { appLogger } from "../utils/logger";

const apiClient = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

// Introduction to Masculine Temple as Sacred Body Temple
const templeIntro = {
  title: "Your Body is the Temple",
  description: "The Masculine Temple is not a building — it is YOU. Your body is the fortress, the ground, the sacred vessel through which the divine masculine moves. This is not about hardening or performing. It is about inhabiting yourself fully — with presence, with heart, with integrity. The temple is not earned. It IS you. This work is about returning home to yourself.",
  principles: [
    { title: "Unconditional Self-Honor", text: "Honor yourself not because you achieved something, but because you exist. Your worth is not measured by productivity, success, or how much you provide. You matter because you are here. From this ground, you can truly serve." },
    { title: "Strength with Heart", text: "True masculine strength is not hardness — it is the capacity to remain open while standing firm. The mature man protects without rigidity, leads without domination, feels without being overwhelmed. This is strength in service of love." },
    { title: "The Body as Ground", text: "A man disconnected from his body is a man disconnected from his power. Not power over others, but the power to be present, to feel, to respond rather than react. Embodiment is not optional — it is the foundation of mature masculinity." },
    { title: "Sacred Aloneness & Brotherhood", text: "The masculine needs both: the willingness to face oneself in solitude, and the nourishment of brotherhood. A man who cannot be alone is running from himself. A man who never seeks brothers is carrying too much alone." }
  ]
};

const archetypes = [
  {
    id: "warrior",
    title: "The Warrior",
    subtitle: "Courage & Boundaries",
    icon: Sword,
    image: "https://images.pexels.com/photos/5971304/pexels-photo-5971304.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-red-300", bg: "bg-red-500/10", border: "border-red-500/30" },
    description: "The Warrior is not the one who fights, but the one who knows when to act and when to be still. He is the guardian of his own integrity — the one who protects what is sacred, speaks truth regardless of consequence, and meets challenge with a steady, grounded heart.",
    teachings: [
      { heading: "The Noble Warrior", body: "In every culture, the highest expression of the Warrior is not aggression but self-mastery. The Bushido code of the samurai, the chivalry of the medieval knight, the Kshatriya tradition of India — all describe a warrior who is fierce in protection, gentle in peace, and uncompromising in honor. The enemy is never primarily external. The real battlefield is within." },
      { heading: "Boundaries as Sacred Work", body: "A man who cannot say 'no' is not kind — he is afraid. Healthy boundaries are not walls; they are the membrane of a healthy self. When you say yes when you mean no, you betray yourself and ultimately fail those you are trying to serve. The Warrior teaches us that our 'no' is as sacred as our 'yes.' Learning to hold your ground without aggression is one of the most important skills a man can develop." },
      { heading: "Anger as Sacred Fire", body: "Anger is the Warrior's signal — it says: a boundary has been crossed, or an injustice requires response. The problem is not anger itself but what we do with it. Suppressed anger becomes depression or violence. Expressed unconsciously, it destroys. But anger that is felt, honored, and channeled becomes the fuel for righteous action, creative vision, and the protection of the vulnerable." }
    ],
    practices: [
      { name: "Boundary Practice", desc: "Choose one relationship where you regularly say yes when you mean no. This week, practice saying: 'That doesn't work for me' or 'I need time to think about that.' Notice the discomfort — and notice what comes after. This is Warrior training." },
      { name: "Warrior's Breath (Bhastrika)", desc: "Sit tall. Take 20 rapid, powerful breaths through the nose — forceful inhale, forceful exhale. Then take a deep inhale, hold for as long as comfortable, and slowly exhale. This ignites the solar plexus and the Warrior's fire. Repeat 3 rounds." },
      { name: "Iron Bow Pose", desc: "Stand in a wide stance with arms raised overhead, fingers interlaced. Arch back powerfully, lifting the chest to the sky. Hold for 5 breaths. Feel your ribcage open, your heart exposed. The Warrior is powerful AND open-hearted." }
    ],
    ritual: {
      name: "Shield & Sword Declaration Ceremony 🙏",
      timing: "New Moon, or when facing a major challenge or transition",
      steps: [
        "Find an outdoor space at dawn or dusk. Stand facing east (the direction of new beginnings).",
        "Hold in your right hand an object that represents your sword — your truth, your clarity, your discernment (a stick, a pen, a stone with an edge).",
        "Hold in your left hand an object representing your shield — what you protect (a photo, a stone, an object from home).",
        "Stand in a wide stance, feet rooted. Take 10 warrior breaths — forceful and rhythmic.",
        "Speak aloud what you are defending: your values, your family, your truth, your integrity. Name them clearly.",
        "Speak aloud what you are willing to cut away: what no longer belongs in your life, what you have been tolerating that dishonors you.",
        "Strike the ground with your 'sword' hand three times: 'I stand for this. I am a warrior of integrity.'",
        "Bow to the four directions — a sign of humility and respect for all life."
      ],
      closing: "Return to this ceremony whenever you feel your boundaries eroding or your purpose unclear."
    }
  },
  {
    id: "king",
    title: "The King",
    subtitle: "Leadership & Sovereignty",
    icon: Crown,
    image: "https://images.pexels.com/photos/5386375/pexels-photo-5386375.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    description: "The King archetype is not about hierarchy but about sovereignty over one's own inner kingdom. The mature King is stable, generous, clear, and life-giving. He does not rule from fear but from a deep rootedness in who he is and what he stands for.",
    teachings: [
      { heading: "The Inner Kingdom", body: "Before a man can tend a family, a community, or the world, he must first become king of his own inner realm. This means creating order out of chaos within — not by suppressing parts of the self, but by integrating them under a wise, compassionate authority. The King knows all his parts: the Warrior, the Lover, the Magician, the Shadow. He gives each its appropriate domain." },
      { heading: "Blessing Others", body: "The highest function of the King is blessing — the capacity to see the worth and potential in others and to call it forth. When a man with King energy tells a younger man 'I see you, I see your gifts, I believe in you,' it changes lives. Many men are starving for this blessing — from fathers who were absent or withholding. The mature King knows: blessing others does not diminish him. It multiplies." },
      { heading: "The Shadow King: The Tyrant", body: "When King energy is distorted, it becomes the Tyrant — the man who must control everything and everyone because inside he is terrified. The Tyrant rules by fear, demands loyalty, cannot tolerate disagreement, and mistakes rigidity for strength. Every man must examine: where am I a tyrant — in my relationships, my inner life, my parenting? The antidote is not weakness but genuine strength: the willingness to be questioned, to be wrong, and to grow." }
    ],
    practices: [
      { name: "The Blessing Practice", desc: "Write a letter of genuine appreciation to three men in your life — a father figure, a friend, a mentor or son. Tell them specifically what you see in them, what they mean to you, what gifts they carry. Send at least one." },
      { name: "Morning Sovereignty", desc: "Before checking your phone in the morning, sit for 5 minutes in silence. Ask: 'What matters most today? Who do I want to be?' Set one clear intention as king of your day. This is not grandiosity — it is taking responsibility for the direction of your energy." },
      { name: "Decision Practice", desc: "When facing a difficult decision, ask: 'What would the best version of me — generous, clear, long-sighted — choose here?' The King thinks in generations, not moments. He asks: 'What story do I want told about this choice?'" }
    ],
    ritual: {
      name: "Morning Sovereignty Embodiment Ritual 🙏",
      timing: "Every morning — especially during periods of leadership challenge",
      steps: [
        "Rise 15 minutes before anyone else in your home. Go to a window or outdoors and face the light.",
        "Stand tall. Place one hand on your heart and one on your solar plexus.",
        "Breathe deeply 7 times — with each breath, feel yourself settling into your body, into your role, into this day.",
        "Speak your sovereign declaration aloud: 'Today I lead with clarity. I give freely. I receive with gratitude. I protect what matters. I build what lasts.'",
        "Review your day mentally: What does the King in you most need to tend to today? What act of generosity can you offer? What decision needs your full, unhurried attention?",
        "Close by bowing slightly — not in submission, but in reverence. The mature King bows to life, to those he serves, to the sacred.",
        "Begin your day from this grounded, generous center."
      ],
      closing: "This ritual takes under 10 minutes but sets the tone for how you inhabit your whole day."
    }
  },
  {
    id: "magician",
    title: "The Magician",
    subtitle: "Wisdom & Transformation",
    icon: Eye,
    image: "https://images.unsplash.com/photo-1611430995190-712d5f93f37e?crop=entropy&cs=srgb&fm=jpg&w=800",
    color: { text: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    description: "The Magician is the master of the liminal — the one who stands between worlds and transforms energy from one form to another. He is the healer, the shaman, the teacher, the scientist, the poet. He initiates others and himself through the power of awareness.",
    teachings: [
      { heading: "The Alchemist Within", body: "Alchemy was never primarily about turning lead into gold — it was a metaphor for transforming the leaden parts of the self into gold. The Magician in every man has the power to take pain and make it wisdom, take failure and make it fuel, take darkness and make it depth. This is the great work — not external achievement but internal transformation." },
      { heading: "The Initiation", body: "In indigenous cultures, boys did not become men through age alone — they underwent initiation: a period of separation, ordeal, and transformation, after which they returned to the community as men with new names, new responsibilities, and new relationships to the sacred. Modern culture has largely lost this. Men must often create their own initiations — the meaningful challenge, the threshold crossed, the mentor sought." },
      { heading: "Holding the Space", body: "The Magician's greatest gift is the capacity to hold space — to be so grounded and clear that others can go through their own transformation in his presence. This is the gift of the great therapist, the spiritual director, the elder. It requires that the Magician has done his own work — has been to the depths and returned — so he does not collapse when others bring him their darkness." }
    ],
    practices: [
      { name: "Shadow Integration", desc: "Write down three qualities in other people that irritate or disgust you most. For each, ask honestly: 'Is this in me, in any form?' Denied qualities in ourselves are often what we most judge in others. Integration begins with acknowledgment." },
      { name: "Sit with Difficulty", desc: "Choose one thing you have been avoiding — a conversation, a truth, a feeling. Sit with it for 20 minutes. Do not solve it. Simply witness it with the Magician's steady awareness. The act of truly seeing something begins its transformation." },
      { name: "Journal of Questions", desc: "Keep a journal not of answers but of questions. Begin each entry with: 'What if...' or 'I wonder...' or 'What am I not seeing?' The Magician is not the one with all the answers. He is the one who knows which questions open doors." }
    ],
    ritual: {
      name: "Initiation by Fire and Shadow 🙏",
      timing: "At a life threshold — a major change, loss, or transformation",
      steps: [
        "Find an evening when you can be alone and undisturbed. Gather: candles, a journal, a bowl, and matches.",
        "Create a circle of candles around you. Sit in the center. This is your sacred container — the Magician's circle.",
        "Write on separate small papers every part of yourself you have rejected, suppressed, or are afraid to look at. Be courageous. Nothing is too dark to name here.",
        "Read each one aloud and say: 'I see you. I acknowledge you. You are part of me. I am not afraid of you.'",
        "For each piece, decide: is this something to integrate (give it its appropriate place) or release (burn it)?",
        "Burn the papers you are releasing, one by one. For those you are integrating, tear them and scatter them across your journal pages.",
        "Sit in the circle until the candles burn down or you feel complete. You have looked into your own darkness and named it. This is the Magician's greatest work."
      ],
      closing: "What you integrate loses its power over you. What you release transforms into compost for your next becoming."
    }
  },
  {
    id: "lover",
    title: "The Lover",
    subtitle: "Passion & Connection",
    icon: Heart,
    image: "https://images.pexels.com/photos/4955511/pexels-photo-4955511.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/30" },
    description: "The Lover in a man is not primarily about romantic love — it is his capacity for aliveness: his ability to be moved, to feel beauty, to live with passion, to be fully present with another person, and to be undone by the magnificence of being alive.",
    teachings: [
      { heading: "The Full-Bodied Life", body: "The Lover archetype is the one who wants to taste everything — not in the sense of hedonism, but in the sense of full engagement with life. He is the one who weeps at music, is stopped in his tracks by the sunset, is genuinely curious about every person he meets. He does not live behind glass. He is moved. He allows himself to be affected. This is courage of a different kind." },
      { heading: "Masculine & Feminine Integration", body: "True maturity in a man involves integrating the feminine — not becoming feminine, but honoring the yin within: the receptive, the intuitive, the tender, the relational. The man who can be soft without losing himself, who can receive without grasping, who can love without losing his sense of self — this man is whole. He is not less masculine for this integration. He is more." },
      { heading: "Presence as the Greatest Gift", body: "For the Lover, the greatest thing one human being can offer another is full presence — not fixing, not advising, not being distracted, but simply being there: curious, open, receptive. In a world of constant partial attention, presence is one of the rarest and most beautiful gifts a man can offer. To be truly seen and heard by another person is one of the deepest human experiences." }
    ],
    practices: [
      { name: "Beauty Practice", desc: "Spend 10 minutes today looking — really looking — at something beautiful. A tree, a piece of music, a work of art, a person you love. Without categorizing or explaining it. Just receive it. Allow yourself to be moved. This is Lover practice." },
      { name: "Deep Listening", desc: "In your next conversation with someone close to you, practice listening without preparing your response. Listen to understand, not to reply. When they finish, pause before speaking. Ask: 'Is there anything more?' This is presence — the Lover's greatest offering." },
      { name: "Body Aliveness Scan", desc: "Lie down and slowly scan your body from feet to crown, spending 10 seconds at each area simply noticing sensation: warmth, tingling, pressure, emptiness. The Lover reconnects men to the felt sense of being alive — not as performance, but as genuine experience." }
    ],
    ritual: {
      name: "Body Aliveness & Gratitude Ceremony 🙏",
      timing: "Weekly — particularly when feeling disconnected, numb, or driven purely by output",
      steps: [
        "Choose a time when you won't be interrupted. Dim the lights. Put on music that has moved you emotionally — music you love.",
        "Lie on the floor on your back. Close your eyes.",
        "Begin with one hand on your heart. Simply feel it beating for 3 minutes — the faithful, uncomplaining rhythm of the body that has kept you alive through everything.",
        "Slowly begin to move — let the music move you. Not performance. Not exercise. Simply let your body move however it wants to. Let it be strange, or tender, or powerful.",
        "As you move, internally or aloud, begin to thank each part of your body: 'Thank you, feet, for carrying me. Thank you, hands, for building and creating. Thank you, heart, for feeling.'",
        "Dance or move for at least 20 minutes. You may feel emotion arise — let it. The Lover does not suppress sensation.",
        "End lying on the floor again, breathing. Feel the warmth and aliveness in your body. This is the gift."
      ],
      closing: "The Lover reminds us: the body is not a vehicle. It is the experience itself."
    }
  },
  {
    id: "ancestral",
    title: "Ancestral Connection",
    subtitle: "Lineage & Legacy",
    icon: TreePine,
    image: "https://images.pexels.com/photos/1792626/pexels-photo-1792626.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    description: "Every man stands on the shoulders of an unbroken line of men stretching back to the first human beings. Ancestral connection is about reclaiming this lineage — healing what is broken, honoring what is good, and consciously becoming the ancestor your descendants will need.",
    teachings: [
      { heading: "The Ancestral Wound", body: "Many men carry ancestral wounds — patterns of emotional unavailability, addiction, violence, shame, or abandonment that have passed down through the male line for generations. These patterns are not your fault. But they are your responsibility. The practice of ancestral healing is not about blaming your father or grandfather — it is about seeing clearly what was passed to you and choosing, consciously, what to pass on." },
      { heading: "Men's Business", body: "In many indigenous cultures, there is 'men's business' — sacred knowledge and practices passed from elder men to younger men, separate from the mixed community. The loss of this transmission — of elders who have been through it, who know the way, who can say 'I see what you're going through; here's what I know' — is one of the deepest wounds in modern masculine culture. Seeking mentorship, brotherhood, and elderhood are acts of healing." },
      { heading: "Becoming the Ancestor", body: "At some point, every man must ask: 'What will the men of my bloodline be known for? What am I adding to this lineage?' This is not grandiosity — it is a sober recognition that your choices ripple forward. Every time you break a harmful pattern — in how you speak to your children, how you treat your partner, how you handle your anger — you change the future of your lineage." }
    ],
    practices: [
      { name: "Ancestor Altar", desc: "Create a small altar with photos, objects, or symbols representing the men of your lineage — father, grandfathers, great-grandfathers. Light a candle. Speak to them. Thank what was good. Ask for what you need. If there are wounds, offer forgiveness — not condoning but releasing." },
      { name: "Men's Circle", desc: "Seek or create a men's circle — a regular gathering of men who meet to speak honestly about their lives, not to fix each other, but to witness each other. Brotherhood in its deepest sense is one of the most healing forces available to men." },
      { name: "Letter to Your Descendants", desc: "Write a letter to a man in your bloodline who will be born 100 years from now. What do you want him to know? What are you healing for him? What gifts are you passing on? What do you hope for him? Keep this letter." }
    ],
    ritual: {
      name: "Ancestor Altar Ceremony 🙏",
      timing: "Samhain/Halloween, Day of the Dead, Father's Day, or any time you feel the need to reconnect with your lineage",
      steps: [
        "Gather: a cloth for the altar, candles, photos or objects from men in your ancestry, a glass of water, a glass of whiskey or a drink your ancestors would have known, food they would have recognized.",
        "Arrange the altar with care. Place the photos or objects where they feel right. Light the candles.",
        "Pour the water and the drink. Place the food. These are your offerings — you are feeding your ancestors.",
        "Sit before the altar and speak aloud: 'I call to the men of my bloodline. I honor what you gave me: your strength, your resilience, your sacrifices, your love expressed in the language available to you.'",
        "Then speak what you are healing: 'I acknowledge the wounds in this lineage. I do not blame. I choose to transform them. The pattern ends with me. What begins with me is this...' (name the new pattern you are choosing).",
        "Ask for what you need from your ancestors: wisdom, courage, guidance. Sit in silence for 10 minutes and listen.",
        "Close by saying: 'Thank you. I carry you with me. I continue what was good. I transform what was broken. I love you.'"
      ],
      closing: "Tend this altar until the candles naturally burn down. The food and drink offerings can be left overnight and returned to the earth."
    }
  }
];

const MasculineTemple = ({ user, api }) => {
  const navigate = useNavigate();
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [activeTab, setActiveTab] = useState("teachings");
  const [embodimentPractices, setEmbodimentPractices] = useState([]);
  const [loadingPractices, setLoadingPractices] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  const fetchPractices = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/masculine-embodiment");
      setEmbodimentPractices(data);
    } catch (error) {
      appLogger.warn("Masculine Temple practices load failed", error);
    } finally {
      setLoadingPractices(false);
    }
  }, []);

  useEffect(() => {
    fetchPractices();
  }, [fetchPractices]);

  return (
    <div className="min-h-screen bg-background" data-testid="masculine-temple">
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
              <p className="text-xs text-amber-300/60 uppercase tracking-widest">Sacred Masculine</p>
              <h1 className="text-xl font-serif">Masculine <span className="italic text-amber-300">Temple</span></h1>
            </div>
          </div>
          <Shield className="w-6 h-6 text-amber-300/30" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 pt-8"
        >
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
              <Shield className="w-12 h-12 text-amber-300" />
            </div>
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif mb-4">
            The <span className="text-amber-300 italic">Masculine Temple</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            A sacred space for men — tending the forgotten arts of initiation, brotherhood,
            and embodied masculine wisdom. Here live the archetypes that make a man whole:
            the Warrior, the King, the Magician, the Lover, and the ancestor within.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
            <Shield className="w-4 h-4 text-amber-400/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
        </motion.div>

        {/* Body as Temple Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
        >
          <button 
            onClick={() => setShowIntro(!showIntro)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-serif text-amber-200">{templeIntro.title}</h3>
            </div>
            {showIntro ? <ChevronUp className="w-5 h-5 text-amber-300" /> : <ChevronDown className="w-5 h-5 text-amber-300" />}
          </button>
          
          <AnimatePresence>
            {showIntro && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-muted-foreground mt-4 mb-6 leading-relaxed">{templeIntro.description}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {templeIntro.principles.map((principle, i) => (
                    <div key={`${principle.title}-${i}`} className="p-4 rounded-xl bg-black/20 border border-amber-500/10">
                      <h4 className="font-serif text-amber-300 mb-2">{principle.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{principle.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Embodiment Practices from Database */}
        {embodimentPractices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-orange-400" />
              <h3 className="text-2xl font-serif">Embodiment Practices</h3>
            </div>
            <p className="text-muted-foreground mb-6">Sacred practices for honoring your whole temple — body, heart, strength, and soul.</p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {embodimentPractices.map((practice, index) => (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => setSelectedPractice(practice)}
                  className="p-5 rounded-xl bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:scale-[1.02] transition-all group"
                  data-testid={`embodiment-${practice.id}`}
                >
                  {practice.image_url && (
                    <div className="relative h-32 rounded-lg overflow-hidden mb-4">
                      <img src={practice.image_url} alt={practice.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <span className="text-xs text-orange-300 uppercase tracking-wider">{practice.category}</span>
                  <h4 className="font-serif text-lg mt-1 group-hover:text-orange-300 transition-colors">{practice.name}</h4>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{practice.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Archetype Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <h3 className="text-2xl font-serif">The Four Archetypes</h3>
          </div>
        </div>

        {/* Archetype Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archetypes.map((arch, index) => {
            const Icon = arch.icon;
            return (
              <motion.div
                key={arch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => { setSelectedArchetype(arch); setActiveTab("teachings"); }}
                data-testid={`archetype-${arch.id}`}
                className={`group cursor-pointer rounded-2xl border backdrop-blur-xl overflow-hidden
                           ${arch.color.bg} ${arch.color.border}
                           hover:scale-[1.02] transition-all duration-300`}
              >
                {/* Image */}
                {arch.image && (
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={arch.image} 
                      alt={arch.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent`} />
                    <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl ${arch.color.bg} border ${arch.color.border} flex items-center justify-center backdrop-blur-sm`}>
                      <Icon className={`w-5 h-5 ${arch.color.text}`} />
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-serif mb-1">{arch.title}</h3>
                  <p className={`text-sm ${arch.color.text} mb-3 uppercase tracking-wider`}>{arch.subtitle}</p>
                  <p className="text-base text-muted-foreground line-clamp-3 leading-relaxed">{arch.description}</p>
                  <div className={`mt-4 flex items-center gap-1 text-sm ${arch.color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <ChevronRight className="w-4 h-4" />
                    <span>Enter the Teaching</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center p-8 rounded-2xl bg-amber-500/5 border border-amber-500/15"
        >
          <Shield className="w-8 h-8 text-amber-300/40 mx-auto mb-4" />
          <blockquote className="text-lg font-serif italic text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            "The mature masculine is not soft masculinity or hard masculinity.
            It is a deep masculinity — rooted, warm, clear, and unafraid."
          </blockquote>
          <p className="mt-4 text-xs text-amber-300/50 uppercase tracking-widest">Sacred Masculine Wisdom</p>
        </motion.div>
      </main>

      {/* Archetype Detail Modal */}
      <AnimatePresence>
        {selectedArchetype && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedArchetype(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl max-w-3xl w-full my-8"
              data-testid="archetype-modal"
            >
              {/* Modal Header */}
              <div className={`p-6 rounded-t-2xl ${selectedArchetype.color.bg} border-b ${selectedArchetype.color.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${selectedArchetype.color.bg} border ${selectedArchetype.color.border} flex items-center justify-center`}>
                      <selectedArchetype.icon className={`w-6 h-6 ${selectedArchetype.color.text}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif">{selectedArchetype.title}</h2>
                      <p className={`text-sm ${selectedArchetype.color.text}`}>{selectedArchetype.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArchetype(null)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    data-testid="close-modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{selectedArchetype.description}</p>
              </div>

              {/* Tabs */}
              <div className={`flex border-b ${selectedArchetype.color.border}`}>
                {["teachings", "practices", "ritual"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium transition-all capitalize ${
                      activeTab === tab
                        ? `${selectedArchetype.color.text} border-b-2 ${selectedArchetype.color.border}`
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "ritual" ? "Ritual 🙏" : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "teachings" && (
                  <div className="space-y-4">
                    {selectedArchetype.teachings.map((t, i) => (
                      <div key={`${selectedArchetype.id}-teaching-${t.heading}-${i}`} className={`p-5 rounded-xl ${selectedArchetype.color.bg} border ${selectedArchetype.color.border}`}>
                        <h4 className="font-serif mb-2">{t.heading}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "practices" && (
                  <div className="space-y-4">
                    {selectedArchetype.practices.map((p, i) => (
                      <div key={`${selectedArchetype.id}-practice-${p.name}-${i}`} className="p-5 rounded-xl bg-white/5 border border-white/10">
                        <h4 className="font-serif mb-2 flex items-center gap-2">
                          <Star className={`w-4 h-4 ${selectedArchetype.color.text}`} />
                          {p.name}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{p.desc}</p>
                        <GuidedAudioButton
                          api={api}
                          script={`${selectedArchetype.name} practice: ${p.name}. ${p.desc}`}
                          label="Listen to practice"
                          className="text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "ritual" && selectedArchetype.ritual && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl ${selectedArchetype.color.bg} border ${selectedArchetype.color.border}`}>
                      <h3 className="font-serif text-lg mb-1">{selectedArchetype.ritual.name}</h3>
                      <p className="text-xs text-muted-foreground italic">{selectedArchetype.ritual.timing}</p>
                    </div>
                    <ol className="space-y-3">
                      {selectedArchetype.ritual.steps.map((step, i) => (
                        <li key={`${selectedArchetype.id}-ritual-step-${String(step).slice(0, 24)}-${i}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className={`w-7 h-7 rounded-full ${selectedArchetype.color.bg} border ${selectedArchetype.color.border} flex items-center justify-center text-xs ${selectedArchetype.color.text} flex-shrink-0`}>{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div className={`p-4 rounded-xl ${selectedArchetype.color.bg} border ${selectedArchetype.color.border}`}>
                      <p className="text-xs text-muted-foreground/80 italic">{selectedArchetype.ritual.closing}</p>
                    </div>
                    <GuidedAudioButton
                      api={api}
                      script={`${selectedArchetype.name} ritual: ${selectedArchetype.ritual.name}. ${selectedArchetype.ritual.steps.join(". ")}. ${selectedArchetype.ritual.closing}`}
                      label="Listen to Guided Ritual"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embodiment Practice Detail Modal */}
      <AnimatePresence>
        {selectedPractice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedPractice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl max-w-2xl w-full my-8"
              data-testid="embodiment-modal"
            >
              {selectedPractice.image_url && (
                <div className="relative h-48 rounded-t-2xl overflow-hidden">
                  <img src={selectedPractice.image_url} alt={selectedPractice.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs">{selectedPractice.category}</span>
                  {selectedPractice.element && <span className="px-3 py-1 rounded-full bg-white/5 text-xs">{selectedPractice.element} Element</span>}
                  {selectedPractice.duration_minutes && <span className="px-3 py-1 rounded-full bg-white/5 text-xs">{selectedPractice.duration_minutes} min</span>}
                </div>
                <h2 className="text-2xl font-serif mb-3">{selectedPractice.name}</h2>
                <p className="text-muted-foreground mb-6">{selectedPractice.description}</p>

                {selectedPractice.why_this_heals && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" /> Why This Heals
                    </h3>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {selectedPractice.why_this_heals}
                    </div>
                  </div>
                )}

                {selectedPractice.practice_guide && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" /> Practice Guide
                    </h3>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                      {selectedPractice.practice_guide}
                    </div>
                  </div>
                )}

                {selectedPractice.extended_teachings && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-violet-400" /> Deeper Teachings
                    </h3>
                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                      {selectedPractice.extended_teachings}
                    </div>
                  </div>
                )}

                {selectedPractice.benefits && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Benefits</h3>
                    <div className="flex flex-wrap gap-2">
                      {(typeof selectedPractice.benefits === 'string' ? selectedPractice.benefits.split(',') : selectedPractice.benefits).map((b, i) => (
                        <span key={`${selectedPractice.id || selectedPractice.name}-benefit-${String(b).slice(0, 24)}-${i}`} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs">{typeof b === 'string' ? b.trim() : b}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <GuidedAudioButton
                    api={api}
                    script={`${selectedPractice.name}. ${selectedPractice.description}. ${selectedPractice.practice_guide || ''}`}
                    label="Listen to Guided Practice"
                    className="flex-1"
                  />
                  <AddToJournal 
                    practiceName={selectedPractice.name} 
                    practiceType="masculine" 
                    duration={selectedPractice.duration_minutes || 20}
                    buttonVariant="outline"
                    buttonSize="default"
                  />
                  <button onClick={() => setSelectedPractice(null)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasculineTemple;
