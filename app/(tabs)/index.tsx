import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  Animated,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  searchMeals,
  filterByArea,
  filterByCategory,
  fetchIndianMeals,
} from "@/src/services/api";
import SearchBar from "@/components/SearchBar";
import FilterTabs from "@/components/FilterTabs";
import RecipeCard from "@/components/RecipeCard";
import Header from "@/components/Header";
import SkeletonCard from "@/components/SkeletonCard";
import { Spacing } from "@/constants/theme";

interface Filter {
  label: string;
  type: string;
  value: string;
}

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Screen animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    loadMeals();
  }, []);

  async function loadMeals() {
    try {
      setLoading(true);
      const data = await searchMeals("chicken");
      setMeals(data);
    } catch (error) {
      console.error("Error loading meals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFilter(filter: Filter) {
    try {
      setLoading(true);
      let data: any[] = [];

      if (filter.type === "area") {
        data = await filterByArea(filter.value);
      } else if (filter.type === "category") {
        data = await filterByCategory(filter.value);
      } else {
        data = await searchMeals(filter.value);
      }

      setMeals(data);
    } catch (error) {
      console.error("Error filtering meals:", error);
    } finally {
      setLoading(false);
    }
  }

async function handleSearch(text: string) {
  setQuery(text);

  if (!text.trim()) {
    loadMeals();
    return;
  }

  try {
    setLoading(true);

    // 🇮🇳 PREMIUM SEARCH LOGIC
    let data: any[] = [];

    if (
      text.toLowerCase().includes("ind") ||
      ["paneer", "dal", "biryani", "curry", "masala"].some((k) =>
        text.toLowerCase().includes(k)
      )
    ) {
      data = await fetchIndianMeals(text);
    } else {
      data = await searchMeals(text);
    }

    setMeals(data);
  } catch (error) {
    console.error("Error searching meals:", error);
  } finally {
    setLoading(false);
  }
}


  return (
    <>
      <Header />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        }}
      >
        <Text style={styles.heading}>🍽️ Popular Dishes</Text>

        <SearchBar value={query} onChange={handleSearch} />
        <FilterTabs onSelect={handleFilter} />

        {/* 🔥 PREMIUM LOADING */}
        {loading ? (
          <>
            {[1, 2, 3].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        ) : meals.length > 0 ? (
          meals.map((meal, index) => (
            <RecipeCard
              key={meal.idMeal}
              meal={meal}
              index={index} // used for stagger animation
            />
          ))
        ) : (
          <Text style={styles.noResults}>
            No recipes found. Try a different search!
          </Text>
        )}
      </Animated.ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: Spacing.md,
  },
  noResults: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: Spacing.lg,
  },
});
