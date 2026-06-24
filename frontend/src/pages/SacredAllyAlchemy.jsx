import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Sparkles, Flame, Waves, Wind, X, Feather, Star, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { appLogger } from "../utils/logger";
import GuidedAudioButton from "../components/GuidedAudioButton";

const ALLY_FALLBACK_DATA = [
  {
    id: "ally-dragon-sovereign-flame",
    name: "Sophia Dragon Alchemy · Sovereign Flame",
    category: "dragon",
    ally_type: "dragon",
    element: "fire",
    description: "Sophia dragon medicine awakens sovereign wisdom, sacred courage, and transmutation through conscious golden fire.",
    alchemy_teachings: [
      "Power with wisdom creates benevolent leadership.",
      "Golden dragon fire transmutes fear into precise compassionate action.",
      "Sovereignty is self-mastery anchored in truth and devotion.",
    ],
    rituals: [
      "Light a gold candle and release one limiting story into the flame with breath.",
      "Place right hand on solar plexus and left hand on heart while speaking your vow three times.",
      "Complete with barefoot grounding for 7 minutes.",
    ],
    ceremonies: [
      "Sophia Flame Opening Ceremony: 9 breaths, vow invocation, and candle offering.",
      "Sovereign Boundary Ceremony: draw a golden circle around your body and state three truth-boundaries.",
      "Night Integration Ceremony: gratitude, journal insight, and one aligned action for tomorrow.",
    ],
    journal_prompts: [
      "Where is wisdom asking me to lead with more courage?",
      "What fear is ready to become sacred fuel?",
      "What boundary protects my devotion and mission?",
    ],
    affirmations: [
      "I lead with wisdom, courage, and compassion.",
      "My golden fire purifies and clarifies my path.",
      "I am safe to embody sovereign truth.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/71/Serpiente_alquimica.jpg",
    diagram_image_url: "/diagrams/dragon-alchemy-diagram.svg",
  },
  {
    id: "ally-fairy-aether-bloom",
    name: "Fairy Alchemy · Aether Bloom",
    category: "fairies",
    ally_type: "fairy",
    element: "air",
    description: "Fairy alchemy restores wonder, subtle listening, and relational harmony with land intelligence.",
    image_url: "https://images.pexels.com/photos/1028225/pexels-photo-1028225.jpeg",
    diagram_image_url: "/diagrams/fairy-alchemy-diagram.svg",
  },
  {
    id: "ally-wolf-lunar-path",
    name: "Wolf Alchemy · Lunar Path",
    category: "wolves",
    ally_type: "wolf",
    element: "moon",
    description: "Wolf alchemy refines instinct, discernment, and sacred pack dynamics.",
    image_url: "https://images.pexels.com/photos/346941/pexels-photo-346941.jpeg",
    diagram_image_url: "/diagrams/wolf-alchemy-diagram.svg",
  },
  {
    id: "ally-whale-oceanic-hymn",
    name: "Whale Alchemy · Oceanic Hymn",
    category: "whales",
    ally_type: "whale",
    element: "water",
    description: "Whale alchemy carries ancestral memory and deep coherence through sacred song lines.",
    image_url: "https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg",
    diagram_image_url: "/diagrams/whale-songline-diagram.svg",
  },
  {
    id: "ally-dolphin-joy-current",
    name: "Dolphin Alchemy · Joy Current",
    category: "dolphins",
    ally_type: "dolphin",
    element: "water",
    description: "Dolphin alchemy harmonizes joy, play, communication, and social healing.",
    image_url: "https://images.pexels.com/photos/2258696/pexels-photo-2258696.jpeg",
    diagram_image_url: "/diagrams/dolphin-alchemy-diagram.svg",
  },
  {
    id: "ally-jaguar-shadow-gold",
    name: "Jaguar Alchemy · Shadow Gold",
    category: "sacred_allies",
    ally_type: "jaguar",
    element: "earth",
    description: "Jaguar alchemy guides fearless shadow integration and energetic boundary mastery.",
    image_url: "https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg",
    diagram_image_url: "/diagrams/jaguar-alchemy-diagram.svg",
  },
  {
    id: "ally-raven-oracle-veil",
    name: "Raven Alchemy · Oracle Veil",
    category: "sacred_allies",
    ally_type: "raven",
    element: "air",
    description: "Raven alchemy activates pattern recognition and threshold wisdom.",
    image_url: "https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg",
    diagram_image_url: "/diagrams/raven-alchemy-diagram.svg",
  },
];

const SACRED_ALLY_EXPANSION_PACK = [
  {
    id: "ally-serpent-kundalini-current",
    name: "Serpent Alchemy · Kundalini Current",
    ally_type: "serpent",
    category: "sacred_allies",
    element: "spirit",
    description: "Serpent alchemy awakens embodied life-force, spinal intelligence, and sacred renewal through conscious shedding.",
    alchemy_teachings: [
      "Shedding identity layers is required for authentic rebirth.",
      "Kundalini movement asks for regulation and grounded pacing.",
      "Embodiment converts awakening into relational integrity.",
    ],
    rituals: [
      "Spinal wave breath for 12 minutes with a gentle pelvic floor release.",
      "Shedding ritual: write one outgrown identity and release it safely by fire or water.",
      "Grounding seal: knees bent, palms on lower belly, long exhales for 5 cycles.",
    ],
    ceremonies: [
      "Coiled Light Ceremony: awaken and circulate life-force through breath and intention.",
      "Sacred Shedding Ceremony: release old vows, contracts, and identities.",
      "Embodiment Seal Ceremony: anchor awakened energy into one practical life action.",
    ],
    journal_prompts: [
      "What identity is complete and ready to shed now?",
      "Where is life-force asking me to move differently?",
      "How will I protect this new energy with healthy boundaries?",
    ],
    affirmations: [
      "I shed with grace and rise in truth.",
      "My life-force is sacred, grounded, and wise.",
      "I embody renewal with integrity.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/71/Serpiente_alquimica.jpg",
    diagram_image_url: "/diagrams/dragon-spirit-current-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Ouroboros"],
  },
  {
    id: "ally-phoenix-ash-rebirth",
    name: "Phoenix Alchemy · Ash Rebirth",
    ally_type: "phoenix",
    category: "sacred_allies",
    element: "fire",
    description: "Phoenix alchemy guides total renewal, grief transmutation, and rebirth after collapse.",
    alchemy_teachings: [
      "Rebirth requires honoring endings, not bypassing them.",
      "Grief metabolized becomes clean life-force.",
      "True renewal pairs vision with disciplined action.",
    ],
    rituals: [
      "Ash-to-gold journaling: what ended, what remains, what rises.",
      "Fire breath with hand on heart and navel for 9 cycles.",
      "Dawn vow ritual: name your renewed identity and one action for today.",
    ],
    ceremonies: [
      "Ashes Ceremony: consciously grieve and release what has ended.",
      "Flame Rise Ceremony: call forward your renewed path and power.",
      "Vow of Continuity Ceremony: commit to seven days of aligned actions.",
    ],
    journal_prompts: [
      "What chapter has fully ended in me?",
      "What am I being reborn into now?",
      "Which one action proves my renewal is real?",
    ],
    affirmations: [
      "I rise renewed, clear, and devoted.",
      "My endings are gateways to truth.",
      "I carry fire with wisdom.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/71/Serpiente_alquimica.jpg",
    diagram_image_url: "/diagrams/dragon-fire-current-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Phoenix_(mythology)"],
  },
  {
    id: "ally-bear-deep-rest-guardian",
    name: "Bear Alchemy · Deep Rest Guardian",
    ally_type: "bear",
    category: "sacred_allies",
    element: "earth",
    description: "Bear alchemy restores strength through rest, boundary intelligence, and embodied protection.",
    alchemy_teachings: [
      "Rest is medicine and a strategic discipline.",
      "Boundaries preserve life-force for sacred priorities.",
      "Power matures through pacing, not force.",
    ],
    rituals: [
      "Weighted rest ritual for 12 minutes of nervous-system downshift.",
      "Boundary mapping: write yes/no commitments for this week.",
      "Grounding meal blessing before evening closure.",
    ],
    ceremonies: [
      "Den Ceremony: reclaim rest as sacred strength.",
      "Boundary Circle Ceremony: define and speak protective boundaries.",
      "Strength in Stillness Ceremony: channel power without urgency.",
    ],
    journal_prompts: [
      "Where am I exhausted from overextending?",
      "What boundary would restore my energy now?",
      "How does rested power feel in my body?",
    ],
    affirmations: [
      "My rest is sacred and non-negotiable.",
      "I protect my energy with clarity.",
      "Grounded strength lives in me.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/71/2010-kodiak-bear-1.jpg",
    diagram_image_url: "/diagrams/oak-rootedness-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Bear"],
  },
  {
    id: "ally-owl-night-vision",
    name: "Owl Alchemy · Night Vision",
    ally_type: "owl",
    category: "sacred_allies",
    element: "air",
    description: "Owl alchemy sharpens intuitive vision, pattern recognition, and truth discernment in darkness.",
    alchemy_teachings: [
      "Night vision is the ability to perceive what others miss.",
      "Silence refines intuition and symbolic literacy.",
      "Discernment protects destiny pathways.",
    ],
    rituals: [
      "Twilight silence sit for 9 minutes with soft gaze awareness.",
      "Symbol tracking: record first three signs you notice each evening.",
      "Moon breath ritual for focus and subtle listening.",
    ],
    ceremonies: [
      "Night Vision Ceremony: enter silence and ask one precise truth-question.",
      "Symbol Reading Ceremony: decode repeating omens into one practical next step.",
      "Discernment Seal Ceremony: commit to one truth-based decision.",
    ],
    journal_prompts: [
      "What truth am I finally ready to see?",
      "Which pattern keeps repeating until I respond?",
      "Where does discernment ask for action now?",
    ],
    affirmations: [
      "I see clearly in all conditions.",
      "Discernment guides my choices.",
      "My intuition is calm and precise.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Bubo_bubo_2_%28Martin_Mecnarowski%29.jpg",
    diagram_image_url: "/diagrams/raven-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Owl"],
  },
  {
    id: "ally-eagle-sky-sovereignty",
    name: "Eagle Alchemy · Sky Sovereignty",
    ally_type: "eagle",
    category: "sacred_allies",
    element: "air",
    description: "Eagle alchemy expands vision, strategic leadership, and sovereign altitude perspective.",
    alchemy_teachings: [
      "Altitude reveals strategy hidden in ground-level noise.",
      "Sovereignty means vision plus responsibility.",
      "Precision focus protects purpose from distraction.",
    ],
    rituals: [
      "Horizon-gaze breathing with expanded chest posture for 7 minutes.",
      "Strategy mapping: define your top three priorities for 30 days.",
      "Sky vow: speak your mission aloud before beginning work.",
    ],
    ceremonies: [
      "Sovereign View Ceremony: rise above noise and claim true priorities.",
      "Mission Alignment Ceremony: refine focus and remove misaligned commitments.",
      "Leadership Integrity Ceremony: pair vision with one concrete service action.",
    ],
    journal_prompts: [
      "What does the higher view reveal right now?",
      "Where am I scattering focus away from purpose?",
      "What decision aligns with sovereign leadership?",
    ],
    affirmations: [
      "I see clearly and lead wisely.",
      "My vision is focused and purposeful.",
      "I act from altitude and integrity.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Bald_Eagle_Portrait.jpg",
    diagram_image_url: "/diagrams/sirius-focus-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Eagle"],
  },
  {
    id: "ally-spider-weaver-wisdom",
    name: "Spider Alchemy · Weaver Wisdom",
    ally_type: "spider",
    category: "sacred_allies",
    element: "earth",
    description: "Spider alchemy teaches destiny weaving, relational architecture, and intentional creation.",
    alchemy_teachings: [
      "What you weave daily becomes your lived destiny.",
      "Structure and artistry belong together.",
      "Intentional patterns create resilient outcomes.",
    ],
    rituals: [
      "Thread ritual: map one life pattern you are consciously weaving this month.",
      "Sacred web reflection: identify five key relationships and their reciprocity quality.",
      "Creation sprint: 20 minutes of focused building without distraction.",
    ],
    ceremonies: [
      "Web of Destiny Ceremony: choose what to weave and what to dissolve.",
      "Reciprocity Ceremony: repair one relational thread through truthful action.",
      "Creation Integrity Ceremony: align output with soul values.",
    ],
    journal_prompts: [
      "What am I weaving repeatedly through habits?",
      "Which thread in my life needs repair?",
      "What new pattern will I weave this week?",
    ],
    affirmations: [
      "I weave my life with intention.",
      "My patterns are aligned with truth.",
      "Creation flows through focused devotion.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Argiope_aurantia_%28Garden_spider%29.jpg",
    diagram_image_url: "/diagrams/mycelium-network-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Spider"],
  },
  {
    id: "ally-panther-shadow-sovereignty",
    name: "Panther Alchemy · Shadow Sovereignty",
    ally_type: "panther",
    category: "sacred_allies",
    element: "water",
    description: "Panther alchemy guides elegant shadow power, stealth discernment, and embodied courage.",
    alchemy_teachings: [
      "Shadow power becomes medicine through conscious accountability.",
      "Stealth is timing wisdom, not fear.",
      "Elegant strength protects your sacred mission.",
    ],
    rituals: [
      "Night path walk in mindful silence for 10 minutes.",
      "Shadow naming ritual: identify one hidden fear and one courageous response.",
      "Somatic boundary practice with low stance and grounded breath.",
    ],
    ceremonies: [
      "Shadow Sovereignty Ceremony: reclaim denied strength with compassion.",
      "Timing Wisdom Ceremony: choose right action at the right moment.",
      "Elegant Power Ceremony: embody calm authority in one challenging interaction.",
    ],
    journal_prompts: [
      "What hidden strength am I ready to reclaim?",
      "Where does timing matter more than speed?",
      "How can I embody power without hardening?",
    ],
    affirmations: [
      "My shadow integrates into clean power.",
      "I move with calm, precise authority.",
      "Courage lives in my body now.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Black_panther.jpg",
    diagram_image_url: "/diagrams/jaguar-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Black_panther"],
  },
  {
    id: "ally-deer-heart-grace",
    name: "Deer Alchemy · Heart Grace",
    ally_type: "deer",
    category: "sacred_allies",
    element: "earth",
    description: "Deer alchemy restores gentle strength, heart coherence, and responsive grace under pressure.",
    alchemy_teachings: [
      "Gentleness can hold extraordinary strength.",
      "Grace is embodied responsiveness, not passivity.",
      "Heart coherence improves choices in conflict.",
    ],
    rituals: [
      "Heart coherence breath for 7 minutes with hand on chest.",
      "Grace under pressure ritual: rehearse one difficult conversation slowly.",
      "Nature attunement walk for relational softness and clarity.",
    ],
    ceremonies: [
      "Heart Grace Ceremony: soften armor without losing boundaries.",
      "Compassionate Strength Ceremony: pair kindness with clear truth.",
      "Relational Repair Ceremony: complete one act of clean restoration.",
    ],
    journal_prompts: [
      "Where does my heart need more gentleness right now?",
      "How can I stay kind and clear in conflict?",
      "What grace-filled action will I take today?",
    ],
    affirmations: [
      "My heart is gentle and strong.",
      "I respond with grace and clarity.",
      "Compassion and boundaries coexist in me.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/5/54/Red_deer_stag_2009_denmark.jpg",
    diagram_image_url: "/diagrams/chamuel-heart-peace-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Deer"],
  },
];

const VISUAL_OVERRIDES_BY_ID = {
  "ally-dragon-sovereign-flame": {
    name: "Sophia Dragon Alchemy · Sovereign Flame",
    description: "Sophia dragon medicine awakens sovereign wisdom, sacred courage, and transmutation through the Cosmic Womb of conscious golden fire.",
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/212855693ad33b5cc2d9428fc7c4f110428011f892af99f0e690eeecd787374d.png",
    diagram_image_url: "/diagrams/dragon-alchemy-diagram.svg",
    ceremonies: [
      "Sophia Flame Opening Ceremony: 9 breaths, vow invocation, and candle offering.",
      "Sovereign Boundary Ceremony: draw a golden circle around your body and state three truth-boundaries.",
      "Night Integration Ceremony: gratitude, journal insight, and one aligned action for tomorrow.",
    ],
    source_references: [
      "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/212855693ad33b5cc2d9428fc7c4f110428011f892af99f0e690eeecd787374d.png",
      "https://en.wikipedia.org/wiki/Sophia_(Gnosticism)",
      "https://en.wikipedia.org/wiki/Dragon",
    ],
  },
  "ally-fairy-aether-bloom": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Falero_Luis_Ricardo_Lily_Fairy_1888.jpg",
    diagram_image_url: "/diagrams/fairy-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Fairy"],
  },
  "ally-wolf-lunar-path": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/6/68/Eurasian_wolf_2.jpg",
    diagram_image_url: "/diagrams/wolf-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Wolf"],
  },
  "ally-whale-oceanic-hymn": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/6/61/Humpback_Whale_underwater_shot.jpg",
    diagram_image_url: "/diagrams/whale-songline-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Humpback_whale"],
  },
  "ally-dolphin-joy-current": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Tursiops_truncatus_01.jpg",
    diagram_image_url: "/diagrams/dolphin-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Dolphin"],
  },
  "ally-jaguar-shadow-gold": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg",
    diagram_image_url: "/diagrams/jaguar-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Jaguar"],
  },
  "ally-raven-oracle-veil": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Corvus_corax.jpg",
    diagram_image_url: "/diagrams/raven-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Common_raven"],
  },
  "angel-metatron-cube-alchemy": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/MetatronInIslamicArts.jpg",
    diagram_image_url: "/diagrams/metatron-cube-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Metatron"],
  },
  "angel-michael-blue-flame": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/GuidoReni_MichaelDefeatsSatan.jpg",
    diagram_image_url: "/diagrams/michael-shield-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Michael_(archangel)"],
  },
  "angel-raphael-emerald-ray": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/9/97/Saint_Raphael.JPG",
    diagram_image_url: "/diagrams/raphael-healing-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Raphael_(archangel)"],
  },
  "angel-gabriel-silver-stream": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Ghent_Altarpiece_-_Angel_of_the_Annunciation.jpg",
    diagram_image_url: "/diagrams/gabriel-communication-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Gabriel"],
  },
  "ally-dragon-fire-phoenix-current": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Chinese_dragon_asset_heraldry.svg/960px-Chinese_dragon_asset_heraldry.svg.png",
    diagram_image_url: "/diagrams/dragon-fire-current-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Chinese_dragon"],
  },
  "ally-dragon-water-lunar-current": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Chinese_dragon_asset_heraldry.svg/960px-Chinese_dragon_asset_heraldry.svg.png",
    diagram_image_url: "/diagrams/dragon-water-current-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Chinese_dragon"],
  },
  "ally-dragon-air-feathered-current": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Quetzalc%C3%B3atl_como_la_serpiente_emplumada_y_el_dios_del_viento_Eh%C3%A9catl%2C_en_el_folio_19.jpg",
    diagram_image_url: "/diagrams/dragon-air-current-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Quetzalcoatl"],
  },
  "ally-dragon-earth-root-current": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f5/202306_Varanus_komodoensis.jpg",
    diagram_image_url: "/diagrams/dragon-earth-current-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Komodo_dragon"],
  },
  "ally-dragon-spirit-aether-current": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/71/Serpiente_alquimica.jpg",
    diagram_image_url: "/diagrams/dragon-spirit-current-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Ouroboros"],
  },
  "ally-sophia-wisdom-stream": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/4/47/Ecclesia_Gnostica_Holy_Sophia_Statue.png",
    diagram_image_url: "/diagrams/sophia-wisdom-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Sophia_(Gnosticism)"],
  },
  "ally-ascended-master-st-germain": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Count_of_St_Germain.jpg",
    diagram_image_url: "/diagrams/st-germain-violet-flame-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Count_of_St._Germain"],
  },
  "ally-ascended-master-thoth": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Thoth.svg/500px-Thoth.svg.png",
    diagram_image_url: "/diagrams/thoth-language-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Thoth"],
  },
  "ally-earth-oak-elder": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/a/af/Quercus_robur.jpg",
    diagram_image_url: "/diagrams/oak-rootedness-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Quercus_robur"],
  },
  "ally-earth-honeybee-alliance": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Apis_mellifera_Western_honey_bee.jpg",
    diagram_image_url: "/diagrams/honeybee-pollination-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Western_honey_bee"],
  },
  "ally-earth-mycelium-network": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Mushroom%27s_roots_%28myc%C3%A9lium%29.jpg",
    diagram_image_url: "/diagrams/mycelium-network-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Mycelium"],
  },
  "ally-earth-redwood-guardian": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/0/03/US_199_Redwood_Highway.jpg",
    diagram_image_url: "/diagrams/redwood-axis-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Sequoia_sempervirens"],
  },
  "ally-galactic-pleiades-harmonic": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/3840px-Pleiades_large.jpg",
    diagram_image_url: "/diagrams/pleiades-harmonic-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Pleiades"],
  },
  "ally-galactic-sirius-focus": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Canis_Major_constellation_map.svg/250px-Canis_Major_constellation_map.svg.png",
    diagram_image_url: "/diagrams/sirius-focus-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Sirius"],
  },
  "ally-galactic-andromeda-perspective": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Andromeda_Galaxy_2025.png/3840px-Andromeda_Galaxy_2025.png",
    diagram_image_url: "/diagrams/andromeda-perspective-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Andromeda_Galaxy"],
  },
  "ally-galactic-orion-creation-field": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg/3840px-Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg",
    diagram_image_url: "/diagrams/orion-creation-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Orion_Nebula"],
  },
  "angel-uriel-golden-wisdom": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/4/43/St_Uriel%2C_St_John%27s_Church%2C_Warminster%2C_Wiltshire.jpg",
    diagram_image_url: "/diagrams/uriel-wisdom-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Uriel"],
  },
  "angel-zadkiel-mercy-violet": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Sanctus_Zadkiel.jpg",
    diagram_image_url: "/diagrams/zadkiel-mercy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Zadkiel"],
  },
  "angel-chamuel-heart-peace": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Sanctus_Chamuel.jpg",
    diagram_image_url: "/diagrams/chamuel-heart-peace-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Camael"],
  },
  "angel-jophiel-illumination": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Sanctus_Jophiel.jpg",
    diagram_image_url: "/diagrams/jophiel-illumination-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Jophiel"],
  },
};

