const DB_NAME = "soul-temple-offline";
const DB_VERSION = 1;
const STORE = "practices";

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async (mode, fn) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const result = fn(store);
    tx.oncomplete = () => {
      db.close();
      resolve(result.result !== undefined ? result.result : result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
};

export const saveOfflinePractice = (practice) => withStore("readwrite", (store) => store.put(practice));

export const deleteOfflinePractice = (id) => withStore("readwrite", (store) => store.delete(id));

export const getOfflinePractice = async (id) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(id);
    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

export const listOfflinePractices = async () => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => {
      db.close();
      const items = (request.result || []).map(({ segments, ...meta }) => ({
        ...meta,
        segmentCount: Array.isArray(segments) ? segments.length : 0,
      }));
      resolve(items.sort((a, b) => (b.saved_at || "").localeCompare(a.saved_at || "")));
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

export const listOfflinePracticeIds = async () => {
  const items = await listOfflinePractices();
  return new Set(items.map((item) => item.id));
};

export const getOfflineStorageEstimate = async () => {
  try {
    if (!navigator.storage?.estimate) return null;
    const { usage, quota } = await navigator.storage.estimate();
    return { usageMb: Math.round((usage || 0) / 1048576), quotaMb: Math.round((quota || 0) / 1048576) };
  } catch {
    return null;
  }
};

export const base64AudioToObjectUrl = (base64Audio) => {
  const binary = window.atob(String(base64Audio || ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
};

export const chunkTextForOfflineTts = (text, maxChars = 900) => {
  const source = String(text || "").trim();
  if (!source) return [];
  if (source.length <= maxChars) return [source];
  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = sentence.slice(0, maxChars);
    }
  }
  if (current) chunks.push(current);
  return chunks;
};
