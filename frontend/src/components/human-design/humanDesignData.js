import { Eye, Moon, Shield, Zap } from "lucide-react";

export const PROFILE_LINES = {
  1: { name: "Investigator", desc: "Foundation-seeker. You need deep knowledge and security before you shine." },
  2: { name: "Hermit", desc: "Natural talent emerges through solitude then re-engaging the world." },
  3: { name: "Martyr", desc: "You learn through trial and error — your 'mistakes' are sacred wisdom." },
  4: { name: "Opportunist", desc: "Networks and community are your power base. Relationships open doors." },
  5: { name: "Heretic", desc: "Others project their hopes onto you. You're here to offer practical solutions." },
  6: { name: "Role Model", desc: "You live in three phases: trial (1–30), withdrawal (30–50), wisdom (50+)." },
};

export const stableHumanDesignKey = (prefix, value) => {
  const slug = String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${prefix}-${slug || "item"}`;
};

export const humanDesignTypes = [
  {
    id: "generator",
    name: "Generator",
    population: "~37%",
    icon: Zap,
    color: "orange",
    aura: "Open and Enveloping",
    strategy: "Wait to Respond",
    notSelf: "Frustration",
    signature: "Satisfaction",
    description: "Generators are the life force of the planet. They have sustainable energy from their defined Sacral Center. Their strategy is to wait for life to come to them and then respond with their gut (Sacral response).",
    keyTraits: [
      "Sustainable work energy when doing what they love",
      "Sacral 'uh-huh' or 'uh-uh' response guides decisions",
      "Magnetic aura that draws opportunities to them",
      "Master builders who create through response",
      "Need to be asked to access their wisdom",
    ],
    deconditioning: "Generators have been conditioned to initiate and push. The deconditioning process involves learning to wait, trusting that the right opportunities will come. When you respond rather than initiate, life flows with ease and you feel deep satisfaction.",
    affirmation: "I trust that life brings me exactly what I need. I wait, I respond, and I am satisfied.",
  },
  {
    id: "manifesting-generator",
    name: "Manifesting Generator",
    population: "~33%",
    icon: Zap,
    color: "red",
    aura: "Open and Enveloping",
    strategy: "Wait to Respond, then Inform",
    notSelf: "Frustration and Anger",
    signature: "Satisfaction and Peace",
    description: "Manifesting Generators are multi-passionate energy beings who combine Generator sustainability with Manifestor initiating energy. They move quickly and often skip steps, which is correct for them.",
    keyTraits: [
      "Multi-passionate with many interests",
      "Fast-moving and efficient",
      "Skip steps naturally (correct for them)",
      "Need to respond AND inform before acting",
      "Can pivot quickly when something isn't working",
    ],
    deconditioning: "MGs have been told to slow down and focus on one thing. Your multi-passionate nature is a gift. Trust your Sacral response, inform those affected by your actions, and embrace your unique non-linear path.",
    affirmation: "I honor my multiple passions. I respond, I inform, and I move at my own pace.",
  },
  {
    id: "projector",
    name: "Projector",
    population: "~20%",
    icon: Eye,
    color: "blue",
    aura: "Focused and Absorbing",
    strategy: "Wait for the Invitation",
    notSelf: "Bitterness",
    signature: "Success",
    description: "Projectors are here to guide and direct the energy of others. They have a focused, penetrating aura that can see deep into others. They need recognition and invitation to share their gifts.",
    keyTraits: [
      "Natural guides and advisors",
      "See systems and how to optimize them",
      "Need recognition before sharing wisdom",
      "Require rest and alone time to discharge energy",
      "Waiting for invitation protects their energy",
    ],
    deconditioning: "Projectors have been conditioned to work like Generators and initiate like Manifestors. The deconditioning process involves learning to wait for recognition and invitation, especially in career, love, and living situations. Your wisdom is valued when invited.",
    affirmation: "I wait for recognition and invitation. My guidance is valuable and I share it when invited.",
  },
  {
    id: "manifestor",
    name: "Manifestor",
    population: "~9%",
    icon: Shield,
    color: "purple",
    aura: "Closed and Repelling",
    strategy: "Inform Before Acting",
    notSelf: "Anger",
    signature: "Peace",
    description: "Manifestors are the initiators, here to get things started. They have a closed aura that can feel repelling to others. By informing before acting, they reduce resistance and find peace.",
    keyTraits: [
      "Natural initiators who start things",
      "Independent and self-contained",
      "Impact others with their aura and actions",
      "Need freedom and space to create",
      "Informing prevents resistance from others",
    ],
    deconditioning: "Manifestors have been conditioned to ask permission. You don't need permission - you need to inform. The difference is crucial. Informing is not asking; it's a courtesy that allows others to adjust and reduces the resistance you feel.",
    affirmation: "I am free to initiate. I inform out of respect, not to seek permission. I find peace in my impact.",
  },
  {
    id: "reflector",
    name: "Reflector",
    population: "~1%",
    icon: Moon,
    color: "violet",
    aura: "Resistant and Sampling",
    strategy: "Wait a Lunar Cycle (28 days)",
    notSelf: "Disappointment",
    signature: "Surprise",
    description: "Reflectors are rare beings with no defined centers. They sample and reflect the energy around them, making them barometers for the health of their community. They need a full lunar cycle to make major decisions.",
    keyTraits: [
      "Mirror the health of their community",
      "Experience all energies but identify with none",
      "Deeply affected by their environment",
      "Major decisions need 28 days (lunar cycle)",
      "Wisdom comes from talking through decisions",
    ],
    deconditioning: "Reflectors have been conditioned to make quick decisions like everyone else. Your lunar cycle strategy is not a limitation - it's your protection. In that 28 days, you experience the decision from every perspective. Take your time.",
    affirmation: "I honor my need for time. I wait through the full moon cycle and trust the clarity that comes.",
  },
];

export const centers = [
  {
    name: "Head",
    location: "Top",
    color: "yellow",
    theme: "Inspiration & Mental Pressure",
    defined: "Consistent source of inspiration and questions. Mental pressure to think and figure things out.",
    undefined: "Amplifies others' inspiration. Can get lost in questions that aren't yours. Wisdom: Not every question needs an answer.",
    biological: "Pineal Gland",
  },
  {
    name: "Ajna",
    location: "Between Head and Throat",
    color: "green",
    theme: "Mind & Conceptualization",
    defined: "Fixed way of processing and thinking. Reliable mental patterns. Strong opinions.",
    undefined: "Open mind that can see all perspectives. Amplifies others' certainty. Wisdom: Certainty isn't necessary.",
    biological: "Pituitary Gland",
  },
  {
    name: "Throat",
    location: "Center",
    color: "brown",
    theme: "Communication & Manifestation",
    defined: "Consistent way of speaking and expressing. Reliable voice and communication style.",
    undefined: "Flexible communication that adapts. Desire to attract attention. Wisdom: Wait for the right moment to speak.",
    biological: "Thyroid & Parathyroid",
  },
  {
    name: "G Center (Self)",
    location: "Center of Chest",
    color: "yellow",
    theme: "Identity & Direction",
    defined: "Fixed sense of self and direction. Reliable identity. Knows who they are and where they're going.",
    undefined: "Chameleon-like identity that adapts. Can get lost in others' direction. Wisdom: Place and people matter - be in the right environment.",
    biological: "Liver & Blood",
  },
  {
    name: "Heart (Ego)",
    location: "Right of Center",
    color: "red",
    theme: "Willpower & Value",
    defined: "Consistent willpower and drive. Can make and keep promises. Natural sense of self-worth.",
    undefined: "Amplifies others' willpower. Can feel pressure to prove worth. Wisdom: Nothing to prove - your value is inherent.",
    biological: "Heart, Stomach, Gallbladder",
  },
  {
    name: "Solar Plexus",
    location: "Right Side",
    color: "orange",
    theme: "Emotions & Feeling",
    defined: "Emotional authority. Waves of emotions are natural. Need to wait for clarity through the wave.",
    undefined: "Amplifies others' emotions. Can avoid confrontation. Wisdom: Not all emotions are yours - don't make decisions based on others' feelings.",
    biological: "Kidneys, Pancreas, Nervous System",
  },
  {
    name: "Sacral",
    location: "Below G Center",
    color: "red",
    theme: "Life Force & Work",
    defined: "Sustainable work energy. Sacral response (gut feeling) guides decisions. Generators and MGs have this.",
    undefined: "No consistent life force energy. Can overwork to keep up. Wisdom: You're not here to work like a Generator - rest is essential.",
    biological: "Ovaries, Testes",
  },
  {
    name: "Spleen",
    location: "Left Side",
    color: "brown",
    theme: "Intuition & Survival",
    defined: "Consistent intuition and immune response. Spontaneous knowing. Splenic authority speaks once.",
    undefined: "Amplifies others' fears and intuition. Can hold onto what's unhealthy. Wisdom: Let go of what's no longer serving you.",
    biological: "Spleen, Lymphatic System",
  },
  {
    name: "Root",
    location: "Bottom",
    color: "brown",
    theme: "Pressure & Adrenaline",
    defined: "Consistent way of handling stress. Natural drive and pressure. Can work under stress.",
    undefined: "Amplifies others' stress. Can feel rushed when there's no rush. Wisdom: You don't have to act on the pressure.",
    biological: "Adrenal Glands",
  },
];

export const keyGates = [
  { number: 1, name: "Self-Expression", center: "G", theme: "Creative self-expression, individuality" },
  { number: 2, name: "The Receptive", center: "G", theme: "Direction, driver of vehicle of life" },
  { number: 7, name: "The Army", center: "G", theme: "Leadership, direction, role of the self" },
  { number: 10, name: "Treading", center: "G", theme: "Self-love, behavior, awakening" },
  { number: 13, name: "The Listener", center: "G", theme: "Listener, keeper of secrets" },
  { number: 20, name: "Contemplation", center: "Throat", theme: "Presence, the now, contemplation" },
  { number: 34, name: "Power", center: "Sacral", theme: "Pure power, available energy" },
  { number: 43, name: "Breakthrough", center: "Ajna", theme: "Insight, breakthrough, unique knowing" },
  { number: 46, name: "Love of the Body", center: "G", theme: "Serendipity, right place right time" },
  { number: 51, name: "Shock", center: "Heart", theme: "Initiative, shock, competitive spirit" },
  { number: 57, name: "The Gentle", center: "Spleen", theme: "Intuitive clarity, penetrating insight" },
  { number: 62, name: "Details", center: "Throat", theme: "Expressing details, naming things" },
  { number: 64, name: "Before Completion", center: "Head", theme: "Confusion to clarity, mental pressure" },
];

export const getTypeColor = (color) => {
  const colors = {
    orange: "from-orange-500/10 to-amber-500/5 border-orange-500/20 text-orange-300",
    red: "from-red-500/10 to-rose-500/5 border-red-500/20 text-red-300",
    blue: "from-blue-500/10 to-cyan-500/5 border-blue-500/20 text-blue-300",
    purple: "from-purple-500/10 to-violet-500/5 border-purple-500/20 text-purple-300",
    violet: "from-violet-500/10 to-indigo-500/5 border-violet-500/20 text-violet-300",
  };
  return colors[color] || colors.blue;
};