const WITH_DEFAULT_FIELDS = [
  "alchemy_teachings",
  "rituals",
  "ceremonies",
  "journal_prompts",
  "affirmations",
];

const GENERIC_ALLY_FALLBACK_IMAGE = "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/212855693ad33b5cc2d9428fc7c4f110428011f892af99f0e690eeecd787374d.png";

const ALLY_IMAGE_OVERRIDES = {
  "ally-serpent-kundalini-current": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/027083978eb967793f95c35ed9cf46b8d0b989de6694b151524bc5a0f565bc45.png",
  "ally-phoenix-ash-rebirth": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/e0ead193f467e510758fee333a84855aa25be6db7ff07a0be5dbc0eefa15ff29.png",
  "ally-bear-deep-rest-guardian": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/10c66a24adc9f159565382e888997cf75b6ca0e5ee5aa19b9013bc513d86e687.png",
  "ally-owl-night-vision": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/3fd2473855e7e312eed4f9b73700b45f2d375c91fdbb2ee52f2e1b23965014a5.png",
  "ally-eagle-sky-sovereignty": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/1867f33385f0d816cbebea73594f41323bf578ddaf8756bad9e26ffd2994b915.png",
  "ally-spider-weaver-wisdom": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/629aec2415ffde9a3fbdda424c5c5fd774221615c4dd2e60e9e52f66ab245069.png",
  "ally-panther-shadow-sovereignty": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/9716088cb8c859f32181382b17097b273f265ad7295fe1a5642d556be95fa97f.png",
  "ally-deer-heart-grace": "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/8aa1701b02d3cca8cca503661ca20e7e4bd2c17450782d0a3aabf6d0b0a58ad8.png",
};

