export const SABBAT_TABS = ["overview", "ritual", "embodiment", "nature"];

export const getSabbatTabLabel = (tab) => {
  if (tab === "overview") return "Traditions";
  if (tab === "ritual") return "Ritual 🙏";
  if (tab === "embodiment") return "Embodiment";
  return "Crystals & Herbs";
};
