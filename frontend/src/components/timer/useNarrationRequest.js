import { useEffect, useState } from "react";
import {
  fallbackNarrationSegments,
  MIN_NARRATION_MINUTES,
  SCRIPT_EXPANSION_TIMEOUT_MS,
  splitSentences,
} from "./practiceTimerUtils";
import { getEffectiveGuidedNarrationMode } from "../../utils/guidedNarrationSettings";

export const useNarrationRequest = ({
  autoNarrate,
  normalizedSegments,
  practiceType,
  element,
  calculatedTotal,
  clearNarrationCache,
}) => {
  const [narrationSegments, setNarrationSegments] = useState([]);
  const [narrationPreparing, setNarrationPreparing] = useState(false);

  useEffect(() => {
    if (!autoNarrate) {
      setNarrationSegments([]);
      setNarrationPreparing(false);
      return;
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const steps = normalizedSegments
      .map((segment) => [segment.name, segment.description].filter(Boolean).join(": "))
      .filter(Boolean)
      .slice(0, 48);
    const sourceTexts = normalizedSegments
      .flatMap((segment) => [segment.description, segment.name])
      .flatMap((value) => splitSentences(value))
      .filter(Boolean)
      .slice(0, 96);

    const targetMinutes = Math.max(MIN_NARRATION_MINUTES, Math.ceil(calculatedTotal / 60));
    const fallback = fallbackNarrationSegments(normalizedSegments, targetMinutes);
    if (!steps.length && !sourceTexts.length && !fallback.length) {
      setNarrationSegments([]);
      setNarrationPreparing(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SCRIPT_EXPANSION_TIMEOUT_MS);

    clearNarrationCache();
    setNarrationSegments(fallback);
    setNarrationPreparing(true);

    fetch(`${backendUrl}/api/content/expand-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        practice_name: normalizedSegments[0]?.name || `${practiceType} practice`,
        element,
        duration_minutes: targetMinutes,
        use_ai: false,
        include_toning: true,
        anti_repetition_mode: getEffectiveGuidedNarrationMode({
          practiceName: normalizedSegments[0]?.name,
          practiceType,
          element,
          sourceTexts,
          steps,
        }),
        steps,
        source_texts: sourceTexts,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (controller.signal.aborted) return;
        const expanded = Array.isArray(data?.segments) ? data.segments.filter(Boolean) : [];
        if (expanded.length) {
          clearNarrationCache();
          setNarrationSegments(expanded);
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (!controller.signal.aborted) setNarrationPreparing(false);
      });

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    autoNarrate,
    calculatedTotal,
    clearNarrationCache,
    element,
    normalizedSegments,
    practiceType,
  ]);

  return {
    narrationSegments,
    narrationPreparing,
  };
};
