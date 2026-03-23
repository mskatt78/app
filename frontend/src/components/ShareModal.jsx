import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, Twitter, Facebook, Link2, Copy, Check, X, 
  MessageCircle, Mail, Download
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const ShareModal = ({ isOpen, onClose, title, description, url, image }) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || window.location.href;
  const shareTitle = title || "Sacred Practice from Soul Temple 2.0";
  const shareText = description || "Discover this beautiful spiritual practice";

  const shareLinks = [
    {
      name: "Twitter/X",
      icon: Twitter,
      color: "bg-black hover:bg-gray-800",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
        onClose();
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    }
  };

  const handleShareClick = (shareLink) => {
    window.open(shareLink.url, '_blank', 'width=600,height=400');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-serif">Share</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-medium text-sm line-clamp-2">{shareTitle}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{shareText}</p>
            </div>

            {/* Native Share Button (if available) */}
            {navigator.share && (
              <Button 
                onClick={handleNativeShare}
                className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/30"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share via Device
              </Button>
            )}

            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {shareLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.name}
                    onClick={() => handleShareClick(link)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white transition-all ${link.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{link.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Copy Link */}
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground truncate">
                {shareUrl}
              </div>
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Simple share button component
export const ShareButton = ({ title, description, url, className = "" }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`p-2 rounded-full hover:bg-white/10 transition-colors ${className}`}
        title="Share"
      >
        <Share2 className="w-5 h-5" />
      </button>
      <ShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={title}
        description={description}
        url={url}
      />
    </>
  );
};

export default ShareModal;
