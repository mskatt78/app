import { motion } from "framer-motion";
import { Bell, Clock, Moon, Smartphone, Sun } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";

const CARD_INITIAL = { opacity: 0, y: 20 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_TRANSITION = { delay: 0.15 };

export const SettingsNotificationsCard = ({
  notificationPrefs,
  updateNotificationPrefs,
  supportsNotifications,
  sendTestNotification,
}) => (
  <motion.div
    initial={CARD_INITIAL}
    animate={CARD_ANIMATE}
    transition={CARD_TRANSITION}
    className="p-6 rounded-2xl bg-card/50 border border-white/5"
    data-testid="settings-notifications-card"
  >
    <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
      <Sun className="w-5 h-5 text-primary" />
      Sacred Notifications
    </h2>

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-400" />
            Moon Phase Alerts
          </p>
          <p className="text-sm text-muted-foreground">Get notified on New & Full Moons</p>
        </div>
        <Switch
          checked={notificationPrefs.moonPhaseAlerts}
          onCheckedChange={(checked) => updateNotificationPrefs({ moonPhaseAlerts: checked })}
          data-testid="settings-moon-phase-alerts-switch"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            Daily Wisdom
          </p>
          <p className="text-sm text-muted-foreground">Receive daily spiritual inspiration</p>
        </div>
        <Switch
          checked={notificationPrefs.dailyWisdom}
          onCheckedChange={(checked) => updateNotificationPrefs({ dailyWisdom: checked })}
          data-testid="settings-daily-wisdom-switch"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            Practice Reminders
          </p>
          <p className="text-sm text-muted-foreground">Gentle nudge for daily practice</p>
        </div>
        <Switch
          checked={notificationPrefs.practiceReminders}
          onCheckedChange={(checked) => updateNotificationPrefs({ practiceReminders: checked })}
          data-testid="settings-practice-reminders-switch"
        />
      </div>

      {supportsNotifications && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <p className="font-medium flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-400" />
              Browser Notifications
            </p>
            <p className="text-sm text-muted-foreground">Receive notifications even when app is closed</p>
          </div>
          <Switch
            checked={notificationPrefs.browserNotifications}
            onCheckedChange={(checked) => updateNotificationPrefs({ browserNotifications: checked })}
            data-testid="settings-browser-notifications-switch"
          />
        </div>
      )}

      <div className="pt-4 border-t border-white/10">
        <label className="block text-sm text-muted-foreground mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Notification Time
        </label>
        <Input
          type="time"
          value={notificationPrefs.reminderTime || "08:00"}
          onChange={(event) => updateNotificationPrefs({ reminderTime: event.target.value })}
          className="bg-card/50 border-white/10 w-40"
          data-testid="settings-notification-time-input"
        />
      </div>

      <Button variant="outline" onClick={sendTestNotification} className="w-full" data-testid="settings-test-notification-btn">
        <Bell className="w-4 h-4 mr-2" />
        Send Test Notification
      </Button>
    </div>
  </motion.div>
);
