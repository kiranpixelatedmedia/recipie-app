import {
  ScrollView,
  Text,
  Image,
  StyleSheet,
  View,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { getMealDetails } from "@/src/services/api";
import { Spacing, Colors, Radius } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const [meal, setMeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getMealDetails(id as string);
        setMeal(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ---------------- ANIMATIONS ---------------- */

  const heroTranslate = scrollY.interpolate({
    inputRange: [-100, 0, 300],
    outputRange: [-40, 0, 120],
    extrapolate: "clamp",
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.15, 1],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [120, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Preparing recipe…</Text>
      </View>
    );
  }

  if (!meal) return null;

  const tags = meal.strTags?.split(",").filter(Boolean) || [];

  return (
    <View style={styles.container}>
      {/* STICKY HEADER TITLE */}
      <Animated.View style={[styles.stickyHeader, { opacity: titleOpacity }]}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <Text style={styles.stickyTitle} numberOfLines={1}>
          {meal.strMeal}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* HERO */}
        <Animated.View
          style={[
            styles.hero,
            {
              transform: [{ translateY: heroTranslate }, { scale: heroScale }],
            },
          ]}
        >
          <Image source={{ uri: meal.strMealThumb }} style={styles.heroImage} />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>{meal.strMeal}</Text>

            <View style={styles.metaRow}>
              {meal.strArea && <MetaBadge text={`🌍 ${meal.strArea}`} />}
              {meal.strCategory && (
                <MetaBadge text={`🍴 ${meal.strCategory}`} />
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* CONTENT */}
        <View style={styles.sheet}>
          {tags.length > 0 && (
            <View style={styles.tags}>
              {tags.map((t: string) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t.trim()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* INFO CARDS */}
          <View style={styles.infoRow}>
            <InfoCard icon="👥" label="Serves" value="2–4" />
            <InfoCard icon="⏱️" label="Time" value="30 min" />
            <InfoCard icon="🔥" label="Level" value="Medium" />
          </View>

          {/* INSTRUCTIONS */}
          {meal.strInstructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👨‍🍳 How to Cook</Text>
              <View style={styles.instructionsCard}>
                <Text style={styles.instructions}>
                  {meal.strInstructions}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- COMPONENTS ---------------- */

function MetaBadge({ text }: { text: string }) {
  return (
    <View style={styles.metaBadge}>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
  },

  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 88,
    zIndex: 10,
    justifyContent: "flex-end",
    padding: Spacing.md,
  },

  stickyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },

  hero: {
    height: 420,
    overflow: "hidden",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroGradient: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: Spacing.lg,
  },

  heroTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  metaBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },

  metaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  sheet: {
    marginTop: -30,
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.lg,
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.lg,
  },

  tag: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  tagText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 13,
  },

  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: Spacing.xl,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: Spacing.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  infoIcon: { fontSize: 26, marginBottom: 6 },
  infoLabel: { fontSize: 12, color: Colors.textSecondary },
  infoValue: { fontSize: 16, fontWeight: "800" },

  section: { marginBottom: Spacing.xl },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: Spacing.md,
  },

  instructionsCard: {
    backgroundColor: "#fff",
    padding: Spacing.lg,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  instructions: {
    fontSize: 16,
    lineHeight: 26,
    color: "#374151",
  },
});
