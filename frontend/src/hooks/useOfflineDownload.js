import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { saveOfflinePractice, listOfflinePracticeIds, chunkTextForOfflineTts } from "../utils/offlineStore";
import { resolveGuidedVoiceId, resolveGuidedSpeedValue } from "../utils/guidedVoiceSettings";
import { appLogger } from "../utils/logger";

export const useOfflineDownload = ({ api }) => {
  const [downloadedIds, setDownloadedIds] = useState(new Set());
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    listOfflinePracticeIds()
      .then(setDownloadedIds)
      .catch(() => {});
  }, []);

  const downloadPractice = useCallback(async (practice) => {
    if (downloadingId) return false;
    setDownloadingId(practice.id);
    setDownloadProgress(0);
    try {
      const texts = (practice.steps || []).flatMap((step) => chunkTextForOfflineTts(step));
      if (!texts.length) throw new Error("No narration text available");
      const voice = resolveGuidedVoiceId();
      const speed = resolveGuidedSpeedValue() || 0.85;
      const segments = [];
      for (let i = 0; i < texts.length; i += 1) {
        const response = await api.post("/tts/generate-base64", { text: texts[i], voice, speed }, { timeout: 45000 });
        if (!response?.data?.audio_base64) throw new Error("Missing audio payload");
        segments.push({ text: texts[i], audio_base64: response.data.audio_base64 });
        setDownloadProgress(Math.round(((i + 1) / texts.length) * 100));
      }
      await saveOfflinePractice({
        id: practice.id,
        name: practice.name,
        element: practice.element,
        category: practice.category,
        duration_minutes: practice.duration_minutes,
        saved_at: new Date().toISOString(),
        segments,
      });
      setDownloadedIds((prev) => new Set([...prev, practice.id]));
      toast.success(`${practice.name} saved for offline practice`);
      return true;
    } catch (error) {
      appLogger.error("Offline download failed", error);
      toast.error("Download failed — please check your connection and try again");
      return false;
    } finally {
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  }, [api, downloadingId]);

  return { downloadedIds, downloadingId, downloadProgress, downloadPractice };
};
