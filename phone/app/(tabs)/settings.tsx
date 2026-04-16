import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/theme/global";
import { authService } from "@/services/authService";
import Button from "@/components/button/button";

export type SettingItemProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
};

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  icon,
  onPress,
  rightComponent,
}) => {
  const { colors, typography } = useTheme();

  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.left}>
        <Ionicons name={icon} size={20} color={colors.text} />
        <Text
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.md,
            color: colors.text,
          }}
        >
          {title}
        </Text>
      </View>
      {rightComponent ? (
        rightComponent
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { colors, typography, themeMode, setThemeMode } = useTheme();

  // Profile
  const [username, setUsername] = useState(authService.getUsername() || "User");
  const email = authService.getEmail() || "user@email.com";
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Modals
  const [profileModal, setProfileModal] = useState(false);
  const [languageModal, setLanguageModal] = useState(false);

  // Language
  const [language, setLanguage] = useState("English");
  const languages = ["English", "French", "Spanish"];

  const avatarUrl = "";

  const handleSaveProfile = () => {
    if (newUsername.trim()) {
      setUsername(newUsername);
      authService.setUser(null, newUsername, email);
    }
    if (newPassword.trim()) console.log("Password updated");
    setNewUsername("");
    setNewPassword("");
    setProfileModal(false);
  };

  const handleLogout = () => {
    authService.logout();
    router.replace("/auth/login");
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* PROFILE */}
        {/* <MyHeader title="My Settings"/> */}
        <View style={[styles.profile, { backgroundColor: colors.card }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.xl,
                  color: colors.white,
                  fontWeight: "600",
                }}
              >
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.md,
                color: colors.text,
                fontWeight: "600",
              }}
            >
              {username}
            </Text>
            <Text
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: 18,
                color: colors.text,
              }}
            >
              {email}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setProfileModal(true)}>
            <Ionicons name="create-outline" size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* GENERAL */}
        <Text
          style={{
            fontFamily: typography.fontFamily.boldH,
            fontSize: typography.fontSize.sm,
            color: colors.text,
            marginTop: 20,
            marginLeft: 15,
            marginBottom: 5,
          }}
        >
          General
        </Text>

        <SettingItem
          title="Notifications"
          icon="notifications-outline"
          onPress={() => router.push("/notifications/page")}
        />

        <SettingItem
          title="Language"
          icon="language-outline"
          onPress={() => setLanguageModal(true)}
          rightComponent={
            <Text
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.md,
                color: colors.text,
              }}
            >
              {language}
            </Text>
          }
        />

        <SettingItem
          title="Dark Mode"
          icon="moon-outline"
          rightComponent={
            <Switch
              value={themeMode === "dark"}
              onValueChange={() =>
                setThemeMode(themeMode === "dark" ? "light" : "dark")
              }
              trackColor={{ false: colors.primary, true: colors.primary }}
              thumbColor={colors.secondary}
            />
          }
        />

        {/* LOGOUT */}
          <Button
              variant="secondary"
              title={"LogOut"}
              onPress={handleLogout}
              style={{ marginTop: 28, marginHorizontal: 20 }}
          />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={profileModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.lg,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 15,
              }}
            >
              Edit Profile
            </Text>

            <TextInput
              placeholder="New Username"
              placeholderTextColor={colors.text}
              value={newUsername}
              onChangeText={setNewUsername}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.boxBorder, fontFamily: typography.fontFamily.body },
              ]}
            />

            <TextInput
              placeholder="New Password"
              placeholderTextColor={colors.text}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.boxBorder, fontFamily: typography.fontFamily.body },
              ]}
            />

            <View style={styles.modalActions}>
              <Pressable onPress={() => setProfileModal(false)}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.md,
                    color: colors.text,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable onPress={handleSaveProfile}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.md,
                    fontWeight: "600",
                    color: colors.primary,
                  }}
                >
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* LANGUAGE MODAL */}
      <Modal visible={languageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.lg,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 15,
              }}
            >
              Select Language
            </Text>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.languageItem}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageModal(false);
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.md,
                    color: colors.text,
                  }}
                >
                  {lang}
                </Text>
                {language === lang && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <Pressable onPress={() => setLanguageModal(false)}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.md,
                  color: colors.text,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop:50 },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  item: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  logout: { marginTop: 30, alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 20 },
  modalCard: { borderRadius: 20, padding: 20 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 },
  languageItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 0.5, borderColor: "#eee" },
});