const ALL_SACRED_ALLY_FALLBACK = [...ALLY_FALLBACK_DATA, ...SACRED_ALLY_EXPANSION_PACK];
const FALLBACK_BY_ID = Object.fromEntries((ALL_SACRED_ALLY_FALLBACK || []).map((item) => [item.id, item]));

const mergeAllyCompanionPack = (items) => {
  const incoming = Array.isArray(items) ? items : [];
  const byId = new Map(incoming.map((item) => [item?.id, item]));
  SACRED_ALLY_EXPANSION_PACK.forEach((entry) => {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  });
  return Array.from(byId.values());
};

const withVisualOverrides = (items) =>
  (items || []).map((item) => {
    const fallback = (item && FALLBACK_BY_ID[item.id]) || {};
    const merged = {
      ...fallback,
      ...item,
      ...((item && VISUAL_OVERRIDES_BY_ID[item.id]) || {}),
    };

    WITH_DEFAULT_FIELDS.forEach((field) => {
      if (!Array.isArray(merged[field]) || merged[field].length === 0) {
        const fallbackValue = fallback[field];
        if (Array.isArray(fallbackValue) && fallbackValue.length > 0) {
          merged[field] = fallbackValue;
        }
      }
    });

    merged.image_url = ALLY_IMAGE_OVERRIDES[merged.id] || merged.image_url || GENERIC_ALLY_FALLBACK_IMAGE;

    return merged;
  });

