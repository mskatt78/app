import { AnimatePresence, motion } from "framer-motion";
import { Cloud, Gift, Star, X } from "lucide-react";
import { Button } from "../ui/button";
import { stableGeneKey } from "./geneKeysData";

export const GeneKeysModals = ({ selectedKey, setSelectedKey, selectedSequence, setSelectedSequence }) => (
  <>
    <AnimatePresence>
      {selectedKey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedKey(null)}
          data-testid="gene-key-modal-overlay"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
            data-testid="gene-key-modal"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <span className="text-2xl font-serif text-violet-300">{selectedKey.key}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-serif">Gene Key {selectedKey.key}</h2>
                    <p className="text-sm text-muted-foreground italic">{selectedKey.theme}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedKey(null)} className="p-2 rounded-full hover:bg-white/10" data-testid="gene-key-close-modal-btn">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Cloud className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-300 uppercase tracking-wider">Shadow</span>
                  </div>
                  <p className="text-lg font-serif">{selectedKey.shadow}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-300 uppercase tracking-wider">Gift</span>
                  </div>
                  <p className="text-lg font-serif">{selectedKey.gift}</p>
                </div>
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-violet-400" />
                    <span className="text-xs text-violet-300 uppercase tracking-wider">Siddhi</span>
                  </div>
                  <p className="text-lg font-serif">{selectedKey.siddhi}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">DNA Codon</p>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-lg text-primary">{selectedKey.codon}</span>
                  <span className="text-muted-foreground">Amino Acid: {selectedKey.amino}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                <h4 className="font-medium mb-2 text-violet-300">Contemplation</h4>
                <p className="text-sm text-muted-foreground italic">
                  "How does the shadow of {selectedKey.shadow} show up in my life?
                  What would it look like to transform this into the gift of {selectedKey.gift}?"
                </p>
              </div>

              <Button onClick={() => setSelectedKey(null)} className="w-full" variant="outline" data-testid="gene-key-close-modal-footer-btn">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {selectedSequence && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedSequence(null)}
          data-testid="gene-sequence-modal-overlay"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
            data-testid="gene-sequence-modal"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-serif">{selectedSequence.name}</h2>
                  <p className="text-sm text-muted-foreground italic">{selectedSequence.subtitle}</p>
                </div>
                <button onClick={() => setSelectedSequence(null)} className="p-2 rounded-full hover:bg-white/10" data-testid="gene-sequence-close-modal-btn">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-muted-foreground">{selectedSequence.description}</p>

              <div>
                <h4 className="font-medium mb-3">The Spheres</h4>
                <div className="space-y-2">
                  {selectedSequence.spheres.map((sphere) => (
                    <div key={stableGeneKey(`sequence-sphere-${selectedSequence.id}`, sphere.name)} className="p-3 rounded-lg bg-white/5">
                      <p className="font-medium">{sphere.name}</p>
                      <p className="text-sm text-muted-foreground">{sphere.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <h4 className="font-medium mb-2 text-violet-300">Contemplation Guide</h4>
                <p className="text-sm text-muted-foreground">{selectedSequence.contemplation}</p>
              </div>

              <Button onClick={() => setSelectedSequence(null)} className="w-full" variant="outline" data-testid="gene-sequence-close-modal-footer-btn">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
