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
import {
  GUIDED_SPEED_OPTIONS,
  GUIDED_VOICE_PROFILES,
  getGuidedPracticeOverrideMode,
  getGuidedSpeedOption,
  getGuidedVoiceProfile,
  setGuidedPracticeOverrideMode,
  setGuidedSpeedOption,
  setGuidedVoiceProfile,
} from "../../utils/guidedVoiceSettings";
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
  const [guidedSpeedOption, setGuidedSpeedOptionState] = useState(() => getGuidedSpeedOption());
  const [guidedVoiceProfile, setGuidedVoiceProfileState] = useState(() => getGuidedVoiceProfile());
  const [guidedPracticeOverrideMode, setGuidedPracticeOverrideModeState] = useState(() => getGuidedPracticeOverrideMode());
  const [voiceProfiles, setVoiceProfiles] = useState([]);
  const [voiceProfileName, setVoiceProfileName] = useState("My Voice");
  const [voiceSampleFile, setVoiceSampleFile] = useState(null);
  const [creatingVoiceProfile, setCreatingVoiceProfile] = useState(false);
  const [deletingVoiceProfileId, setDeletingVoiceProfileId] = useState(null);

  const {
    preferences: notificationPrefs,
    updatePreferences: updateNotificationPrefs,
    supportsNotifications,
    sendTestNotification,
  } = useNotifications();

  const isAdminUser = (user?.email || "").toLowerCase() === "mskatt78@gmail.com";

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
        try {
          const voiceProfilesResponse = await api.get("/voice-profiles");
          setVoiceProfiles(Array.isArray(voiceProfilesResponse.data) ? voiceProfilesResponse.data : []);
        } catch (voiceError) {
          appLogger.warn("Voice profiles load warning", voiceError);
        }
      } catch (error) {
        appLogger.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };

    queueMicrotask(fetchData);
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

  const updateGuidedSpeedOption = useCallback((mode) => {
    const nextMode = setGuidedSpeedOption(mode);
    setGuidedSpeedOptionState(nextMode);
    toast.success(`Guided speed set to ${GUIDED_SPEED_OPTIONS[nextMode].label}`);
  }, []);

  const updateGuidedVoiceProfile = useCallback((mode) => {
    const nextMode = setGuidedVoiceProfile(mode);
    setGuidedVoiceProfileState(nextMode);
    toast.success(`Guided voice set to ${GUIDED_VOICE_PROFILES[nextMode].label}`);
  }, []);

  const updateGuidedPracticeOverrideMode = useCallback((mode) => {
    const nextMode = setGuidedPracticeOverrideMode(mode);
    setGuidedPracticeOverrideModeState(nextMode);
    toast.success(nextMode === "remember" ? "Per-practice override will be remembered" : "Per-practice override set to current session");
  }, []);

  const createVoiceProfile = useCallback(async () => {
    if (!voiceSampleFile) {
      toast.error("Please select an audio sample first");
      return;
    }

    const name = voiceProfileName.trim();
    if (!name) {
      toast.error("Please enter a voice profile name");
      return;
    }

    setCreatingVoiceProfile(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", voiceSampleFile);
      uploadFormData.append("duration_seconds", "0");
      uploadFormData.append("category", "custom_voice_sample");
      const uploadResponse = await api.post("/voice-files", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileId = uploadResponse?.data?.file_id;
      if (!fileId) {
        toast.error("Voice sample upload failed");
        return;
      }

      const profileResponse = await api.post("/voice-profiles", {
        name,
        sample_file_id: fileId,
      });

      const createdProfile = profileResponse?.data;
      if (createdProfile?.profile_id) {
        setVoiceProfiles((current) => [createdProfile, ...current]);
        setVoiceProfileName("My Voice");
        setVoiceSampleFile(null);
        toast.success("Custom voice profile saved");
      } else {
        toast.error("Could not create voice profile");
      }
    } catch (error) {
      appLogger.error("Create voice profile failed", error);
      toast.error("Could not create voice profile");
    } finally {
      setCreatingVoiceProfile(false);
    }
  }, [api, voiceProfileName, voiceSampleFile]);

  const removeVoiceProfile = useCallback(async (profileId) => {
    setDeletingVoiceProfileId(profileId);
    try {
      await api.delete(`/voice-profiles/${profileId}`);
      setVoiceProfiles((current) => current.filter((profile) => profile.profile_id !== profileId));
      toast.success("Voice profile removed");
    } catch (error) {
      appLogger.error("Delete voice profile failed", error);
      toast.error("Could not remove voice profile");
    } finally {
      setDeletingVoiceProfileId(null);
    }
  }, [api]);

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
    guidedSpeedOption,
    guidedVoiceProfile,
    guidedPracticeOverrideMode,
    voiceProfiles,
    voiceProfileName,
    setVoiceProfileName,
    voiceSampleFile,
    setVoiceSampleFile,
    creatingVoiceProfile,
    deletingVoiceProfileId,
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
    updateGuidedSpeedOption,
    updateGuidedVoiceProfile,
    updateGuidedPracticeOverrideMode,
    createVoiceProfile,
    removeVoiceProfile,
  };
};
