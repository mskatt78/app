const SHAMANIC_IMAGES = {
  forestYoga: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/4b6d6ab03f96914627ccfbc39b09615c2d0fa6e1903faca4e710bc88f6130fc0.png",
  templeMystic: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/7de214d334ee145343ed2f5bd1c20519d7256224c68255b0c12aa2c9c536494b.png",
  oracleAltar: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/05b27da2262f66dfed11e77dd106f85adb9a0ef9afa29751453dd2d4215f984d.png",
  archangel: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/4a76eb7b37f84aa379f56d57cddf40ea342d3fbead89144c146cdd0d29296942.png",
  fireCeremony: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/517e0237e87cc76ebb98c9ad20425cf7a058e1242d78e12afe48d2ec8435704a.png",
  moonRitual: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/c5ab01ab38dc94bd9027c12649c1e3028a7722dee40872dc574ec8a4a353b56b.png",
  cosmicSky: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/a38d45a08aa3a740e035d72eb2624cc1ae965768ec5dfa4073bf0c6dae06a5e5.png",
  soundBowls: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/8524d20a138509b69b27753f53657d251d6bc9c2f420d72eb2e67351f66d6606.png",
  soundForestCircle: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/c9b7f5f4416000ce2fd28246d4dde77d9010da8f3771bac03c8311da3c8eb36c.png",
  soundBowlsCrystals: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/da8d4c0cc88c761363c91fb4e84e8b72c3ca7665b5fcbc7fbac00cf911923a5b.png",
  soundMoonDrum: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/7a53949f87b6ccc4e8177d62ad6f7445ac4d6411cb41b8138b4c0b9d1471bf0d.png",
  soundCaveGong: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/77f171f6c1e0449bb1ce3665b4413e9053d2302cec1ff5a4663d702c72b2bdb2.png",
  soundOceanAltar: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/c9f076563d68fd0574f48bc1a26c56964c434afcdf620374437790100c6886f8.png",
  soundMountainChant: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/51516d7b833450408ae57309eca108f7d16fd01310f5e6092ef7091426e0ab82.png",
};

