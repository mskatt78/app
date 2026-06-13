import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";

export const SettingsLogoutCard = ({ handleLogout }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
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
