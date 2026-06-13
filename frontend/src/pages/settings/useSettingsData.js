import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useNotifications } from "../../components/NotificationSystem";
import {
  GUIDED_NARRATION_MODES,
  getGuidedNarrationMode,
  setGuidedNarrationMode,
} from "../../utils/guidedNarrationSettings";
import {
  GUIDED_TONING_INTENSITIES,
  getGuidedToningIntensity,
  setGuidedToningIntensity,
} from "../../utils/guidedToningSettings";
import { appLogger } from "../../utils/logger";
import { DEFAULT_REMINDER_SETTINGS } from "./settingsConstants";

export const useSettingsData = ({ api, user, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState(null);
  const [rituals, setRituals] = useState([]);
  const [reminderSettings, setReminderSettings] = useState(DEFAULT_REMINDER_SETTINGS);
  const [guidedNarrationMode, setGuidedNarrationModeState] = useState(() => getGuidedNarrationMode());
  const [guidedToningIntensity, setGuidedToningIntensityState] = useState(() => getGuidedToningIntensity());

  const {
    preferences: notificationPrefs,
    updatePreferences: updateNotificationPrefs,
    supportsNotifications,
    sendTestNotification,
  } = useNotifications();

  const isAdminUser = ["mskatt78@gmail.com", "skywatersacredembodiments@gmail.com"].includes((user?.email || "").toLowerCase());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reminderRes, ritualsRes, deletionRes] = await Promise.all([
          api.get("/settings/reminders"),
          api.get("/rituals"),
          api.get("/account/deletion-status"),
        ]);
        setReminderSettings(reminderRes.data);
        setRituals(ritualsRes.data);
        setDeletionStatus(deletionRes.data || null);
      } catch (error) {
        appLogger.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    try {
      await api.put("/settings/reminders", reminderSettings);
      toast.success("Settings saved!");
    } catch (error) {
      appLogger.error("Failed to save settings", error);
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  }, [api, reminderSettings]);

  const toggleDay = useCallback((day) => {
    setReminderSettings((current) => {
      if (current.days.includes(day)) {
        return { ...current, days: current.days.filter((existingDay) => existingDay !== day) };
      }

      return { ...current, days: [...current.days, day] };
    });
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Blessed journey, until we meet again");
      navigate("/", { replace: true });
    } catch (error) {
      appLogger.error("Logout failed", error);
      navigate("/", { replace: true });
    }
  }, [api, navigate]);

  const exportAccountData = useCallback(async () => {
    setExporting(true);
    try {
      const response = await api.get("/account/export");
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `soul-temple-account-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Account export downloaded");
    } catch (error) {
      appLogger.error("Failed to export account", error);
      toast.error("Could not export account data");
    } finally {
      setExporting(false);
    }
  }, [api]);

  const requestAccountDeletion = useCallback(async () => {
    const confirmed = window.confirm("Submit an account deletion request? You can still contact support if you need help before removing your data.");
    if (!confirmed) {
      return;
    }

    setRequestingDeletion(true);
    try {
      const response = await api.post("/account/delete-request", {
        reason: "User requested deletion from settings",
      });
      setDeletionStatus(response.data);
      toast.success("Deletion request submitted");
    } catch (error) {
      appLogger.error("Failed to request deletion", error);
      toast.error("Could not submit deletion request");
    } finally {
      setRequestingDeletion(false);
    }
  }, [api]);

  const updateGuidedNarrationMode = useCallback((mode) => {
    const nextMode = setGuidedNarrationMode(mode);
    setGuidedNarrationModeState(nextMode);
    const modeLabel = GUIDED_NARRATION_MODES[nextMode]?.label || "Strict";
    toast.success(`Guided narration mode set to ${modeLabel}`);
  }, []);

  const updateGuidedToningMode = useCallback((mode) => {
    const nextMode = setGuidedToningIntensity(mode);
    setGuidedToningIntensityState(nextMode);
    toast.success(`Guided toning intensity set to ${GUIDED_TONING_INTENSITIES[nextMode].label}`);
  }, []);

  return {
    loading,
    saving,
    exporting,
    requestingDeletion,
    deletionStatus,
    rituals,
    reminderSettings,
    guidedNarrationMode,
    guidedToningIntensity,
    notificationPrefs,
    updateNotificationPrefs,
    supportsNotifications,
    sendTestNotification,
    isAdminUser,
    setReminderSettings,
    saveSettings,
    toggleDay,
    handleLogout,
    exportAccountData,
    requestAccountDeletion,
    updateGuidedNarrationMode,
    updateGuidedToningMode,
  };
};
