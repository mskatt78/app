import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Sparkles, Moon, Star, Eye, Flower2, BookOpen, X, Play } from "lucide-react";
import GuidedAudioButton from "../components/GuidedAudioButton";

const teachings = [
  {
    id: "rose-lineage",
    title: "The Rose Lineage",
    subtitle: "Ancient Feminine Wisdom",
    icon: Flower2,
    image: "https://images.pexels.com/photos/827106/pexels-photo-827106.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/20" },
    description: "The Rose Lineage carries the unbroken thread of feminine wisdom through time — from Isis of ancient Egypt, the High Priestesses of Avalon, Mary Magdalene and the Essene communities, to the Cathars, the troubadours, and beyond.",
    content: [
      {
        heading: "Origins of the Rose",
        body: "The rose has been sacred to the Goddess for over 5,000 years. In ancient Sumer she belonged to Inanna. In Egypt, the red rose was Isis's flower — Her tears as she searched for Osiris. In Rome, roses adorned Aphrodite's temples. The five-petaled rose mirrors the pentagram — the sacred geometry of Venus as she traces her path through the sky over eight years."
      },
      {
        heading: "Mary Magdalene & the Bridal Chamber",
        body: "The Gnostic Gospels reveal Mary Magdalene as the Apostle to the Apostles — the beloved who understood Christ's teachings most fully. The 'Bridal Chamber' was not a physical union but a sacred alchemical marriage of the inner masculine and feminine — the hieros gamos. She carried the Rose teachings to the south of France, where they lived on in the troubadour traditions and later, the Cathars."
      },
      {
        heading: "Sophia & Divine Feminine Wisdom",
        body: "Sophia is the Greek word for Wisdom — the divine feminine face of the sacred. In Gnostic cosmology she is the soul of the world, the breath of creation. Her tears became matter, her longing became love, her wisdom became the path back to source. To embody Sophia is to be love itself — not love as emotion, but love as the organizing principle of all existence."
      },
      {
        heading: "The Priestess Path",
        body: "For thousands of years, women trained in the temple arts — healing, prophecy, sacred dance, dream interpretation, herb lore, and the mysteries of birth, death, and rebirth. The Priestess was not separate from life — she was life itself made conscious. She stood at the threshold between worlds and tended the sacred flame so that all of humanity could find its way home."
      }
    ]
  },
  {
    id: "rose-meditations",
    title: "Rose Meditations",
    subtitle: "Heart Opening Practices",
    icon: Heart,
    image: "https://images.pexels.com/photos/6931767/pexels-photo-6931767.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-pink-300", bg: "bg-pink-500/10", border: "border-pink-500/20", glow: "shadow-pink-500/20" },
    description: "These meditations work with the rose as a living portal to the heart. Each petal is a layer of the self — each fragrance a memory of home.",
    content: [
      {
        heading: "The Unfolding Rose",
        body: "Sit comfortably and close your eyes. Bring your awareness to the center of your chest — your heart space. Visualize a rosebud there, deep crimson or soft pink, depending on what calls you. With each inhale, see the bud beginning to open. With each exhale, feel the petals softening and releasing. Allow the rose to unfold in its own time. You cannot force a rose to bloom. When it is ready, breathe in its fragrance and let it fill every cell of your body. This is your true nature — soft, radiant, and whole."
      },
      {
        heading: "Meeting Your Inner Magdalene",
        body: "In your mind's eye, walk to the edge of a sea at golden hour. The water is calm and the sky holds the last colors of sunset. A woman walks toward you — robed, luminous, carrying a small alabaster jar. She is your Inner Magdalene. She knows every shadow you carry, every wound that shaped you, every gift that is waiting to be born. Sit with her. Ask her what she sees in you. Listen without judgment. Let her anoint you with the sacred oil she carries. You are already anointed. You have always been enough."
      },
      {
        heading: "The Rose Chamber",
        body: "Imagine descending a spiral staircase of living rose canes, blooming as you walk. At the bottom is a circular chamber, its walls woven entirely from roses of every color. In the center burns a soft flame — the eternal feminine fire. Sit beside it. This is the place within you that was never wounded, never diminished, never lost. This is your original wholeness. Stay here as long as you need. Return here whenever the world feels too harsh."
      }
    ]
  },
  {
    id: "feminine-embodiment",
    title: "Feminine Embodiment",
    subtitle: "Practices for Women",
    icon: Sparkles,
    image: "https://images.pexels.com/photos/6015070/pexels-photo-6015070.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-fuchsia-300", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", glow: "shadow-fuchsia-500/20" },
    description: "Embodiment is the practice of coming home to your body — not as an object, but as a sacred vessel of consciousness. The feminine principle lives in the body, in sensation, in the felt sense of being alive.",
    content: [
      {
        heading: "Womb Awakening",
        body: "Place both hands over your lower belly — your womb space or hara, your center of creative power. Close your eyes and breathe into this space. The womb, whether physical or energetic, is the center of feminine power — the place where all creation begins. Breathe love into this space. If there are wounds here — from difficult births, abortions, miscarriages, sexual trauma — offer compassion first. Then gently breathe in golden light, filling this space with warmth and acknowledgment. You are a creatrix. This is your sacred center."
      },
      {
        heading: "The Wave Practice",
        body: "Stand with feet hip-width apart, knees soft. Begin to move your hips in a gentle figure-eight or wave motion — like water. Let the movement be guided by what feels right in your body, not by how it looks. Let your arms follow. Let your spine undulate. The feminine moves in waves — in cycles, in spirals, not in straight lines. This is not performance. This is remembrance. Allow sound to come — sighs, tones, laughter, tears. Whatever arises is sacred."
      },
      {
        heading: "Sacred Self-Touch",
        body: "With reverence and presence, place your hands on different parts of your body — your face, your shoulders, your heart, your belly, your legs and feet. As you do, speak quietly or internally: 'I bless this face that has seen so much. I bless these hands that have given so much. I bless this heart that has loved so much.' The feminine heals through being witnessed and loved. Begin with yourself."
      },
      {
        heading: "Moon Cycle Attunement",
        body: "Track your menstrual cycle or the moon cycle with the four archetypes: New Moon/Menstruation — the Crone/Wise Woman (inner world, rest, visions); Waxing/Follicular — the Maiden (fresh energy, new ideas, lightness); Full Moon/Ovulation — the Mother (outward, giving, radiance); Waning/Luteal — the Wild Woman/Enchantress (truth-telling, depth, integration). Honor each phase rather than pushing against it. Your cycle is not a burden. It is your compass."
      }
    ]
  },
  {
    id: "rose-ceremonies",
    title: "Rose Ceremonies & Rituals",
    subtitle: "Sacred Feminine Practices",
    icon: Moon,
    image: "https://images.pexels.com/photos/7252509/pexels-photo-7252509.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/20" },
    description: "Ceremony creates a container for transformation. When we mark the sacred passages of our lives with ritual, we weave ourselves back into the web of life.",
    content: [
      {
        heading: "Rose Petal Bath Ritual",
        body: "Prepare a bath with rose petals (fresh or dried), a few drops of rose essential oil, Himalayan salt, and if available, rose quartz crystals placed around the tub. Light candles — white or pink. Before entering, hold your intention: What are you releasing? What are you calling in? Enter the bath slowly, feeling it as an initiation. Soak for at least 20 minutes. As you drain the water, imagine everything you are releasing flowing away with it. End by anointing your heart with a drop of rose oil."
      },
      {
        heading: "New Moon Rose Ceremony",
        body: "On the night of the new moon, create a small altar with: one fresh or dried rose, a candle, something representing your intention (written on paper, or a crystal), and a glass of rose water or regular water. Light the candle. Hold the rose to your heart and speak your intentions aloud to the darkness — for the new moon is the time of planting seeds. Close by drinking the water slowly and saying: 'So it is. And so it shall be.'"
      },
      {
        heading: "Sisterhood Circle",
        body: "Gather with women you trust in a circle. Place a vase of roses in the center. Each woman takes a rose and shares: one thing she is releasing, one thing she is grateful for, and one dream she is nurturing. No advice is given — only witnessing. The circle ends with each woman offering her rose petal to a bowl of water as a blessing to all women everywhere. Close with a shared silence, hands linked, breathing together."
      },
      {
        heading: "Daily Rose Invocation",
        body: "Each morning, hold a rose quartz crystal or simply place your hand on your heart. Say aloud or internally: 'I am the rose — rooted in earth, growing through darkness, opening to light. I carry within me the wisdom of all women who came before. I am guided, I am protected, I am loved. Today I choose to bloom.' Begin the day from this place."
      }
    ]
  },
  {
    id: "rituals-embodiment",
    title: "Rose Rituals & Embodiment",
    subtitle: "Sacred Ceremonies for Women",
    icon: Star,
    color: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/20" },
    description: "These rituals are doorways into the living body of the Rose Temple — full ceremony formats designed to be practiced with reverence, intention, and the willingness to be transformed. 🙏",
    content: [
      {
        heading: "Magdalene Anointing Ceremony 🙏",
        body: "Gather: rose essential oil (or coconut oil with dried rose petals), a red or white candle, a mirror, your journal. Light the candle. Sit before the mirror and look into your own eyes without looking away for 3 full minutes — the 'soft gaze' that sees beyond the surface. Then, dip your finger into the rose oil. Anoint your third eye (between your eyebrows), your throat, your heart, your womb space, and the soles of your feet. With each anointing, speak aloud: 'I consecrate this [eye/voice/heart/womb/path] to the truth of who I am. I am anointed. I am enough. I am loved.' Close by placing both hands on your heart, bowing to yourself in the mirror, and offering gratitude for this body that carries you."
      },
      {
        heading: "Womb Healing Ceremony 🙏",
        body: "Create a safe, warm, private space. Bring: a red cloth or blanket, a warm water bottle for your belly, rose oil, and your journal. Play soft instrumental music. Lie down, place the warmth on your lower belly. Begin with 10 minutes of conscious breathing into the womb space — imagine golden light filling this center. Then speak aloud, tenderly, to your womb: name what it has carried that was not yours to carry. Name what has been done to it without its consent. Name what it has created — life, art, love. Offer forgiveness, compassion, and gratitude. This is not a one-time practice — return to it whenever this space needs tending. End by placing one hand on your womb and one on your heart: 'You are safe. You are sacred. You are mine.'"
      },
      {
        heading: "Daily Rose Devotion Practice 🙏",
        body: "A 5-minute morning practice: Place fresh or dried rose petals on your altar or in a small bowl of water. Place one hand on your heart. Take 3 deep breaths. As you exhale each breath, feel your heart softening — like rose petals opening. Speak: 'Today I choose love as my foundation. I move from the heart. I receive what life offers with grace. I bloom in my own time.' Pick up one rose petal and hold it through your morning. Let it be a reminder throughout the day to return to your heart. At night, return the petal to the earth."
      },
      {
        heading: "Full Moon Rose Sisterhood Ritual 🙏",
        body: "Gather 3 or more women on or near the full moon. Create a circle with candles and a vase of roses in the center. One by one, each woman takes a rose from the vase and speaks: one wound she is releasing, one truth she is claiming, one blessing she offers to all women in the circle and beyond. No commentary or advice is offered — only witnessing. After all have spoken, each woman places a petal in a shared bowl of water, saying: 'May all women be free.' Close by standing, hands linked, breathing together in silence for 2 minutes. The bowl of rose water is poured onto the earth the next morning as an offering."
      },
      {
        heading: "Sacred Embodiment Dance 🙏",
        body: "This practice requires 30–45 minutes of privacy and music that moves you — anything from slow devotional music to tribal beats, depending on what you need. Begin lying on the floor in stillness. Feel the weight of your body. After 5 minutes, begin to let one finger move, then your hand, then your arm, then your whole body, rising slowly from the floor. Let the body lead — not the mind. There is no choreography here. There are no steps to get right. Simply follow sensation: where does your body want to move? What part needs to shake loose? What wants to rise, to spiral, to collapse, to extend? Stay with each impulse until it completes itself, then follow the next. Close with both hands on your heart, kneeling or standing, and bow to the body that danced you home."
      }
    ]
  },
  {
    id: "ancient-teachings",
    title: "Ancient Women's Teachings",
    subtitle: "Wisdom Through the Ages",
    icon: BookOpen,
    color: { text: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "shadow-violet-500/20" },
    description: "Across every culture and age, women have been the keepers of sacred knowledge — the web-weavers, the midwives of matter and spirit, the ones who remembered what others forgot.",
    content: [
      {
        heading: "The Thirteen Grandmothers",
        body: "In 2004, thirteen Indigenous grandmothers from across the world — from the Amazon, the Arctic, the Himalayas, Mexico, Africa, and more — gathered for the first time to share their wisdom and unite in prayer for the Earth. Their message was unanimous: return to the sacred feminine. Honor the earth as mother. Tend the fire of wisdom. They represent the unbroken lineage of women who have held the wisdom of living in harmony with all life."
      },
      {
        heading: "Hildegard von Bingen",
        body: "12th-century abbess, composer, poet, visionary, herbalist, and one of the most remarkable women in history. She called her direct experience of the divine 'the living light,' and she recorded visions of extraordinary beauty and complexity. Her music is still performed today — luminous, soaring, unlike anything else in the medieval world. She taught that God could be experienced through nature, through beauty, through the body — not only through theology and doctrine."
      },
      {
        heading: "The Pythia of Delphi",
        body: "For nearly a thousand years, the Oracle at Delphi was always a woman — the Pythia. She sat above a crack in the earth, breathing vapors, entering a trance state, and channeling the voice of Apollo (who had claimed the site from Gaia). Petitioners came from across the ancient world — kings, generals, philosophers — seeking her guidance. The Pythia was not a fraud. She was a trained practitioner of one of humanity's oldest arts: direct access to non-ordinary states of knowing."
      },
      {
        heading: "The Tao Te Ching & Yin",
        body: "Lao Tzu's Tao Te Ching — perhaps the most translated book after the Bible — is a hymn to the feminine principle. 'The valley spirit never dies. It is called the mysterious female. The gateway of the mysterious female is called the root of heaven and earth.' Yin — often misunderstood as passive or weak — is in fact the deepest power: receptive, spacious, the ground from which all things emerge. To embody yin is to become the ocean that all rivers return to."
      }
    ]
  }
];

