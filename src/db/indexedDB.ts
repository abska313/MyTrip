/**
 * ABSKA 214 — Robust Client-Side Storage Layer (IndexedDB + Fallback)
 * Purely local, zero external cloud transmission.
 */

const DB_NAME = 'abska_214_database';
const DB_VERSION = 2;

export const STORES = [
  'user_profile',
  'tasks',
  'character_tree',
  'xp_transactions',
  'achievements',
  'books',
  'skills_projects',
  'journal',
  'time_blocks',
  'physical_logs',
  'new_experiences',
  'rewards',
  'phase_contracts',
  'phase_reviews',
  'comeback_logs',
  'hard_day_logs',
  'future_letter',
  'post_journey_plan',
  'smart_suggestions',
  'before_after_photos',
  'weekly_weight_logs'
] as const;

export type StoreName = typeof STORES[number];

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      for (const storeName of STORES) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };
  });
}

export async function putItem<T extends { id: string | number }>(storeName: StoreName, item: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // LocalStorage fallback
    try {
      const key = `abska_${storeName}_${item.id}`;
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('Fallback storage warning:', e);
    }
  }
}

export async function getItem<T>(storeName: StoreName, id: string | number): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      const raw = localStorage.getItem(`abska_${storeName}_${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

export async function getAllItems<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const items: T[] = [];
    const prefix = `abska_${storeName}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        try {
          items.push(JSON.parse(localStorage.getItem(k)!));
        } catch {}
      }
    }
    return items;
  }
}

export async function deleteItem(storeName: StoreName, id: string | number): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.removeItem(`abska_${storeName}_${id}`);
  }
}

export async function clearStore(storeName: StoreName): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const prefix = `abska_${storeName}_`;
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }
}

// Full Export / Backup Utility
export async function exportFullDatabase(): Promise<string> {
  const backup: Record<string, unknown> = {
    app: 'REHLATI_214',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    stores: {}
  };

  const storesObj: Record<string, unknown> = {};
  for (const storeName of STORES) {
    storesObj[storeName] = await getAllItems(storeName);
  }
  backup.stores = storesObj;

  return JSON.stringify(backup, null, 2);
}

// Validate Backup Format
export function validateBackup(jsonString: string): { isValid: boolean; message: string; data?: any } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, message: 'الملف ليس بتنسيق JSON صحيح' };
    }
    if ((parsed.app !== 'REHLATI_214' && parsed.app !== 'ABSKA_214') || !parsed.stores) {
      return { isValid: false, message: 'هذا الملف لا يتبع بنية نسخ احتياطي تطبيق رحلتي' };
    }
    return { isValid: true, message: 'ملف النسخ الاحتياطي صالح للاستيراد', data: parsed };
  } catch {
    return { isValid: false, message: 'فشل قراءة الملف؛ يرجى التأكد من اختيار ملف JSON غير تالف' };
  }
}

// Restore Database from Backup
export async function restoreFullDatabase(parsedData: any): Promise<{ success: boolean; count: number }> {
  let restoredCount = 0;
  for (const storeName of STORES) {
    if (parsedData.stores && Array.isArray(parsedData.stores[storeName])) {
      await clearStore(storeName);
      const items = parsedData.stores[storeName];
      for (const item of items) {
        if (item && item.id) {
          await putItem(storeName, item);
          restoredCount++;
        }
      }
    }
  }
  return { success: true, count: restoredCount };
}

// Full Reset
export async function resetFullDatabase(): Promise<void> {
  for (const storeName of STORES) {
    await clearStore(storeName);
  }
  localStorage.clear();
}
