import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/theme/global";
import { lessonService } from "@/services/lessonService";
import { Lesson } from "@/app/types";

const LessonPage: React.FC = () => {
  const theme = useTheme();
  const { colors, typography } = theme;
  const { lessonId } = useLocalSearchParams();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const allLessons = await lessonService.getAllLessons();
        const found = allLessons.find(l => l.lessonId.toString() === lessonId);
        setLesson(found || null);
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    } else {
      setLoading(false);
    }
  }, [lessonId]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/lessons");
    }
  };

  if (!lesson) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Lesson not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { fontFamily: typography.fontFamily.boldH, color: colors.text }]}>
          {lesson.title}
        </Text>
        
        <Text style={[styles.text, { fontFamily: typography.fontFamily.body, color: colors.text }]}>
          {lesson.content}
        </Text>

        { (lesson.writtenPronunciation || lesson.englishEquivalent) && (
          <View style={styles.detailCard}>
            {lesson.writtenPronunciation && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.primary }]}>Pronunciation:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{lesson.writtenPronunciation}</Text>
              </View>
            )}
            {lesson.englishEquivalent && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.primary }]}>English:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{lesson.englishEquivalent}</Text>
              </View>
            )}
          </View>
        )}

        {lesson.example && (
          <View style={styles.exampleContainer}>
            <Text style={[styles.exampleLabel, { color: colors.text, opacity: 0.7 }]}>Example:</Text>
            <Text style={[styles.text, { fontFamily: typography.fontFamily.body, color: colors.text, fontStyle: 'italic' }]}>
              {lesson.example}
            </Text>
          </View>
        )}

        {/* Next Lesson Button (just goes back for now or to first lesson if not found) */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleBack}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default LessonPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F5F3",
    paddingTop: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: "#2E4A45",
  },
  detailCard: {
    backgroundColor: "rgba(95, 127, 119, 0.1)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#5F7F77",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    width: 110,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
    fontStyle: "italic",
  },
  exampleContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#5F7F77",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  buttonText: {
    color: "#E6F0EC",
    fontWeight: "600",
    fontSize: 16,
  },
});