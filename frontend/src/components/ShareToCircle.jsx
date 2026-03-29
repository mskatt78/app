import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axios from "axios";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const ELEMENTS = ["Earth", "Water", "Fire", "Air", "Spirit"];

/**
 * ShareToCircle — modal for sharing a practice reflection to the Community Sacred Circle.
 * Props:
 *   practiceTitle: string  (pre-fills the post title)
 *   practiceType:  string  (post type: "journey" | "insight" | "gratitude" | "question")
 *   defaultElement: string (optional default element)
 *   onClose: fn            (called when closed or submitted)
 */
export default function ShareToCircle({ practiceTitle, practiceType = "journey", defaultElement = "Spirit", onClose }) {
  const [authorName, setAuthorName] = useState("");
  const [reflection, setReflection] = useState("");
  const [element, setElement] = useState(defaultElement);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!reflection.trim()) {
      toast.error("Please write a reflection before sharing");
      return;
    }
    setLoading(true);
    try {
      await api.post("/community/posts", {
        title: practiceTitle || "Sacred Practice Reflection",
        content: reflection.trim(),
        author: authorName.trim() || "Sacred Seeker",
        author_name: authorName.trim() || "Sacred Seeker",
        type: practiceType,
        element: element,
        tags: [practiceTitle, "practice", element.toLowerCase()].filter(Boolean),
      });
      toast.success("Your reflection has been shared to the Sacred Circle");
      onClose?.();
    } catch {
      toast.error("Could not share to Sacred Circle — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-card border border-rose-500/20 p-6 shadow-2xl"
        data-testid="share-to-circle-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10">
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-rose-100">Share to Sacred Circle</h3>
              {practiceTitle && (
                <p className="text-xs text-muted-foreground">{practiceTitle}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Reflection */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Your Reflection</label>
            <textarea
              placeholder="Share what arose for you during this practice... your insights, feelings, breakthroughs..."
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-rose-500/40 text-foreground placeholder:text-muted-foreground/40 resize-none leading-relaxed"
              data-testid="share-reflection-input"
              autoFocus
            />
          </div>

          {/* Name + Element row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                placeholder="Sacred Seeker"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-rose-500/40 text-foreground placeholder:text-muted-foreground/40"
                data-testid="share-author-input"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Element</label>
              <select
                value={element}
                onChange={e => setElement(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-rose-500/40 text-foreground"
                data-testid="share-element-select"
              >
                {ELEMENTS.map(el => (
                  <option key={el} value={el} className="bg-card">{el}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" onClick={onClose} className="flex-1 text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={loading || !reflection.trim()}
              className="flex-1 bg-rose-500/80 hover:bg-rose-500 text-white"
              data-testid="share-submit-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Share
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
