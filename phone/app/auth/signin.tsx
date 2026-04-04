import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/global";
import InputField from "@/components/inputs/inputField";
import Button from "@/components/button/button";
import { authService } from "@/services/authService";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();
  const theme = useTheme();
  const { colors, typography } = theme;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await authService.registerStudent(username, email, password);
      Alert.alert("Success", "Registration successful! You can now log in.");
      router.push("/auth/login");
    } catch (error) {
      Alert.alert("Registration Failed", error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/back.png")}
      style={styles.background}
      resizeMode="cover"
    >

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerContainer}>
            
            {/* Logo */}
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />

            {/* Glass Card */}
            <View style={styles.card}>
              <Text style={[styles.title, { fontFamily: typography.fontFamily.boldH, color: colors.secondary }]}>Sign Up</Text>
              <Text style={[ { fontFamily: typography.fontFamily.bold, fontSize: 18,    textAlign: "center", }]}>Ready to delve into the wonderful world of African culture?</Text>

              <InputField
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />

              <InputField
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
              />

              <InputField
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                title={loading ? "Signing up..." : "Sign Up"}
                variant="secondary"
                onPress={handleSignUp}
                disabled={loading}
              />

              <TouchableOpacity
                onPress={() => router.push("/auth/login")}
                style={{ marginTop: 16 }}
              >
                <Text style={[{fontFamily: typography.fontFamily.buttonText},styles.signupText]}>
                  Already have an account? Log In
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,

  },


  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  logo: {
    width:150,
    height: 150,
    resizeMode: "contain",
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#21443D",
    padding: 20,
  },

  title: {
    fontSize: 26,
    // color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },


  signupText: {
    color: "#272727",
    textAlign: "center",
    fontSize: 14,
  },
});