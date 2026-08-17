/**
 * AsyncStorage-compatible shim over `localStorage`.
 *
 * Mobile code calls `@react-native-async-storage/async-storage`, whose API is
 * async. Rather than rewrite every call site, this exposes the same method
 * signatures so ported modules only change their import line.
 *
 * Safe during SSR: `localStorage` does not exist on the server, so every method
 * degrades to a no-op / empty result instead of throwing.
 */
const memory = new Map<string, string>();

const store = (): Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'> | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    // Safari private mode and blocked third-party storage both throw on access.
    return null;
  }
};

export const localStore = {
  async getItem(key: string): Promise<string | null> {
    const s = store();
    if (!s) return memory.get(key) ?? null;
    return s.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    const s = store();
    if (!s) {
      memory.set(key, value);
      return;
    }
    s.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    const s = store();
    if (!s) {
      memory.delete(key);
      return;
    }
    s.removeItem(key);
  },

  async getAllKeys(): Promise<string[]> {
    const s = store();
    if (!s) return [...memory.keys()];
    const keys: string[] = [];
    for (let i = 0; i < s.length; i += 1) {
      const key = s.key(i);
      if (key !== null) keys.push(key);
    }
    return keys;
  },

  /** Mirrors AsyncStorage.multiGet: an array of [key, value] pairs. */
  async multiGet(keys: readonly string[]): Promise<Array<[string, string | null]>> {
    const s = store();
    if (!s) return keys.map((key) => [key, memory.get(key) ?? null]);
    return keys.map((key) => [key, s.getItem(key)]);
  }
};

export default localStore;
