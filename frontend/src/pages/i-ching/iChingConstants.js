export const COIN_SLOTS = ["left", "center", "right"];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const buildCoinAnimationFrames = () => {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `coin-toss-${index + 1}`,
    type: Math.random() > 0.5 ? "yang" : "yin",
  }));
};

export const runCoinCastingFlow = async ({ api, dispatchCasting }) => {
  const frames = buildCoinAnimationFrames();
  dispatchCasting({ type: "start", frames });
  await sleep(400);

  try {
    const response = await api.get("/i-ching/cast/coins");
    await sleep(500);
    dispatchCasting({ type: "set-result", result: response.data });
    return { result: response.data, error: null };
  } catch (error) {
    return { result: null, error };
  }
};
