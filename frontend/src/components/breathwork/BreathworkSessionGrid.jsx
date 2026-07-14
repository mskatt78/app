import { motion } from "framer-motion";
import { Crown, Lock, Wind } from "lucide-react";
import { getBreathworkImage } from "../../utils/shamanicImageTheme";

export const BreathworkSessionGrid = ({
  filteredSessions,
  elementColors,
  startSession,
  canAccessSession,
  onLockedSessionSelect,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="breathwork-session-grid">
    {filteredSessions.map((session, index) => {
      const colors = elementColors[session.element] || elementColors.Air;
      const locked = session.is_premium && !canAccessSession(session);
      return (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300 relative`}
          onClick={() => (locked ? onLockedSessionSelect(session) : startSession(session))}
          data-testid={`session-card-${session.id}`}
        >
          {locked && (
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex items-center justify-center" data-testid={`breathwork-locked-overlay-${session.id}`}>
              <div className="text-center px-4">
                <Lock className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                <p className="text-sm text-amber-200">Premium Breathlove</p>
                <p className="text-xs text-amber-100/70">Tap to unlock</p>
              </div>
            </div>
          )}
          <div className="relative h-36 overflow-hidden">
            <img src={getBreathworkImage(session)} alt={session.name} className="w-full h-full object-cover" loading="lazy" data-testid={`breathwork-session-image-${session.id}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text} backdrop-blur-sm`}>{session.element}</span>
            {session.is_premium && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-100 flex items-center gap-1" data-testid={`breathwork-premium-badge-${session.id}`}>
                <Crown className="w-3 h-3" />
                {session.premium_label || "Premium"}
              </span>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${colors.bg}`}><Wind className={`w-6 h-6 ${colors.text}`} /></div>
              <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>{session.element}</span>
            </div>

            <h3 className="text-xl font-serif mb-2">{session.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{session.description}</p>

            {session.is_premium && (
              <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-100" data-testid={`breathwork-premium-inline-${session.id}`}>
                <Crown className="w-3 h-3" />
                {session.premium_label || "Premium"}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{session.duration_minutes} minutes</span>
              <span className="text-xs">{session.pattern.inhale}-{session.pattern.hold}-{session.pattern.exhale}{session.pattern.hold_empty > 0 ? `-${session.pattern.hold_empty}` : ""}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {session.benefits?.slice(0, 3).map((benefit) => (
                <span key={benefit} className="px-2 py-1 rounded-full bg-white/5 text-xs">{benefit}</span>
              ))}
            </div>

            {(session.best_for_tags || []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2" data-testid={`breathwork-best-for-tags-${session.id}`}>
                {session.best_for_tags.map((tag) => (
                  <span key={`breathwork-best-for-${session.id}-${tag}`} className="px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] text-emerald-100">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {session.safety_notes && (
              <div className="mt-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20" data-testid={`breathwork-safety-notes-${session.id}`}>
                <p className="text-[10px] uppercase tracking-wider text-rose-300 mb-1">Safety</p>
                <p className="text-[11px] text-rose-100/90 line-clamp-2">{session.safety_notes}</p>
              </div>
            )}

            {locked && (
              <p className="mt-3 text-xs text-amber-200" data-testid={`breathwork-locked-text-${session.id}`}>
                This Breathlove journey is locked. Purchase premium section access to begin.
              </p>
            )}

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
