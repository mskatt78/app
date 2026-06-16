import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export const IChingHexagramModal = ({ open, hexagrams, onClose, onSelectHexagram }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          data-testid="i-ching-hexagram-modal"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 bg-card p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-serif">The 64 Hexagrams</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10" data-testid="i-ching-close-hexagram-list-button">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {hexagrams.map((hex) => (
                <div
                  key={hex.id}
                  onClick={() => onSelectHexagram(hex)}
                  className="cursor-pointer p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-center"
                  data-testid={`i-ching-hexagram-item-${hex.number}`}
                >
                  <div className="text-2xl mb-1">{hex.chinese}</div>
                  <p className="text-xs text-muted-foreground">{hex.number}. {hex.name}</p>
                </div>
              ))}
              {hexagrams.length < 64 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>More hexagrams coming soon...</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