const RoseTemple = ({ user, api }) => {
  const navigate = useNavigate();
  const [selectedTeaching, setSelectedTeaching] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

  return (
    <div className="min-h-screen bg-background" data-testid="rose-temple">
      {/* Sacred Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-rose-500/10">
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
              <p className="text-xs text-rose-300/60 uppercase tracking-widest">Sacred Feminine</p>
              <h1 className="text-xl font-serif">Rose <span className="italic text-rose-300">Temple</span></h1>
            </div>
          </div>
          <Flower2 className="w-6 h-6 text-rose-300/50" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 pt-8"
        >
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-rose-500/30 to-pink-600/20 border border-rose-500/30 flex items-center justify-center">
              <Flower2 className="w-12 h-12 text-rose-300" />
            </div>
            <div className="absolute inset-0 rounded-full bg-rose-500/10 blur-xl" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif mb-4">
            The <span className="text-rose-300 italic">Rose Temple</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            A sacred space for women — tending the ancient flame of the Rose Lineage.
            Here lives the wisdom of Mary Magdalene, Sophia, Isis, and all the women
            who have carried this thread through time. Enter with your whole heart.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-rose-500/50" />
            <Flower2 className="w-4 h-4 text-rose-400/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-rose-500/50" />
          </div>
        </motion.div>

        {/* Teaching Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachings.map((teaching, index) => {
            const Icon = teaching.icon;
            return (
              <motion.div
                key={teaching.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedTeaching(teaching)}
                data-testid={`teaching-${teaching.id}`}
                className={`group cursor-pointer rounded-2xl border backdrop-blur-xl overflow-hidden
                           ${teaching.color.bg} ${teaching.color.border}
                           hover:scale-[1.02] transition-all duration-300
                           hover:shadow-lg ${teaching.color.glow}`}
              >
                {/* Image */}
                {teaching.image && (
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={teaching.image} 
                      alt={teaching.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent`} />
                    <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl ${teaching.color.bg} border ${teaching.color.border} flex items-center justify-center backdrop-blur-sm`}>
                      <Icon className={`w-5 h-5 ${teaching.color.text}`} />
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-serif mb-1">{teaching.title}</h3>
                  <p className={`text-sm ${teaching.color.text} mb-3 uppercase tracking-wider`}>{teaching.subtitle}</p>
                  <p className="text-base text-muted-foreground line-clamp-3 leading-relaxed">{teaching.description}</p>
                  <div className={`mt-4 flex items-center gap-1 text-sm ${teaching.color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <Eye className="w-4 h-4" />
                    <span>Enter Portal</span>
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
          className="mt-16 text-center p-8 rounded-2xl bg-rose-500/5 border border-rose-500/15"
        >
          <Flower2 className="w-8 h-8 text-rose-300/40 mx-auto mb-4" />
          <blockquote className="text-lg font-serif italic text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            "The rose is the flower of the goddess. She does not bloom for approval.
            She blooms because it is her nature to bloom."
          </blockquote>
          <p className="mt-4 text-xs text-rose-300/50 uppercase tracking-widest">Rose Lineage Wisdom</p>
        </motion.div>
      </main>

      {/* Teaching Detail Modal */}
      <AnimatePresence>
        {selectedTeaching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => { setSelectedTeaching(null); setSelectedContent(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl max-w-3xl w-full my-8"
              data-testid="teaching-modal"
            >
              {/* Modal Header */}
              <div className={`p-6 rounded-t-2xl ${selectedTeaching.color.bg} border-b ${selectedTeaching.color.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${selectedTeaching.color.bg} border ${selectedTeaching.color.border} flex items-center justify-center`}>
                      <selectedTeaching.icon className={`w-6 h-6 ${selectedTeaching.color.text}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif">{selectedTeaching.title}</h2>
                      <p className={`text-sm ${selectedTeaching.color.text}`}>{selectedTeaching.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedTeaching(null); setSelectedContent(null); }}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    data-testid="close-modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{selectedTeaching.description}</p>
              </div>

              {/* Content Sections */}
              <div className="p-6 space-y-4">
                {selectedTeaching.content.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-5 rounded-xl cursor-pointer border transition-all
                               ${selectedContent === i
                                 ? `${selectedTeaching.color.bg} ${selectedTeaching.color.border}`
                                 : 'bg-white/5 border-white/10 hover:bg-white/8'}`}
                    onClick={() => setSelectedContent(selectedContent === i ? null : i)}
                    data-testid={`section-${i}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base">{section.heading}</h3>
                      <Star className={`w-4 h-4 transition-colors ${selectedContent === i ? selectedTeaching.color.text : 'text-muted-foreground'}`} />
                    </div>
                    <AnimatePresence>
                      {selectedContent === i && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-muted-foreground leading-relaxed mt-3"
                        >
                          {section.body}
                        </motion.p>
                      )}
                      {selectedContent === i && section.body && (
                        <div className="mt-3 flex">
                          <GuidedAudioButton
                            api={api}
                            script={`${selectedTeaching.title}: ${section.heading}. ${section.body}`}
                            label="Listen to this practice"
                            className="text-xs"
                          />
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoseTemple;
