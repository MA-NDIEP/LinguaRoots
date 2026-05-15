import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
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

type Category = "Numbers" | "Names" | "Language Systems";

const CATEGORIES: Category[] = ["Numbers", "Names", "Language Systems"];

const CATEGORY_TYPE_MAP: Record<Category, LessonType> = {
  Numbers: "NUMBERS",
  Names: "NAMES",
  "Language Systems": "LANGUAGE_SYSTEMS",
};

/**
 * Normalises a raw lesson type string from the backend into the canonical
 * LessonType expected by the frontend.
 *
 * Handles common backend variations such as:
 *   - lowercase          "numbers"          → "NUMBERS"
 *   - camelCase          "languageSystems"   → "LANGUAGE_SYSTEMS"
 *   - PascalCase         "LanguageSystems"   → "LANGUAGE_SYSTEMS"
 *   - already correct    "LANGUAGE_SYSTEMS"  → "LANGUAGE_SYSTEMS"
 */
const normaliseLessonType = (raw: string): LessonType => {
  const upper = raw.toUpperCase().replace(/\s+/g, "_");

  // camelCase / PascalCase → SCREAMING_SNAKE_CASE
  // e.g. "languageSystems" → "LANGUAGE_SYSTEMS"
  const screaming = raw
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase()
    .replace(/\s+/g, "_");

  // Prefer the screaming-snake result if it matches a known type, otherwise
  // fall back to a simple upper-case.
  const knownTypes: LessonType[] = ["NUMBERS", "NAMES", "LANGUAGE_SYSTEMS"];
  if (knownTypes.includes(screaming as LessonType)) return screaming as LessonType;
  if (knownTypes.includes(upper as LessonType)) return upper as LessonType;

  // Unknown value — return as-is and let the filter simply produce an empty list
  return raw as LessonType;
};

/**
 * Safely extracts a Lesson array from whatever shape the backend returns.
 *
 * Handles:
 *   - bare array          [...lessons]
 *   - wrapped object      { data: [...] }
 *   - wrapped object      { lessons: [...] }
 *   - wrapped object      { content: [...] }  (Spring Page<T>)
 */
const extractLessons = (raw: unknown): Lesson[] => {
  if (Array.isArray(raw)) return raw as Lesson[];

  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["data", "lessons", "content", "items", "results"]) {
      if (Array.isArray(obj[key])) return obj[key] as Lesson[];
    }
  }

  console.warn("[LessonsScreen] Unexpected lessons response shape:", raw);
  return [];
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
        const raw = await lessonService.getAllLessons(userId ?? undefined);

        // Safely unwrap whatever shape the backend returned
        const extracted = extractLessons(raw);

        // Normalise every lesson's `type` so filtering works regardless of
        // how the backend serialises the enum value.
        const normalised: Lesson[] = extracted.map((lesson) => ({
          ...lesson,
          type: normaliseLessonType(String(lesson.type)),
        }));

        setLessons(normalised);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setLessons([]);
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
      <View
        style={[styles.container, styles.centered, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <MyHeader title="My Lessons" />

      {/* Category tabs */}
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

      {/* Section heading */}
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

      {/* 2-column lesson grid */}
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
            <View
              key={lesson.lessonId}
              style={[styles.cardWrapper, { width: CARD_WIDTH }]}
            >
              <LessonCard
                lesson={lesson}
                locked={
                  lesson.progress === "LOCKED" || lesson.status === "DRAFT"
                }
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