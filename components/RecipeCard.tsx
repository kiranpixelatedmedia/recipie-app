import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { router } from "expo-router";

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strArea?: string;
  strCategory?: string;
}

interface RecipeCardProps {
  meal: Meal;
  index?: number; // optional, for stagger animation
}

export default function RecipeCard({ meal, index = 0 }: RecipeCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 450,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => router.push(`/recipe/${meal.idMeal}`)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: translateAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* IMAGE */}
        <Animated.Image
          source={{ uri: meal.strMealThumb }}
          style={[styles.image, { opacity: imageOpacity }]}
          resizeMode="cover"
          onLoad={() =>
            Animated.timing(imageOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start()
          }
        />

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {meal.strMeal}
          </Text>

          <Text style={styles.desc} numberOfLines={1}>
            {meal.strArea && meal.strCategory
              ? `${meal.strArea} • ${meal.strCategory}`
              : meal.strArea || meal.strCategory || "Recipe"}
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },

  image: {
    height: 190,
    width: "100%",
    backgroundColor: "#E5E7EB",
  },

  content: {
    padding: Spacing.md,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.text,
    lineHeight: 24,
  },

  desc: {
    color: Colors.textSecondary,
    marginTop: 6,
    fontSize: 14,
    fontWeight: "500",
  },
});
