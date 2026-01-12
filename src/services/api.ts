import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

/* ======================================================
   CACHE CONFIG
====================================================== */

const MEMORY_CACHE = new Map<string, any>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const now = () => Date.now();

/* ---------------- CACHE HELPERS ---------------- */

async function getCache(key: string) {
  // 1️⃣ Memory cache
  if (MEMORY_CACHE.has(key)) {
    const cached = MEMORY_CACHE.get(key);
    if (now() - cached.time < CACHE_TTL) return cached.data;
    MEMORY_CACHE.delete(key);
  }

  // 2️⃣ AsyncStorage cache
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (now() - parsed.time < CACHE_TTL) {
      MEMORY_CACHE.set(key, parsed);
      return parsed.data;
    }
    await AsyncStorage.removeItem(key);
  } catch {
    return null;
  }

  return null;
}

async function setCache(key: string, data: any) {
  const payload = { data, time: now() };
  MEMORY_CACHE.set(key, payload);
  await AsyncStorage.setItem(key, JSON.stringify(payload));
}

/* ======================================================
   FETCHER (WITH CACHE)
====================================================== */

async function fetchCached(url: string, key: string) {
  const cached = await getCache(key);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");

  const json = await res.json();
  const meals = json.meals ?? [];

  await setCache(key, meals);
  return meals;
}

/* ======================================================
   SEARCH
====================================================== */

export async function searchMeals(query: string) {
  return fetchCached(
    `${BASE_URL}/search.php?s=${query}`,
    `search:${query}`
  );
}

/* ======================================================
   FILTERS
====================================================== */

export async function filterByArea(area: string) {
  return fetchCached(
    `${BASE_URL}/filter.php?a=${area}`,
    `area:${area}`
  );
}

export async function filterByCategory(category: string) {
  return fetchCached(
    `${BASE_URL}/filter.php?c=${category}`,
    `category:${category}`
  );
}

/* ======================================================
   DETAILS (INDIVIDUAL CACHE)
====================================================== */

export async function getMealDetails(id: string) {
  const cacheKey = `meal:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  if (!res.ok) throw new Error("API error");

  const json = await res.json();
  const meal = json.meals?.[0];

  if (meal) await setCache(cacheKey, meal);
  return meal;
}

/* ======================================================
   POPULAR
====================================================== */

export async function fetchPopularMeals() {
  return fetchCached(
    `${BASE_URL}/search.php?s=`,
    "popular"
  );
}

/* ======================================================
   🇮🇳 PREMIUM INDIAN RECIPES (CACHED + AGGREGATED)
====================================================== */

export async function fetchIndianMeals() {
  const cacheKey = "indian:all";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const keywords = [
    "chicken",
    "curry",
    "masala",
    "paneer",
    "dal",
    "biryani",
    "tikka",
    "kofta",
    "sabzi",
  ];

  try {
    // 1️⃣ Area-based Indian meals
    const areaMeals = await fetchCached(
      `${BASE_URL}/filter.php?a=Indian`,
      "indian:area"
    );

    // 2️⃣ Keyword-based Indian meals
    const keywordResults = await Promise.all(
      keywords.map((k) =>
        fetchCached(
          `${BASE_URL}/search.php?s=${k}`,
          `indian:kw:${k}`
        )
      )
    );

    // 3️⃣ Merge + deduplicate
    const map = new Map<string, any>();
    [...areaMeals, ...keywordResults.flat()].forEach((meal) => {
      if (meal?.idMeal) map.set(meal.idMeal, meal);
    });

    const merged = Array.from(map.values());
    await setCache(cacheKey, merged);

    return merged;
  } catch (error) {
    console.error("Indian meals fetch failed", error);
    return [];
  }
}
