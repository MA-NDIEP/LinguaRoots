// components/InputField.tsx
import { useTheme } from "@/theme/global";
import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  Image,
  Platform,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const { typography, colors, themeMode } = theme;

  const [passwordVisible, setPasswordVisible] = useState(false);

  // If secureTextEntry is passed, we manage the visibility.
  // When secureTextEntry is TRUE, it should hide text. 
  // If passwordVisible is TRUE, we want to SEE the text, so we set secureTextEntry to FALSE.
  const isSecure = secureTextEntry && !passwordVisible;

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: themeMode === 'light' ? colors.primary : colors.white,
          backgroundColor: themeMode === 'light' ? colors.white : colors.primary,
        },
      ]}
    >
      {icon ? (
        <Image source={icon} style={[styles.icon, { tintColor: colors.primary }]} />
      ) : null}

      <TextInput
        style={[
          styles.input,
          { 
            fontFamily: typography.fontFamily.buttonText, 
            backgroundColor: themeMode === 'light' ? colors.white : colors.primary, 
            color: themeMode === 'light' ? colors.text : colors.white 
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={themeMode === 'light' ? colors.text + "80" : colors.white + "80"} // 50% opacity
        secureTextEntry={isSecure}
        value={value}
        onChangeText={onChangeText}
      />

      {secureTextEntry && (
        <TouchableOpacity 
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.eyeIcon}
        >
          <Ionicons 
            name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
            size={24} 
            color={themeMode === 'light' ? colors.primary : colors.white} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 14,
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
  eyeIcon: {
    padding: 5,
  },
});
