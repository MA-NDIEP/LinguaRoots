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
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/global";
import InputField from "@/components/inputs/inputField";
import Button from "@/components/button/button";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();
  const theme = useTheme();
  const { colors, typography } = theme;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
              <Text style={[styles.title, { fontFamily: typography.fontFamily.boldH, color: colors.primary }]}>Login</Text>
              <Text style={[ { fontFamily: typography.fontFamily.bold, fontSize: 18,    textAlign: "center", }]}>Ready to dive into the wonderful world of African culture?</Text>


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

              <TouchableOpacity style={styles.forgot}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Login"
                onPress={() => router.push("/(tabs)")}
              />

              <TouchableOpacity
                onPress={() => router.push("/auth/signin")}
                style={{ marginTop: 16 }}
              >
                <Text style={styles.signupText}>
                  Don’t have an account? Sign up
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
    fontWeight: "700",
    // color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },

  forgot: {
    marginBottom: 15,
  },

  forgotText: {
    color: "#6c6b6b",
    fontSize: 14,
    padding : 8,
  },

  signupText: {
    color: "#6c6b6b",
    textAlign: "center",
    fontSize: 14,
  },
});