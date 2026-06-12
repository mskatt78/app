import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Leaf, Flame, Snowflake, Sun, Moon, Star, X, ChevronRight, Gem, Wind, Mountain, TreePine, Globe } from "lucide-react";

// ── Sabbat data ───────────────────────────────────────────────────────────────
const SABBATS = [
  {
    id: "samhain",
    name: "Samhain",
    image: "https://static.prod-images.emergentagent.com/jobs/1834e61f-9422-4ee4-90fd-d2458c84ed8d/images/c0aa6a8f18a1ccea2657e8b30c966cf641dba34020c725befcba1b0861cbd21f.png",
    subtitle: "The Hallows · The Celtic New Year",
    dates: { north: "Oct 31 – Nov 1", south: "Apr 30 – May 1" },
    monthIndex: { north: 9, south: 3 }, // 0-based month for proximity calc
    season: { north: "Late Autumn", south: "Late Autumn" },
    angle: 0, // position on the wheel (degrees)
    color: { text: "text-indigo-300", bg: "bg-indigo-500/15", border: "border-indigo-500/30", hex: "#818cf8" },
    element: "Spirit",
    icon: Moon,
    theme: "Ancestors · Endings · The Veil Thins · Transformation",
    description: "Samhain is the most sacred night of the wheel — when the veil between the living and the dead grows thin. The Celtic year ends and begins again in darkness. We honour those who came before, release what has died, and prepare to descend into the fertile void of winter.",
    traditions: [
      "Celtic: The Feast of the Dead — food and place settings for ancestors",
      "Mexican: Día de los Muertos — ofrendas, marigolds, sugar skulls",
      "Norse: Álfablót — offerings to the elves and land spirits",
      "Scottish: Turnip lanterns lit to ward off wandering spirits"
    ],
    ritual: {
      name: "Ancestor Feast Ceremony",
      steps: [
        "Clear and clean your table or altar before dusk falls.",
        "Set a place for each ancestor or loved one you wish to honour — their photo, an object of theirs, or simply their name written on paper.",
        "Light candles — one for each ancestor you invite. Light them slowly, naming each person as you do.",
        "Prepare food that they loved in life and place a portion at their setting.",
        "Sit at the table and speak to them. Share what has happened in your life since they left. Ask for their wisdom, their forgiveness, their blessing.",
        "After the meal, pour a libation (water, wine, or whiskey) onto the earth outside.",
        "Close the ceremony at midnight by thanking them and bidding them farewell until the next turning of the wheel."
      ]
    },
    embodiment: "Stand in darkness — outdoors if possible. Close your eyes and feel the vast presence of all life that has come before you. You stand at the end of a river of souls. You carry them forward. Breathe and let their energy move through your spine.",
    crystals: ["Obsidian", "Black Tourmaline", "Labradorite", "Smoky Quartz", "Amethyst"],
    herbs: ["Mugwort", "Rosemary", "Sage", "Wormwood", "Calendula"],
    colors: ["Black", "Deep Purple", "Burnt Orange", "Blood Red"],
  },
  {
    id: "yule",
    name: "Yule",
    image: "https://static.prod-images.emergentagent.com/jobs/1834e61f-9422-4ee4-90fd-d2458c84ed8d/images/4110dc171c9c1d123761f27f4da3235dbebc96e243aac796af35b41c7526d89b.png",
    subtitle: "Winter Solstice · Rebirth of the Light",
    dates: { north: "Dec 20–23", south: "Jun 20–23" },
    monthIndex: { north: 11, south: 5 },
    season: { north: "Midwinter", south: "Midwinter" },
    angle: 45,
    color: { text: "text-blue-200", bg: "bg-blue-500/10", border: "border-blue-400/30", hex: "#93c5fd" },
    element: "Earth",
    icon: Snowflake,
    theme: "Longest Night · Return of the Sun · Stillness · Hope",
    description: "The Winter Solstice is the longest night and the turning point — from here, the light returns. This is a time of deep rest, inner reflection, and the quiet, fierce hope of the dark. The sun-child is reborn. All of nature holds its breath.",
    traditions: [
      "Norse: Yule — burning the Yule log for 12 nights, wassailing",
      "Roman: Saturnalia — feasting, gift-giving, reversing social hierarchies",
      "Persian: Shab-e Yalda — the longest night, poetry and pomegranates",
      "Celtic: Keeping the fire burning through the night to welcome the returning sun"
    ],
    ritual: {
      name: "Longest Night Vigil",
      steps: [
        "Prepare your space at sunset on the solstice eve. Cover windows or use only candlelight.",
        "Write everything you are releasing from this year — fears, failures, relationships, patterns. Be thorough.",
        "At the darkest hour (midnight), burn these papers one by one, speaking: 'I release this to the dark. The dark transforms it to light.'",
        "Then write what you are calling in for the returning year — one word or phrase per candle.",
        "Light each new candle from the last flame of the old, saying: 'From the ashes, I call in [intention].'",
        "Stay awake as long as you are able. Watch the candles burn.",
        "At first light (or whenever you wake), step outside and greet the returning sun: 'Welcome back, great light. I am renewed.'"
      ]
    },
    embodiment: "Lie in complete darkness and stillness. Feel the earth's deep winter quiet in your bones. You are a seed in the dark ground — not dead, but dreaming. Hold this stillness until you feel warmth beginning to stir from your centre. That warmth is your own inner sun, returning.",
    crystals: ["Clear Quartz", "Blue Kyanite", "Sunstone", "Gold Calcite", "Snowflake Obsidian"],
    herbs: ["Holly", "Mistletoe", "Pine", "Frankincense", "Myrrh"],
    colors: ["Midnight Blue", "Silver", "Gold", "White", "Evergreen"],
  },
  {
    id: "imbolc",
    name: "Imbolc",
    image: "https://static.prod-images.emergentagent.com/jobs/1834e61f-9422-4ee4-90fd-d2458c84ed8d/images/c95268332ae4a98eb7cf58fbe24526fc25f6e41d1fd253e24c8921ff127fe60b.png",
    subtitle: "Candlemas · Brigid's Fire",
    dates: { north: "Feb 1–2", south: "Aug 1–2" },
    monthIndex: { north: 1, south: 7 },
    season: { north: "Early Spring", south: "Early Spring" },
    angle: 90,
    color: { text: "text-amber-200", bg: "bg-amber-500/10", border: "border-amber-400/30", hex: "#fde68a" },
    element: "Fire",
    icon: Flame,
    theme: "First Stirrings · Brigid · Creativity · Purification",
    description: "Imbolc means 'in the belly' — the first stirrings of life returning to the frozen earth. Brigid, the Celtic goddess of creativity, healing, and the forge, walks the land again, breathing warmth into the ground. Seeds beneath the snow begin to stir. The light is noticeably returning.",
    traditions: [
      "Celtic: Brigid's crosses woven from rushes, placed over doors for protection",
      "Blessing of candles for the year ahead",
      "Brigid's bed — a corn doll laid in a basket to invite her blessing",
      "Scottish: The Cailleach (winter hag) is defeated and spring begins"
    ],
    ritual: {
      name: "Brigid's Candle Blessing",
      steps: [
        "Gather all the candles you will use in the coming year.",
        "Create a Brigid's cross from rushes, straw, or paper strips.",
        "Light one central candle and dedicate it to Brigid: 'Lady of the Forge, Lady of the Flame, I invite your fire into my life this year.'",
        "Pass each candle through the flame of the central candle, charging it with intention.",
        "Speak over each one what it will be used for: healing, creativity, ceremony, home blessing.",
        "Place the Brigid's cross above your front door.",
        "Journal about what creative projects and seeds of intention you want Brigid's fire to ignite this year."
      ]
    },
    embodiment: "Place both hands in cold water or on snow if available. Feel the numbness, then the tingling as warmth returns. This is the sensation of spring returning to the earth — feel it returning to your own body too. Let it move upward from your hands into your heart. Something in you is waking.",
    crystals: ["Amethyst", "Garnet", "Moonstone", "Citrine", "Red Jasper"],
    herbs: ["Snowdrop", "Blackberry", "Angelica", "Basil", "Bay Laurel"],
    colors: ["White", "Pale Yellow", "Soft Green", "Silver"],
  },
  {
    id: "ostara",
    name: "Ostara",
    image: "https://static.prod-images.emergentagent.com/jobs/1834e61f-9422-4ee4-90fd-d2458c84ed8d/images/48ebe7e9ead519ebd4aded8d1abc0f8202d298c4a70aad88438dc4dab16df1ae.png",
    subtitle: "Spring Equinox · The Great Balance",
    dates: { north: "Mar 19–22", south: "Sep 20–23" },
    monthIndex: { north: 2, south: 8 },
    season: { north: "Spring", south: "Spring" },
    angle: 135,
    color: { text: "text-green-300", bg: "bg-green-500/10", border: "border-green-500/30", hex: "#86efac" },
    element: "Air",
    icon: Leaf,
    theme: "Balance · Renewal · Fertility · Light and Dark Equal",
    description: "At the Spring Equinox, day and night are briefly equal before the light takes hold. The earth is alive with emergence — blossoms, birdsong, the first insects. The hare runs wild in the fields. Everything is possible again. This is the season of radical renewal and the courage to begin.",
    traditions: [
      "Germanic: Ostara — eggs, hares, dawn ceremonies",
      "Persian: Nowruz (New Year) — spring cleaning, jumping over fire",
      "Japanese: Hanami — cherry blossom viewing as sacred practice",
      "Indigenous Australian: Bogong moth season — first gathering, community celebration"
    ],
    ritual: {
      name: "Seed Blessing & Planting Ceremony",
      steps: [
        "Gather seeds — both for planting and as symbols of intentions.",
        "Dye eggs with natural dyes (turmeric for yellow, beets for red, onion skin for gold). As you dye them, hold an intention for each colour.",
        "At dawn if possible, take your seeds and eggs outside.",
        "Bury an egg (or compostable offering) in the ground: 'I return to the earth what I no longer need.'",
        "Hold each seed in your palm and breathe your intention into it, then plant it: 'I plant [intention] in this soil. May it grow in the light of this new season.'",
        "Speak a prayer to the rising sun, welcoming the returning brightness.",
        "Return inside and eat a meal that includes eggs, greens, and seeds as a communion with spring."
      ]
    },
    embodiment: "Go outside at dawn and face east. Stand in a wide, open stance — arms spread, palms up. Feel the air moving through you: the last cool of night and the first warmth of sun meeting in your skin. This balance lives in you too. Breathe it into your solar plexus. You are the meeting place of light and dark.",
    crystals: ["Aquamarine", "Rose Quartz", "Moss Agate", "Green Aventurine", "Clear Quartz"],
    herbs: ["Daffodil", "Clover", "Dandelion", "Violet", "Lavender"],
    colors: ["Pale Green", "Yellow", "Pink", "Lilac", "Sky Blue"],
  },
  {
    id: "beltane",
    name: "Beltane",
    image: "https://static.prod-images.emergentagent.com/jobs/1834e61f-9422-4ee4-90fd-d2458c84ed8d/images/b3881e3cefcbb9d994caae304281bf0db724d2afb84a9036e814d544910c6346.png",
    subtitle: "May Day · The Great Marriage",
    dates: { north: "Apr 30 – May 1", south: "Oct 31 – Nov 1" },
    monthIndex: { north: 4, south: 10 },
    season: { north: "Late Spring", south: "Late Spring" },
    angle: 180,
    color: { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/30", hex: "#fda4af" },
    element: "Fire",
    icon: Flame,
    theme: "Passion · Union · Fertility · Celebration of Life",
    description: "Beltane is the great fire festival of desire, fertility, and the sacred union of the divine masculine and feminine. The earth is in full flower, the sap is rising, the animals are mating. This is a time to celebrate aliveness, desire, creativity, and the sheer joy of embodied existence.",
    traditions: [
      "Celtic: Leaping Beltane fires for luck and purification",
      "Maypole dancing — weaving the threads of community",
      "Gathering May blossoms (hawthorn/blackthorn) for the home",
      "Dew collected on May morning is sacred — wash your face in it for beauty and blessing"
    ],
    ritual: {
      name: "Beltane Fire Leap",
      steps: [
        "Build two fires (even two candles in a line work symbolically) and decorate the space with flowers — especially hawthorn, roses, and wildflowers.",
        "Before you leap (or step) between the fires, write on paper what you are leaving behind — what dims your aliveness.",
        "Burn the paper in one of the fires.",
        "Then leap or step between the two fires/candles as a symbol of transformation and renewal.",
        "On the other side, speak aloud what you are leaping INTO — your desires, your creative fire, your full yes to life.",
        "Dance — wildly if you can. Put on your most alive music and move your body until you feel genuinely warm and lit up.",
        "Close by tending the flowers on your altar and leaving an offering to the land: milk, honey, flowers, or grain."
      ]
    },
    embodiment: "This is the embodiment practice of desire. Ask yourself: what do I truly want — not what is responsible, not what is safe — but what makes me come alive? Let that longing arise in your body. Feel it as physical warmth, electricity, aliveness. This is sacred. This is life force itself. Let it inform one courageous action today.",
    crystals: ["Rose Quartz", "Carnelian", "Garnet", "Malachite", "Ruby"],
    herbs: ["Hawthorn", "Rose", "Honeysuckle", "Clover", "Marigold"],
    colors: ["Red", "White", "Green", "Gold", "Hot Pink"],
  },
  {
    id: "litha",
    name: "Litha",
    image: "https://static.prod-images.emergentagent.com/jobs/1834e61f-9422-4ee4-90fd-d2458c84ed8d/images/ff1bc23e547f1833f9c792ef415c71285f6e66a0d2c21aa1c55b6652c633734d.png",
    subtitle: "Summer Solstice · Peak of the Light",
    dates: { north: "Jun 20–23", south: "Dec 20–23" },
    monthIndex: { north: 5, south: 11 },
    season: { north: "Midsummer", south: "Midsummer" },
    angle: 225,
    color: { text: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/30", hex: "#fde047" },
    element: "Fire",
    icon: Sun,
    theme: "Solar Peak · Abundance · Community · Full Radiance",
    description: "The Summer Solstice is the longest day, the peak of the sun's power. Everything is in bloom. This is the time of greatest light, abundance, and community celebration. After today, the light will gently begin to wane — making this moment precious. Stand in your fullness. This is your peak.",
    traditions: [
      "Norse: Midsummer — bonfires, wildcrafting, swimming in natural water",
      "Celtic: Gathering sacred herbs at dawn when their power is greatest",
      "Latvian: Jāņi — flower crowns, singing through the night",
      "Indigenous: Sun ceremonies across many cultures, honouring the great light"
    ],
    ritual: {
      name: "Solar Peak Ceremony",
      steps: [
        "Rise before dawn and go outside. Gather a few herbs (any herbs from your garden or wildcrafted) while they are still dew-damp.",
        "At sunrise, stand facing east with your arms open. Speak: 'Great Sun, I honour your fullness. I honour my own fullness. I am alive in your light.'",
        "Create a flower or herb crown if you can — this is the day of wearing your beauty openly.",
        "At noon (solar peak), stand in direct sunlight for 5 minutes with eyes closed, face upward. Breathe in the light. Feel it charging you.",
        "Make an offering of flowers, grain, or honey to the earth.",
        "That evening, gather with others if possible — feast, sing, build a fire if safe to do so.",
        "As the sun sets, acknowledge the beginning of the waning — and the wisdom of impermanence."
      ]
    },
    embodiment: "Practice full-body sunbathing as a sacred act — not passive, but conscious. Lie in sunlight and with each body part you expose to the sun, consciously receive its light. 'I receive light into my chest. I receive warmth into my belly.' This is a solar meditation. You are a plant. You are photosynthesising your own healing.",
    crystals: ["Citrine", "Sunstone", "Amber", "Peridot", "Gold Calcite"],
    herbs: ["St John's Wort", "Lavender", "Chamomile", "Calendula", "Meadowsweet"],
    colors: ["Gold", "Orange", "Yellow", "White", "Bright Green"],
  },
  {
    id: "lughnasadh",
    name: "Lughnasadh",
    image: "https://static.prod-images.emergentagent.com/jobs/1834e61f-9422-4ee4-90fd-d2458c84ed8d/images/9611418f1cc7e292141bcc36351d44a389add748c45ce20ecefcb47dcc0ba18a.png",
    subtitle: "Lammas · First Harvest",
    dates: { north: "Aug 1–2", south: "Feb 1–2" },
    monthIndex: { north: 7, south: 1 },
    season: { north: "Late Summer", south: "Late Summer" },
    angle: 270,
    color: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30", hex: "#fbbf24" },
    element: "Earth",
    icon: Leaf,
    theme: "First Harvest · Gratitude · Skill · Sacrifice",
    description: "Lughnasadh (named for the god Lugh) is the festival of the first grain harvest — a time of gratitude for what the summer has grown, and the recognition that to receive abundance, something must be given. The god sacrifices himself so the people may eat. What have you harvested? What are you grateful for?",
    traditions: [
      "Celtic: The first bread baked from the new grain was sacred",
      "Lugh's athletic games and competitions — celebrating skill and craft",
      "Bilberry picking in Ireland — first fruits ritual",
      "Indigenous Australian: First fruits ceremonies across many language groups"
    ],
    ritual: {
      name: "First Harvest Gratitude Ceremony",
      steps: [
        "Bake or purchase a round loaf of bread. This is your ritual centrepiece.",
        "Gather the fruits of your summer: accomplishments, relationships deepened, skills learned, abundance received. Write each one on a slip of paper.",
        "Create a harvest altar with whatever is in season: fruits, grains, vegetables, sunflowers.",
        "Light a candle and speak each accomplishment aloud, placing the paper on the altar: 'I am grateful for this harvest.'",
        "Break the bread and eat a piece consciously, saying: 'I receive this abundance with gratitude. May my cup always run over.'",
        "Share the remaining bread with someone you love, or leave a piece outside for the birds and earth.",
        "Ask yourself: 'What skill or gift can I offer back to my community from what I have received this year?'"
      ]
    },
    embodiment: "Hold a piece of bread (or grain, or fruit) in your hands. Close your eyes and trace backwards in your mind all the lives, hands, soil, sun and rain that brought this food to you. Feel the web of interdependence you are woven into. You did not grow this alone. Nothing real is ever grown alone. Open your hands and receive it with genuine gratitude.",
    crystals: ["Citrine", "Tiger's Eye", "Carnelian", "Amber", "Gold Sheen Obsidian"],
    herbs: ["Wheat", "Sunflower", "Corn", "Heather", "Gorse"],
    colors: ["Gold", "Bronze", "Orange", "Brown", "Deep Yellow"],
  },
  {
    id: "mabon",
    name: "Mabon",
    image: "https://images.unsplash.com/photo-1541480333465-b09786ad8ac6?crop=entropy&cs=srgb&fm=jpg&q=85",
    subtitle: "Autumn Equinox · The Second Harvest",
    dates: { north: "Sep 20–23", south: "Mar 19–22" },
    monthIndex: { north: 8, south: 2 },
    season: { north: "Autumn", south: "Autumn" },
    angle: 315,
    color: { text: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/30", hex: "#fb923c" },
    element: "Earth",
    icon: Leaf,
    theme: "Balance · Harvest Gratitude · Letting Go · Ancestral Remembrance",
    description: "At the Autumn Equinox, light and dark are equal once more — but now the dark is taking hold. The second harvest is gathered. The trees begin to let go of their leaves in a riot of colour. This is the season of conscious releasing: of grief, of what didn't work, of summer's fullness as we prepare to descend into the sacred dark.",
    traditions: [
      "Anglo-Saxon: The feast of Halig ('harvest home') — community celebration",
      "Japanese: Higan — visiting ancestors' graves, equinoctial week of reflection",
      "Chinese: Mid-Autumn Festival — mooncakes, family reunion, lunar gratitude",
      "Celtic: Mara gathering — the last harvest before winter's preparation"
    ],
    ritual: {
      name: "Autumn Releasing Ceremony",
      steps: [
        "Go to a tree that is changing colour or about to drop its leaves.",
        "Collect several fallen leaves (do not pull from the tree).",
        "On each leaf, write (in water-based ink or chalk) one thing you are releasing this season: a belief, a relationship pattern, a grief, a version of yourself.",
        "Hold each leaf and feel the weight of what it carries. Then with gratitude, let it go — either blowing it away in the wind, placing it in flowing water, or burying it in the earth.",
        "As the last leaf is released, speak: 'I release this with gratitude for all it taught me. I trust the turning.'",
        "Make a final harvest of what you ARE keeping — the wisdom, the relationships, the growth. Write these in your journal.",
        "Close by eating something harvested from this season — apples, nuts, root vegetables — as a communion with the turning earth."
      ]
    },
    embodiment: "Stand beneath a tree that is dropping its leaves. Watch the leaves fall. Feel the beauty of letting go — without clinging, without grief, simply releasing what was full into what comes next. Let your body mirror this: soften your grip on your own leaves. What are you holding too tightly? Let one thing go today.",
    crystals: ["Amber", "Citrine", "Carnelian", "Smoky Quartz", "Moss Agate"],
    herbs: ["Apple", "Blackberry", "Oak", "Hazel", "Sage"],
    colors: ["Rust", "Burnt Orange", "Gold", "Deep Red", "Brown"],
  },
];

// ── Earth Crafting practices ──────────────────────────────────────────────────
const EARTH_CRAFTING = [
  {
    id: "medicine-wheel",
    name: "Medicine Wheel",
    icon: Star,
    color: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/25" },
    description: "The Medicine Wheel is one of the oldest sacred technologies on earth — a map of the cosmos, the self, and all of nature's cycles. Found in Indigenous cultures across North America, the Andes, the British Isles, and beyond.",
    steps: [
      "Find a clear space in nature or in your garden. Ideally circular — at least 1–2 metres in diameter.",
      "Begin by placing a stone at the centre — this represents the Great Spirit / Source / the Unmoving Centre of all things.",
      "Place a stone to the East (direction of air, new beginnings, sunrise, the mind). Speak: 'I honour the East — the place of new beginnings and the rising sun.'",
      "Place a stone to the South (direction of fire, passion, youth, summer). Speak: 'I honour the South — the place of growth and the midday sun.'",
      "Place a stone to the West (direction of water, emotions, autumn, the setting sun). Speak: 'I honour the West — the place of introspection and the setting sun.'",
      "Place a stone to the North (direction of earth, wisdom, winter, the midnight sky). Speak: 'I honour the North — the place of wisdom and the midnight sky.'",
      "Fill in the circle with more stones, creating a full wheel. Decorate with flowers, feathers, crystals, shells — anything that calls to you.",
      "Sit at the centre and feel yourself as the still point around which all directions and all elements turn."
    ],
    note: "Leave the wheel in place and return to it regularly. It becomes a living altar."
  },
  {
    id: "crystal-grid",
    name: "Crystal Grid in Nature",
    icon: Gem,
    color: { text: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/25" },
    description: "A crystal grid in nature amplifies intention by combining the power of geometric arrangement with the living earth herself. Unlike indoor grids, these are left as offerings.",
    steps: [
      "Choose a natural space that feels alive and receptive — under a tree, beside water, in a meadow.",
      "Ask the land's permission before you place anything. Sit quietly and feel whether you are welcome.",
      "Choose crystals (tumblestones work well) and arrange them in a sacred geometry: star, spiral, flower of life, or simple circle.",
      "At the centre, place your most powerful stone and speak your intention into it.",
      "Activate the grid by drawing an imaginary line connecting each stone outward from the centre, spiralling out.",
      "Speak your prayer or intention aloud to the land.",
      "Leave the grid as an offering. If using biodegradable materials only, leave everything. If using valuable crystals, retrieve them after 24 hours."
    ],
    note: "Sunrise and sunset are the most powerful activation times."
  },
  {
    id: "herb-bundling",
    name: "Herb Bundling & Plant Medicine",
    icon: Leaf,
    color: { text: "text-green-300", bg: "bg-green-500/10", border: "border-green-500/25" },
    description: "The practice of gathering, bundling, and working with plants connects us to an unbroken lineage of herbalists, healers, and those who walked the land as medicine people.",
    steps: [
      "Gather herbs mindfully — ask the plant's permission before cutting. Take no more than one third of any plant.",
      "As you gather, speak to the plant. Thank it. Tell it what you intend to use it for.",
      "Bundle the stems together tightly with natural twine (cotton or hemp). Spiral the binding upward.",
      "Hang to dry in a warm, well-ventilated space — usually 2–4 weeks.",
      "Once dry, use the bundles for smudging/smoke cleansing, culinary medicine, herbal teas, or as altar offerings.",
      "Store the loose dried herbs in glass jars, labelled with the plant name, date, and where it was gathered.",
      "Learn 3 plants deeply before learning many shallowly. The plant will teach you."
    ],
    note: "Always identify plants properly before using. Never ingest anything unless you are certain of identification."
  },
  {
    id: "land-offering",
    name: "Sacred Land Offerings",
    icon: TreePine,
    color: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
    description: "Offerings are among the most ancient spiritual technologies — a conscious act of reciprocity with the living world. You give to the land; the land gives to you.",
    steps: [
      "Choose a place in nature that feels significant — a tree, a rock, a river crossing, the base of a hill.",
      "Prepare your offerings: biodegradable and natural only — cornmeal, tobacco, herbs, flowers, honey, water, seeds, milk, grain.",
      "Come to the place in silence. Spend a few minutes simply being present, feeling the land's character.",
      "Speak a greeting and ask permission to make an offering.",
      "Place each offering with intention, speaking aloud what it represents: 'I offer this corn as gratitude for all the food this earth provides. I offer these flowers as beauty returned to beauty.'",
      "Then make your prayer or request, or simply offer your presence as the gift.",
      "Sit quietly for at least 10 minutes afterward. The land may speak — in wind, in bird call, in sensation. Be receptive.",
      "Close by bowing and saying thank you in whichever language or form feels authentic."
    ],
    note: "Never offer plastic, synthetic materials, or anything that would harm the ecosystem."
  },
  {
    id: "stone-circle",
    name: "Stone Circle Altar",
    icon: Mountain,
    color: { text: "text-stone-300", bg: "bg-stone-500/10", border: "border-stone-500/25" },
    description: "Stone circles create a held, sacred space — a temple built from the earth itself. Found on every continent, they are among humanity's oldest ceremonial forms.",
    steps: [
      "Collect stones with intention — ideally gathered from the landscape where you will build, or from places meaningful to you. Ask each stone if it is willing to serve.",
      "Choose a circle size: small (30cm, for altar), medium (1–2m, for personal ceremony), large (3m+, for group work).",
      "Find your centre stone first — place the largest, most powerful stone at the heart.",
      "From the centre, determine your cardinal points (North, South, East, West) using a compass or the sun.",
      "Place four 'gateway stones' at the four directions first, then fill in between.",
      "When the circle is complete, walk its perimeter clockwise three times, stating your purpose.",
      "Enter the circle from the East (direction of beginnings) and conduct your ceremony.",
      "When complete, walk counter-clockwise to close the circle."
    ],
    note: "Permanent outdoor stone circles should be left undisturbed. They grow in power over time."
  },
];

// ── Helper: get current Sabbat ────────────────────────────────────────────────
const getCurrentSabbat = (hemisphere) => {
  const now = new Date();
  const month = now.getMonth();
  const closest = SABBATS.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.monthIndex[hemisphere] - month);
    const currDiff = Math.abs(curr.monthIndex[hemisphere] - month);
    return currDiff < prevDiff ? curr : prev;
  });
  return closest.id;
};

const SeasonalTemple = ({ user }) => {
  const navigate = useNavigate();
  const [hemisphere, setHemisphere] = useState(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
      const south = ["australia","auckland","wellington","argentina","sao_paulo","santiago","lima","johannesburg","new_zealand"];
      return south.some(s => tz.includes(s)) ? "south" : "north";
    } catch { return "north"; }
  });
  const [selectedSabbat, setSelectedSabbat] = useState(null);

  const getSabbatTabLabel = (tab) => {
    if (tab === "overview") return "Traditions";
    if (tab === "ritual") return "Ritual 🙏";
    if (tab === "embodiment") return "Embodiment";
    return "Crystals & Herbs";
  };
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCraft, setSelectedCraft] = useState(null);

  const currentSabbat = useMemo(() => getCurrentSabbat(hemisphere), [hemisphere]);

  const sabbatTabs = ["overview", "ritual", "embodiment", "nature"];

  return (
    <div className="min-h-screen bg-background" data-testid="seasonal-temple">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button data-testid="back-btn" onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Sacred Seasons</p>
              <h1 className="text-xl font-serif">Wheel of the <span className="italic text-amber-300">Year</span></h1>
            </div>
          </div>
          {/* Hemisphere Toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
            <button onClick={() => setHemisphere("south")} data-testid="hemi-south"
              className={`px-3 py-1 rounded-full text-xs transition-all ${hemisphere === "south" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              🌿 South
            </button>
            <button onClick={() => setHemisphere("north")} data-testid="hemi-north"
              className={`px-3 py-1 rounded-full text-xs transition-all ${hemisphere === "north" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              ☀️ North
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* ── Wheel of the Year visual ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-10 pt-4">
          <h2 className="text-3xl font-serif mb-2">The Eight <span className="italic text-amber-300">Sacred Gates</span></h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            The Wheel turns through 8 stations — 4 solar (solstices & equinoxes) and 4 fire festivals. Each gate is a doorway into a different quality of being.
            {" "}<span className={`text-xs px-2 py-0.5 rounded-full ${hemisphere === "south" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
              {hemisphere === "south" ? "🌿 Southern Hemisphere dates" : "☀️ Northern Hemisphere dates"}
            </span>
          </p>

          {/* Wheel graphic */}
          <div className="relative w-72 h-72 mx-auto my-10">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-4 rounded-full border border-white/5" />
            {/* Centre */}
            <div className="absolute inset-[44%] rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Star className="w-3 h-3 text-primary" />
            </div>
            {/* Sabbat nodes */}
            {SABBATS.map((s) => {
              const angleRad = ((s.angle - 90) * Math.PI) / 180;
              const radius = 108;
              const x = 144 + radius * Math.cos(angleRad);
              const y = 144 + radius * Math.sin(angleRad);
              const isCurrent = s.id === currentSabbat;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSabbat(s); setActiveTab("overview"); }}
                  data-testid={`wheel-${s.id}`}
                  style={{ left: x - 20, top: y - 20 }}
                  className={`absolute w-10 h-10 rounded-full border flex items-center justify-center
                             transition-all hover:scale-110
                             ${s.color.bg} ${s.color.border}
                             ${isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110" : ""}`}
                  title={`${s.name} — ${s.dates[hemisphere]}`}
                >
                  <Icon className={`w-4 h-4 ${s.color.text}`} />
                </button>
              );
            })}
            {/* Spokes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 288 288">
              {SABBATS.map((s) => {
                const angleRad = ((s.angle - 90) * Math.PI) / 180;
                return (
                  <line key={s.id}
                    x1="144" y1="144"
                    x2={144 + 100 * Math.cos(angleRad)}
                    y2={144 + 100 * Math.sin(angleRad)}
                    stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                );
              })}
            </svg>
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="text-primary">●</span> Currently nearest: <span className="font-medium">{SABBATS.find(s => s.id === currentSabbat)?.name}</span>
            {" "}· Click any gate to enter
          </p>
        </motion.div>

        {/* ── Sabbat Cards Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {SABBATS.map((s, i) => {
            const Icon = s.icon;
            const isCurrent = s.id === currentSabbat;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedSabbat(s); setActiveTab("overview"); }}
                data-testid={`sabbat-card-${s.id}`}
                className={`cursor-pointer rounded-xl border transition-all hover:scale-[1.02] overflow-hidden
                           ${s.color.bg} ${s.color.border}
                           ${isCurrent ? "ring-1 ring-primary" : ""}`}
              >
                {s.image && (
                  <div className="relative h-28 overflow-hidden">
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
                    {isCurrent && <span className="absolute top-2 right-2 text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Now</span>}
                  </div>
                )}
                <div className="p-4">
                <div className={`flex items-center justify-between mb-3 ${s.image ? 'hidden' : ''}`}>
                  <Icon className={`w-6 h-6 ${s.color.text}`} />
                  {isCurrent && !s.image && <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Now</span>}
                </div>
                <h3 className="font-serif text-base mb-0.5">{s.name}</h3>
                <p className={`text-xs ${s.color.text} mb-2`}>{s.dates[hemisphere]}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{s.theme}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Earth Crafting ─────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Mountain className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-2xl font-serif">Earth <span className="italic text-emerald-300">Crafting</span></h2>
              <p className="text-sm text-muted-foreground">Sacred practices for working with the living land 🙏</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EARTH_CRAFTING.map((craft, i) => {
              const Icon = craft.icon;
              return (
                <motion.div
                  key={craft.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedCraft(craft)}
                  data-testid={`craft-${craft.id}`}
                  className={`cursor-pointer p-5 rounded-xl border transition-all hover:scale-[1.02]
                             ${craft.color.bg} ${craft.color.border} group`}
                >
                  <Icon className={`w-6 h-6 ${craft.color.text} mb-3`} />
                  <h3 className="font-serif text-base mb-2">{craft.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">{craft.description}</p>
                  <div className={`mt-3 flex items-center gap-1 text-xs ${craft.color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <ChevronRight className="w-3 h-3" /> View Practice
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Sabbat Detail Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSabbat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedSabbat(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl max-w-3xl w-full my-8"
              data-testid="sabbat-modal">
              {/* Modal header */}
              <div className={`p-6 rounded-t-2xl ${selectedSabbat.color.bg} border-b ${selectedSabbat.color.border}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-serif">{selectedSabbat.name}</h2>
                    <p className={`text-sm ${selectedSabbat.color.text}`}>{selectedSabbat.subtitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedSabbat.dates[hemisphere]} · {selectedSabbat.season[hemisphere]}</p>
                  </div>
                  <button onClick={() => setSelectedSabbat(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors" data-testid="close-sabbat">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{selectedSabbat.description}</p>
              </div>
              {/* Tabs */}
              <div className={`flex border-b ${selectedSabbat.color.border}`}>
                {sabbatTabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-xs font-medium transition-all capitalize ${
                      activeTab === tab ? `${selectedSabbat.color.text} border-b-2 ${selectedSabbat.color.border}` : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {getSabbatTabLabel(tab)}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Themes</p>
                      <p className={`text-sm ${selectedSabbat.color.text} font-medium`}>{selectedSabbat.theme}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Traditions from Around the World</p>
                      <ul className="space-y-2">
                        {selectedSabbat.traditions.map((t, i) => (
                          <li key={`${selectedSabbat.id}-tradition-${String(t).slice(0, 30)}-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Star className={`w-3 h-3 ${selectedSabbat.color.text} flex-shrink-0 mt-1`} />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedSabbat.colors.map((c, i) => (
                        <span key={`${selectedSabbat.id}-color-${String(c).toLowerCase()}-${i}`} className={`px-2 py-1 rounded-full text-xs ${selectedSabbat.color.bg} ${selectedSabbat.color.text} border ${selectedSabbat.color.border}`}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "ritual" && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg">{selectedSabbat.ritual.name}</h3>
                    <ol className="space-y-3">
                      {selectedSabbat.ritual.steps.map((step, i) => (
                        <li key={`${selectedSabbat.id}-ritual-step-${String(step).slice(0, 24)}-${i}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className={`w-6 h-6 rounded-full ${selectedSabbat.color.bg} border ${selectedSabbat.color.border} flex items-center justify-center text-xs ${selectedSabbat.color.text} flex-shrink-0`}>{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {activeTab === "embodiment" && (
                  <div className={`p-5 rounded-xl ${selectedSabbat.color.bg} border ${selectedSabbat.color.border}`}>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedSabbat.embodiment}</p>
                  </div>
                )}
                {activeTab === "nature" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Crystals</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSabbat.crystals.map((c, i) => (
                          <span key={`${selectedSabbat.id}-crystal-${String(c).toLowerCase()}-${i}`} className={`px-3 py-1 rounded-full text-xs border ${selectedSabbat.color.bg} ${selectedSabbat.color.text} ${selectedSabbat.color.border}`}>{c}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Sacred Plants & Herbs</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSabbat.herbs.map((h, i) => (
                          <span key={`${selectedSabbat.id}-herb-${String(h).toLowerCase()}-${i}`} className="px-3 py-1 rounded-full text-xs border bg-green-500/10 text-green-300 border-green-500/25">{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Earth Crafting Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCraft && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedCraft(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl max-w-2xl w-full my-8"
              data-testid="craft-modal">
              <div className={`p-6 rounded-t-2xl ${selectedCraft.color.bg} border-b ${selectedCraft.color.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <selectedCraft.icon className={`w-8 h-8 ${selectedCraft.color.text}`} />
                    <h2 className="text-xl font-serif">{selectedCraft.name}</h2>
                  </div>
                  <button onClick={() => setSelectedCraft(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{selectedCraft.description}</p>
              </div>
              <div className="p-6 space-y-4">
                <ol className="space-y-3">
                  {selectedCraft.steps.map((step, i) => (
                    <li key={`${selectedCraft.id}-step-${String(step).slice(0, 24)}-${i}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className={`w-7 h-7 rounded-full ${selectedCraft.color.bg} border ${selectedCraft.color.border} flex items-center justify-center text-xs ${selectedCraft.color.text} flex-shrink-0`}>{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className={`p-4 rounded-xl ${selectedCraft.color.bg} border ${selectedCraft.color.border}`}>
                  <p className="text-xs text-muted-foreground/80 italic">🙏 {selectedCraft.note}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeasonalTemple;
