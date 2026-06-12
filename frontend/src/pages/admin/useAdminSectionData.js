import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { clearStoredAdminToken, ensureAdminToken } from "../../components/admin/adminSession";
import { appLogger } from "../../utils/logger";
import { AUDIO_COLLECTION } from "./constants";
import { buildAdminItemsParams } from "./utils";

export const useAdminSectionData = ({
  collection,
  apiBaseUrl,
  navigate,
  searchParams,
  setSearchParams,
}) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [verificationSummary, setVerificationSummary] = useState({ verified: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [hasAdminSession, setHasAdminSession] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalItem, setModalItem] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [verificationFilter, setVerificationFilter] = useState(() => searchParams.get("verification") || "all");
  const [priorityFilter, setPriorityFilter] = useState(() => searchParams.get("priority") || "all");

  const isAudio = collection === AUDIO_COLLECTION;
  const isYogaCollection = collection === "yoga_poses";

  const fetchItems = useCallback(async () => {
    try {
      const params = buildAdminItemsParams({
        page,
        search,
        isYogaCollection,
        verificationFilter,
        priorityFilter,
      });

      const response = await fetch(`${apiBaseUrl}/api/admin/${collection}/items?${params}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        clearStoredAdminToken();
        throw new Error("expired-admin-token");
      }

      const data = await response.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      if (isYogaCollection) {
        setVerificationSummary(data.verification_summary || { verified: 0, pending: 0 });
      }
    } catch (error) {
      appLogger.error("Admin items load failed", error);
      toast.error("Failed to load items");
      throw new Error("load-items-failed");
    }
  }, [apiBaseUrl, collection, isYogaCollection, page, priorityFilter, search, verificationFilter]);

  const bootstrapAdminAccess = useCallback(async () => {
    setLoading(true);
    try {
      const resolvedToken = await ensureAdminToken(apiBaseUrl);
      setHasAdminSession(Boolean(resolvedToken));
      if (!isAudio) {
        await fetchItems();
      }
    } catch (error) {
      appLogger.warn("Admin session bootstrap failed", error);
      toast.error("Please sign in with your admin account to continue");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, fetchItems, isAudio, navigate]);

  useEffect(() => {
    bootstrapAdminAccess();
  }, [bootstrapAdminAccess]);

  const updateYogaQueueParams = useCallback(
    (nextVerification, nextPriority) => {
      if (!isYogaCollection) return;

      const next = new URLSearchParams(searchParams);
      if (nextVerification === "all") {
        next.delete("verification");
      } else {
        next.set("verification", nextVerification);
      }

      if (nextPriority === "all") {
        next.delete("priority");
      } else {
        next.set("priority", nextPriority);
      }

      setSearchParams(next);
    },
    [isYogaCollection, searchParams, setSearchParams]
  );

  const handleSave = useCallback(
    async (formData) => {
      const isNew = !formData.id || formData.id === undefined;
      try {
        const endpoint = isNew
          ? `${apiBaseUrl}/api/admin/${collection}/items`
          : `${apiBaseUrl}/api/admin/${collection}/items/${formData.id}`;
        const method = isNew ? "POST" : "PUT";

        const response = await fetch(endpoint, {
          method,
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error("Save failed");
        }
        const saved = await response.json();

        if (isNew) {
          setItems((prev) => [saved, ...prev]);
          setTotal((prev) => prev + 1);
        } else {
          setItems((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        }
        toast.success(isNew ? "Entry created" : "Entry updated");
      } catch (error) {
        appLogger.error("Admin item save failed", error);
        toast.error("Failed to save");
        throw new Error("Save failed");
      }
    },
    [apiBaseUrl, collection]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Delete this entry? This cannot be undone.")) return;
      setDeleting(id);
      try {
        const response = await fetch(`${apiBaseUrl}/api/admin/${collection}/items/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Delete failed");
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
        toast.success("Entry deleted");
      } catch (error) {
        appLogger.error("Admin item delete failed", error);
        toast.error("Failed to delete");
      } finally {
        setDeleting(null);
      }
    },
    [apiBaseUrl, collection]
  );

  const pagination = useMemo(() => {
    return {
      hasPages: total > 30,
      totalPages: Math.ceil(total / 30),
    };
  }, [total]);

  return {
    items,
    total,
    verificationSummary,
    loading,
    hasAdminSession,
    search,
    setSearch,
    page,
    setPage,
    modalItem,
    setModalItem,
    deleting,
    verificationFilter,
    setVerificationFilter,
    priorityFilter,
    setPriorityFilter,
    isAudio,
    isYogaCollection,
    updateYogaQueueParams,
    handleSave,
    handleDelete,
    pagination,
  };
};