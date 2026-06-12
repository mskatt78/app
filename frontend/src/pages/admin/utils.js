import { COLLECTION_META } from "./constants";

export const getCollectionMeta = (collection) => {
  return COLLECTION_META[collection] || { name: collection, icon: "📁" };
};

export const getPreviewFields = (item) => {
  const keys = ["name", "title", "original_filename"];
  const primary =
    keys.find((key) => item[key]) ||
    Object.keys(item).find(
      (key) => key !== "id" && key !== "_id" && typeof item[key] === "string"
    );
  const secondary = ["element", "type", "tradition", "frequency", "arcana"].find(
    (key) => item[key]
  );
  return { primary: item[primary] || "—", secondary: item[secondary] };
};

export const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const buildAdminItemsParams = ({
  page,
  search,
  isYogaCollection,
  verificationFilter,
  priorityFilter,
}) => {
  const params = new URLSearchParams({ page, limit: 30, ...(search ? { search } : {}) });
  if (isYogaCollection && verificationFilter !== "all") {
    params.set("verification_status", verificationFilter);
  }
  if (isYogaCollection && priorityFilter !== "all") {
    params.set("verification_priority", priorityFilter);
  }
  return params;
};