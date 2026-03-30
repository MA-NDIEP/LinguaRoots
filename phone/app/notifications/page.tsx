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
      <Text
        style={[
          styles.title,
          {
            color: colors.primary,
            fontFamily: typography.fontFamily.heading,
          },
        ]}
      >
        Notifications
      </Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: colors.white,
                borderRadius: radius.sm,
              },
              !item.read && {
                borderLeftWidth: 4,
                borderLeftColor: colors.secondary,
              },
            ]}
            onPress={() => markAsRead(item.id)}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name={getIcon(item.type)}
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.textBox}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.bold,
                  },
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.cardMessage,
                  {
                    color: colors.text,
                    opacity: 0.7,
                    fontFamily: typography.fontFamily.body,
                  },
                ]}
              >
                {item.message}
              </Text>

              <Text
                style={[
                  styles.time,
                  {
                    color: colors.muted,
                    fontFamily: typography.fontFamily.body,
                  },
                ]}
              >
                {item.time}
              </Text>
            </View>

            {!item.read && (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.secondary },
                ]}
              />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
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