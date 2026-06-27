import { PROFILE_NAME_MAP } from "./humanDesignData";

export const calculateHumanDesignChart = async (api, request) => {
  if (!api) throw new Error("API client missing");

  const { data } = await api.post("/birth-chart/human-design/calculate", request);
  const profileCode = String(data?.profile || "1/1");
  const [conscious, unconscious] = profileCode.split("/").map((value) => Number(value || 1));

  const backendGeneKeys = data?.gene_keys_profile || {};
  const geneKeysProfile = {
    lifesWork: {
      key: backendGeneKeys?.lifesWork?.gate,
      gate: backendGeneKeys?.lifesWork?.gate,
      line: backendGeneKeys?.lifesWork?.line,
      role: "Life's Work",
      sphere: backendGeneKeys?.lifesWork?.sphere || "Life's Work",
      planet: backendGeneKeys?.lifesWork?.planet || "Conscious Sun",
      description: backendGeneKeys?.lifesWork?.description,
      color: "amber",
    },
    evolution: {
      key: backendGeneKeys?.evolution?.gate,
      gate: backendGeneKeys?.evolution?.gate,
      line: backendGeneKeys?.evolution?.line,
      role: "Evolution",
      sphere: backendGeneKeys?.evolution?.sphere || "Evolution",
      planet: backendGeneKeys?.evolution?.planet || "Conscious Earth",
      description: backendGeneKeys?.evolution?.description,
      color: "emerald",
    },
    radiance: {
      key: backendGeneKeys?.radiance?.gate,
      gate: backendGeneKeys?.radiance?.gate,
      line: backendGeneKeys?.radiance?.line,
      role: "Radiance",
      sphere: backendGeneKeys?.radiance?.sphere || "Radiance",
      planet: backendGeneKeys?.radiance?.planet || "Unconscious Sun",
      description: backendGeneKeys?.radiance?.description,
      color: "violet",
    },
    purpose: {
      key: backendGeneKeys?.purpose?.gate,
      gate: backendGeneKeys?.purpose?.gate,
      line: backendGeneKeys?.purpose?.line,
      role: "Purpose",
      sphere: backendGeneKeys?.purpose?.sphere || "Purpose",
      planet: backendGeneKeys?.purpose?.planet || "Unconscious Earth",
      description: backendGeneKeys?.purpose?.description,
      color: "rose",
    },
    profile: profileCode,
  };

  return {
    typeKey: data?.type_key || "projector",
    authority: data?.authority || "Splenic",
    profile: profileCode,
    profileName: PROFILE_NAME_MAP[profileCode] || `Line ${conscious}/${unconscious}`,
    consciousLine: conscious,
    unconsciousLine: unconscious,
    personalitySun: data?.personality?.Sun,
    personalityEarth: data?.personality?.Earth,
    designSun: data?.design?.Sun,
    designEarth: data?.design?.Earth,
    definedCenters: (data?.defined_centers || []).map((key) => ({ key, name: key })),
    definedChannels: data?.defined_channels || [],
    activeGates: data?.active_gates || [],
    gateCount: (data?.active_gates || []).length,
    incarnationCross: data?.incarnation_cross || null,
    variables: data?.variables || {},
    digestion: data?.variables?.digestion || "—",
    perspective: data?.variables?.perspective || "—",
    motivation: data?.variables?.motivation || "—",
    cognition: data?.variables?.cognition || "—",
    environment: data?.variables?.environment || "—",
    audit: data?.audit || {},
    geneKeysProfile,
  };
};
