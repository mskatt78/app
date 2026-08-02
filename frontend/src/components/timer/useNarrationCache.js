import { useCallback, useRef } from "react";
import { DEFAULT_GUIDED_TTS_SPEED, wait } from "./practiceTimerUtils";
import { resolveGuidedSpeedValue, resolveGuidedVoiceId } from "../../utils/guidedVoiceSettings";

export const useNarrationCache = () => {
  const cacheRef = useRef(new Map());
  const pendingRef = useRef(new Map());
  const MAX_CACHE_ITEMS = 8;

  const clearNarrationCache = useCallback(() => {
    pendingRef.current.clear();
    cacheRef.current.forEach((url) => {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    cacheRef.current.clear();
  }, []);

  const fetchNarrationAudioUrl = useCallback(async (index, text, controller) => {
    const cacheKey = `${index}::${text}`;
    if (cacheRef.current.has(cacheKey)) return cacheRef.current.get(cacheKey);
    if (pendingRef.current.has(cacheKey)) return pendingRef.current.get(cacheKey);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const pending = (async () => {
      let data = null;
      const resolvedVoice = resolveGuidedVoiceId();
      const resolvedSpeed = resolveGuidedSpeedValue() || DEFAULT_GUIDED_TTS_SPEED;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const response = await fetch(`${backendUrl}/api/tts/generate-base64`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: resolvedVoice, speed: resolvedSpeed }),
          signal: controller.signal,
        });
        if (response.ok) {
          data = await response.json();
          if (data?.audio_base64) break;
        }
        if (controller.signal.aborted) break;
        await wait(300 * (attempt + 1));
      }
      return data;
    })()
      .then((data) => {
        if (!data?.audio_base64) throw new Error("No audio payload");
        const binary = atob(data.audio_base64);
        const bytes = new Uint8Array(binary.length);
        for (let position = 0; position < binary.length; position += 1) {
          bytes[position] = binary.charCodeAt(position);
        }
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        cacheRef.current.set(cacheKey, url);

        while (cacheRef.current.size > MAX_CACHE_ITEMS) {
          const oldestKey = cacheRef.current.keys().next().value;
          const oldestUrl = cacheRef.current.get(oldestKey);
          cacheRef.current.delete(oldestKey);
          if (typeof oldestUrl === "string" && oldestUrl.startsWith("blob:")) {
            URL.revokeObjectURL(oldestUrl);
          }
        }

        return url;
      })
      .finally(() => {
        pendingRef.current.delete(cacheKey);
      });

    pendingRef.current.set(cacheKey, pending);
    return pending;
  }, []);

  return {
    fetchNarrationAudioUrl,
    clearNarrationCache,
  };
};
