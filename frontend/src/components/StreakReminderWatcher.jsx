import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

const localDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const StreakReminderWatcher = ({ api }) => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        if (localStorage.getItem("streakReminderEnabled") === "false") return;
        const reminderTime = localStorage.getItem("streakReminderTime") || "19:00";
        const [hours, minutes] = reminderTime.split(":").map(Number);
        const now = new Date();
        if (now.getHours() * 60 + now.getMinutes() < hours * 60 + minutes) return;

        const today = localDateKey(now);
        if (localStorage.getItem("streakReminderLastShown") === today) return;

        const response = await api.get("/practice-history", { params: { limit: 10 } });
        if (cancelled) return;
        const entries = Array.isArray(response.data) ? response.data : [];
        const utcToday = now.toISOString().slice(0, 10);
        const practicedToday = entries.some((entry) => {
          const stamp = String(entry.completed_at || "").slice(0, 10);
          return stamp === utcToday || stamp === today;
        });

        localStorage.setItem("streakReminderLastShown", today);
        if (practicedToday) return;

        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Your streak awaits", {
              body: "The temple is open. A few sacred minutes tonight keeps your practice streak alive.",
              icon: "/icon-192.png",
              badge: "/icon-192.png",
              tag: "streak-reminder",
            });
          } catch (error) {
            appLogger.debug("Streak OS notification skipped", error);
          }
        }

        toast("Your streak awaits", {
          description: "You haven't practiced today. A few sacred minutes keeps the flame alive.",
          duration: 12000,
          action: {
            label: "Practice now",
            onClick: () => navigate("/meditations"),
          },
        });
      } catch (error) {
        appLogger.debug("Streak reminder check skipped", error);
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [api, navigate]);

  return null;
};
