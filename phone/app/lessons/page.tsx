import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/theme/global";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

// ── Lesson data shape ──────────────────────────────────────────────
type LessonData = {
  lessonNumber: number;
  character: string;
  title: string;
  english: string;
  written: string;
  example: string;
  audioUri?: string; // local: require("...") | remote: "https://..."
};

// ── Swap this out with API / props later ───────────────────────────
const LESSON: LessonData = {
  lessonNumber: 1,
  character: "ก",
  title: "Thai Alphabet: Gor Gai",
  english: "Gor Gai – Chicken",
  written: "gaw gai",
  example: "ไก่ (chicken)",
  audioUri: undefined, // replace with real uri when ready
};

const Lesson1Screen: React.FC = () => {
  const { colors, typography, radius } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const handleAudio = async () => {
    if (!LESSON.audioUri) return;

    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: LESSON.audioUri },
      { shouldPlay: true }
    );
    setSound(newSound);
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setIsPlaying(false);
        setSound(null);
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/lessons")}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.boxBorder }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text
          style={[
            styles.lessonBadge,
            {
              color: colors.secondary,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.md,
            },
          ]}
        >
          Lesson {LESSON.lessonNumber}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.characterBox,
            { backgroundColor: colors.card, borderColor: colors.boxBorder },
          ]}
        >
          <Text
            style={[
              styles.character,
              {
                color: colors.primary,
                fontFamily: typography.fontFamily.boldH,
              },
            ]}
          >
            {LESSON.character}
          </Text>
        </View>

        {/* ── Title ── */}
        <Text
          style={[
            styles.title,
            {
              color: colors.primary,
              fontFamily: typography.fontFamily.heading,
              fontSize: typography.fontSize.lg,
            },
          ]}
        >
          {LESSON.title}
        </Text>

        {/* ── Info rows ── */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.boxBorder },
          ]}
        >
          <InfoRow
            label="English"
            value={LESSON.english}
            colors={colors}
            typography={typography}
          />
          <Divider color={colors.boxBorder} />
          <InfoRow
            label="Written"
            value={LESSON.written}
            colors={colors}
            typography={typography}
          />
          <Divider color={colors.boxBorder} />
          <InfoRow
            label="Example"
            value={LESSON.example}
            colors={colors}
            typography={typography}
          />
        </View>

        {/* ── Audio player ── */}
        <TouchableOpacity
          onPress={handleAudio}
          disabled={!LESSON.audioUri}
          style={[
            styles.audioBtn,
            {
              backgroundColor: LESSON.audioUri ? colors.secondary : colors.boxBorder,
              borderRadius: radius.sm,
            },
          ]}
        >
          <Ionicons
            name={isPlaying ? "pause-circle" : "volume-high"}
            size={24}
            color={colors.white}
          />
          <Text
            style={[
              styles.audioBtnText,
              {
                color: colors.white,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.xs,
              },
            ]}
          >
            {!LESSON.audioUri
              ? "No Audio Available"
              : isPlaying
              ? "Pause"
              : "Play Pronunciation"}
          </Text>
        </TouchableOpacity>

        {/* ── Next Lesson ── */}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.sm,
            },
          ]}
          onPress={() => router.push("/lessons/page")}
        >
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
            Next Lesson
          </Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ── Small helpers ──────────────────────────────────────────────────

const InfoRow = ({
  label,
  value,
  colors,
  typography,
}: {
  label: string;
  value: string;
  colors: any;
  typography: any;
}) => (
  <View style={styles.infoRow}>
    <Text
      style={[
        styles.infoLabel,
        {
          color: colors.secondary,
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.xs,
        },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.infoValue,
        {
          color: colors.text,
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.xs,
        },
      ]}
    >
      {value}
    </Text>
  </View>
);

const Divider = ({ color }: { color: string }) => (
  <View style={[styles.divider, { backgroundColor: color }]} />
);

export default Lesson1Screen;

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonBadge: {
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    alignItems: "center",
  },
  characterBox: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  character: {
    fontSize: 120,
    lineHeight: 140,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  infoCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    flex: 2,
    textAlign: "right",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  audioBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    marginBottom: 12,
  },
  audioBtnText: {},
  nextBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  nextBtnText: {},
});