const buildEmbodimentPractices = (item) => {
  const allyName = String(item?.name || "this ally").trim();
  const element = String(item?.element || "spirit").toLowerCase();

  return [
    `Somatic Grounding (7 min): stand with feet rooted hip-width apart, soften knees, and breathe into ${element} awareness while naming where ${allyName} is felt in your body.`,
    "Breath-Movement Cycle (9 min): 4-count inhale, 6-count exhale with gentle spinal undulation; pause every 90 seconds to track sensation changes and adjust intensity.",
    "Embodied Voice (5 min): speak your core ritual line aloud on exhale, then walk slowly for one minute integrating tone, posture, and intention.",
    "Nervous System Seal (4 min): hand on heart + solar plexus, long exhale until jaw/shoulders release; name one practical boundary or action for today.",
  ];
};

const buildEmbodimentMilestones = (item) => [
  `24h checkpoint: complete one visible action that proves ${item?.name || "this ally"} is embodied (conversation, boundary, or task).`,
  "72h checkpoint: repeat breath-movement cycle and journal what changed in your emotional regulation.",
  "7-day checkpoint: track one repeated behavior shift and one relationship shift from your practice.",
];

const firstLine = (value, fallback = "") => {
  if (Array.isArray(value)) {
    const found = value.find((item) => String(item || "").trim());
    return found ? String(found).trim() : fallback;
  }
  const text = String(value || "").trim();
  return text || fallback;
};

