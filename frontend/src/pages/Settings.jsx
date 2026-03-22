import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Bell, Clock, Calendar, Save, Moon, Sun, User, LogOut, 
  Sparkles, Smartphone, Globe
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";
import { useNotifications } from "../components/NotificationSystem";

const Settings = ({ user, api }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rituals, setRituals] = useState([]);
  
  // Get notification context
  const { 
    preferences: notificationPrefs, 
    updatePreferences: updateNotificationPrefs,
    supportsNotifications,
    sendTestNotification
  } = useNotifications();
  
  const [reminderSettings, setReminderSettings] = useState({
    enabled: false,
    time: "08:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    ritual_id: null,
    message: "Time for your sacred practice",
  });

  const daysOfWeek = [
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
    { value: "sunday", label: "Sun" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reminderRes, ritualsRes] = await Promise.all([
        api.get("/settings/reminders"),
        api.get("/rituals"),
      ]);
      setReminderSettings(reminderRes.data);
      setRituals(ritualsRes.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put("/settings/reminders", reminderSettings);
      toast.success("Settings saved!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setReminderSettings(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Blessed journey, until we meet again");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="settings-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Customize</p>
              <h1 className="text-xl font-serif">Settings <span className="italic text-primary">& Profile</span></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-card/50 border border-white/5"
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
                  <h3 className="text-lg font-medium">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Daily Reminders Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-card/50 border border-white/5"
            >
              <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Daily Practice Reminders
              </h2>
              
              <div className="space-y-6">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified for your daily practice</p>
                  </div>
                  <Switch
                    checked={reminderSettings.enabled}
                    onCheckedChange={(checked) => 
                      setReminderSettings(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>

                {reminderSettings.enabled && (
                  <>
                    {/* Time Picker */}
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Reminder Time
                      </label>
                      <Input
                        type="time"
                        value={reminderSettings.time}
                        onChange={(e) => 
                          setReminderSettings(prev => ({ ...prev, time: e.target.value }))
                        }
                        className="bg-card/50 border-white/10 w-40"
                      />
                    </div>

                    {/* Days Selection */}
                    <div>
                      <label className="block text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Practice Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <button
                            key={day.value}
                            onClick={() => toggleDay(day.value)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all
                                       ${reminderSettings.days.includes(day.value)
                                         ? 'bg-primary/20 border-primary text-primary'
                                         : 'bg-white/5 border-white/10 text-muted-foreground'}
                                       border`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Linked Ritual */}
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Link to Ritual (optional)
                      </label>
                      <Select
                        value={reminderSettings.ritual_id || "none"}
                        onValueChange={(v) => 
                          setReminderSettings(prev => ({ 
                            ...prev, 
                            ritual_id: v === "none" ? null : v 
                          }))
                        }
                      >
                        <SelectTrigger className="bg-card/50 border-white/10">
                          <SelectValue placeholder="Select a ritual" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No specific ritual</SelectItem>
                          {rituals.map((ritual) => (
                            <SelectItem key={ritual.ritual_id} value={ritual.ritual_id}>
                              {ritual.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Message */}
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Reminder Message
                      </label>
                      <Input
                        value={reminderSettings.message}
                        onChange={(e) => 
                          setReminderSettings(prev => ({ ...prev, message: e.target.value }))
                        }
                        placeholder="Time for your sacred practice"
                        className="bg-card/50 border-white/10"
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Save Button */}
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="w-full bg-primary"
              data-testid="save-settings-btn"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>

            {/* Notification Settings Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 rounded-2xl bg-card/50 border border-white/5"
            >
              <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Sacred Notifications
              </h2>
              
              <div className="space-y-6">
                {/* Moon Phase Alerts */}
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
                    onCheckedChange={(checked) => 
                      updateNotificationPrefs({ moonPhaseAlerts: checked })
                    }
                  />
                </div>

                {/* Daily Wisdom */}
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
                    onCheckedChange={(checked) => 
                      updateNotificationPrefs({ dailyWisdom: checked })
                    }
                  />
                </div>

                {/* Practice Reminders */}
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
                    onCheckedChange={(checked) => 
                      updateNotificationPrefs({ practiceReminders: checked })
                    }
                  />
                </div>

                {/* Browser Notifications */}
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
                      onCheckedChange={(checked) => 
                        updateNotificationPrefs({ browserNotifications: checked })
                      }
                    />
                  </div>
                )}

                {/* Notification Time */}
                <div className="pt-4 border-t border-white/10">
                  <label className="block text-sm text-muted-foreground mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Notification Time
                  </label>
                  <Input
                    type="time"
                    value={notificationPrefs.reminderTime || "08:00"}
                    onChange={(e) => 
                      updateNotificationPrefs({ reminderTime: e.target.value })
                    }
                    className="bg-card/50 border-white/10 w-40"
                  />
                </div>

                {/* Test Notification Button */}
                <Button
                  variant="outline"
                  onClick={sendTestNotification}
                  className="w-full"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
              </div>
            </motion.div>

            {/* Logout Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20"
            >
              <h2 className="text-xl font-serif mb-4 text-destructive">Sign Out</h2>
              <p className="text-sm text-muted-foreground mb-4">
                You will be signed out of your account on this device.
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
