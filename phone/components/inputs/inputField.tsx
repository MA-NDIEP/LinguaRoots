// components/InputField.tsx
import { useTheme } from "@/theme/global";
import React, { useEffect, useRef } from "react";
import {
  TextInput,
  StyleSheet,
  Image,
  Animated,
  Platform,
  Text,
} from "react-native";

interface Props {
  placeholder: string;
  icon?: any;
  secureTextEntry?: boolean;  //for passwords 
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
    // floating label animation 1 if text is there and label floats. 0 otherwise
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

  // Label animation styles
  const labelStyle = {
    position: "absolute" as const,
    left: icon ? 44 : 14,
    top: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -1],
    }),
    fontSize: focusAnim.interpolate({
      inputRange: [0, 3],
      outputRange: [20, 16],
    }),
    color: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.primary, colors.primary],
    }),
    fontFamily: typography.fontFamily.bold,
  };

  const bgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.white, colors.white],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.16],
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
      {icon ? (
        <Image source={icon} style={[styles.icon, { tintColor: colors.primary }]} />
      ) : null}

      <Animated.Text style={labelStyle}>{placeholder}</Animated.Text>

      <TextInput
        style={[
          styles.input,
          { fontFamily: typography.fontFamily.buttonText, backgroundColor: "#fff" },
        ]}
        secureTextEntry={secureTextEntry}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={value}
        onChangeText={onChangeText}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 100,
    height: 60,
    margin: 18,

    position: "relative",
  },
  icon: {
    width: 24,
    height: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
  },
});
