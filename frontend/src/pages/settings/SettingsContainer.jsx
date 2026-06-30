import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { Button } from "../../components/ui/button";
import { SettingsAccountToolsCard } from "./SettingsAccountToolsCard";
import { SettingsGuidedAudioCard } from "./SettingsGuidedAudioCard";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsLogoutCard } from "./SettingsLogoutCard";
import { SettingsNotificationsCard } from "./SettingsNotificationsCard";
import { SettingsProfileCard } from "./SettingsProfileCard";
import { SettingsRemindersCard } from "./SettingsRemindersCard";
import { SettingsCustomVoiceCard } from "./SettingsCustomVoiceCard";
import { useSettingsData } from "./useSettingsData";

const SettingsContainer = ({ user, api }) => {
  const navigate = useNavigate();
  const {
    loading,
    saving,
    exporting,
    requestingDeletion,
    deletionStatus,
    rituals,
    reminderSettings,
    guidedNarrationMode,
    guidedNarrationDurationByModality,
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
    updateGuidedNarrationDurationForModality,
    updateGuidedToningMode,
    updateGuidedSpeedOption,
    updateGuidedVoiceProfile,
    updateGuidedPracticeOverrideMode,
    createVoiceProfile,
    removeVoiceProfile,
  } = useSettingsData({ api, user, navigate });

  if (loading) {
    return (
      <div className="min-h-screen bg-background" data-testid="settings-page">
        <SettingsHeader navigate={navigate} />
        <main className="max-w-2xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="settings-page">
      <SettingsHeader navigate={navigate} />

      <main className="max-w-2xl mx-auto p-6">
        <div className="space-y-8">
          <SettingsProfileCard user={user} />

          <SettingsRemindersCard
            reminderSettings={reminderSettings}
            setReminderSettings={setReminderSettings}
            rituals={rituals}
            toggleDay={toggleDay}
          />

          <SettingsGuidedAudioCard
            guidedNarrationMode={guidedNarrationMode}
            guidedNarrationDurationByModality={guidedNarrationDurationByModality}
            guidedToningIntensity={guidedToningIntensity}
            guidedSpeedOption={guidedSpeedOption}
            guidedVoiceProfile={guidedVoiceProfile}
            guidedPracticeOverrideMode={guidedPracticeOverrideMode}
            updateGuidedNarrationMode={updateGuidedNarrationMode}
            updateGuidedNarrationDurationForModality={updateGuidedNarrationDurationForModality}
            updateGuidedToningMode={updateGuidedToningMode}
            updateGuidedSpeedOption={updateGuidedSpeedOption}
            updateGuidedVoiceProfile={updateGuidedVoiceProfile}
            updateGuidedPracticeOverrideMode={updateGuidedPracticeOverrideMode}
          />

          <SettingsCustomVoiceCard
            creatingVoiceProfile={creatingVoiceProfile}
            deletingVoiceProfileId={deletingVoiceProfileId}
            voiceProfileName={voiceProfileName}
            setVoiceProfileName={setVoiceProfileName}
            voiceSampleFile={voiceSampleFile}
            setVoiceSampleFile={setVoiceSampleFile}
            voiceProfiles={voiceProfiles}
            createVoiceProfile={createVoiceProfile}
            removeVoiceProfile={removeVoiceProfile}
          />

          <Button onClick={saveSettings} disabled={saving} className="w-full bg-primary" data-testid="save-settings-btn">
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>

          <SettingsNotificationsCard
            notificationPrefs={notificationPrefs}
            updateNotificationPrefs={updateNotificationPrefs}
            supportsNotifications={supportsNotifications}
            sendTestNotification={sendTestNotification}
          />

          <SettingsAccountToolsCard
            navigate={navigate}
            exporting={exporting}
            exportAccountData={exportAccountData}
            isAdminUser={isAdminUser}
            deletionStatus={deletionStatus}
            requestingDeletion={requestingDeletion}
            requestAccountDeletion={requestAccountDeletion}
          />

          <SettingsLogoutCard handleLogout={handleLogout} />
        </div>
      </main>
    </div>
  );
};

export default SettingsContainer;
