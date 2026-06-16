import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export const RuneLibraryModal = ({ open, runes, onClose, onSelectRune }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          data-testid="rune-library-modal"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 bg-card p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-serif">Elder Futhark Runes</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10" data-testid="rune-library-close-btn">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
              {runes.map((rune) => (
                <div
                  key={rune.id}
                  onClick={() => onSelectRune(rune)}
                  className="cursor-pointer p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-center"
                  data-testid={`rune-library-item-${rune.id}`}
                >
                  <div className="text-3xl font-serif text-amber-300 mb-1">{rune.symbol}</div>
                  <p className="text-xs text-muted-foreground truncate">{rune.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