const deriveCeremonies = (item) => {
  if (Array.isArray(item?.ceremonies) && item.ceremonies.length > 0) {
    return item.ceremonies;
  }
  const ritualLines = Array.isArray(item?.practical_rituals)
    ? item.practical_rituals
    : Array.isArray(item?.rituals)
      ? item.rituals
      : [];

  return ritualLines.slice(0, 3).map((line, index) => `Ceremony ${index + 1}: ${line}`);
};

const deepLine = (sectionTitle, baseText, index) => {
  const text = String(baseText || "").trim();
  if (!text) return "";

  if (sectionTitle.toLowerCase().includes("ritual")) {
    return `Somatic anchor ${index + 1}: Slow your breath for 7 cycles, embody this line in your body, then complete one grounded action before moving on.`;
  }
  if (sectionTitle.toLowerCase().includes("ceremon")) {
    return `Ceremonial descent ${index + 1}: speak this intention aloud, pause in silence for 60 seconds, then seal it through touch at heart and solar plexus.`;
  }
  if (sectionTitle.toLowerCase().includes("journal")) {
    return `Integration journaling ${index + 1}: write without editing for 9 minutes, then underline one actionable truth to complete today.`;
  }
  if (sectionTitle.toLowerCase().includes("affirmation")) {
    return `Embodiment repetition ${index + 1}: repeat slowly on breath (inhale/hold/exhale), then walk one minute while feeling it become lived reality.`;
  }
  return `Transformational inquiry ${index + 1}: contemplate this teaching, name where it lives in your life now, and define one practical shift before nightfall.`;
};

