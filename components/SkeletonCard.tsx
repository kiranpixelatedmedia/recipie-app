import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import { Radius, Spacing } from "@/constants/theme";

const { width } = Dimensions.get("window");

export default function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={styles.textBlock} />

      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#E5E7EB",
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  image: {
    height: 180,
    backgroundColor: "#D1D5DB",
  },
  textBlock: {
    height: 24,
    margin: Spacing.md,
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: "40%",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
