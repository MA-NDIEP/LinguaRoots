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
import { authService } from "@/services/authService";
import { Lesson } from "@/app/types";
import Button from "@/components/button/button";
import { Alert } from "react-native";

const LessonPage: React.FC = () => {
  const theme = useTheme();
  const { colors, typography, themeMode } = theme;
  const { lessonId } = useLocalSearchParams();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const userId = authService.getUserId();
        const allLessons = await lessonService.getAllLessons(userId || undefined);
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
    router.back();
  };

  const handleComplete = async () => {
    if (!lesson || lesson.lessonOrder === undefined) return;
    
    setCompleting(true);
    try {
      const userId = authService.getUserId();
      if (!userId) throw new Error("User not logged in");
      
      await lessonService.completeLesson(userId, lesson.lessonOrder);
      Alert.alert("Success", "Lesson completed!", [
        { text: "OK", onPress: () => handleBack() }
      ]);
    } catch (error) {
      console.error("Error completing lesson:", error);
      Alert.alert("Error", "Failed to complete lesson. Please try again.");
    } finally {
      setCompleting(false);
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
          <View style={[styles.detailCard, { backgroundColor: themeMode === 'dark' ? 'rgba(119, 157, 40, 0.15)' : 'rgba(95, 127, 119, 0.1)' }]}>
            {lesson.writtenPronunciation && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Pronunciation:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{lesson.writtenPronunciation}</Text>
              </View>
            )}
            {lesson.englishEquivalent && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>English:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{lesson.englishEquivalent}</Text>
              </View>
            )}
          </View>
        )}

        {lesson.example && (
          <View style={[styles.exampleContainer, { backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[styles.exampleLabel, { color: colors.text, opacity: 0.7 }]}>Example:</Text>
            <Text style={[styles.text, { fontFamily: typography.fontFamily.body, color: colors.text, fontStyle: 'italic', marginBottom: 0 }]}>
              {lesson.example}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {lesson.progress !== 'COMPLETED' && (
            <Button
              title={completing ? "Completing..." : "Complete Lesson"}
              onPress={handleComplete}
              loading={completing}
              variant="secondary"
              style={styles.actionButton}
            />
          )}

          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.secondary }]}
            onPress={handleBack}
          >
            <Text style={[styles.backButtonText, { color: colors.secondary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LessonPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
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
  },
  detailCard: {
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#779D28",
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
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    width: '100%',
    paddingHorizontal: 0,
  },
  backButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});