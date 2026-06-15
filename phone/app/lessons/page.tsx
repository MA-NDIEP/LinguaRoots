import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/theme/global";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { lessonService } from "@/services/lessonService";
import { authService } from "@/services/authService";
import { Lesson, LessonType } from "@/app/types/index";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function extractLessons(raw: unknown): Lesson[] {
  if (Array.isArray(raw)) return raw as Lesson[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["data", "content", "lessons", "items"]) {
      if (Array.isArray(obj[key])) return obj[key] as Lesson[];
    }
  }
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const LessonScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();

  // ✅ Now receives lessonId (number) to find the lesson
  // and category (LessonType) to filter siblings for prev/next navigation
  const params = useLocalSearchParams<{
    lessonId?: string;
    category?: string;
  }>();

  // ── State ──────────────────────────────────────────────────────────────────
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [completing, setCompleting] = useState(false);

  // ── Animation refs ─────────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const lesson = lessons[currentIndex] ?? null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === lessons.length - 1;
  const progress = lessons.length > 0 ? (currentIndex + 1) / lessons.length : 0;

  // ── Fetch lessons ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = authService.getUserId();
        const raw = await lessonService.getAllLessons(userId ?? undefined);
        const all = extractLessons(raw);

        // ✅ Filter to only the same category as the tapped lesson
        // so prev/next stays within that category
        const targetId = params.lessonId ? parseInt(params.lessonId, 10) : null;
        const targetLesson = all.find((l) => l.lessonId === targetId);
        const categoryType = (params.category as LessonType) ?? targetLesson?.type;

        // Only show lessons from the same category, sorted by lessonOrder
        const categoryLessons = all
          .filter((l) => l.type === categoryType)
          .sort((a, b) => (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0));

        setLessons(categoryLessons);

        // Find the index of the tapped lesson within this filtered list
        if (targetId != null) {
          const idx = categoryLessons.findIndex((l) => l.lessonId === targetId);
          if (idx >= 0) setCurrentIndex(idx);
        } else {
          // Fall back to first OPEN lesson in the category
          const openIdx = categoryLessons.findIndex((l) => l.progress === "OPEN");
          if (openIdx >= 0) setCurrentIndex(openIdx);
        }
      } catch (e) {
        setError("Failed to load lessons. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // ── Page transition animation ──────────────────────────────────────────────
  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (!loading && lesson) animateIn();
  }, [currentIndex, loading]);

  // ── Pulse animation for audio button ──────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => pulseLoop.current?.stop();
  }, [isPlaying]);

  // ── Audio ──────────────────────────────────────────────────────────────────
  const stopAndUnload = useCallback(async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (_) {}
      setSound(null);
      setIsPlaying(false);
    }
  }, [sound]);

  useEffect(() => {
    return () => {
      stopAndUnload();
    };
  }, [currentIndex]);

  const handleAudio = async () => {
    // ✅ pronunciation field holds the audio URL per confirmed API response
    if (!lesson?.pronunciation) return;

    if (isPlaying) {
      await stopAndUnload();
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: lesson.pronunciation },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setSound(null);
          newSound.unloadAsync().catch(() => {});
        }
        if (!status.isLoaded && status.error) {
          console.error("Playback error:", status.error);
          setIsPlaying(false);
        }
      });
    } catch (e) {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
    }
  };

  // ── Navigation + completion ────────────────────────────────────────────────
  const handleNext = async () => {
    if (!lesson || completing) return;

    if (lesson.progress !== "COMPLETED") {
      try {
        setCompleting(true);
        const userId = authService.getUserId();
        if (userId != null && lesson.lessonOrder != null) {
          await lessonService.completeLesson(userId, lesson.lessonOrder);
        }
      } catch (e) {
        console.error("Failed to mark lesson complete:", e);
      } finally {
        setCompleting(false);
      }
    }

    await stopAndUnload();
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
    } else {
      router.push("/lessons");
    }
  };

  const handlePrev = async () => {
    await stopAndUnload();
    if (!isFirst) setCurrentIndex((i) => i - 1);
    else router.push("/lessons");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Loading
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.text, fontFamily: typography.fontFamily.body },
          ]}
        >
          Loading lesson…
        </Text>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Error
  // ─────────────────────────────────────────────────────────────────────────
  if (error || !lesson) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.secondary} />
        <Text
          style={[
            styles.errorText,
            { color: colors.text, fontFamily: typography.fontFamily.bold },
          ]}
        >
          {error ?? "No lessons available."}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/lessons")}
          style={[
            styles.errorBtn,
            { backgroundColor: colors.primary, borderRadius: radius.sm },
          ]}
        >
          <Text
            style={[
              styles.errorBtnText,
              { color: colors.white, fontFamily: typography.fontFamily.bold },
            ]}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Lesson
  // ─────────────────────────────────────────────────────────────────────────

  // ✅ pronunciation = audio URL (confirmed from API response)
  const hasAudio = !!lesson.pronunciation;
  const isLocked = lesson.progress === "LOCKED";
  const isCompleted = lesson.progress === "COMPLETED";

  // ✅ Display the category label without "ALPHABET" — use the actual type value
  const categoryLabel = lesson.type.replace(/_/g, " ");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePrev}
          style={[
            styles.iconBtn,
            { backgroundColor: colors.card, borderColor: colors.boxBorder },
          ]}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.lessonLabel,
              {
                color: colors.secondary,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.xs,
              },
            ]}
          >
            {categoryLabel} · LESSON {lesson.lessonOrder ?? currentIndex + 1}
          </Text>
          <Text
            style={[
              styles.lessonTitle,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.heading,
                fontSize: typography.fontSize.md,
              },
            ]}
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
        </View>

        <View
          style={[
            styles.counterBadge,
            { backgroundColor: colors.card, borderColor: colors.boxBorder },
          ]}
        >
          <Text
            style={[
              styles.counterText,
              {
                color: colors.secondary,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.md,
              },
            ]}
          >
            {currentIndex + 1}/{lessons.length}
          </Text>
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={[styles.progressTrack, { backgroundColor: colors.boxBorder }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${progress * 100}%` as any,
            },
          ]}
        />
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            width: "100%",
          }}
        >
          {/* ── Character Hero Card ── */}
          <View
            style={[
              styles.heroCard,
              { backgroundColor: colors.card, borderColor: colors.boxBorder },
            ]}
          >
            {(isCompleted || isLocked) && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isCompleted
                      ? colors.primary
                      : colors.secondary,
                    opacity: 0.92,
                  },
                ]}
              >
                <Ionicons
                  name={isCompleted ? "checkmark-circle" : "lock-closed"}
                  size={12}
                  color={colors.white}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: colors.white,
                      fontFamily: typography.fontFamily.bold,
                    },
                  ]}
                >
                  {isCompleted ? "Completed" : "Locked"}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.characterGlyph,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.boldH,
                },
              ]}
            >
              {lesson.content}
            </Text>

            {lesson.writtenPronunciation && (
              <View
                style={[
                  styles.pronChip,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.boxBorder,
                  },
                ]}
              >
                <Ionicons
                  name="text-outline"
                  size={13}
                  color={colors.secondary}
                />
                <Text
                  style={[
                    styles.pronChipText,
                    {
                      color: colors.secondary,
                      fontFamily: typography.fontFamily.bold,
                      fontSize: typography.fontSize.sm,
                    },
                  ]}
                >
                  {lesson.writtenPronunciation}
                </Text>
              </View>
            )}
          </View>

          {/* ── Info Card ── */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.boxBorder },
            ]}
          >
            <InfoRow
              icon="language-outline"
              label="English"
              value={lesson.englishEquivalent}
              colors={colors}
              typography={typography}
            />
            <Divider color={colors.boxBorder} />
            <InfoRow
              icon="mic-outline"
              label="Written"
              value={lesson.writtenPronunciation}
              colors={colors}
              typography={typography}
            />
            <Divider color={colors.boxBorder} />
            <InfoRow
              icon="book-outline"
              label="Example"
              value={lesson.example}
              colors={colors}
              typography={typography}
            />
          </View>

          {/* ── Audio Button ── */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }], width: "100%" }}>
            <TouchableOpacity
              onPress={handleAudio}
              disabled={!hasAudio || isLocked}
              activeOpacity={0.85}
              style={[
                styles.audioBtn,
                {
                  backgroundColor:
                    !hasAudio || isLocked
                      ? colors.boxBorder
                      : isPlaying
                      ? colors.secondary
                      : colors.primary,
                  borderRadius: radius.sm,
                },
              ]}
            >
              <View style={styles.audioBtnInner}>
                <View
                  style={[
                    styles.audioIconWrap,
                    { backgroundColor: "rgba(255,255,255,0.18)" },
                  ]}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "volume-high"}
                    size={22}
                    color={colors.white}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.audioBtnLabel,
                      {
                        color: colors.white,
                        fontFamily: typography.fontFamily.bold,
                        fontSize: typography.fontSize.sm,
                      },
                    ]}
                  >
                    {!hasAudio || isLocked
                      ? "No Audio Available"
                      : isPlaying
                      ? "Pause Pronunciation"
                      : "Play Pronunciation"}
                  </Text>
                  {hasAudio && !isLocked && (
                    <Text
                      style={[
                        styles.audioBtnSub,
                        {
                          color: "rgba(255,255,255,0.72)",
                          fontFamily: typography.fontFamily.body,
                          fontSize: typography.fontSize.sm,
                        },
                      ]}
                    >
                      Tap to {isPlaying ? "stop" : "hear"} native pronunciation
                    </Text>
                  )}
                </View>
              </View>
              {hasAudio && !isLocked && (
                <Ionicons
                  name={isPlaying ? "radio-outline" : "play-circle-outline"}
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* ── Next / Finish Button ── */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={isLocked || completing}
            activeOpacity={0.85}
            style={[
              styles.nextBtn,
              {
                backgroundColor: isLocked ? colors.boxBorder : colors.secondary,
                borderRadius: radius.sm,
                opacity: completing ? 0.75 : 1,
              },
            ]}
          >
            {completing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Text
                  style={[
                    styles.nextBtnText,
                    {
                      color: colors.white,
                      fontFamily: typography.fontFamily.bold,
                      fontSize: typography.fontSize.sm,
                    },
                  ]}
                >
                  {isLocked
                    ? "Lesson Locked"
                    : isLast
                    ? "Finish & Return"
                    : "Next Lesson"}
                </Text>
                {!isLocked && (
                  <Ionicons
                    name={isLast ? "checkmark-circle" : "arrow-forward"}
                    size={20}
                    color={colors.white}
                  />
                )}
              </>
            )}
          </TouchableOpacity>

          {/* ── Dot navigation ── */}
          {lessons.length > 1 && lessons.length <= 20 && (
            <View style={styles.dotRow}>
              {lessons.map((l, i) => (
                <View
                  key={l.lessonId}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === currentIndex
                          ? colors.primary
                          : l.progress === "COMPLETED"
                          ? colors.secondary
                          : colors.boxBorder,
                      width: i === currentIndex ? 20 : 8,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const InfoRow = ({
  icon,
  label,
  value,
  colors,
  typography,
}: {
  icon: string;
  label: string;
  value?: string;
  colors: any;
  typography: any;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelWrap}>
      <Ionicons
        name={icon as any}
        size={14}
        color={colors.secondary}
        style={{ marginRight: 6 }}
      />
      <Text
        style={[
          styles.infoLabel,
          {
            color: colors.secondary,
            fontFamily: typography.fontFamily.bold,
            fontSize: typography.fontSize.md,
          },
        ]}
      >
        {label}
      </Text>
    </View>
    <Text
      style={[
        styles.infoValue,
        {
          color: colors.text,
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.md,
        },
      ]}
      numberOfLines={2}
    >
      {value ?? "—"}
    </Text>
  </View>
);

const Divider = ({ color }: { color: string }) => (
  <View style={[styles.divider, { backgroundColor: color }]} />
);

export default LessonScreen;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  loadingText: { marginTop: 12, fontSize: 14, opacity: 0.7 },
  errorText: { fontSize: 15, textAlign: "center", marginTop: 8 },
  errorBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12 },
  errorBtnText: { fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  lessonLabel: { letterSpacing: 1.2, marginBottom: 1 },
  lessonTitle: { lineHeight: 22 },
  counterBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1,
  },
  counterText: { letterSpacing: 0.5 },
  progressTrack: {
    height: 5, marginHorizontal: 20,
    borderRadius: 2, marginBottom: 28, overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  scrollContent: {
    paddingHorizontal: 20, paddingBottom: 52,
    alignItems: "center", gap: 20,
  },
  heroCard: {
    width: "100%", minHeight: 220, borderRadius: 24,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 36, paddingHorizontal: 20,
    position: "relative", overflow: "hidden",
  },
  statusBadge: {
    position: "absolute", top: 14, right: 14,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 11, letterSpacing: 0.4 },
  characterGlyph: { fontSize: 110, lineHeight: 130, textAlign: "center" },
  pronChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  pronChipText: { letterSpacing: 0.3 },
  infoCard: { width: "100%", borderRadius: 18, borderWidth: 1, overflow: "hidden", marginTop: 10,  },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 8,
  },
  infoLabelWrap: { flexDirection: "row", alignItems: "center", flex: 1 },
  infoLabel: { letterSpacing: 0.3 },
  infoValue: { flex: 2, textAlign: "right", lineHeight: 18 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  audioBtn: {
    width: "100%", flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 18, marginTop: 10,
  },
  audioBtnInner: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  audioIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
  },
  audioBtnLabel: { lineHeight: 20 },
  audioBtnSub: { marginTop: 1 },
  nextBtn: {
    width: "100%", flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, paddingVertical: 15, marginTop: 30,
  },
  nextBtnText: { letterSpacing: 0.3 },
  dotRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5, marginTop: 10, flexWrap: "wrap",
  },
  dot: { height: 8, borderRadius: 4 },
});