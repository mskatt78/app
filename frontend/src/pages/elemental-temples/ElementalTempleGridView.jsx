import { motion } from "framer-motion";
import { ChevronRight, Lock } from "lucide-react";

export const ElementalTempleGridView = ({
  elements,
  setActiveTemple,
  setActiveSection,
  canAccessTemple,
  onLockedTemple,
}) => (
  <motion.div
    key="grid"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
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
        const locked = !canAccessTemple(el);
        return (
          <motion.div
            key={el.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              if (locked) {
                onLockedTemple?.(el);
                return;
              }
              setActiveTemple(el);
              setActiveSection("why_it_heals");
            }}
            data-testid={`temple-${el.id}`}
            className={`group cursor-pointer relative overflow-hidden rounded-2xl border
                       ${el.color.bg} ${el.color.border}
                       hover:scale-[1.02] transition-all duration-300 hover:shadow-xl ${el.color.glow}`}
          >
            {locked && (
              <div className="absolute top-3 left-3 z-10">
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-100 text-xs" data-testid={`elemental-temple-premium-badge-${el.id}`}>
                  <Lock className="w-3 h-3" /> Premium
                </span>
              </div>
            )}
            {el.image && (
              <div className="relative h-36 overflow-hidden">
                <img
                  src={el.image}
                  alt={el.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent`} />
                <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl ${el.color.bg} border ${el.color.border} flex items-center justify-center backdrop-blur-sm`}>
                  <Icon className={`w-6 h-6 ${el.color.text}`} />
                </div>
                <span className={`absolute top-4 right-4 text-2xl font-serif ${el.color.text}`}>{el.element}</span>
              </div>
            )}
            <div className="p-5">
              <h3 className="text-xl font-serif mb-1">{el.name}</h3>
              <p className={`text-sm ${el.color.text} mb-3 italic`}>{el.tagline}</p>
              <p className="text-base text-muted-foreground line-clamp-3 leading-relaxed">{el.description}</p>
              <div className={`mt-4 flex items-center gap-1 text-sm ${el.color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <ChevronRight className="w-4 h-4" />
                <span>Enter Temple</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);