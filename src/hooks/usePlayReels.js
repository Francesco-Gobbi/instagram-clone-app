import { useEffect, useState } from 'react';

const pausePlayer = (player) => {
  if (!player) return;
  if (typeof player.pause === 'function') {
    try {
      player.pause();
      return;
    } catch (error) {
      console.warn('Unable to pause player via pause():', error);
    }
  }
  if (typeof player.pauseAsync === 'function') {
    player.pauseAsync().catch((error) =>
      console.warn('Unable to pause player via pauseAsync():', error)
    );
  }
};

const playPlayer = (player) => {
  if (!player) return;
  if (typeof player.play === 'function') {
    try {
      player.play();
      return;
    } catch (error) {
      console.warn('Unable to play player via play():', error);
    }
  }
  if (typeof player.playAsync === 'function') {
    player.playAsync().catch((error) =>
      console.warn('Unable to play player via playAsync():', error)
    );
  }
};

const mutePlayer = (player, muted) => {
  if (!player) return;
  if ('muted' in player) {
    player.muted = muted;
    return;
  }
  if ('isMuted' in player) {
    player.isMuted = muted;
    return;
  }
  if (typeof player.setIsMutedAsync === 'function') {
    player.setIsMutedAsync(muted).catch((error) =>
      console.warn('Unable to toggle mute via setIsMutedAsync():', error)
    );
  }
};

const usePlayReels = ({ videoRefs, focusedScreen }) => {
  const [isMuted, setMuted] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [progressBarValue, setProgressBarValue] = useState(0.0);
  const [muteButtonVisible, setMuteButtonVisible] = useState(false);

  useEffect(() => {
    if (currentIndex !== null) {
      const player = videoRefs.current[currentIndex];
      if (!player) {
        return;
      }

      if (!focusedScreen) {
        setPlayingVideo(false);
        pausePlayer(player);
      } else {
        setPlayingVideo(true);
        playPlayer(player);
      }
    }
  }, [focusedScreen, currentIndex, videoRefs]);

  useEffect(() => {
    const player = videoRefs.current[currentIndex];
    if (!player) {
      return;
    }

    const pollStatus = () => {
      if (typeof player.getStatusAsync === 'function') {
        player
          .getStatusAsync()
          .then((status) => {
            if (!status || !status.durationMillis) {
              return;
            }
            const positionRatio = status.positionMillis / status.durationMillis;
            const clampedValue = Math.min(1, Math.max(0, positionRatio));
            setProgressBarValue(Number(clampedValue.toFixed(3)));
          })
          .catch(() => {});
      }
    };

    const statusInterval = setInterval(pollStatus, 100);
    return () => clearInterval(statusInterval);
  }, [currentIndex, videoRefs]);

  const handleLongPress = () => {
    const player = videoRefs.current[currentIndex];
    if (player) {
      pausePlayer(player);
    }
  };

  const handlePressOut = () => {
    const player = videoRefs.current[currentIndex];
    if (player) {
      playPlayer(player);
    }
  };

  const handlePress = () => {
    const player = videoRefs.current[currentIndex];
    if (!player) {
      return;
    }

    const nextMuted = !isMuted;
    mutePlayer(player, nextMuted);
    setMuted(nextMuted);
    setMuteButtonVisible(true);
    setTimeout(() => {
      setMuteButtonVisible(false);
    }, 1000);
  };

  return {
    playingVideo,
    setCurrentIndex,
    progressBarValue,
    muteButtonVisible,
    isMuted,
    handleLongPress,
    handlePressOut,
    handlePress,
  };
};

export default usePlayReels;
