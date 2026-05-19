import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Moon, Sun, Sparkles, Calendar, Check } from "lucide-react";
import { toast } from "sonner";

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

// Check if browser supports notifications
const supportsNotifications = () => {
  return "Notification" in window && "serviceWorker" in navigator;
};

// Request permission for push notifications
const requestPermission = async () => {
  if (!supportsNotifications()) return false;
  
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Notification permission error:", error);
    return false;
  }
};

// Send a browser notification
const sendBrowserNotification = (title, options = {}) => {
  if (!supportsNotifications() || Notification.permission !== "granted") return;
  
  const notification = new Notification(title, {
    icon: "/logo192.png",
    badge: "/logo192.png",
    ...options
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};

// Default notification preferences
const defaultPreferences = {
  moonPhaseAlerts: true,
  dailyWisdom: true,
  practiceReminders: true,
  reminderTime: "08:00",
  browserNotifications: false
};

// Moon phase messages
const moonPhaseMessages = {
  new: "New Moon tonight. Perfect time for setting intentions and new beginnings.",
  waxing_crescent: "Waxing Crescent Moon. Nurture what you've planted.",
  first_quarter: "First Quarter Moon. Time to take action on your intentions.",
  waxing_gibbous: "Waxing Gibbous Moon. Refine and adjust your path.",
  full: "Full Moon tonight! Time for celebration, gratitude, and release.",
  waning_gibbous: "Waning Gibbous Moon. Share your wisdom with others.",
  third_quarter: "Third Quarter Moon. Time for reflection and shedding.",
  waning_crescent: "Waning Crescent Moon. Rest, surrender, and prepare for renewal."
};

const calculateMoonPhase = (date) => {
  const lunarCycle = 29.53059;
  const knownNewMoon = new Date("2024-01-11T11:57:00Z");
  const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;

  if (phase < 1.85) return "new";
  if (phase < 7.38) return "waxing_crescent";
  if (phase < 9.23) return "first_quarter";
  if (phase < 14.76) return "waxing_gibbous";
  if (phase < 16.61) return "full";
  if (phase < 22.14) return "waning_gibbous";
  if (phase < 23.99) return "third_quarter";
  return "waning_crescent";
};

// Daily wisdom messages (rotating)
const dailyWisdomMessages = [
  "Your breath is your anchor. Return to it throughout the day.",
  "The universe is always listening. Speak your truth.",
  "Ground yourself. Feel your roots extending into the earth.",
  "What you seek is also seeking you.",
  "Trust the timing of your life.",
  "You are the medicine you've been looking for.",
  "Honor your journey. Every step has meaning.",
  "Today, let love be your compass.",
  "Your energy introduces you before you speak.",
  "Be still. The answers are within.",
  "You are worthy of all the beauty life offers.",
  "Sacred practice is remembering who you truly are.",
  "The stars aligned for your birth. You belong here.",
  "Water your own garden today.",
  "Your ancestors walk with you."
];

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("notificationPreferences");
    return saved ? JSON.parse(saved) : defaultPreferences;
  });
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
  }, [preferences]);

  const addInAppNotification = useCallback((notification) => {
    const id = Date.now();
    setInAppNotifications(prev => [
      { ...notification, id, timestamp: new Date(), read: false },
      ...prev.slice(0, 19) // Keep max 20 notifications
    ]);
  }, []);

  const checkDailyNotifications = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();
    const lastCheck = localStorage.getItem("lastNotificationCheck");

    // Only check once per day
    if (lastCheck === today) return;

    // Check if it's the reminder time
    const [hours, minutes] = (preferences.reminderTime || "08:00").split(":");
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (now >= reminderTime) {
      localStorage.setItem("lastNotificationCheck", today);

      // Send daily wisdom
      if (preferences.dailyWisdom) {
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const wisdomIndex = dayOfYear % dailyWisdomMessages.length;
        
        addInAppNotification({
          type: "wisdom",
          title: "Daily Wisdom",
          message: dailyWisdomMessages[wisdomIndex],
          icon: Sparkles
        });

        if (preferences.browserNotifications) {
          sendBrowserNotification("Daily Wisdom", {
            body: dailyWisdomMessages[wisdomIndex],
            tag: "daily-wisdom"
          });
        }
      }

      // Check moon phase for alerts
      if (preferences.moonPhaseAlerts) {
        const moonPhase = calculateMoonPhase(now);
        if (moonPhase === "new" || moonPhase === "full") {
          addInAppNotification({
            type: "moon",
            title: moonPhase === "full" ? "Full Moon" : "New Moon",
            message: moonPhaseMessages[moonPhase],
            icon: Moon
          });

          if (preferences.browserNotifications) {
            sendBrowserNotification(moonPhase === "full" ? "Full Moon Tonight" : "New Moon Tonight", {
              body: moonPhaseMessages[moonPhase],
              tag: "moon-phase"
            });
          }
        }
      }

      // Practice reminder
      if (preferences.practiceReminders) {
        addInAppNotification({
          type: "reminder",
          title: "Sacred Practice Reminder",
          message: "Take a moment today for your spiritual practice. Even 5 minutes matters.",
          icon: Sun
        });
      }
    }
  }, [preferences, addInAppNotification]);

  // Check for daily notifications on mount and set interval
  useEffect(() => {
    checkDailyNotifications();

    const interval = setInterval(checkDailyNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkDailyNotifications]);

  const markAsRead = (id) => {
    setInAppNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearNotification = (id) => {
    setInAppNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setInAppNotifications([]);
  };

  const updatePreferences = async (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    
    // Request browser notification permission if enabling
    if (newPrefs.browserNotifications && !preferences.browserNotifications) {
      const granted = await requestPermission();
      if (!granted) {
        toast.error("Browser notification permission denied");
        updated.browserNotifications = false;
      } else {
        toast.success("Browser notifications enabled!");
      }
    }
    
    setPreferences(updated);
  };

  const unreadCount = inAppNotifications.filter(n => !n.read).length;

  const value = {
    preferences,
    updatePreferences,
    inAppNotifications,
    addInAppNotification,
    markAsRead,
    clearNotification,
    clearAllNotifications,
    unreadCount,
    showNotificationCenter,
    setShowNotificationCenter,
    supportsNotifications: supportsNotifications(),
    sendTestNotification: () => {
      addInAppNotification({
        type: "test",
        title: "Test Notification",
        message: "Your notifications are working correctly!",
        icon: Bell
      });
      if (preferences.browserNotifications) {
        sendBrowserNotification("Test Notification", {
          body: "Your browser notifications are working!"
        });
      }
      toast.success("Test notification sent!");
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Bell Component (for header)
export const NotificationBell = () => {
  const { unreadCount, setShowNotificationCenter } = useNotifications();

  return (
    <button
      onClick={() => setShowNotificationCenter(true)}
      className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      data-testid="notification-bell"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

// Notification Center Panel
export const NotificationCenter = () => {
  const { 
    inAppNotifications, 
    showNotificationCenter, 
    setShowNotificationCenter,
    markAsRead,
    clearNotification,
    clearAllNotifications
  } = useNotifications();

  if (!showNotificationCenter) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowNotificationCenter(false)}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-white/10 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card/90 backdrop-blur-xl p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-serif">Notifications</h2>
            <div className="flex items-center gap-2">
              {inAppNotifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowNotificationCenter(false)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-4 space-y-3">
            {inAppNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No notifications yet</p>
                <p className="text-sm">Sacred messages will appear here</p>
              </div>
            ) : (
              inAppNotifications.map((notification) => {
                const Icon = notification.icon || Bell;
                const typeColors = {
                  wisdom: "bg-amber-500/10 border-amber-500/20",
                  moon: "bg-purple-500/10 border-purple-500/20",
                  reminder: "bg-blue-500/10 border-blue-500/20",
                  test: "bg-green-500/10 border-green-500/20"
                };
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${typeColors[notification.type] || "bg-white/5 border-white/10"} 
                              ${!notification.read ? "ring-1 ring-primary/30" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="p-1 rounded-full hover:bg-white/10 flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationProvider;
