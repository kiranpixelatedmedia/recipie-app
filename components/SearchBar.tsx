import {
  View,
  TextInput,
  StyleSheet,
  Animated,
} from "react-native";
import { useRef } from "react";
import { Colors, Radius, Spacing } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const shadowStyle = {
    shadowOpacity: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.08, 0.18],
    }),
    elevation: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 6],
    }),
  };

  return (
    <Animated.View
      style={[
        styles.container,
        shadowStyle,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.iconContainer}>
        {/* simple emoji icon to avoid extra deps */}
        <Animated.Text style={styles.icon}>🔍</Animated.Text>
      </View>

      <TextInput
        placeholder="Search recipes..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },

  iconContainer: {
    marginRight: 8,
  },

  icon: {
    fontSize: 18,
  },

  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },
});
