import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import LessonCard from "@/components/cards/lesson";
import MyHeader from "@/components/cards/header";
import { useTheme } from "@/theme/global";
import { lessonService } from "@/services/lessonService";
import { authService } from "@/services/authService";
import { Lesson } from "@/app/types";

const lockIcon = require("../../assets/images/lock.png");

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const LessonsScreen: React.FC = () => {
  const theme = useTheme();
  const { colors, typography } = theme;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <MyHeader title="My Lessons" />

      <View style={styles.grid}>
        {lessons.map((lesson) => (
          <View key={lesson.lessonId} style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
            <LessonCard
              lesson={lesson}
              locked={lesson.progress === 'LOCKED' || lesson.status === 'DRAFT'}
              onPress={() => router.push({
                pathname: "/lessons/page",
                params: { lessonId: lesson.lessonId }
              })}
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
    // padding: 20,
    paddingTop:30,
    paddingHorizontal: 20,
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