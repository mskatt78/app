import { motion } from "framer-motion";
import { Wind } from "lucide-react";

export const BreathworkSessionGrid = ({ filteredSessions, elementColors, startSession }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="breathwork-session-grid">
    {filteredSessions.map((session, index) => {
      const colors = elementColors[session.element] || elementColors.Air;
      return (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
          onClick={() => startSession(session)}
          data-testid={`session-card-${session.id}`}
        >
          {session.image_url && (
            <div className="relative h-36 overflow-hidden">
              <img src={session.image_url} alt={session.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text} backdrop-blur-sm`}>{session.element}</span>
            </div>
          )}
          <div className="p-6">
            {!session.image_url && (
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg}`}><Wind className={`w-6 h-6 ${colors.text}`} /></div>
                <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>{session.element}</span>
              </div>
            )}

            <h3 className="text-xl font-serif mb-2">{session.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{session.description}</p>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{session.duration_minutes} minutes</span>
              <span className="text-xs">{session.pattern.inhale}-{session.pattern.hold}-{session.pattern.exhale}{session.pattern.hold_empty > 0 ? `-${session.pattern.hold_empty}` : ""}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {session.benefits?.slice(0, 3).map((benefit) => (
                <span key={benefit} className="px-2 py-1 rounded-full bg-white/5 text-xs">{benefit}</span>
              ))}
            </div>

            {session.frequency && (
              <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-primary">Frequency:</span> {session.frequency.split(" - ")[0]}
              </div>
            )}

            {(session.youtube_tutorials || []).length > 0 && (
              <a
                href={session.youtube_tutorials[0].url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="mt-3 inline-block text-xs text-cyan-200 underline underline-offset-2"
                data-testid={`breathwork-youtube-link-${session.id}`}
              >
                {session.youtube_tutorials[0].title}
              </a>
            )}

            {session.content_integrity?.verified && (
              <p className="mt-2 text-[11px] text-cyan-300/90" data-testid={`breathwork-integrity-${session.id}`}>
                Verified references ({session.content_integrity.references_count || 0})
              </p>
            )}
            {session.content_integrity?.last_reviewed_at && (
              <p className="text-[11px] text-muted-foreground" data-testid={`breathwork-reviewed-at-${session.id}`}>
                Last reviewed: {new Date(session.content_integrity.last_reviewed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </motion.div>
      );
    })}
  </div>
);
