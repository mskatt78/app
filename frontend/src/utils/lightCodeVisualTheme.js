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

export const SACRED_GEOMETRY_IMAGE_OVERRIDES = {
  sg1: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/54024e7f3884fc52d12d585c570e4a29dbc0dce94e3ef6a5ce3a8ee67432bfd6.png", // Flower of Life
  sg2: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/f5d8d5e0a7fcc7beab8a072ca90f202985ed3e38d7f9315497867aff04f5e281.png", // Metatron's Cube
  sg3: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/057c2ca7ba1909a3f67c44ff8bff5047c1400227c7e705638e91b1288541ded1.png", // Sri Yantra
  sg4: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/13db11fff33c318318e8b70049e8ae0598c812b77301f729d3fade38b5c11449.png", // Seed of Life
  sg5: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/0791a1640d746d4ea7e6cf67833b274d1be4a9abc575b372758a64072d3d1eb7.png", // Vesica Piscis
  sg6: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/fc18055c35ee4c49236f62c5783ae8ec86e69e792254451040f95b04d3364338.png", // Torus
  sg9: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/3551de1b0e0c5c399975286d0b2abf5b9585fa661fdc6a9ce405f55a8e6bc0bf.png", // Platonic set
  sg11: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/a1227b39c0c144e9db1a14c5200f3d797a5c8d102a7eeba6a90be9723754d6d2.png", // Tetrahedron
  sg12: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/0011d4643c6c97ad170adbe794c185cc89dbdcde1f3711189f34ff8a9f084d8a.png", // Cube
  sg13: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/51fa492ddec543f2e7e004d43cb4f376d132616a4fc58cb2a9838df0cd131981.png", // Octahedron
  sg14: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/6729c38c87e9ff30193af7f78833f46184079edac67a8cac9088014e676108eb.png", // Icosahedron
};

export const SACRED_GEOMETRY_SYMBOL_OVERRIDES = {
  sg1: "✿",
  sg2: "⎔",
  sg3: "۞",
  sg4: "❂",
  sg5: "◉",
  sg6: "⦿",
  sg7: "✡",
  sg8: "🌀",
  sg9: "⬢",
  sg10: "∞",
  sg11: "⏃",
  sg12: "⧈",
  sg13: "⋈",
  sg14: "⬠",
};
