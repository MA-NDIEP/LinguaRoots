// components/InputField.tsx
import { useTheme } from "@/theme/global";
import React, { useRef, useState } from "react";
import {
  TextInput,
  StyleSheet,
  Image,
  Animated,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  placeholder: string;
  icon?: any;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (t: string) => void;
}

export default function InputField({
  placeholder,
  icon,
  secureTextEntry,
  value,
  onChangeText,
}: Props) {
  const theme = useTheme();
  const { typography, colors } = theme;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const focusAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!value) {
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }
  };

  // 🔥 Floating label animation
  const labelStyle = {
    position: "absolute" as const,
    left: icon ? 44 : 14,
    top: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -1],
    }),
    fontSize: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 14],
    }),
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  };

  const bgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.white, colors.white],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: colors.primary,
          backgroundColor: bgColor,
          shadowOpacity,
        },
      ]}
    >
      {/* Left Icon */}
      {icon ? (
        <Image
          source={icon}
          style={[styles.icon, { tintColor: colors.primary }]}
        />
      ) : null}

      {/* Floating Label */}
      <Animated.Text style={labelStyle}>{placeholder}</Animated.Text>

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          { fontFamily: typography.fontFamily.buttonText },
        ]}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={value}
        onChangeText={onChangeText}
      />

      {/* Eye Icon (only for password fields) */}
      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={22}
            color={colors.primary}
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 16, // ✅ FIXED (was 100)
    height: 60,
    margin: 18,
    position: "relative",

    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },

  icon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },

  eyeIcon: {
    marginLeft: 10,
  },
});