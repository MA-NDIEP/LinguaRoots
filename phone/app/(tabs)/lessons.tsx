import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import LessonCard from "@/components/cards/lesson";
import MyHeader from "@/components/cards/header";
import { useTheme } from "@/theme/global";
import { lessonService } from "@/services/lessonService";
import { authService } from "@/services/authService";
import { Lesson, LessonType } from "@/app/types";

const lockIcon = require("../../assets/images/lock.png");

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type Category = "Numbers" | "Names" | "Language_Systems";

const CATEGORIES: Category[] = ["Numbers", "Names", "Language_Systems"];

const CATEGORY_TYPE_MAP: Record<Category, LessonType> = {
  Numbers:   "NUMBERS",
  Names:     "NAMES",
  Language_Systems: "LANGUAGE_SYSTEMS",
};

const LessonsScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("Numbers");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const userId = authService.getUserId();
        const data = await lessonService.getAllLessons(userId || undefined);
        setLessons(data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const activeLessons = lessons.filter(
    (lesson) => lesson.type === CATEGORY_TYPE_MAP[activeCategory]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <MyHeader title="My Lessons" />

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? colors.secondary : colors.card,
                  borderColor: isActive ? colors.secondary : colors.boxBorder,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? colors.white : colors.text,
                    fontFamily: typography.fontFamily.bold,
                    fontSize: typography.fontSize.xs,
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Category title */}
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
            fontFamily: typography.fontFamily.heading,
            fontSize: typography.fontSize.lg,
          },
        ]}
      >
        {activeCategory}
      </Text>

      {/* 2-column grid */}
      <View style={styles.grid}>
        {activeLessons.length === 0 ? (
          <Text
            style={[
              styles.emptyText,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.xs,
                opacity: 0.5,
              },
            ]}
          >
            No lessons available yet.
          </Text>
        ) : (
          activeLessons.map((lesson) => (
            <View key={lesson.lessonId} style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
              <LessonCard
                lesson={lesson}
                locked={lesson.progress === "LOCKED" || lesson.status === "DRAFT"}
                onPress={() =>
                  router.push({
                    pathname: "/lessons/page",
                    params: { lessonId: lesson.lessonId },
                  })
                }
                lockIcon={lockIcon}
              />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default LessonsScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContent: {
    gap: 8,
    paddingRight: 8,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
  },
  sectionTitle: {
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    marginBottom: 16,
  },
  emptyText: {
    width: "100%",
    textAlign: "center",
    marginTop: 40,
  },
});