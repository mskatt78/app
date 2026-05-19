import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useTimerClock = ({
  segments,
  totalDuration,
  autoStartAudio,
  isMuted,
  onTransition,
  onPause,
  onReset,
  onComplete,
  warmAudioContext,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const intervalRef = useRef(null);
  const sessionEndRef = useRef(null);
  const completionRef = useRef(false);
  const autoStartedRef = useRef(false);
  const lastSegmentIndexRef = useRef(0);
  const currentSegmentIndexRef = useRef(0);
  const segmentEndTimesRef = useRef([]);
  const segmentsLengthRef = useRef(0);
  const onTransitionRef = useRef(onTransition);
  const onPauseRef = useRef(onPause);
  const onResetRef = useRef(onReset);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onTransitionRef.current = onTransition; }, [onTransition]);
  useEffect(() => { onPauseRef.current = onPause; }, [onPause]);
  useEffect(() => { onResetRef.current = onReset; }, [onReset]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { currentSegmentIndexRef.current = currentSegmentIndex; }, [currentSegmentIndex]);
  useEffect(() => { segmentEndTimesRef.current = segmentEndTimes; }, [segmentEndTimes]);
  useEffect(() => { segmentsLengthRef.current = normalizedSegments.length; }, [normalizedSegments.length]);

  const normalizedSegments = useMemo(() => {
    if (!segments.length) return [];

    const prepared = segments.map((segment) => ({
      ...segment,
      duration_seconds: segment.duration_seconds || segment.duration || 60,
    }));
    const preparedTotal = prepared.reduce((sum, segment) => sum + segment.duration_seconds, 0);

    if (!totalDuration || totalDuration <= 0 || preparedTotal === 0 || preparedTotal === totalDuration) {
      return prepared;
    }

    const difference = totalDuration - preparedTotal;
    const lastIndex = prepared.length - 1;
    prepared[lastIndex] = {
      ...prepared[lastIndex],
      duration_seconds: Math.max(1, prepared[lastIndex].duration_seconds + difference),
    };
    return prepared;
  }, [segments, totalDuration]);

  const segmentsTotal = normalizedSegments.reduce((sum, segment) => sum + segment.duration_seconds, 0);
  const calculatedTotal = totalDuration && totalDuration > 0 ? totalDuration : (segmentsTotal || 300);

  const segmentEndTimes = useMemo(() => {
    let runningTotal = 0;
    return normalizedSegments.map((segment) => {
      runningTotal += segment.duration_seconds;
      return runningTotal;
    });
  }, [normalizedSegments]);

  const currentSegmentIndex = useMemo(() => {
    if (!normalizedSegments.length) return 0;
    const foundIndex = segmentEndTimes.findIndex((segmentEnd) => totalElapsed < segmentEnd);
    return foundIndex === -1 ? normalizedSegments.length - 1 : foundIndex;
  }, [normalizedSegments, segmentEndTimes, totalElapsed]);

  const currentSegment = normalizedSegments[currentSegmentIndex];
  const currentSegmentStart = currentSegmentIndex > 0 ? segmentEndTimes[currentSegmentIndex - 1] : 0;
  const currentSegmentDuration = currentSegment?.duration_seconds || 60;
  const segmentTime = currentSegment
    ? Math.min(currentSegmentDuration, Math.max(0, totalElapsed - currentSegmentStart))
    : 0;
  const remainingTime = Math.max(0, calculatedTotal - totalElapsed);
  const overallProgress = (totalElapsed / calculatedTotal) * 100;
  const segmentProgress = currentSegment ? (segmentTime / currentSegmentDuration) * 100 : 0;

  const syncElapsedFromClock = useCallback(() => {
    if (!sessionEndRef.current) return;

    const nextRemaining = Math.max(0, Math.ceil((sessionEndRef.current - Date.now()) / 1000));
    const nextElapsed = Math.min(calculatedTotal, calculatedTotal - nextRemaining);

    if (normalizedSegments.length > 0) {
      const foundIndex = segmentEndTimes.findIndex((segmentEnd) => nextElapsed < segmentEnd);
      const nextSegmentIndex = foundIndex === -1 ? normalizedSegments.length - 1 : foundIndex;
      if (nextSegmentIndex !== lastSegmentIndexRef.current && nextElapsed < calculatedTotal) {
        if (!isMuted) onTransitionRef.current?.();
        lastSegmentIndexRef.current = nextSegmentIndex;
      }
    }

    setTotalElapsed(nextElapsed);

    if (nextElapsed >= calculatedTotal && !completionRef.current) {
      completionRef.current = true;
      sessionEndRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      onCompleteRef.current?.();
      if (!isMuted) onTransitionRef.current?.();
    }
  }, [calculatedTotal, isMuted, normalizedSegments.length, segmentEndTimes]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(syncElapsedFromClock, 250);
      syncElapsedFromClock();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, syncElapsedFromClock]);

  useEffect(() => {
    if (autoStartAudio && !isRunning && !autoStartedRef.current && calculatedTotal > 0) {
      autoStartedRef.current = true;
      completionRef.current = false;
      lastSegmentIndexRef.current = currentSegmentIndex;
      sessionEndRef.current = Date.now() + ((calculatedTotal - totalElapsed) * 1000);
      setIsRunning(true);
    }
  }, [autoStartAudio, calculatedTotal, currentSegmentIndex, isRunning, totalElapsed]);

  const handlePlayPause = useCallback(() => {
    if (isRunning) {
      syncElapsedFromClock();
      sessionEndRef.current = null;
      setIsRunning(false);
      onPauseRef.current?.();
      return;
    }

    warmAudioContext?.();
    completionRef.current = false;
    lastSegmentIndexRef.current = currentSegmentIndexRef.current;
    sessionEndRef.current = Date.now() + ((calculatedTotal - totalElapsed) * 1000);
    setIsRunning(true);
  }, [calculatedTotal, isRunning, syncElapsedFromClock, totalElapsed, warmAudioContext]);

  const handleReset = useCallback(() => {
    sessionEndRef.current = null;
    completionRef.current = false;
    lastSegmentIndexRef.current = 0;
    setIsRunning(false);
    setTotalElapsed(0);
    onResetRef.current?.();
  }, []);

  const handleSkipSegment = useCallback(() => {
    const currentIndex = currentSegmentIndexRef.current;
    if (currentIndex >= segmentsLengthRef.current - 1) return;

    const nextElapsed = segmentEndTimesRef.current[currentIndex];
    setTotalElapsed(nextElapsed);
    lastSegmentIndexRef.current = currentIndex + 1;
    if (isRunning) {
      sessionEndRef.current = Date.now() + ((calculatedTotal - nextElapsed) * 1000);
    }
    if (!isMuted) onTransitionRef.current?.();
  }, [calculatedTotal, isMuted, isRunning]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return {
    isRunning,
    remainingTime,
    currentSegment,
    currentSegmentIndex,
    normalizedSegments,
    currentSegmentDuration,
    segmentTime,
    segmentProgress,
    overallProgress,
    calculatedTotal,
    handlePlayPause,
    handleReset,
    handleSkipSegment,
  };
};
