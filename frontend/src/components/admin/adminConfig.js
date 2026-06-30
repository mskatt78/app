// Admin form configurations for different content types
export const ELEMENTS = ["Earth", "Water", "Fire", "Air", "Spirit", "All"];
export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
export const CHAKRAS = ["Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"];

export const HEART_CATEGORIES = ["self_love", "compassion", "forgiveness", "gratitude", "connection", "healing"];
export const CREATIVE_CATEGORIES = ["visual", "writing", "movement", "nature", "meditation"];
export const SHAMANIC_CATEGORIES = ["journey", "power_animal", "ancestral", "divination", "ceremony", "shadow"];
export const ELEMENTAL_CATEGORIES = ["grounding", "emotional", "energy", "communication", "spiritual", "integration", "nature_connection", "purification", "divination", "energy_work"];

// Tab configuration
export const ADMIN_TABS = [
  { id: "yoga", label: "Yoga", group: "practices" },
  { id: "mudras", label: "Mudras", group: "practices" },
  { id: "breathwork", label: "Breathwork", group: "practices" },
  { id: "crystals", label: "Crystals", group: "tools" },
  { id: "mantras", label: "Mantras", group: "tools" },
  { id: "earth-altars", label: "Altars", group: "shamanic" },
  { id: "elemental-practices", label: "Elemental", group: "shamanic" },
  { id: "heart-practices", label: "Heart", group: "shamanic" },
  { id: "creative-processes", label: "Creative", group: "shamanic" },
  { id: "shamanic-practices", label: "Shamanic", group: "shamanic" },
  { id: "workshops", label: "Workshops", group: "events" },
  { id: "events", label: "Events", group: "events" },
  { id: "courses", label: "Courses", group: "events" },
  { id: "retreats", label: "Retreats", group: "commerce" },
  { id: "books", label: "Books", group: "commerce" },
  { id: "custom-oracle-cards", label: "Oracle", group: "commerce" },
  { id: "live-sessions", label: "Live", group: "commerce" },
  { id: "preset-rituals", label: "Rituals", group: "tools" },
];

// API endpoint mapping
export const getEndpoint = (tab, isAdmin = false) => {
  const endpoints = {
    yoga: isAdmin ? "/admin/yoga-poses" : "/yoga/poses",
    mudras: isAdmin ? "/admin/mudras" : "/mudras",
    breathwork: isAdmin ? "/admin/breathwork" : "/breathwork/sessions",
    crystals: isAdmin ? "/admin/crystals" : "/crystals",
    mantras: isAdmin ? "/admin/mantras" : "/mantras",
    workshops: isAdmin ? "/admin/workshops" : "/workshops",
    events: isAdmin ? "/admin/events" : "/events",
    courses: isAdmin ? "/admin/courses" : "/courses",
    "earth-altars": isAdmin ? "/admin/earth-altars" : "/earth-altars",
    "elemental-practices": isAdmin ? "/admin/elemental-practices" : "/elemental-practices",
    "heart-practices": isAdmin ? "/admin/heart-practices" : "/heart-practices",
    "creative-processes": isAdmin ? "/admin/creative-processes" : "/creative-processes",
    "shamanic-practices": isAdmin ? "/admin/shamanic-practices" : "/shamanic-practices",
    retreats: isAdmin ? "/admin/retreats" : "/admin/retreats",
    books: isAdmin ? "/admin/books" : "/admin/books",
    "custom-oracle-cards": isAdmin ? "/admin/custom-oracle-cards" : "/admin/custom-oracle-cards",
    "live-sessions": isAdmin ? "/admin/live-sessions" : "/admin/live-sessions",
    "preset-rituals": isAdmin ? "/admin/preset-rituals" : "/preset-rituals",
  };
  return endpoints[tab] || "/yoga/poses";
};

// Default form data for each content type
export const getDefaultFormData = (tab) => {
  const defaults = {
    yoga: {
      name: "", sanskrit_name: "", element: "Earth", description: "",
      instructions: [], benefits: [], chakras: [], duration_minutes: 3,
      difficulty: "Beginner", contraindications: [], image_url: ""
    },
    mudras: {
      name: "", sanskrit_name: "", element: "Earth", description: "",
      instructions: "", benefits: [], image_url: ""
    },
    breathwork: {
      name: "", element: "Earth", description: "", duration_minutes: 10,
      pattern: { inhale: 4, hold: 4, exhale: 4, hold_empty: 0 },
      benefits: [], frequency: "", best_time: "", instructions: ""
    },
    crystals: {
      name: "", element: "Earth", chakras: [], properties: [],
      description: "", image_url: ""
    },
    mantras: {
      name: "", sanskrit: "", translation: "", element: "Spirit",
      chakra: "", benefits: [], audio_url: "", duration_seconds: 10, repetitions: 108
    },
    workshops: {
      title: "", description: "", instructor: "", date: "",
      duration_minutes: 60, location: "", max_participants: 20,
      price: 0, image_url: "", topics: [], requirements: []
    },
    events: {
      title: "", description: "", date: "", time: "", location: "",
      event_type: "workshop", price: 0, image_url: "", capacity: 50
    },
    courses: {
      title: "", description: "", instructor: "", duration_weeks: 4,
      modules: [], price: 0, image_url: "", level: "Beginner"
    },
    "earth-altars": {
      name: "", element: "Earth", description: "", purpose: "",
      items: [], setup_ritual: [], activation_prayer: "", best_time: "", image_url: ""
    },
    "elemental-practices": {
      name: "", element: "Earth", category: "grounding", description: "",
      duration_minutes: 20, difficulty: "Beginner", benefits: [],
      instructions: [], best_time: "", moon_phase: "", caution: "", image_url: ""
    },
    "heart-practices": {
      name: "", category: "self_love", description: "", tradition: "",
      benefits: [], steps: [], affirmation: "", duration_minutes: 20, image_url: ""
    },
    "creative-processes": {
      name: "", category: "visual", description: "", tradition: "",
      materials: [], process_steps: [], spiritual_purpose: "",
      duration_minutes: 30, image_url: ""
    },
    "shamanic-practices": {
      name: "", category: "journey", description: "", tradition: "",
      preparation: "", journey_steps: [], safety_notes: "", closing_prayer: "",
      duration_minutes: 30, requires_unlock: false, image_url: ""
    },
    retreats: {
      name: "", description: "", location: "", start_date: "", end_date: "",
      price: 0, currency: "USD", capacity: 20, image_url: "", features: [], includes: [], element: "Spirit",
      retreat_mode: "physical", online_session_url: "", instagram_url: "", youtube_url: "", facebook_url: "", tiktok_url: "", website_url: ""
    },
    books: {
      title: "", author: "", description: "", price: 0, currency: "USD",
      image_url: "", purchase_url: "", chapters: [], testimonials: []
    },
    "custom-oracle-cards": {
      name: "", element: "Spirit", meaning: "", reversed_meaning: "",
      image_url: "", keywords: []
    },
    "live-sessions": {
      title: "", description: "", scheduled_at: "", duration_minutes: 60,
      platform: "zoom", join_url: "", price: 0, currency: "USD",
      max_participants: null, element: "Spirit"
    },
    "preset-rituals": {
      name: "", description: "", element: "Spirit", image_url: "", segments: []
    }
  };
  return defaults[tab] || {};
};

