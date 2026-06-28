import { motion } from "framer-motion";
import { ShareButton } from "../../components/ShareModal";

const DIVINATION_FALLBACK_IMAGE = "https://images.pexels.com/photos/3815585/pexels-photo-3815585.jpeg?auto=compress&cs=tinysrgb&w=1200";

const handleDivinationImageError = (event) => {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = DIVINATION_FALLBACK_IMAGE;
};

const renderLine = (value, lineNumber) => {
  const isYang = value === 7 || value === 9;
  const isOld = value === 6 || value === 9;
  const yangLineClassName = `h-3 w-32 rounded-full ${isOld ? "bg-amber-500" : "bg-white"}`;
  const yinSegmentClassName = `h-3 w-14 rounded-full ${isOld ? "bg-amber-500" : "bg-white"}`;

  return (
    <motion.div
      key={`hexagram-line-${lineNumber}`}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: lineNumber * 0.1 }}
      className="flex items-center justify-center gap-2 my-1"
    >
      {isYang ? (
        <div className={yangLineClassName} />
      ) : (
        <>
          <div className={yinSegmentClassName} />
          <div className="w-4" />
          <div className={yinSegmentClassName} />
        </>
      )}
      {isOld && <span className="text-xs text-amber-400 ml-2">changing</span>}
    </motion.div>
  );
};

export const IChingResultCard = ({ result }) => {
  if (!result) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" data-testid="i-ching-result-card">
      <div className="p-8 rounded-2xl bg-card border border-white/10 text-center">
        <div className="h-52 rounded-xl overflow-hidden border border-white/10 mb-5" data-testid="i-ching-result-image-wrap">
          <img
            src={result.image_url || DIVINATION_FALLBACK_IMAGE}
            alt={result.name}
            className="w-full h-full object-cover"
            onError={handleDivinationImageError}
            data-testid="i-ching-result-image"
          />
        </div>
        <div className="flex flex-col-reverse items-center mb-6">
          {result.lines_cast?.map((value, index) => renderLine(value, index + 1))}
        </div>
        <h2 className="text-3xl font-serif mb-2">Hexagram {result.number}: {result.name}</h2>
        <p className="text-4xl mb-4">{result.chinese}</p>
        <div className="text-sm text-muted-foreground">{result.trigram_above} over {result.trigram_below} • {result.element} • {result.season}</div>
      </div>

      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <h3 className="font-serif text-xl mb-3 text-amber-300">The Judgment</h3>
        <p className="text-lg italic leading-relaxed">{result.judgment}</p>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="font-serif text-xl mb-3">Interpretation</h3>
        <p className="text-muted-foreground leading-relaxed">{result.meaning}</p>
      </div>

      {result.line_meanings && result.line_meanings.length > 0 && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20" data-testid="i-ching-changing-lines">
          <h3 className="font-serif text-xl mb-4 text-red-300">Changing Lines</h3>
          <div className="space-y-4">
            {result.line_meanings.map((lm) => (
              <div key={`changing-line-${lm.line}-${String(lm.meaning || "").slice(0, 40)}`} className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-red-400 mb-2">Line {lm.line}</p>
                <p className="text-muted-foreground">{lm.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <ShareButton
          title={`I Ching: Hexagram ${result.number} - ${result.name}`}
          description={`${result.chinese} - ${result.judgment?.substring(0, 120)}...`}
          className="border border-white/10 rounded-full px-6 py-3 hover:bg-white/5 inline-flex items-center gap-2"
          data-testid="i-ching-share-result-button"
        />
      </div>
    </motion.div>
  );
};
