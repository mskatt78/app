import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Clock, Flame } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { daysOfWeek } from "./settingsConstants";

const CARD_INITIAL = { opacity: 0, y: 20 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_TRANSITION = { delay: 0.1 };

export const SettingsRemindersCard = ({ reminderSettings, setReminderSettings, rituals, toggleDay }) => {
  const reminderDays = reminderSettings.days || [];
  const [streakEnabled, setStreakEnabled] = useState(() => localStorage.getItem("streakReminderEnabled") !== "false");
  const [streakTime, setStreakTime] = useState(() => localStorage.getItem("streakReminderTime") || "19:00");

  const handleStreakToggle = async (checked) => {
    setStreakEnabled(checked);
    localStorage.setItem("streakReminderEnabled", checked ? "true" : "false");
    if (checked && "Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // in-app toast reminder still works without OS permission
      }
    }
  };

  const handleStreakTimeChange = (event) => {
    setStreakTime(event.target.value);
    localStorage.setItem("streakReminderTime", event.target.value);
  };

  return (
    <motion.div
      initial={CARD_INITIAL}
      animate={CARD_ANIMATE}
      transition={CARD_TRANSITION}
      className="p-6 rounded-2xl bg-card/50 border border-white/5"
      data-testid="settings-reminders-card"
    >
      <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        Daily Practice Reminders
      </h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Enable Reminders</p>
            <p className="text-sm text-muted-foreground">Get notified for your daily practice</p>
          </div>
          <Switch
            checked={reminderSettings.enabled}
            onCheckedChange={(checked) => setReminderSettings((current) => ({ ...current, enabled: checked }))}
            data-testid="settings-reminders-enabled-switch"
          />
        </div>

        {reminderSettings.enabled && (
          <>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Reminder Time
              </label>
              <Input
                type="time"
                value={reminderSettings.time}
                onChange={(event) => setReminderSettings((current) => ({ ...current, time: event.target.value }))}
                className="bg-card/50 border-white/10 w-40"
                data-testid="settings-reminders-time-input"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-3">
                <Calendar className="w-4 h-4 inline mr-1" />
                Practice Days
              </label>
              <div className="flex flex-wrap gap-2" data-testid="settings-reminders-days-grid">
                {daysOfWeek.map((day) => {
                  const isSelected = reminderDays.includes(day.value);
                  const dayButtonClassName = isSelected
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-white/5 border-white/10 text-muted-foreground";

                  return (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${dayButtonClassName} border`}
                      data-testid={`settings-reminders-day-${day.value}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Link to Ritual (optional)</label>
              <Select
                value={reminderSettings.ritual_id || "none"}
                onValueChange={(value) => setReminderSettings((current) => ({ ...current, ritual_id: value === "none" ? null : value }))}
              >
                <SelectTrigger className="bg-card/50 border-white/10" data-testid="settings-reminders-ritual-select">
                  <SelectValue placeholder="Select a ritual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific ritual</SelectItem>
                  {rituals.map((ritual) => (
                    <SelectItem key={ritual.ritual_id} value={ritual.ritual_id}>{ritual.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Reminder Message</label>
              <Input
                value={reminderSettings.message}
                onChange={(event) => setReminderSettings((current) => ({ ...current, message: event.target.value }))}
                placeholder="Time for your sacred practice"
                className="bg-card/50 border-white/10"
                data-testid="settings-reminders-message-input"
              />
            </div>
          </>
        )}

        <div className="pt-6 border-t border-white/10 space-y-4" data-testid="settings-streak-protection">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Streak Protection
              </p>
              <p className="text-sm text-muted-foreground">A gentle evening nudge if you haven't practiced today</p>
            </div>
            <Switch
              checked={streakEnabled}
              onCheckedChange={handleStreakToggle}
              data-testid="settings-streak-protection-switch"
            />
          </div>

          {streakEnabled && (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Remind me after
              </label>
              <Input
                type="time"
                value={streakTime}
                onChange={handleStreakTimeChange}
                className="bg-card/50 border-white/10 w-40"
                data-testid="settings-streak-protection-time-input"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