// Form field configurations for each content type
export const getFormFields = (tab) => {
  const common = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "element", label: "Element", type: "select", options: ELEMENTS },
    { name: "image_url", label: "Image", type: "image" },
  ];
  
  const fields = {
    yoga: [
      { name: "name", label: "Pose Name", type: "text", required: true },
      { name: "sanskrit_name", label: "Sanskrit Name", type: "text" },
      { name: "element", label: "Element", type: "select", options: ELEMENTS },
      { name: "difficulty", label: "Difficulty", type: "select", options: DIFFICULTIES },
      { name: "description", label: "Description", type: "textarea" },
      { name: "duration_minutes", label: "Duration (min)", type: "number" },
      { name: "benefits", label: "Benefits", type: "array" },
      { name: "instructions", label: "Instructions", type: "array" },
      { name: "chakras", label: "Chakras", type: "checkbox", options: CHAKRAS },
      { name: "image_url", label: "Image", type: "image" },
    ],
    crystals: [
      { name: "name", label: "Crystal Name", type: "text", required: true },
      { name: "element", label: "Element", type: "select", options: ELEMENTS },
      { name: "description", label: "Description", type: "textarea" },
      { name: "properties", label: "Properties", type: "array" },
      { name: "chakras", label: "Chakras", type: "checkbox", options: CHAKRAS },
      { name: "image_url", label: "Image", type: "image" },
    ],
    retreats: [
      { name: "name", label: "Retreat Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "retreat_mode", label: "Retreat Mode", type: "select", options: ["physical", "online", "hybrid"] },
      { name: "online_session_url", label: "Online Session URL", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      { name: "price", label: "Price", type: "number" },
      { name: "capacity", label: "Capacity", type: "number" },
      { name: "features", label: "Features", type: "array" },
      { name: "includes", label: "Includes", type: "array" },
      { name: "instagram_url", label: "Instagram URL", type: "text" },
      { name: "youtube_url", label: "YouTube URL", type: "text" },
      { name: "facebook_url", label: "Facebook URL", type: "text" },
      { name: "tiktok_url", label: "TikTok URL", type: "text" },
      { name: "website_url", label: "Website URL", type: "text" },
      { name: "element", label: "Element", type: "select", options: ELEMENTS },
      { name: "image_url", label: "Image", type: "image" },
    ],
    books: [
      { name: "title", label: "Book Title", type: "text", required: true },
      { name: "author", label: "Author", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "price", label: "Price", type: "number" },
      { name: "purchase_url", label: "Purchase URL", type: "text" },
      { name: "image_url", label: "Cover Image", type: "image" },
    ],
    "custom-oracle-cards": [
      { name: "name", label: "Card Name", type: "text", required: true },
      { name: "element", label: "Element", type: "select", options: ELEMENTS },
      { name: "meaning", label: "Upright Meaning", type: "textarea" },
      { name: "reversed_meaning", label: "Reversed Meaning", type: "textarea" },
      { name: "keywords", label: "Keywords", type: "array" },
      { name: "image_url", label: "Card Image", type: "image" },
    ],
    "live-sessions": [
      { name: "title", label: "Session Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "scheduled_at", label: "Date & Time", type: "datetime-local" },
      { name: "duration_minutes", label: "Duration (min)", type: "number" },
      { name: "platform", label: "Platform", type: "select", options: ["zoom", "youtube", "other"] },
      { name: "join_url", label: "Join URL", type: "text" },
      { name: "price", label: "Price", type: "number" },
      { name: "max_participants", label: "Max Participants", type: "number" },
      { name: "element", label: "Element", type: "select", options: ELEMENTS },
    ],
    "preset-rituals": [
      { name: "name", label: "Ritual Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "element", label: "Element", type: "select", options: ELEMENTS },
      { name: "image_url", label: "Image", type: "image" },
    ],
  };
  
  // Use common fields as fallback
  return fields[tab] || common;
};

export default {
  ELEMENTS,
  DIFFICULTIES,
  CHAKRAS,
  ADMIN_TABS,
  getEndpoint,
  getDefaultFormData,
  getFormFields
};
