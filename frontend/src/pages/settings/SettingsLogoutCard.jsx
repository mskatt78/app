import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";

const CARD_INITIAL = { opacity: 0, y: 20 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_TRANSITION = { delay: 0.2 };

export const SettingsLogoutCard = ({ handleLogout }) => (
  <motion.div
    initial={CARD_INITIAL}
    animate={CARD_ANIMATE}
    transition={CARD_TRANSITION}
    className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20"
    data-testid="settings-logout-card"
  >
    <h2 className="text-xl font-serif mb-4 text-destructive">Sign Out</h2>
    <p className="text-sm text-muted-foreground mb-4">
      You will be signed out of your account on this device.
    </p>
    <Button variant="destructive" onClick={handleLogout} data-testid="logout-btn">
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  </motion.div>
);