const buildMasterHealingProtocol = (item) => {
  const rituals = Array.isArray(item?.practical_rituals) && item.practical_rituals.length > 0
    ? item.practical_rituals
    : Array.isArray(item?.rituals)
      ? item.rituals
      : [];
  const ceremonies = deriveCeremonies(item);
  const teachings = Array.isArray(item?.alchemy_teachings) ? item.alchemy_teachings : [];
  const prompts = Array.isArray(item?.journal_prompts) ? item.journal_prompts : [];

  return [
    {
      phase_id: "preparation",
      title: "Phase 1 · Preparation & Nervous System Safety",
      duration: "8-12 min",
      steps: [
        `Opening Invocation: ${item?.description || "I enter this work with clarity, consent, and compassion."}`,
        `Set body safety: orient to five stable points in your environment and lengthen the exhale for 7 rounds.`,
        `Name today's healing intention in one sentence and speak it aloud three times.`,
      ],
    },
    {
      phase_id: "descent",
      title: "Phase 2 · Ritual Descent",
      duration: "15-25 min",
      steps: [
        rituals[0] || "Begin with one grounding ritual and move slowly through each body signal.",
        rituals[1] || "Track sensations and pause whenever activation rises beyond your capacity.",
        rituals[2] || "Seal the descent by placing hand on heart and naming what softened.",
      ],
    },
    {
      phase_id: "embodiment",
      title: "Phase 3 · Embodiment Practice",
      duration: "20-30 min",
      steps: buildEmbodimentPractices(item),
    },
    {
      phase_id: "transmutation",
      title: "Phase 4 · Ceremonial Transmutation",
      duration: "18-30 min",
      steps: [
        ceremonies[0] || "Enter the first ceremony with reverence and complete focus.",
        ceremonies[1] || "Move one limiting pattern into flame, breath, or water as symbolic release.",
        ceremonies[2] || "Close with a vow that converts insight into a visible action.",
      ],
    },
    {
      phase_id: "integration",
      title: "Phase 5 · Integration Timeline",
      duration: "3 days",
      steps: [
        teachings[0] || "Apply one alchemy teaching in your next conversation or boundary.",
        prompts[0] || "Journal one truth that emerged and one behavior you will change today.",
        ...buildEmbodimentMilestones(item),
      ],
    },
  ];
};

const handleImageFallback = (event, allyId) => {
  const fallbackImage = ALLY_IMAGE_OVERRIDES[allyId] || GENERIC_ALLY_FALLBACK_IMAGE;
  if (event.currentTarget?.src !== fallbackImage) {
    event.currentTarget.src = fallbackImage;
  }
};

const FILTERS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "dragon", label: "Dragon", icon: Flame },
  { id: "fairies", label: "Fairies", icon: Wind },
  { id: "wolves", label: "Wolves", icon: Feather },
  { id: "whales", label: "Whales", icon: Waves },
  { id: "dolphins", label: "Dolphins", icon: Star },
  { id: "sacred_allies", label: "Other Sacred Allies", icon: Sparkles },
];

