import { AnimatePresence, motion } from "framer-motion";
import { Feather, Loader2, Moon, RotateCcw, Sparkles, Star, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { getArchangelImage } from "../../utils/shamanicImageTheme";

export const ArchangelReadingSection = ({
  reading,
  loading,
  question,
  setQuestion,
  spreadType,
  setSpreadType,
  performReading,
  resetReading,
  showCards,
  setSelectedArchangel,
  setShowBrowse,
  spreadTypes,
  elementColors,
}) => {
  if (!reading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8" data-testid="archangel-reading-setup">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center">
            <Feather className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-serif mb-3">Receive Angelic Guidance</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            The Archangels are divine beings of light, love, and infinite compassion. Ask your question and allow them to come forward.
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-white/10">
          <label className="text-sm text-muted-foreground mb-2 block">Your Question (optional)</label>
          <Textarea
            placeholder="What would you like guidance about? Love, career, healing, purpose..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-white/5 border-white/10 min-h-[100px] resize-none"
            data-testid="question-input"
          />
        </div>

        <div className="bg-card rounded-2xl p-6 border border-white/10">
          <label className="text-sm text-muted-foreground mb-3 block">Choose Your Spread</label>
          <Select value={spreadType} onValueChange={setSpreadType}>
            <SelectTrigger data-testid="archangel-spread-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              {spreadTypes.map((spread) => <SelectItem key={spread.value} value={spread.value}>{spread.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {spreadTypes.map((spread) => (
              <button
                key={spread.value}
                onClick={() => setSpreadType(spread.value)}
                className={`p-4 rounded-xl text-left transition-all ${spreadType === spread.value ? "bg-primary/20 border-primary/50 border" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
                data-testid={`archangel-spread-option-${spread.value}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {spread.cards === 1 ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
                  <span className="font-medium">{spread.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{spread.description}</p>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={performReading}
          disabled={loading}
          className="w-full py-6 text-lg bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
          data-testid="receive-guidance-btn"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Connecting with the Archangels...</>
            : <><Feather className="w-5 h-5 mr-2" />Receive Divine Guidance</>}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8" data-testid="archangel-reading-results">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Your Angelic Reading</h2>
        <Button variant="ghost" onClick={resetReading} data-testid="archangel-reset-reading-btn"><RotateCcw className="w-4 h-4 mr-2" />New Reading</Button>
      </div>

      {reading.question && (
        <div className="bg-card rounded-xl p-4 border border-white/10">
          <p className="text-sm text-muted-foreground">Your Question:</p>
          <p className="italic">&ldquo;{reading.question}&rdquo;</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {showCards && reading.cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, rotateY: 180, scale: 0.8 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              transition={{ delay: index * 0.3, duration: 0.6 }}
              className={`rounded-2xl bg-gradient-to-br ${elementColors[card.element]} border relative overflow-hidden`}
              data-testid={`archangel-card-${index}`}
            >
              {reading.cards.length > 1 && <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-sm">{index + 1}</div>}
              {card.is_reversed && <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">Shadow</div>}
              <div className="aspect-square overflow-hidden"><img src={getArchangelImage(card)} alt={card.name} className="w-full h-full object-cover" data-testid={`archangel-reading-card-image-${index}`} /></div>
              <div className="p-5 text-center">
                <h3 className="text-xl font-serif mb-1">{card.name}</h3>
                <p className="text-sm text-primary mb-3">{card.title}</p>
                <div className="flex flex-wrap justify-center gap-1 mb-4">
                  {card.keywords?.slice(0, 3).map((kw) => <span key={`${card.id}-${kw}`} className="text-xs px-2 py-0.5 rounded-full bg-white/10">{kw}</span>)}
                </div>
                <div className="text-sm text-muted-foreground space-y-1"><p>Element: {card.element}</p><p>Crystal: {card.crystal}</p></div>
              </div>
              <div className="px-5 pb-5 pt-2 border-t border-white/10">
                <p className="text-sm italic text-center">{card.is_reversed ? `“${card.reversed_meaning}”` : `“${card.message?.slice(0, 120)}...”`}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {reading.interpretation && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reading.cards.length * 0.3 + 0.5 }} className="bg-gradient-to-br from-primary/10 to-amber-500/10 rounded-2xl p-6 border border-primary/20">
          <h3 className="text-lg font-serif mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Divine Interpretation</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{reading.interpretation}</p>
        </motion.div>
      )}

      {showCards && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reading.cards.length * 0.3 + 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          data-testid="archangel-reading-integration-grid"
        >
          <article className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20" data-testid="archangel-reading-why-this-heals">
            <h4 className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Why this heals</h4>
            <p className="text-sm text-emerald-100/85 leading-relaxed">
              Archangel readings help regulate fear and uncertainty by pairing compassionate symbolism with practical next-step guidance.
            </p>
          </article>

          <article className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20" data-testid="archangel-reading-integration-guide">
            <h4 className="text-xs uppercase tracking-wider text-violet-300 mb-2">Integration guide</h4>
            <p className="text-sm text-violet-100/85 leading-relaxed">
              Choose one angel-aligned action today: truthful communication, boundary repair, compassionate service, or prayerful grounding.
            </p>
          </article>
        </motion.div>
      )}

      {showCards && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reading.cards.length * 0.3 + 0.8 }} className="space-y-4">
          <h3 className="text-lg font-serif">Learn More About Your Archangels</h3>
          {reading.cards.map((card) => (
            <div key={`${card.id}-details`} className="bg-card rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif">{card.name}</h4>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedArchangel(card); setShowBrowse(true); }} data-testid={`archangel-view-profile-${card.id}`}>View Full Profile</Button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{card.love_guidance}</p>
              <div className="bg-primary/10 rounded-lg p-3"><p className="text-sm italic text-primary">&ldquo;{card.affirmation}&rdquo;</p></div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
