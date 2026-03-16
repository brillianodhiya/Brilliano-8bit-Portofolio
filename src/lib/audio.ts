export const playButtonSound = () => {
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}button.mp3`);
    audio.volume = 0.2;
    audio.play().catch(() => {
      // Browser often blocks audio until first user interaction
      // We can ignore this silently as it's a non-critical feature
    });
  } catch (err) {
    console.warn("Audio playback failed:", err);
  }
};