const hashSeed = (value) => {
  const source = String(value || "seed");
  return source.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const pickFromPool = (pool, seed) => {
  if (!Array.isArray(pool) || pool.length === 0) return SHAMANIC_IMAGES.templeMystic;
  return pool[Math.abs(seed) % pool.length];
};

const ANCIENT_POOLS = {
  egyptian: [SHAMANIC_IMAGES.templeMystic, SHAMANIC_IMAGES.oracleAltar],
  avalon: [SHAMANIC_IMAGES.moonRitual, SHAMANIC_IMAGES.forestYoga],
  aboriginal: [SHAMANIC_IMAGES.fireCeremony, SHAMANIC_IMAGES.forestYoga],
  celtic: [SHAMANIC_IMAGES.forestYoga, SHAMANIC_IMAGES.moonRitual],
  peruvian: [SHAMANIC_IMAGES.fireCeremony, SHAMANIC_IMAGES.templeMystic],
  international: [SHAMANIC_IMAGES.templeMystic, SHAMANIC_IMAGES.oracleAltar],
  lemurian: [SHAMANIC_IMAGES.moonRitual, SHAMANIC_IMAGES.cosmicSky],
  atlantean: [SHAMANIC_IMAGES.cosmicSky, SHAMANIC_IMAGES.moonRitual],
  galactic: [SHAMANIC_IMAGES.cosmicSky, SHAMANIC_IMAGES.archangel],
};

export const getAncientWisdomImage = (entry, offset = 0) => {
  const tradition = String(entry?.tradition || "international").toLowerCase();
  const seed = hashSeed(entry?.id || entry?.name) + offset;
  return pickFromPool(ANCIENT_POOLS[tradition] || ANCIENT_POOLS.international, seed);
};

export const getSoundFrequencyImage = (freq, offset = 0) => {
  const category = String(freq?.category || "").toLowerCase();
  const ambient = String(freq?.ambient_type || "").toLowerCase();
  const element = String(freq?.element || "").toLowerCase();
  const seed = hashSeed(freq?.id || freq?.name) + offset;

  if (category.includes("shamanic") || ambient.includes("drum") || element.includes("fire")) {
    return pickFromPool([
      SHAMANIC_IMAGES.fireCeremony,
      SHAMANIC_IMAGES.soundForestCircle,
      SHAMANIC_IMAGES.soundMoonDrum,
      SHAMANIC_IMAGES.soundMountainChant,
      SHAMANIC_IMAGES.forestYoga,
    ], seed);
  }
  if (category.includes("nature") || category.includes("cetacean") || element.includes("water")) {
    return pickFromPool([
      SHAMANIC_IMAGES.moonRitual,
      SHAMANIC_IMAGES.soundOceanAltar,
      SHAMANIC_IMAGES.soundMoonDrum,
      SHAMANIC_IMAGES.forestYoga,
      SHAMANIC_IMAGES.soundForestCircle,
    ], seed);
  }
  if (category.includes("frequency") || category.includes("instrument") || ambient.includes("bowl")) {
    return pickFromPool([
      SHAMANIC_IMAGES.soundBowls,
      SHAMANIC_IMAGES.soundBowlsCrystals,
      SHAMANIC_IMAGES.soundCaveGong,
      SHAMANIC_IMAGES.oracleAltar,
      SHAMANIC_IMAGES.soundOceanAltar,
    ], seed);
  }

  return pickFromPool([
    SHAMANIC_IMAGES.soundBowls,
    SHAMANIC_IMAGES.soundBowlsCrystals,
    SHAMANIC_IMAGES.soundCaveGong,
    SHAMANIC_IMAGES.soundForestCircle,
    SHAMANIC_IMAGES.soundMoonDrum,
    SHAMANIC_IMAGES.templeMystic,
    SHAMANIC_IMAGES.forestYoga,
  ], seed);
};

export const getOracleCardImage = (card, offset = 0) => {
  const element = String(card?.element || "Spirit").toLowerCase();
  const seed = hashSeed(card?.id || card?.name) + offset;

  if (element.includes("fire")) return pickFromPool([SHAMANIC_IMAGES.fireCeremony, SHAMANIC_IMAGES.oracleAltar], seed);
  if (element.includes("water")) return pickFromPool([SHAMANIC_IMAGES.moonRitual, SHAMANIC_IMAGES.soundBowls], seed);
  if (element.includes("air")) return pickFromPool([SHAMANIC_IMAGES.archangel, SHAMANIC_IMAGES.forestYoga], seed);
  if (element.includes("earth")) return pickFromPool([SHAMANIC_IMAGES.templeMystic, SHAMANIC_IMAGES.forestYoga], seed);

  return pickFromPool([SHAMANIC_IMAGES.oracleAltar, SHAMANIC_IMAGES.archangel, SHAMANIC_IMAGES.cosmicSky], seed);
};

export const getArchangelImage = (angel, offset = 0) => {
  const element = String(angel?.element || "Spirit").toLowerCase();
  const seed = hashSeed(angel?.id || angel?.name) + offset;

  if (element.includes("fire")) return pickFromPool([SHAMANIC_IMAGES.archangel, SHAMANIC_IMAGES.fireCeremony], seed);
  if (element.includes("water")) return pickFromPool([SHAMANIC_IMAGES.moonRitual, SHAMANIC_IMAGES.archangel], seed);
  if (element.includes("earth")) return pickFromPool([SHAMANIC_IMAGES.templeMystic, SHAMANIC_IMAGES.archangel], seed);

  return pickFromPool([SHAMANIC_IMAGES.archangel, SHAMANIC_IMAGES.cosmicSky], seed);
};

export const getAstrologySkyImage = () => SHAMANIC_IMAGES.cosmicSky;
