import { motion } from "framer-motion";
import { ArrowLeft, Feather, Heart, Star } from "lucide-react";
import { Button } from "../ui/button";
import { getArchangelImage } from "../../utils/shamanicImageTheme";

export const ArchangelBrowseSection = ({
  showBrowse,
  setShowBrowse,
  allArchangels,
  selectedArchangel,
  setSelectedArchangel,
  elementColors,
  elementTextColors,
}) => {
  if (!showBrowse) return null;

  if (selectedArchangel) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8" data-testid="archangel-selected-profile">
        <Button variant="ghost" size="sm" onClick={() => setSelectedArchangel(null)} className="mb-4" data-testid="archangel-back-to-list-btn">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to All
        </Button>

        <div className={`rounded-2xl bg-gradient-to-br ${elementColors[selectedArchangel.element]} border overflow-hidden`}>
          <div className="aspect-video overflow-hidden">
            <img src={getArchangelImage(selectedArchangel, 1)} alt={selectedArchangel.name} className="w-full h-full object-cover object-top" data-testid="archangel-selected-image" />
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <Feather className={`w-8 h-8 ${elementTextColors[selectedArchangel.element]}`} />
              </div>
              <div>
                <h2 className="text-2xl font-serif">{selectedArchangel.name}</h2>
                <p className="text-primary">{selectedArchangel.title}</p>
                <div className="flex gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span>Element: {selectedArchangel.element}</span>
                  <span>•</span>
                  <span>Color: {selectedArchangel.color}</span>
                  <span>•</span>
                  <span>Crystal: {selectedArchangel.crystal}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-primary mb-2 flex items-center gap-2"><Star className="w-4 h-4" /> Domain</h3>
                <p className="text-muted-foreground leading-relaxed">{selectedArchangel.domain}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-medium text-primary mb-2 flex items-center gap-2"><Heart className="w-4 h-4" /> Message for You</h3>
                <p className="italic text-foreground leading-relaxed">&ldquo;{selectedArchangel.message}&rdquo;</p>
              </div>
              <div>
                <h3 className="font-medium text-primary mb-2 flex items-center gap-2"><Heart className="w-4 h-4" /> Love Guidance</h3>
                <p className="text-muted-foreground leading-relaxed">{selectedArchangel.love_guidance}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-medium text-amber-400 mb-2">Shadow / Reversed Meaning</h3>
                <p className="text-muted-foreground">{selectedArchangel.reversed_meaning}</p>
              </div>
              <div>
                <h3 className="font-medium text-primary mb-2">How to Invoke</h3>
                <p className="text-muted-foreground leading-relaxed">{selectedArchangel.how_to_invoke}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <h3 className="font-medium text-primary mb-2">Affirmation</h3>
                <p className="text-foreground italic">&ldquo;{selectedArchangel.affirmation}&rdquo;</p>
              </div>
              <div>
                <h3 className="font-medium text-primary mb-2">Prayer</h3>
                <p className="text-muted-foreground italic leading-relaxed">&ldquo;{selectedArchangel.prayer}&rdquo;</p>
              </div>
              <div>
                <h3 className="font-medium text-primary mb-2">Signs of Presence</h3>
                <ul className="space-y-1">
                  {selectedArchangel.signs_of_presence?.map((sign) => (
                    <li key={sign} className="text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />{sign}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8" data-testid="archangel-browse-list">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif">Meet the Archangels</h2>
        <Button variant="ghost" size="sm" onClick={() => setShowBrowse(false)} data-testid="archangel-browse-close-btn">Close</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allArchangels.map((angel) => (
          <motion.div
            key={angel.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedArchangel(angel)}
            className={`rounded-xl bg-gradient-to-br ${elementColors[angel.element]} border cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/10 overflow-hidden`}
            data-testid={`archangel-browse-card-${angel.id}`}
          >
            <div className="aspect-square overflow-hidden">
              <img src={getArchangelImage(angel)} alt={angel.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-testid={`archangel-card-image-${angel.id}`} />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Feather className={`w-5 h-5 ${elementTextColors[angel.element]}`} />
                <h3 className="font-serif text-lg">{angel.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{angel.title}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {angel.keywords?.slice(0, 3).map((kw) => (
                  <span key={`${angel.id}-${kw}`} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">{kw}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
