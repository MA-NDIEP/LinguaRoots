import { useTheme } from "@/theme/global";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

type MyHeaderProps = {
  title: string;
  subtitle?: string; // optional if you want extra text later
};

export default function MyHeader({ title, subtitle }: MyHeaderProps) {
  const theme = useTheme();
  const { colors, typography } = theme;

  return (
    <View style={styles.container}>
      {/* Left Side */}
      <View style={styles.left}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View>
          <Text
            style={[
              styles.title,
              { fontFamily: typography.fontFamily.heading,color: colors.text },
            ]}
          >
            {title}
          </Text>

          {subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right Side */}
      <View style={styles.right}>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons
  name="notifications-outline"
  size={24}
  color={colors.text}
/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logo: {
    width: 40,
    height: 40,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
  },

  subtitle: {
    fontSize: 12,
    opacity: 0.6,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(16, 126, 194, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  bellIcon: {
    width: 30,
    height: 30,
    tintColor: "white",
  },
});