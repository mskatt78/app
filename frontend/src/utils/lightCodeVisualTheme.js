const ENCODED_FREQUENCY_IMAGE_POOL = [
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/284370c603f7df69b70587dd5bf924d5f83769d377632bba6aeb4aa3d99cc8bf.png",
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/f65752efe4df4bf9f64585f95cfde3caccde138db47fab69718d4dde31bd446d.png",
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/5358327735c5e4805c7921cdbec2210c138016e37c1913cf07ead4ec73bff825.png",
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/2d7e33f7c69110da89d92cd22ea53cf78536d2bea59901881e0800066a06bdb5.png",
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/c84a5ee28e15f2137c21a6b51ad2304519b9116cb88d8a5ffb4b9c2bd5286876.png",
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/f3059464ca7ea86c0a1afa7e045bdbc85df8a2382831bbe9924bcb633cd1a37f.png",
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/7b0e4988fe3e677e336a180ae6ec5228139c6833b49f1b60ff4c9189ce668105.png",
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/9cbd03a4297aca0d29097fada95aa486eff75ecf581ff4416c90ffedc64d2eab.png",
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/ee17bea2821b1cb692dc74f2628a50cb0891aca6cd6d3c0e78c720b486832f9b.png",
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/41dd72171f39a8f45d612e8ae254d6f2f19e89c463e42dcd51bf7d66786d60f2.png",
];

const stableHash = (value) => {
  const source = String(value || "encoded-frequency");
  let hash = 0;
  for (let idx = 0; idx < source.length; idx += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(idx);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getEncodedFrequencyImage = (stableKey, pool = ENCODED_FREQUENCY_IMAGE_POOL) => {
  if (!Array.isArray(pool) || pool.length === 0) return "";
  const index = stableHash(stableKey) % pool.length;
  return pool[index];
};

export const getEncodedFrequencyOverlayStyle = (stableKey, opacity = 0.28) => ({
  backgroundImage: `url(${getEncodedFrequencyImage(stableKey)})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  opacity,
});

export const getEncodedFrequencyMasterImage = () =>
  "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/41dd72171f39a8f45d612e8ae254d6f2f19e89c463e42dcd51bf7d66786d60f2.png";

export const getEncodedFrequencyPool = () => ENCODED_FREQUENCY_IMAGE_POOL;
