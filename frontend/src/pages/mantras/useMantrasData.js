import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getLocalItem, setLocalItem } from "../../utils/clientStorage";
import { appLogger } from "../../utils/logger";

const PREFERRED_NATURAL_SOUND_KEY = "preferred-natural-sound";

export const useMantrasData = ({ api, user }) => {
  const [mantras, setMantras] = useState([]);
  const [filteredMantras, setFilteredMantras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [favorites, setFavorites] = useState(new Set());
  const [userMantras, setUserMantras] = useState([]);
  const [selectedNaturalSound, setSelectedNaturalSound] = useState(() => {
    try {
      return getLocalItem(PREFERRED_NATURAL_SOUND_KEY) || "ocean";
    } catch {
      return "ocean";
    }
  });

  const [isCreatingMantra, setIsCreatingMantra] = useState(false);
  const [editingMantra, setEditingMantra] = useState(null);
  const [newMantra, setNewMantra] = useState({ text: "", category: "personal", element: "", notes: "" });

  const isMountedRef = useRef(true);

  const fetchUserMantras = useCallback(async () => {
    try {
      const response = await api.get("/mantras/custom");
      if (!isMountedRef.current) return;
      setUserMantras(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch user mantras", error);
    }
  }, [api]);

  const fetchMantras = useCallback(async () => {
    try {
      const response = await api.get("/mantras");
      if (!isMountedRef.current) return;
      setMantras(response.data);
      setFilteredMantras(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch mantras", error);
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, [api]);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await api.get("/favorites?item_type=mantra");
      if (!isMountedRef.current) return;
      const favIds = new Set(response.data.map((f) => f.item_id));
      setFavorites(favIds);
    } catch (error) {
      appLogger.warn("Failed to fetch mantra favorites", error);
    }
  }, [api]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchMantras();
    fetchFavorites();
    if (user) {
      fetchUserMantras();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchFavorites, fetchMantras, fetchUserMantras, user]);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredMantras(mantras);
      return;
    }
    setFilteredMantras(mantras.filter((m) => m.element === selectedElement));
  }, [selectedElement, mantras]);

  useEffect(() => {
    try {
      setLocalItem(PREFERRED_NATURAL_SOUND_KEY, selectedNaturalSound);
    } catch (error) {
      appLogger.warn("Failed to persist preferred natural sound", error);
    }
  }, [selectedNaturalSound]);

  const createUserMantra = async () => {
    if (!newMantra.text.trim()) {
      toast.error("Please write your mantra");
      return;
    }
    try {
      const response = await api.post("/mantras/custom", {
        text: newMantra.text,
        category: newMantra.category,
        element: newMantra.element || null,
        notes: newMantra.notes || null,
      });
      setUserMantras((prev) => [response.data, ...prev]);
      setNewMantra({ text: "", category: "personal", element: "", notes: "" });
      setIsCreatingMantra(false);
      toast.success("Mantra saved!");
    } catch (error) {
      appLogger.error("Failed to create mantra", error);
      toast.error("Could not save mantra");
    }
  };

  const updateUserMantra = async () => {
    if (!editingMantra || !newMantra.text.trim()) return;
    try {
      const response = await api.put(`/mantras/custom/${editingMantra.mantra_id}`, {
        text: newMantra.text,
        category: newMantra.category,
        element: newMantra.element || null,
        notes: newMantra.notes || null,
      });
      setUserMantras((prev) => prev.map((m) => (
        m.mantra_id === editingMantra.mantra_id ? response.data : m
      )));
      setNewMantra({ text: "", category: "personal", element: "", notes: "" });
      setEditingMantra(null);
      toast.success("Mantra updated!");
    } catch (error) {
      appLogger.error("Failed to update mantra", error);
      toast.error("Could not update mantra");
    }
  };

  const deleteUserMantra = async (mantraId) => {
    try {
      await api.delete(`/mantras/custom/${mantraId}`);
      setUserMantras((prev) => prev.filter((m) => m.mantra_id !== mantraId));
      toast.success("Mantra deleted");
    } catch (error) {
      appLogger.warn("Failed to delete mantra", error);
      toast.error("Could not delete mantra");
    }
  };

  const startEditingMantra = (mantra) => {
    setEditingMantra(mantra);
    setNewMantra({
      text: mantra.text,
      category: mantra.category || "personal",
      element: mantra.element || "",
      notes: mantra.notes || "",
    });
    setIsCreatingMantra(true);
  };

  const toggleFavorite = async (mantraId, event) => {
    event?.stopPropagation();
    try {
      if (favorites.has(mantraId)) {
        await api.delete(`/favorites/mantra/${mantraId}`);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(mantraId);
          return next;
        });
        toast.success("Removed from favorites");
      } else {
        await api.post("/favorites", { item_type: "mantra", item_id: mantraId });
        setFavorites((prev) => new Set([...prev, mantraId]));
        toast.success("Added to favorites");
      }
    } catch (error) {
      appLogger.warn("Failed to toggle mantra favorite", error);
    }
  };

  return {
    mantras,
    filteredMantras,
    loading,
    selectedElement,
    setSelectedElement,
    favorites,
    userMantras,
    selectedNaturalSound,
    setSelectedNaturalSound,
    isCreatingMantra,
    setIsCreatingMantra,
    editingMantra,
    setEditingMantra,
    newMantra,
    setNewMantra,
    createUserMantra,
    updateUserMantra,
    deleteUserMantra,
    startEditingMantra,
    toggleFavorite,
    setUserMantras,
    fetchUserMantras,
  };
};