const SectionList = ({ title, icon: Icon, items, testId }) => (
  <div className="space-y-2" data-testid={testId}>
    <h4 className="text-sm font-medium flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary" /> {title}
    </h4>
    <ul className="space-y-2">
      {items?.map((item, idx) => (
        <li key={`${title}-${idx}-${String(item).slice(0, 20)}`} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </div>
          <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed" data-testid={`${testId}-deep-line-${idx}`}>
            {deepLine(title, item, idx)}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

export default function SacredAllyAlchemy({ api }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allyFilter, setAllyFilter] = useState("all");
  const [allies, setAllies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [dailyRecommendation, setDailyRecommendation] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [recommendMood, setRecommendMood] = useState("balanced");
  const [recommendIntention, setRecommendIntention] = useState("clarity");
  const [recommendMoonPhase, setRecommendMoonPhase] = useState("full moon");
  const [showPracticeTools, setShowPracticeTools] = useState(false);
  const [roadmapExpanded, setRoadmapExpanded] = useState(false);

  const ROADMAP_PHASES = [
    {
      id: "p0",
      title: "P0 — Live Now",
      bullets: [
        "Sacred Ally full-depth entries",
        "Whale Song Lines module",
        "Admin editable collections",
      ],
    },
    {
      id: "p1",
      title: "P1 — Engagement Upgrade",
      bullets: [
        "Guided ally audio journeys",
        "21-day pathways",
        "Personalized daily ally recommendation",
      ],
    },
    {
      id: "p2",
      title: "P2 — Premium Expansion",
      bullets: [
        "Compare two ally pathways",
        "Facilitator session mode",
        "Paid advanced ceremony packs",
      ],
    },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const alliesRes = await api.get("/sacred-ally-alchemy");
        const [journeyRes, pathwayRes] = await Promise.all([
          api.get("/sacred-ally-audio-journeys"),
          api.get("/sacred-ally-pathways"),
        ]);
        const allyDataBase = Array.isArray(alliesRes.data) && alliesRes.data.length > 0 ? alliesRes.data : ALLY_FALLBACK_DATA;
        const allyData = mergeAllyCompanionPack(allyDataBase);
        setAllies(withVisualOverrides(allyData));
        setJourneys(Array.isArray(journeyRes.data) ? journeyRes.data : []);
        setPathways(Array.isArray(pathwayRes.data) ? pathwayRes.data : []);
      } catch (error) {
        appLogger.error("Failed loading Sacred Ally Alchemy", error);
        setAllies(withVisualOverrides(mergeAllyCompanionPack(ALLY_FALLBACK_DATA)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const filteredAllies = useMemo(() => {
    const items = allyFilter === "all"
      ? allies
      : allies.filter((item) => String(item.category || "").toLowerCase() === allyFilter);

    const FEATURED_MAIN_DRAGON_ID = "ally-dragon-sovereign-flame";
    return [...items].sort((a, b) => {
      if (a?.id === FEATURED_MAIN_DRAGON_ID && b?.id !== FEATURED_MAIN_DRAGON_ID) return -1;
      if (b?.id === FEATURED_MAIN_DRAGON_ID && a?.id !== FEATURED_MAIN_DRAGON_ID) return 1;
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
  }, [allies, allyFilter]);

  const cards = filteredAllies;

  const requestDailyRecommendation = async () => {
    setDailyLoading(true);
    try {
      const recentIds = [selected?.id, dailyRecommendation?.recommended_ally?.id]
        .filter(Boolean);

      const response = await api.post("/sacred-ally/daily-recommendation", {
        mood: recommendMood,
        moon_phase: recommendMoonPhase,
        intention: recommendIntention,
        recent_ids: recentIds,
      });
      setDailyRecommendation(response.data || null);
    } catch (error) {
      appLogger.error("Daily ally recommendation failed", error);
    } finally {
      setDailyLoading(false);
    }
  };

  const selectedJourney = useMemo(
    () => journeys.find((entry) => entry.ally_id === selected?.id),
    [journeys, selected?.id]
  );

  const selectedPathway = useMemo(
    () => pathways.find((entry) => entry.ally_id === selected?.id),
    [pathways, selected?.id]
  );

  return (
    <div className="min-h-screen bg-background" data-testid="sacred-ally-alchemy-page">
      <header className="border-b border-white/10 bg-card/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/menu")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="sacred-ally-back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">Sacred Temple</p>
            <h1 className="text-xl sm:text-2xl font-serif">Sacred <span className="italic text-primary">Allies</span> Alchemy</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/angelic-alchemy")}
            className="text-cyan-200"
            data-testid="sacred-allies-open-angelic-section"
          >
            Open Archangels
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-900/20 via-background to-amber-900/20 p-5" data-testid="sacred-ally-hero-copy">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Work deeply with Dragon Alchemy, Fairies, Wolves, Whales with Song Lines, Dolphins, and expanded Sacred Allies. Archangelic work now lives in its own dedicated section.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" data-testid="sacred-ally-filters">
          {FILTERS.map((item) => {
            const Icon = item.icon;
            const active = allyFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAllyFilter(item.id)}
                data-testid={`sacred-ally-filter-${item.id}`}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-amber-500/15 border-amber-500/35 text-amber-200"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {item.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="h-56 rounded-2xl border border-white/10 bg-card/40 animate-pulse" data-testid="sacred-ally-loading" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="sacred-ally-grid">
            {cards.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="text-left rounded-2xl border border-white/10 bg-card/50 hover:bg-card/70 transition-all overflow-hidden"
                data-testid={`sacred-ally-card-${item.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className={`w-full h-full ${item.id === "ally-dragon-sovereign-flame" ? "object-contain bg-black/35" : "object-cover"}`}
                    data-testid={`sacred-ally-card-image-${item.id}`}
                    onError={(event) => handleImageFallback(event, item.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <p className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full border border-white/20 bg-black/40 text-white/85" data-testid={`sacred-ally-card-category-${item.id}`}>
                    {item.category || item.ally_type}
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-serif" data-testid={`sacred-ally-card-title-${item.id}`}>{item.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3" data-testid={`sacred-ally-card-description-${item.id}`}>
                    {item.description}
                  </p>
                  <div className="space-y-1.5" data-testid={`sacred-ally-card-practice-preview-${item.id}`}>
                    <p className="text-[11px] text-amber-200/90 line-clamp-1" data-testid={`sacred-ally-card-alchemy-preview-${item.id}`}>
                      ✦ Alchemy: {firstLine(item.alchemy_teachings, "Wisdom-led transmutation and sovereign embodiment.")}
                    </p>
                    <p className="text-[11px] text-cyan-200/90 line-clamp-1" data-testid={`sacred-ally-card-ritual-preview-${item.id}`}>
                      🔥 Ritual: {firstLine(item.practical_rituals || item.rituals, "Opening breath ritual and grounding integration.")}
                    </p>
                    <p className="text-[11px] text-fuchsia-200/90 line-clamp-1" data-testid={`sacred-ally-card-ceremony-preview-${item.id}`}>
                      🜂 Ceremony: {firstLine(deriveCeremonies(item), "Invoke, embody, and seal your daily practice.")}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-card/40 p-4" data-testid="sacred-ally-tools-toggle-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Personalized Practice Tools</p>
              <p className="text-xs text-muted-foreground">Optional: recommendations, roadmap, and planning tools</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPracticeTools((prev) => !prev)}
              data-testid="sacred-ally-tools-toggle-button"
            >
              {showPracticeTools ? "Hide Tools" : "Show Tools"}
            </Button>
          </div>
        </div>

        {showPracticeTools && (
          <>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900/20 via-background to-cyan-900/20 p-5" data-testid="sacred-ally-daily-recommendation-card">
              <h2 className="text-base font-serif mb-3">What to Practice Today</h2>
              <div className="grid sm:grid-cols-4 gap-2 mb-3">
                <input
                  value={recommendMood}
                  onChange={(e) => setRecommendMood(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  placeholder="mood (e.g. anxious)"
                  data-testid="sacred-ally-recommend-mood-input"
                />
                <input
                  value={recommendMoonPhase}
                  onChange={(e) => setRecommendMoonPhase(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  placeholder="moon phase"
                  data-testid="sacred-ally-recommend-moon-input"
                />
                <input
                  value={recommendIntention}
                  onChange={(e) => setRecommendIntention(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  placeholder="intention"
                  data-testid="sacred-ally-recommend-intention-input"
                />
                <Button
                  onClick={requestDailyRecommendation}
                  disabled={dailyLoading}
                  data-testid="sacred-ally-recommend-button"
                >
                  {dailyLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Finding...</> : "Recommend"}
                </Button>
              </div>

              {dailyRecommendation?.recommended_ally && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="sacred-ally-recommendation-result">
                  <p className="text-xs text-muted-foreground">Recommended Ally</p>
                  <p className="text-sm font-medium text-cyan-200">{dailyRecommendation.recommended_ally.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{dailyRecommendation.recommended_ally.description}</p>
                  {dailyRecommendation.recommended_journey?.title && (
                    <p className="text-xs mt-2 text-amber-200">Journey: {dailyRecommendation.recommended_journey.title}</p>
                  )}
                  {dailyRecommendation.recommended_pathway?.title && (
                    <p className="text-xs text-emerald-200">Pathway: {dailyRecommendation.recommended_pathway.title}</p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/50 p-5" data-testid="sacred-ally-roadmap-card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-serif">Potential Improvements Roadmap</h2>
                <button
                  onClick={() => setRoadmapExpanded((v) => !v)}
                  className="text-xs text-primary hover:text-primary/80"
                  data-testid="sacred-ally-roadmap-toggle"
                >
                  {roadmapExpanded ? "Collapse" : "Expand"}
                </button>
              </div>
              {roadmapExpanded && (
                <div className="grid md:grid-cols-3 gap-3 mt-3" data-testid="sacred-ally-roadmap-phases">
                  {ROADMAP_PHASES.map((phase) => (
                    <div key={phase.id} className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid={`sacred-ally-roadmap-${phase.id}`}>
                      <p className="text-sm text-primary mb-2">{phase.title}</p>
                      <ul className="space-y-1">
                        {phase.bullets.map((bullet) => (
                          <li key={bullet} className="text-xs text-muted-foreground">• {bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex items-end sm:items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-background"
              data-testid="sacred-ally-detail-modal"
            >
              <div className="relative aspect-[16/7]">
                <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" onError={(event) => handleImageFallback(event, selected.id)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70"
                  data-testid="sacred-ally-modal-close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 right-12">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/90">{selected.category || selected.ally_type}</p>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white" data-testid="sacred-ally-modal-title">{selected.name}</h2>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {(selected.image_url || selected.diagram_image_url) && (
                  <div className="grid sm:grid-cols-2 gap-3" data-testid="sacred-ally-reference-visuals">
                    {selected.image_url && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                        <p className="text-[11px] text-muted-foreground mb-2">Reference Image</p>
                        <img src={selected.image_url} alt={`${selected.name} reference`} className="w-full aspect-[4/3] object-cover rounded-lg" onError={(event) => handleImageFallback(event, selected.id)} />
                      </div>
                    )}
                    {selected.diagram_image_url && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                        <p className="text-[11px] text-muted-foreground mb-2">Diagram</p>
                        <img src={selected.diagram_image_url} alt={`${selected.name} diagram`} className="w-full aspect-[4/3] object-contain rounded-lg bg-black/20" />
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm text-muted-foreground" data-testid="sacred-ally-modal-description">{selected.description}</p>

                <SectionList title="Alchemy Teachings" icon={Sparkles} items={selected.alchemy_teachings} testId="sacred-ally-alchemy-teachings" />
                <SectionList title="Ceremonies" icon={Flame} items={deriveCeremonies(selected)} testId="sacred-ally-ceremonies" />
                <SectionList title="Embodiment Practices" icon={Waves} items={buildEmbodimentPractices(selected)} testId="sacred-ally-embodiment-practices" />
                <SectionList title="Embodiment Integration Timeline" icon={Feather} items={buildEmbodimentMilestones(selected)} testId="sacred-ally-embodiment-timeline" />

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-3" data-testid="sacred-ally-master-healing-protocol">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-300" />
                    Transformational Healing Protocol (Master-Level)
                  </h3>
                  <div className="space-y-3">
                    {buildMasterHealingProtocol(selected).map((phase) => (
                      <div key={phase.phase_id} className="rounded-lg border border-white/10 bg-black/20 p-3" data-testid={`sacred-ally-master-phase-${phase.phase_id}`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-sm text-amber-100">{phase.title}</p>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">{phase.duration}</span>
                        </div>
                        <ul className="space-y-1.5">
                          {phase.steps.map((step, idx) => (
                            <li key={`${phase.phase_id}-${idx}`} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-amber-300">✦</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedJourney && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="sacred-ally-guided-journey-card">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Guided Audio Journey</p>
                    <p className="text-sm text-primary mb-2">{selectedJourney.title}</p>
                    <p className="text-xs text-muted-foreground mb-3">{selectedJourney.duration_minutes} minutes · {selectedJourney.ambient} ambience</p>
                    <GuidedAudioButton
                      api={api}
                      script={selectedJourney.script}
                      label={`Play ${selectedJourney.title}`}
                      practiceName={selectedJourney.title}
                      durationMinutes={selectedJourney.duration_minutes}
                      sourceTexts={selectedJourney.focus_tags || []}
                      steps={selectedJourney.focus_tags || []}
                      className="w-full justify-center"
                    />
                  </div>
                )}

                {selectedPathway && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="sacred-ally-pathway-card">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Pathway</p>
                    <p className="text-sm text-emerald-200 mt-1">{selectedPathway.title}</p>
                    <p className="text-xs text-muted-foreground">{selectedPathway.days} days · {selectedPathway.level}</p>
                    <p className="text-xs text-muted-foreground mt-2">{selectedPathway.theme}</p>
                    <ul className="mt-2 space-y-1" data-testid="sacred-ally-pathway-modules">
                      {(selectedPathway.modules || []).map((module) => (
                        <li key={module} className="text-xs text-muted-foreground">• {module}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.song_lines?.length > 0 && (
                  <SectionList title="Whale Song Lines" icon={Waves} items={selected.song_lines} testId="sacred-ally-song-lines" />
                )}

                {selected.song_line_practices?.length > 0 && (
                  <SectionList title="Song Line Practices" icon={Waves} items={selected.song_line_practices} testId="sacred-ally-song-line-practices" />
                )}

                <SectionList title={selected.practical_rituals ? "Practical Alchemy Rituals" : "Rituals"} icon={Flame} items={selected.practical_rituals || selected.rituals} testId="sacred-ally-rituals" />
                <SectionList title="Journal Prompts" icon={Feather} items={selected.journal_prompts} testId="sacred-ally-journal-prompts" />
                <SectionList title="Affirmations" icon={Star} items={selected.affirmations} testId="sacred-ally-affirmations" />

                <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="sacred-ally-source-integrity">
                  <p className="text-xs text-muted-foreground mb-2">Source Integrity</p>
                  {selected.content_integrity?.verified && (
                    <p className="text-xs text-cyan-300/90">Verified references ({selected.content_integrity?.references_count || 0})</p>
                  )}
                  {selected.source_references?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {selected.source_references.slice(0, 3).map((ref) => (
                        <li key={ref}>
                          <a href={ref} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-200 underline break-all" data-testid={`sacred-ally-source-ref-${selected.id}`}>
                            {ref}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button onClick={() => setSelected(null)} className="w-full" data-testid="sacred-ally-modal-close-bottom">
                  Return to Alchemy Library
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
