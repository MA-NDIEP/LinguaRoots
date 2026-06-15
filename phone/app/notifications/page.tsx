import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { router } from "expo-router";

const initialNotifications = [
  {
    id: "1",
    title: "New Word Added",
    message: "Learn the word “Ubuntu” today 🌍",
    time: "2 min ago",
    read: false,
    type: "word",
  },
  {
    id: "2",
    title: "Daily Lesson Reminder",
    message: "Don’t forget your lesson for today!",
    time: "1 hr ago",
    read: false,
    type: "lesson",
  },
  {
    id: "3",
    title: "New Cultural Post",
    message: "Discover traditional Cameroonian dishes 🍲",
    time: "Yesterday",
    read: true,
    type: "culture",
  },
];

export default function Notifications() {
  const { colors, typography, spacing, radius } = useTheme();

  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "word":
        return "book-outline";
      case "lesson":
        return "school-outline";
      case "culture":
        return "earth-outline";
      default:
        return "notifications-outline";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.push("/settings")}
                style={[
                  styles.backBtn,
                  { backgroundColor: colors.card, borderColor: colors.boxBorder },
                ]}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.boldH,
                    fontSize: typography.fontSize.lg,
                  },
                ]}
              >
                Notifications
              </Text>
              <View style={{ width: 40 }} />
            </View>
<View style={styles.comingSoon}>
  <Ionicons name="notifications-off-outline" size={52} color={colors.text} style={{ opacity: 0.2 }} />
  <Text style={[styles.comingSoonTitle, { color: colors.text, fontFamily: typography.fontFamily.boldH }]}>
    Coming Soon
  </Text>
  <Text style={[styles.comingSoonSub, { color: colors.text, fontFamily: typography.fontFamily.body }]}>
    Notifications are on their way. We'll let you know when they're ready.
  </Text>
</View>
      
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
    header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
comingSoon: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 40,
  gap: 12,
},
comingSoonTitle: {
  fontSize: 22,
  marginTop: 8,
},
comingSoonSub: {
  fontSize: 14,
  textAlign: "center",
  opacity: 0.5,
  lineHeight: 22,
},
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  headerTitle: {},
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  title: {
    fontSize: 26,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
  },
  cardMessage: {
    fontSize: 13,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});