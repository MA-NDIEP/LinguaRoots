import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import LessonCard from "@/components/cards/lesson";
import MyHeader from "@/components/cards/header";
import { useTheme } from "@/theme/global";

const lockIcon = require("../../assets/images/lock.png");

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type Category = "Alphabets" | "Numbers" | "Names" | "Syllables";

const CATEGORIES: Category[] = ["Alphabets", "Numbers", "Names", "Syllables"];

const LESSONS_BY_CATEGORY: Record<Category, { num: number; locked: boolean }[]> = {
  Alphabets: [
    { num: 1, locked: false },
    { num: 2, locked: false },
    { num: 3, locked: true },
    { num: 4, locked: true },
    { num: 5, locked: true },
    { num: 6, locked: true },
  ],
  Numbers: [
    { num: 1, locked: false },
    { num: 2, locked: true },
    { num: 3, locked: true },
    { num: 4, locked: true },
  ],
  Names: [
    { num: 1, locked: false },
    { num: 2, locked: true },
    { num: 3, locked: true },
  ],
  Syllables: [
    { num: 1, locked: false },
    { num: 2, locked: true },
  ],
};

const LessonsScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();
  const [activeCategory, setActiveCategory] = useState<Category>("Alphabets");

  const activeLessons = LESSONS_BY_CATEGORY[activeCategory];

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
        {activeLessons.map(({ num, locked }) => (
          <View key={num} style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
            <LessonCard
              lesson={num}
              locked={locked}
              onPress={
                !locked ? () => router.push("/lessons/page") : undefined
              }
              lockIcon={lockIcon}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default LessonsScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
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
});