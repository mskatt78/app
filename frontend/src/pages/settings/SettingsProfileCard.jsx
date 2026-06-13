import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

export const SettingsProfileCard = ({ user }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-2xl bg-card/50 border border-white/5"
    data-testid="settings-profile-card"
  >
    <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
      <User className="w-5 h-5 text-primary" />
      Profile
    </h2>

    <div className="flex items-center gap-4">
      <Avatar className="w-16 h-16 border-2 border-primary/20">
        <AvatarImage src={user?.picture} alt={user?.name} />
        <AvatarFallback className="bg-primary/10 text-primary text-xl">
          {user?.name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-lg font-medium" data-testid="settings-profile-name">{user?.name}</h3>
        <p className="text-sm text-muted-foreground" data-testid="settings-profile-email">{user?.email}</p>
      </div>
    </div>
  </motion.div>
);
