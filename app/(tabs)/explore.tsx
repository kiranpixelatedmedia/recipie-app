import { Text, View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { filterByArea, filterByCategory } from "@/src/services/api";
import RecipeCard from "@/components/RecipeCard";
import Header from "@/components/Header";
import { Spacing, Colors } from "@/constants/theme";

const categories = [
  { name: "Breakfast", emoji: "🍳" },
  { name: "Seafood", emoji: "🦞" },
  { name: "Dessert", emoji: "🍰" },
  { name: "Vegetarian", emoji: "🥗" },
  { name: "Beef", emoji: "🥩" },
  { name: "Chicken", emoji: "🍗" },
];

const areas = [
  { name: "Italian", emoji: "🇮🇹" },
  { name: "Mexican", emoji: "🇲🇽" },
  { name: "Chinese", emoji: "🇨🇳" },
  { name: "Indian", emoji: "🇮🇳" },
  { name: "Japanese", emoji: "🇯🇵" },
  { name: "Thai", emoji: "🇹🇭" },
];

export default function ExploreScreen() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  useEffect(() => {
    loadInitialMeals();
  }, []);

  async function loadInitialMeals() {
    try {
      setLoading(true);
      const data = await filterByCategory("Seafood");
      setMeals(data);
      setSelectedCategory("Seafood");
    } catch (error) {
      console.error("Error loading meals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCategorySelect(category: string) {
    try {
      setLoading(true);
      setSelectedCategory(category);
      setSelectedArea(null);
      const data = await filterByCategory(category);
      setMeals(data);
    } catch (error) {
      console.error("Error filtering by category:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAreaSelect(area: string) {
    try {
      setLoading(true);
      setSelectedArea(area);
      setSelectedCategory(null);
      const data = await filterByArea(area);
      setMeals(data);
    } catch (error) {
      console.error("Error filtering by area:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <ScrollView style={styles.container}>
      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍴 Categories</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={[
                styles.chip,
                selectedCategory === cat.name && styles.chipSelected
              ]}
              onPress={() => handleCategorySelect(cat.name)}
            >
              <Text style={styles.chipEmoji}>{cat.emoji}</Text>
              <Text style={[
                styles.chipText,
                selectedCategory === cat.name && styles.chipTextSelected
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Areas Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Cuisines</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {areas.map((area) => (
            <TouchableOpacity
              key={area.name}
              style={[
                styles.chip,
                selectedArea === area.name && styles.chipSelected
              ]}
              onPress={() => handleAreaSelect(area.name)}
            >
              <Text style={styles.chipEmoji}>{area.emoji}</Text>
              <Text style={[
                styles.chipText,
                selectedArea === area.name && styles.chipTextSelected
              ]}>
                {area.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        <Text style={styles.resultsTitle}>
          {selectedCategory 
            ? `${selectedCategory} Recipes` 
            : selectedArea 
            ? `${selectedArea} Cuisine` 
            : "Explore Recipes"}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : meals.length > 0 ? (
          meals.map((meal: any) => (
            <RecipeCard key={meal.idMeal} meal={meal} />
          ))
        ) : (
          <Text style={styles.noResults}>No recipes found</Text>
        )}
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
  },
  chipContainer: {
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  chipTextSelected: {
    color: "#fff",
  },
  resultsSection: {
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  noResults: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
});