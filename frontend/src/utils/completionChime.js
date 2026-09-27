export const playCompletionChime = (volume = 0.5) => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [528, 396].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.9;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume * (i === 0 ? 0.4 : 0.28), start + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 2.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 2.8);
    });
    setTimeout(() => { ctx.close().catch(() => {}); }, 5200);
  } catch (_error) {
    // audio unavailable — silent completion
  }
};
