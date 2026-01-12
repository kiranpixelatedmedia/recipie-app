import AsyncStorage from "@react-native-async-storage/async-storage";

const MEMORY_CACHE = new Map<string, any>();

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function now() {
  return Date.now();
}

export async function getCache(key: string) {
  // 1️⃣ Memory cache
  if (MEMORY_CACHE.has(key)) {
    const cached = MEMORY_CACHE.get(key);
    if (now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    MEMORY_CACHE.delete(key);
  }

  // 2️⃣ AsyncStorage cache
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (now() - parsed.timestamp < CACHE_TTL) {
      MEMORY_CACHE.set(key, parsed);
      return parsed.data;
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch {
    return null;
  }

  return null;
}

export async function setCache(key: string, data: any) {
  const payload = {
    data,
    timestamp: now(),
  };

  MEMORY_CACHE.set(key, payload);
  await AsyncStorage.setItem(key, JSON.stringify(payload));
}
