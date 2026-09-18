import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NextInitiationCard = ({ api }) => {
  const navigate = useNavigate();
  const [next, setNext] = useState(null);
  const [allComplete, setAllComplete] = useState(false);

  useEffect(() => {
    if (!api) return;
    api.get("/mystery-journey/next")
      .then(({ data }) => {
        setNext(data?.next || null);
        setAllComplete(Boolean(data?.all_complete));
      })
      .catch(() => setNext(null));
  }, [api]);

  if (!next && !allComplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 to-black/20 backdrop-blur-xl"
      data-testid="next-initiation-card"
    >
      <div className="flex items-center gap-2 mb-1">
        <ScrollText className="w-4 h-4 text-amber-300" />
        <p className="text-xs uppercase tracking-wider text-amber-200/80">Your Next Initiation</p>
      </div>
      {allComplete ? (
        <p className="text-sm text-muted-foreground mt-1">Every lineage path is complete — you have walked them all. Return to any journey whenever you are called.</p>
      ) : (
        <>
          <h3 className="text-lg font-serif mt-1" data-testid="next-initiation-name">{next.teaching.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Initiation {next.teaching.position} of {next.teaching.total} · {next.stream_label}
          </p>
          <button
            onClick={() => navigate(`/mystery-school-teachings?stream=${next.stream}`)}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs bg-amber-500/20 border border-amber-400/40 text-amber-100 hover:bg-amber-500/30 transition-colors"
            data-testid="next-initiation-go-btn"
          >
            Continue the path <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </motion.div>
  );
};
