import { useState, useEffect, useCallback, useRef } from "react";

const PROGRESS_INCREMENT = 0.01;
const PROGRESS_INTERVAL_MS = 100;

const useProgressBarTimer = ({ stories = [], navigation }) => {
  const timerIdRef = useRef(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progressBar, setProgressBar] = useState(0);

  const clearTimer = useCallback(() => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (initialProgress = 0, onComplete) => {
      clearTimer();
      setProgressBar(initialProgress);

      const id = setInterval(() => {
        setProgressBar((previous) => {
          const nextValue = Number((previous + PROGRESS_INCREMENT).toFixed(3));

          if (nextValue >= 1) {
            clearInterval(id);
            timerIdRef.current = null;
            onComplete?.();
            return 1;
          }

          return nextValue;
        });
      }, PROGRESS_INTERVAL_MS);

      timerIdRef.current = id;
    },
    [clearTimer]
  );

  const nextStory = useCallback(() => {
    clearTimer();

    if (currentStoryIndex < stories.length - 1) {
      setProgressBar(0);
      setCurrentStoryIndex((index) => index + 1);
    } else {
      setProgressBar(0);
      navigation?.goBack?.();
    }
  }, [clearTimer, currentStoryIndex, stories.length, navigation]);

  const prevStory = useCallback(() => {
    clearTimer();

    if (currentStoryIndex > 0) {
      setProgressBar(0);
      setCurrentStoryIndex((index) => index - 1);
    } else {
      setProgressBar(0);
      startTimer(0, nextStory);
    }
  }, [clearTimer, currentStoryIndex, startTimer, nextStory]);

  useEffect(() => {
    if (!stories.length) {
      return undefined;
    }

    startTimer(0, nextStory);

    return () => {
      clearTimer();
    };
  }, [currentStoryIndex, stories.length, startTimer, nextStory, clearTimer]);

  const handlePause = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handleResume = useCallback(() => {
    startTimer(progressBar, nextStory);
  }, [startTimer, progressBar, nextStory]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    progressBar,
    handleResume,
    handlePause,
    nextStory,
    prevStory,
    currentStoryIndex,
  };
};

export default useProgressBarTimer;
