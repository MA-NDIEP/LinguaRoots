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

type Category = "Numbers" | "Language Systems" | "Names";

const CATEGORIES: Category[] = ["Numbers", "Language Systems", "Names"];

const CATEGORY_TYPE_MAP: Record<Category, LessonType> = {
  Numbers: "NUMBER",
  Names: "NAME",
  "Language Systems": "LANGUAGE_SYSTEM",
};

const normaliseLessonType = (raw: string): LessonType => {
  const upper = raw.toUpperCase().replace(/\s+/g, "_");


  const screaming = raw
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase()
    .replace(/\s+/g, "_");

  const knownTypes: LessonType[] = ["NUMBER", "LANGUAGE_SYSTEM", "NAME"];
  if (knownTypes.includes(screaming as LessonType)) return screaming as LessonType;
  if (knownTypes.includes(upper as LessonType)) return upper as LessonType;

  // Unknown value — return as-is and let the filter simply produce an empty list
  return raw as LessonType;
};


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
        console.log("[DEBUG] raw response:", JSON.stringify(raw)); 

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
        style={[styles.screen, styles.centered, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Sticky header: "My Lessons" + category tabs ──────────────────── */}
      <View
        style={[
          styles.fixedHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.boxBorder,
          },
        ]}
      >
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
      </View>

      {/* ── Scrollable lesson content ─────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                      params: { lessonId: String(lesson.lessonId) },
                    })
                  }
                  lockIcon={lockIcon}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default LessonsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  fixedHeader: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tabsContent: {
    gap: 8,
    paddingRight: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 180,
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