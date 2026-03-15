import { motion } from "framer-motion";
import { Lock, Sparkles, Trophy } from "lucide-react";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";

export const LockedContentOverlay = ({ 
  isLocked, 
  unlockRequirement,
  children,
  className = ""
}) => {
  const navigate = useNavigate();

  if (!isLocked) return children;

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content behind */}
      <div className="blur-[2px] opacity-40 pointer-events-none">
        {children}
      </div>
      
      {/* Lock overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/50 to-transparent rounded-2xl"
      >
        <div className="text-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center"
          >
            <Lock className="w-7 h-7 text-amber-400" />
          </motion.div>
          <p className="text-amber-400 font-medium mb-1">Sacred Content Locked</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
            {unlockRequirement || "Complete achievements to unlock this practice"}
          </p>
          <Button 
            size="sm" 
            variant="outline"
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            onClick={() => navigate("/achievements")}
          >
            <Trophy className="w-3 h-3 mr-2" />
            View Achievements
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const UnlockBadge = ({ isUnlocked, className = "" }) => {
  if (!isUnlocked) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 ${className}`}
    >
      <Sparkles className="w-4 h-4 text-white" />
    </motion.div>
  );
};

export const LockedIndicator = ({ isLocked, size = "default" }) => {
  if (!isLocked) return null;
  
  const sizeClasses = {
    small: "w-5 h-5 text-xs",
    default: "w-6 h-6 text-sm",
    large: "w-8 h-8 text-base"
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center`}>
      <Lock className="w-3 h-3 text-amber-400" />
    </div>
  );
};
