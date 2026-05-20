/**
 * 持久化模块：
 * - localStorage 存可序列化状态（videos / generatedPrompt / selectedTemplate）
 * - IndexedDB 存图片 blob（File 对象不可 JSON 序列化）
 */

import type { Image, Video, AppState } from '@/types';

const STORAGE_KEY = 'iphone-jack-state';
const DB_NAME = 'iphone-jack';
const DB_STORE = 'images';
const DB_VERSION = 1;

/* ========== IndexedDB helpers ========== */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Save a single image blob to IndexedDB */
export async function saveImageBlob(id: string, file: File): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, 'readwrite');
  tx.objectStore(DB_STORE).put({ id, blob: file });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Get a single image blob from IndexedDB */
export async function getImageBlob(id: string): Promise<File | null> {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, 'readonly');
  const req = tx.objectStore(DB_STORE).get(id);
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result?.blob ?? null);
    req.onerror = () => reject(req.error);
  });
}

/** Remove an image blob from IndexedDB */
export async function removeImageBlob(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, 'readwrite');
  tx.objectStore(DB_STORE).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Clear all image blobs */
export async function clearImageBlobs(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, 'readwrite');
  tx.objectStore(DB_STORE).clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Get all image blobs, return Map<id, File> */
export async function getAllImageBlobs(): Promise<Map<string, File>> {
  const db = await openDB();
  const tx = db.transaction(DB_STORE, 'readonly');
  const req = tx.objectStore(DB_STORE).getAll();
  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      const map = new Map<string, File>();
      for (const row of req.result as { id: string; blob: File }[]) {
        map.set(row.id, row.blob);
      }
      resolve(map);
    };
    req.onerror = () => reject(req.error);
  });
}

/* ========== localStorage helpers ========== */

interface SerializableState {
  videos: Video[];
  currentVideoId: string | null;
  generatedPrompt: string;
  selectedTemplateId: string | null;
  /** Image metadata (without File/Blob) — reconstructed on load */
  imageMetadata: Array<{ id: string; uploadedAt: string }>;
}

export function saveState(state: AppState): void {
  const serializable: SerializableState = {
    videos: state.videos,
    currentVideoId: state.currentVideo?.id ?? null,
    generatedPrompt: state.generatedPrompt,
    selectedTemplateId: state.selectedTemplate?.id ?? null,
    imageMetadata: state.uploadedImages.map((img) => ({
      id: img.id,
      uploadedAt: img.uploadedAt.toISOString(),
    })),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Quota exceeded — fail silently
  }
}

export async function loadState(): Promise<Partial<AppState>> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const saved: SerializableState = JSON.parse(raw);
    const blobMap = await getAllImageBlobs();

    // Reconstruct images with File + objectURL
    const uploadedImages: Image[] = [];
    for (const meta of saved.imageMetadata) {
      const file = blobMap.get(meta.id);
      if (file) {
        const url = URL.createObjectURL(file);
        uploadedImages.push({
          id: meta.id,
          file,
          url,
          preview: url,
          uploadedAt: new Date(meta.uploadedAt),
        });
      }
    }

    // Reconstruct videos (Date needs parsing)
    const videos: Video[] = (saved.videos ?? []).map((v) => ({
      ...v,
      createdAt: new Date(v.createdAt),
    }));

    const currentVideo = videos.find((v) => v.id === saved.currentVideoId) ?? null;

    return {
      uploadedImages,
      selectedImage: uploadedImages.length > 0 ? uploadedImages[0] : null,
      videos,
      currentVideo,
      generatedPrompt: saved.generatedPrompt ?? '',
    };
  } catch {
    return {};
  }
}
