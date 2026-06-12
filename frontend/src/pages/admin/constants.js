export const AUDIO_COLLECTION = "audio_files";

export const COLLECTION_META = {
  account_deletion_requests: { name: "Account Deletion Requests", icon: "🗑️" },
  astrology_months: { name: "13 Moon Paths", icon: "🌕" },
  oracle_cards: { name: "Oracle Cards", icon: "🔮" },
  tarot_cards: { name: "Tarot Cards", icon: "🃏" },
  ancient_wisdom: { name: "Ancient Wisdom", icon: "📿" },
  somatic_practices: { name: "Somatic Practices", icon: "🧘" },
  sound_frequencies: { name: "Sound Frequencies", icon: "🎵" },
  crystals: { name: "Crystals", icon: "💎" },
  mantras: { name: "Mantras", icon: "🕉️" },
  meditations: { name: "Meditations", icon: "🌙" },
  mudras: { name: "Mudras", icon: "🤲" },
  runes: { name: "Runes", icon: "ᚱ" },
  sacred_guardians: { name: "Sacred Guardians", icon: "🦁" },
  retreats: { name: "Retreats", icon: "🏔️" },
  videos: { name: "Practice Videos", icon: "🎬" },
  live_sessions: { name: "Live Client Spaces", icon: "📡" },
  audio_files: { name: "Audio & Media Library", icon: "🎧" },
};

export const FIELD_CONFIG = {
  courses: ["title", "category", "level", "description", "instructor", "duration", "lessons", "format", "price", "status", "highlights", "image_url", "video_url", "registration_link", "source_type", "source_references", "review_status", "last_reviewed_at"],
  account_deletion_requests: ["email", "name", "status", "reason", "feedback", "requested_at", "updated_at"],
  astrology_months: ["name", "month_number", "season", "description", "teaching", "practice", "image_url"],
  community_posts: ["author_name", "title", "type", "content", "element", "tags", "status", "image_url"],
  live_sessions: ["title", "session_type", "status", "description", "facilitator", "scheduled_at", "duration_minutes", "price", "capacity", "embed_url", "join_url", "stream_url", "what_to_bring", "client_instructions", "image_url"],
  sacred_geometry: ["name", "element", "description", "symbolism", "how_to_draw", "image_url"],
  oracle_cards: ["name", "element", "meaning", "reversed_meaning", "image_url", "keywords"],
  tarot_cards: ["name", "arcana", "number", "upright_meaning", "reversed_meaning", "description", "image_url"],
  ancient_wisdom: ["name", "tradition", "type", "description", "teaching", "practice", "image_url", "source_type", "source_references", "review_status", "last_reviewed_at"],
  somatic_practices: ["name", "type", "element", "description", "benefits", "duration", "instructions", "image_url"],
  sound_frequencies: ["name", "frequency", "element", "category", "ambient_type", "description", "benefits", "practice", "audio_url", "image_url"],
  crystals: ["name", "color", "element", "chakra", "description", "properties", "uses", "image_url"],
  mantras: ["name", "tradition", "text", "meaning", "pronunciation", "benefits", "practice", "source_type", "source_references", "review_status", "last_reviewed_at"],
  meditations: ["name", "type", "element", "duration_minutes", "description", "visualization", "instructions", "image_url", "source_type", "source_references", "review_status", "last_reviewed_at"],
  mudras: ["name", "type", "description", "benefits", "instructions", "image_url", "source_type", "source_references", "review_status", "last_reviewed_at"],
  runes: ["name", "symbol", "phonetic", "meaning", "description", "reversed_meaning", "image_url"],
  sacred_guardians: ["name", "type", "element", "description", "gifts", "invocation", "image_url", "source_type", "source_references", "review_status", "last_reviewed_at"],
  retreats: ["title", "status", "description", "location", "start_date", "end_date", "duration_days", "max_participants", "price", "deposit", "facilitator", "highlights", "includes", "accommodation", "healing_modalities", "registration_link", "image_url"],
  videos: ["title", "category", "description", "video_url", "thumbnail_url", "duration", "practice_type"],
  breathwork_sessions: ["name", "element", "description", "duration_minutes", "frequency", "benefits", "instructions", "image_url", "source_type", "source_references", "review_status", "last_reviewed_at"],
  shamanic_practices: ["name", "category", "element", "description", "duration_minutes", "benefits", "journey_steps", "image_url", "source_type", "source_references", "review_status", "last_reviewed_at"],
  mindfulness_practices: ["name", "category", "element", "description", "duration_minutes", "benefits", "instructions", "image_url"],
  grounding_exercises: ["name", "element", "description", "duration_minutes", "benefits", "instructions", "background_audio", "image_url"],
  heart_practices: ["name", "category", "element", "description", "duration_minutes", "benefits", "steps", "affirmations", "image_url", "source_type", "source_references", "review_status", "last_reviewed_at"],
  creative_processes: ["name", "element", "description", "duration_minutes", "benefits", "materials", "instructions", "image_url"],
  elemental_practices: ["name", "element", "description", "duration_minutes", "benefits", "instructions", "image_url", "source_type", "source_references", "review_status", "last_reviewed_at"],
  yoga_poses: ["name", "sanskrit_name", "element", "category", "description", "benefits", "instructions", "image_url", "source_type", "source_references", "review_status", "last_reviewed_at"],
  energy_healing: ["name", "modality", "element", "description", "history", "how_it_works", "self_healing_guide", "benefits", "contraindications", "duration_minutes", "image_url"],
  free_form_movement: ["name", "category", "element", "description", "duration_minutes", "benefits", "guidance", "music_suggestion", "image_url"],
  chakra_cleansing: ["name", "chakra_name", "chakra_number", "color", "location", "element", "description", "blockage_signs", "cleansing_practice", "affirmations", "duration_minutes", "sound", "image_url"],
};

export const TEXTAREA_FIELDS = new Set([
  "description", "meaning", "reversed_meaning", "teaching", "practice", "instructions",
  "benefits", "uses", "text", "invocation", "gifts", "upright_meaning",
  "highlights", "includes", "accommodation", "healing_modalities",
  "content", "visualization", "journey_steps", "steps", "affirmations",
  "materials", "how_to_draw", "symbolism", "lessons",
  "self_healing_guide", "how_it_works", "history", "contraindications",
  "guidance", "blockage_signs", "cleansing_practice", "client_instructions", "what_to_bring", "source_references"
]);

export const IMAGE_FIELDS = new Set(["image_url", "thumbnail_url"]);
export const AUDIO_FIELDS = new Set(["audio_url"]);
export const VIDEO_FIELDS = new Set(["video_url", "embed_url", "join_url", "stream_url"]);