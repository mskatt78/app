import { AnimatePresence, motion } from "framer-motion";
import { Star, X } from "lucide-react";
import { Button } from "../ui/button";
import { stableHumanDesignKey } from "./humanDesignData";

export const HumanDesignModals = ({ selectedType, setSelectedType, selectedCenter, setSelectedCenter }) => (
  <>
    <AnimatePresence>
      {selectedType && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedType(null)}
          data-testid="human-design-type-modal-overlay"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
            data-testid="human-design-type-modal"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-serif">{selectedType.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedType.population} of population</p>
                </div>
                <button onClick={() => setSelectedType(null)} className="p-2 rounded-full hover:bg-white/10" data-testid="human-design-close-type-modal-btn">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-muted-foreground">{selectedType.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Strategy</p>
                  <p className="font-medium">{selectedType.strategy}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Aura</p>
                  <p className="font-medium text-sm">{selectedType.aura}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Signature</p>
                  <p className="font-medium">{selectedType.signature}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Not-Self</p>
                  <p className="font-medium">{selectedType.notSelf}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Key Traits</h4>
                <ul className="space-y-2">
                  {selectedType.keyTraits.map((trait) => (
                    <li key={stableHumanDesignKey(`modal-trait-${selectedType.id}`, trait)} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <h4 className="font-medium mb-2 text-violet-300">Deconditioning</h4>
                <p className="text-sm text-muted-foreground">{selectedType.deconditioning}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
                <p className="text-lg font-serif italic">"{selectedType.affirmation}"</p>
              </div>

              <Button onClick={() => setSelectedType(null)} className="w-full" variant="outline" data-testid="human-design-close-type-modal-footer-btn">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {selectedCenter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCenter(null)}
          data-testid="human-design-center-modal-overlay"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
            data-testid="human-design-center-modal"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-serif">{selectedCenter.name} Center</h2>
                  <p className="text-sm text-muted-foreground">{selectedCenter.theme}</p>
                </div>
                <button onClick={() => setSelectedCenter(null)} className="p-2 rounded-full hover:bg-white/10" data-testid="human-design-close-center-modal-btn">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">When Defined (Colored)</p>
                  <p className="text-sm text-muted-foreground">{selectedCenter.defined}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">When Undefined (White)</p>
                  <p className="text-sm text-muted-foreground">{selectedCenter.undefined}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Biological Correlation</p>
                <p className="text-sm">{selectedCenter.biological}</p>
              </div>

              <Button onClick={() => setSelectedCenter(null)} className="w-full" variant="outline" data-testid="human-design-close-center-modal-footer-btn">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
