import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
} from "react-native";
import { useRef, useState } from "react";
import { Colors, Radius, Spacing } from "@/constants/theme";

interface Filter {
  label: string;
  type: string;
  value: string;
}

interface FilterTabsProps {
  onSelect: (filter: Filter) => void;
}

const filters: Filter[] = [
  { label: "Breakfast", type: "category", value: "Breakfast" },
  { label: "Lunch", type: "search", value: "Chicken" },
  { label: "Dinner", type: "search", value: "Beef" },
  { label: "Indian", type: "area", value: "Indian" },
  { label: "Italian", type: "area", value: "Italian" },
  { label: "Spanish", type: "area", value: "Spanish" },
  { label: "Arabian", type: "area", value: "Arabian" },
];

export default function FilterTabs({ onSelect }: FilterTabsProps) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((item) => (
        <FilterPill
          key={item.label}
          label={item.label}
          active={active === item.label}
          onPress={() => {
            setActive(item.label);
            onSelect(item);
          }}
        />
      ))}
    </ScrollView>
  );
}

/* ---------------- PILL COMPONENT ---------------- */

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.pill,
          active && styles.activePill,
          { transform: [{ scale }] },
        ]}
      >
        <Text
          style={[
            styles.text,
            active && styles.activeText,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    gap: 10,
    marginBottom: Spacing.lg,
  },

  pill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  activePill: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
    shadowOpacity: 0.18,
    elevation: 5,
  },

  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  activeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
