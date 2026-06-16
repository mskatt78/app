export const COIN_SLOTS = ["left", "center", "right"];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const buildCoinAnimationFrames = () => {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `coin-toss-${index + 1}`,
    type: Math.random() > 0.5 ? "yang" : "yin",
  }));
};
