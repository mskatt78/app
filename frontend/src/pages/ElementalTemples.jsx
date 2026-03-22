import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mountain, Waves, Flame, Wind, Sparkles, ChevronRight, X, Star, Leaf, Droplets, Zap, Eye, Globe } from "lucide-react";

const elements = [
  {
    id: "earth",
    name: "Earth Temple",
    element: "Earth",
    symbol: "⬛",
    icon: Mountain,
    color: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", accent: "emerald", glow: "shadow-emerald-500/20", gradient: "from-emerald-900/80 to-stone-900/60" },
    tagline: "Rooted. Abundant. Embodied.",
    description: "Earth is the foundation — the body itself, the ground beneath your feet, the slow wisdom of forests and stone. Earth teaches us patience, permanence, and the sacred act of being fully present in matter.",
    inner: "In you, Earth is your body, your bones, your sense of safety. It is your capacity to be fully here — not floating above your life but rooted within it. When Earth is in balance, you feel secure, nourished, and at home in yourself.",
    outer: "In the world, Earth is the soil, the forest, the mountain, the cave, the root system beneath the earth that fungi and trees use to communicate and share resources. It is the slow, patient pulse of geological time.",
    nature_connection: [
      "Walk barefoot on soil, grass, sand, or rock. Feel the texture and temperature beneath your feet.",
      "Sit at the base of a large tree. Place your back against the trunk. Breathe its rootedness into your own spine.",
      "Garden with bare hands. Plant seeds with intention. Watch what grows.",
      "Collect stones that call to you. Hold them and feel their ancient time.",
      "Eat food grown in local soil, prepared with care and eaten without distraction."
    ],
    practices: [
      { name: "Mountain Pose (Tadasana)", type: "Movement", desc: "Stand still as a mountain — feet rooted, crown lifted, entire body awake. Hold for 5 minutes while breathing deeply. Feel the weight and stability of your body." },
      { name: "Earth Breath", type: "Breathwork", desc: "Inhale for 4 counts through the nose. Hold for 4. Exhale slowly for 8. Repeat 10 cycles. Imagine breathing into the ground itself." },
      { name: "Body Gratitude Practice", type: "Somatic", desc: "Place both hands on your belly. Close your eyes. Begin to name every part of your body that is working right now, with gratitude. Start with your breath, your heartbeat, your digestion." },
      { name: "Earth Element Meditation", type: "Meditation", desc: "Close your eyes and imagine roots growing from the soles of your feet deep into the earth. Feel yourself being held. Feel the mineral richness of the earth feeding your roots. You are nourished. You belong here." }
    ],
    embodiment: "Earth embodiment is about inhabiting your physical body fully — feeling your feet, your weight, your texture against the world. It is about being so present that you become undeniable. The Earth archetype within us is the one who says: 'I am here. I take up space. I belong.' This is your foundation. Without it, all other elements spin without anchor.",
    wisdom: "The deepest wisdom of Earth is this: nothing is wasted. Every fallen leaf becomes soil. Every ending becomes beginning. The compost of your most difficult experiences is the richest ground for your most beautiful growth. Trust the process. Stay in your body. This too will nourish you.",
    affirmations: [
      "I am rooted, safe, and held by the Earth.",
      "My body is sacred ground.",
      "I am patient, present, and fully here.",
      "I belong to this earth, and the earth belongs to me."
    ]
  },
  {
    id: "water",
    name: "Water Temple",
    element: "Water",
    symbol: "🌊",
    icon: Waves,
    color: { text: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/30", accent: "blue", glow: "shadow-blue-500/20", gradient: "from-blue-900/80 to-slate-900/60" },
    tagline: "Fluid. Feeling. Flowing.",
    description: "Water is the element of emotion, intuition, and the unconscious. Like water, we cannot be grasped — we can only be held in a vessel. Water teaches us that feeling is not weakness; it is the intelligence of the soul.",
    inner: "In you, Water is your emotional life — your capacity to feel deeply, to grieve, to love, to be moved. It is your intuition: that knowing that arrives before words. When Water is balanced, you flow with life rather than resist it. You can hold paradox, rest in uncertainty, and trust what you sense beyond the visible.",
    outer: "In the world, Water is the ocean, the river, the rain, the morning dew. It is the 70% of your own body that is ocean. It is the amniotic fluid that held you before birth. Water has memory — it carries information in its structure, responds to intention, and connects all living things.",
    nature_connection: [
      "Sit beside a river or stream and simply watch the water move. Notice how it navigates obstacles — flowing around, under, through.",
      "Stand in the rain and feel each drop on your skin. Let yourself be fully wet.",
      "Swim in natural water if possible — ocean, river, lake. Float on your back and surrender to being held.",
      "Collect rain water and use it to water plants or simply to hold. Feel its aliveness.",
      "Wake before dawn to watch the dew forming on grass and spiderwebs."
    ],
    practices: [
      { name: "Fluid Movement", type: "Movement", desc: "Put on slow, ambient music and move your body like water — undulating, flowing, never stopping in one shape. Let your spine become a river. Let your arms become waves. Release all rigidity." },
      { name: "Emotional Release Breathwork", type: "Breathwork", desc: "Circular breath — continuous inhale and exhale with no pause. Breathe into the belly, then chest, then release fully. Allow whatever emotions arise to move through. Sound is welcome — sighing, crying, toning." },
      { name: "Grief Practice", type: "Somatic", desc: "Find a private space. Place your hands on your heart. Think of something you are grieving — a loss, an unlived life, a relationship, a dream. Let the tears come. Grief is water returning to the ocean. It is healthy. It is necessary." },
      { name: "Moon Water Meditation", type: "Meditation", desc: "On a full moon night, place a glass of water in the moonlight. In meditation, imagine the moon's silver light filling your emotional body, clearing and cleansing like a gentle tide. Drink the moon water in the morning." }
    ],
    embodiment: "Water embodiment is the practice of feeling — fully, without bracing or numbing. It is learning to track the subtle currents of emotion in the body: the tightening in the throat, the warmth in the chest, the hollow ache of longing. Water asks you to stop managing your feelings and start experiencing them. Emotions are messengers. Every suppressed wave eventually creates a flood. Let them flow.",
    wisdom: "Water does not fight the rock — it goes around it, under it, and over centuries, shapes it. This is the wisdom of water: resistance is rarely the path. Feeling is not the obstacle — it is the way through. Your tears are not weakness. They are intelligence. They are the body's way of knowing.",
    affirmations: [
      "I am fluid, adaptive, and free.",
      "My emotions are messengers, not enemies.",
      "I trust the wisdom of my feeling body.",
      "Like water, I can flow through any obstacle."
    ]
  },
  {
    id: "fire",
    name: "Fire Temple",
    element: "Fire",
    symbol: "🔥",
    icon: Flame,
    color: { text: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/30", accent: "orange", glow: "shadow-orange-500/20", gradient: "from-orange-900/80 to-red-950/60" },
    tagline: "Transformed. Alive. Radiant.",
    description: "Fire is the element of transformation, will, and radiant power. It is the sacred force that burns away what no longer serves, illuminates the darkness, and ignites the passion to live fully and authentically.",
    inner: "In you, Fire is your will, your passion, your power to act. It is the spark of creativity, the courage to speak your truth, and the light of consciousness itself. When Fire is healthy, you are motivated without being driven, powerful without being dominating, bright without burning others.",
    outer: "In the world, Fire is the sun — the great life-giver without which nothing grows. It is the flame in the hearth that has gathered humans into community for all of human existence. It is the forest fire that clears the old growth to make way for new life. It is the volcano that creates new land.",
    nature_connection: [
      "Build a fire safely and tend it with full attention. Watch how it breathes, hungers, and transforms what it consumes.",
      "Rise before dawn to witness the sun rising. Watch the sky transform from dark to golden. Feel the first warmth on your face.",
      "Stand in direct sunlight, arms open, face upturned. Receive the light consciously.",
      "Burn something that represents what you are releasing — a written intention, a symbol — and watch it transform.",
      "Cook something from scratch over an open flame, present to the alchemy of heat and ingredients becoming nourishment."
    ],
    practices: [
      { name: "Power Breath (Kapalabhati)", type: "Breathwork", desc: "Rapid, forceful exhales through the nose with passive inhales. Start with 30 pumps, rest, and repeat three rounds. This ignites digestive fire, clears the mind, and activates energy." },
      { name: "Warrior Sequence", type: "Movement", desc: "Move through Warrior I, II, and III with fierce intention. Hold each for 10 breaths. Let your body be powerful, your gaze steady, your breath strong. You are a warrior of light." },
      { name: "Candle Meditation", type: "Meditation", desc: "Sit before a lit candle in a dark room. Gaze steadily at the flame without blinking until your eyes naturally blink. This is trataka — the practice of steady gazing — which strengthens willpower and concentration." },
      { name: "Fire Ceremony", type: "Ritual", desc: "Write on paper what you are releasing. Read each thing aloud with conviction: 'I release...' Then burn the paper. As it burns, say: 'I am free. I am renewed. I am light.' Watch the smoke carry your intentions skyward." }
    ],
    embodiment: "Fire embodiment is about inhabiting your full power — not power over others, but the radiant, self-sourced power of someone who knows who they are and why they are here. It is about feeling your life force — that hum of aliveness, that heat of desire and purpose — and letting it guide your choices. Fire asks: What are you willing to burn for?",
    wisdom: "The most important thing about fire is that it transforms but does not destroy. Wood becomes heat becomes light becomes ash that feeds new growth. Nothing is lost — everything is changed. This is the deeper truth of transformation: you are not diminished by what you release. You become more yourself.",
    affirmations: [
      "I am radiant, powerful, and alive.",
      "My will is my sacred gift — I use it wisely.",
      "I transform with grace and emerge renewed.",
      "I am the light that illuminates my own path."
    ]
  },
  {
    id: "air",
    name: "Air Temple",
    element: "Air",
    symbol: "🌬️",
    icon: Wind,
    color: { text: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/30", accent: "cyan", glow: "shadow-cyan-500/20", gradient: "from-cyan-900/80 to-slate-900/60" },
    tagline: "Free. Clear. Expansive.",
    description: "Air is the element of mind, breath, communication, and freedom. It is the most subtle and pervasive — like thought itself, it is everywhere and nowhere, connecting all things, impossible to grasp.",
    inner: "In you, Air is your mind — your thoughts, perceptions, and the quality of your awareness. It is your breath: the most direct link between the voluntary and involuntary, between the conscious and unconscious. It is your voice — the vibration of your truth moving through the world.",
    outer: "In the world, Air is the atmosphere — the thin, precious veil of gases that makes all life possible. It is the wind that carries seeds across continents, the breath shared between all living creatures, the invisible medium through which birds fly and sound travels and weather moves.",
    nature_connection: [
      "Lie in an open field and feel the wind move over your body. Notice how it changes — gusts, lulls, temperature shifts. Let it brush away mental debris.",
      "Climb to high ground and stand with your arms spread in the wind. Let it move through you.",
      "Listen deeply to sound — wind in trees, bird calls, distant music. Practice pure listening without labeling.",
      "Blow on dandelion seeds and watch them drift. Let each one carry a prayer.",
      "Sit in morning air before sunrise and be with the quality of that first light and coolness."
    ],
    practices: [
      { name: "4-7-8 Breath", type: "Breathwork", desc: "Inhale for 4 counts. Hold for 7. Exhale for 8. This activates the parasympathetic nervous system and calms anxious air energy. Repeat 4 rounds." },
      { name: "Humming Meditation", type: "Sound", desc: "Sit comfortably and begin to hum — any note or tone that feels natural. Feel the vibration in your skull, your chest, your whole body. Humming activates the vagus nerve, activates calm, and harmonizes the Air element." },
      { name: "Thought Watching", type: "Mindfulness", desc: "Sit for 10 minutes and simply observe your thoughts as if watching clouds move across a sky. Do not follow them. Do not judge them. Simply notice: 'There is a thought.' You are the sky. The thoughts are weather." },
      { name: "Sunrise Pranayama", type: "Breathwork", desc: "At dawn, sit outside or near an open window. Practice alternate nostril breathing (Nadi Shodhana): close the right nostril with your thumb, inhale through the left; close left with ring finger, exhale through right; inhale right; exhale left. Repeat for 10 cycles." }
    ],
    embodiment: "Air embodiment is the practice of mental clarity without rigidity — the ability to think freely, communicate honestly, and hold multiple perspectives without being swept away. It is being able to change your mind with grace, to follow inspiration without losing yourself, to speak truth with kindness. Air is the element of freedom — it cannot be confined, cannot be owned, cannot be made to stand still.",
    wisdom: "Air's greatest teaching is non-attachment. Thoughts come and go like weather — they do not define you. Your beliefs are not you. Your conclusions are not permanent. The mind that can hold a thought lightly, examine it, and release it if it no longer serves — this is a free mind. And freedom is the birthright of the Air element.",
    affirmations: [
      "My mind is clear, open, and free.",
      "I breathe in clarity and breathe out confusion.",
      "I communicate my truth with grace and ease.",
      "I am free — lighter than thought, freer than wind."
    ]
  },
  {
    id: "spirit",
    name: "Spirit Temple",
    element: "Spirit",
    symbol: "✨",
    icon: Sparkles,
    color: { text: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/30", accent: "purple", glow: "shadow-purple-500/20", gradient: "from-purple-900/80 to-indigo-950/60" },
    tagline: "Unified. Infinite. Divine.",
    description: "Spirit — the fifth element, the quintessence — is not separate from the other four. It is the animating force that moves through all of them. It is consciousness itself: the witness, the dreamer, the sacred ground of all being.",
    inner: "In you, Spirit is your deepest nature — the part of you that is prior to thoughts, feelings, sensations, and stories. It is the awareness that is aware: still, spacious, and completely untroubled by everything that arises within it. Some traditions call it the Atman, the Soul, the True Self, Buddha Nature, or simply: Love.",
    outer: "In the world, Spirit is the invisible web of connection — the field of consciousness that underlies all matter. It is what mystics and scientists are both reaching toward when they speak of unified field theory, the quantum field, the Akashic Records, the Tao, or the Kingdom of Heaven. It is the love that moves the sun and other stars.",
    nature_connection: [
      "Sit at dusk or dawn and simply be present without any agenda. Feel yourself as part of the world rather than separate from it.",
      "Look up at the night sky and contemplate the stars. Allow the enormity of existence to wash through you without trying to make sense of it.",
      "Spend time in complete silence — no screens, no music, no speaking. Let the hum of silence become audible.",
      "Witness a birth or a death if you are given the opportunity. Be present at thresholds.",
      "Create a gratitude altar with objects from each element: a stone, a shell, a candle, a feather, and something representing Spirit to you."
    ],
    practices: [
      { name: "Open Awareness Meditation", type: "Meditation", desc: "Simply sit. Let go of any technique. Let your awareness rest in the open, spacious quality of consciousness itself — not focusing on the breath, not watching thoughts, but simply being aware that you are aware. This is the direct recognition of Spirit." },
      { name: "Ho'oponopono", type: "Prayer", desc: "A Hawaiian practice of reconciliation and forgiveness. Silently or aloud, repeat: 'I love you. I'm sorry. Please forgive me. Thank you.' Direct it toward yourself, toward others, toward the world. This practice heals the Spirit of division and separation." },
      { name: "Sacred Geometry Contemplation", type: "Meditation", desc: "Focus on the Sri Yantra, the Flower of Life, or a simple equilateral triangle. Allow the geometric pattern to be a gateway — not something to analyze, but a doorway through which awareness moves into its own source." },
      { name: "The Witness Practice", type: "Mindfulness", desc: "In any moment — especially difficult ones — ask: 'Who is aware of all this?' Not what you are thinking or feeling, but who is watching it. Rest your attention in that awareness that is prior to all content. That is Spirit in you." }
    ],
    embodiment: "Spirit embodiment is the paradox of all spiritual practice: coming fully into the body in order to realize that you are more than the body. It is not transcendence of matter but the recognition of Spirit within matter. Every atom is alive. Every breath is sacred. Every moment is already what you've been seeking. The path home is not upward into abstraction — it is downward, into the root, into the body, into this exact breath.",
    wisdom: "There is only one teaching of the Spirit Temple, and it is this: You are already whole. The sense of separation — of being lost, broken, incomplete, unworthy — is the one illusion that all spiritual practice is designed to dissolve. You are not on the way to becoming something sacred. You are already sacred, already loved, already home. The journey is learning to rest in this, to live from this, to let this truth shape every breath.",
    affirmations: [
      "I am one with all of life.",
      "I am whole, complete, and already home.",
      "Spirit moves through me and as me.",
      "I am love expressing itself as a human being."
    ]
  }
];

const ElementalTemples = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTemple, setActiveTemple] = useState(null);
  const [activeSection, setActiveSection] = useState("embodiment");

  const sections = [
    { id: "embodiment", label: "Embodiment" },
    { id: "inner", label: "Within You" },
    { id: "outer", label: "In Nature" },
    { id: "practices", label: "Practices" },
    { id: "affirmations", label: "Affirmations" }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="elemental-temples">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => activeTemple ? setActiveTemple(null) : navigate(-1)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Sacred Temples</p>
              <h1 className="text-xl font-serif">
                {activeTemple ? (
                  <><span className="italic" style={{ color: `var(--${activeTemple.color.accent})` }}>{activeTemple.name}</span></>
                ) : (
                  <>Elemental <span className="italic text-primary">Temples</span></>
                )}
              </h1>
            </div>
          </div>
          <Globe className="w-6 h-6 text-muted-foreground/30" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {!activeTemple ? (
            /* Temple Selection Grid */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Intro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 pt-4"
              >
                <h2 className="text-4xl font-serif mb-4">The Five <span className="italic text-primary">Elemental Temples</span></h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Each element is a doorway — into nature, into the body, into the deepest layers of the self.
                  Enter your temple and discover what this element is calling you to embody.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {elements.map((el, index) => {
                  const Icon = el.icon;
                  return (
                    <motion.div
                      key={el.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => { setActiveTemple(el); setActiveSection("embodiment"); }}
                      data-testid={`temple-${el.id}`}
                      className={`group cursor-pointer relative overflow-hidden rounded-2xl border p-6
                                 ${el.color.bg} ${el.color.border}
                                 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl ${el.color.glow}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl ${el.color.bg} border ${el.color.border} flex items-center justify-center`}>
                          <Icon className={`w-7 h-7 ${el.color.text}`} />
                        </div>
                        <span className={`text-2xl ${el.color.text} font-serif`}>{el.element}</span>
                      </div>
                      <h3 className="text-xl font-serif mb-1">{el.name}</h3>
                      <p className={`text-xs ${el.color.text} mb-3 italic`}>{el.tagline}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">{el.description}</p>
                      <div className={`mt-4 flex items-center gap-1 text-xs ${el.color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <ChevronRight className="w-4 h-4" />
                        <span>Enter Temple</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Individual Temple View */
            <motion.div
              key={activeTemple.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Temple Hero */}
              <div className={`p-8 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border} mb-8 text-center`}>
                <activeTemple.icon className={`w-16 h-16 mx-auto mb-4 ${activeTemple.color.text}`} />
                <h2 className="text-3xl font-serif mb-2">{activeTemple.name}</h2>
                <p className={`text-lg italic ${activeTemple.color.text} mb-4`}>{activeTemple.tagline}</p>
                <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">{activeTemple.description}</p>
              </div>

              {/* Section Navigation */}
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    data-testid={`section-${sec.id}`}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      activeSection === sec.id
                        ? `${activeTemple.color.bg} ${activeTemple.color.text} border ${activeTemple.color.border}`
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* Section Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {activeSection === "embodiment" && (
                    <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                      <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                        <Star className={`w-5 h-5 ${activeTemple.color.text}`} />
                        Embodying {activeTemple.element}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{activeTemple.embodiment}</p>
                    </div>
                  )}

                  {activeSection === "inner" && (
                    <div className="space-y-4">
                      <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                        <h3 className="text-xl font-serif mb-3">{activeTemple.element} Within You</h3>
                        <p className="text-muted-foreground leading-relaxed">{activeTemple.inner}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-lg font-serif mb-3">The Wisdom of {activeTemple.element}</h3>
                        <p className="text-muted-foreground leading-relaxed italic">{activeTemple.wisdom}</p>
                      </div>
                    </div>
                  )}

                  {activeSection === "outer" && (
                    <div className="space-y-4">
                      <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                        <h3 className="text-xl font-serif mb-3">{activeTemple.element} in the World</h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">{activeTemple.outer}</p>
                        <h4 className="font-medium mb-3">Nature Connection Practices</h4>
                        <ul className="space-y-3">
                          {activeTemple.nature_connection.map((practice, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <span className={`w-6 h-6 rounded-full ${activeTemple.color.bg} border ${activeTemple.color.border} flex items-center justify-center text-xs ${activeTemple.color.text} flex-shrink-0 mt-0.5`}>
                                {i + 1}
                              </span>
                              {practice}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeSection === "practices" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTemple.practices.map((practice, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-5 rounded-xl border ${activeTemple.color.bg} ${activeTemple.color.border}`}
                          data-testid={`practice-card-${i}`}
                        >
                          <span className={`text-xs ${activeTemple.color.text} uppercase tracking-wider`}>{practice.type}</span>
                          <h4 className="font-serif text-base mt-1 mb-2">{practice.name}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{practice.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeSection === "affirmations" && (
                    <div className={`p-8 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border} text-center`}>
                      <h3 className="text-xl font-serif mb-6">{activeTemple.element} Affirmations</h3>
                      <div className="space-y-4">
                        {activeTemple.affirmations.map((aff, i) => (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`text-lg font-serif italic ${activeTemple.color.text} leading-relaxed`}
                          >
                            "{aff}"
                          </motion.p>
                        ))}
                      </div>
                      <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest">
                        Speak these aloud with your hand on your heart
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ElementalTemples;
