// components/cards/lesson.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";

import { Lesson } from "@/app/types";
import { useTheme } from "@/theme/global";

interface LessonCardProps {
  lesson: Lesson;
  locked?: boolean;
  onPress?: () => void;
  lockIcon: ImageSourcePropType;
}

// Per-type card accent colours
const TYPE_COLORS: Record<
  string,
  { bg: string; circle: string; text: string; sub: string }
> = {
  NAME: {
    bg: "#008E79",
    circle: "rgba(255,255,255,0.15)",
    text: "#FFFFFF",
    sub: "rgba(255,255,255,0.75)",
  },


  NUMBER: {
    bg: "#2F5D62",
    circle: "rgba(255,255,255,0.14)",
    text: "#FFFFFF",
    sub: "rgba(255,255,255,0.75)",
  },

  LANGUAGE_SYSTEM: {
    bg: "#3A6B7C",
    circle: "rgba(255,255,255,0.15)",
    text: "#FFFFFF",
    sub: "rgba(255,255,255,0.75)",
  },


};

const FALLBACK = {
  bg: "#21443D",
  circle: "rgba(255,255,255,0.15)",
  text: "#FFFFFF",
  sub: "rgba(255,255,255,0.75)",
};

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  locked = false,
  onPress,
  lockIcon,
}) => {
  const { colors } = useTheme();
  const palette = TYPE_COLORS[lesson.type] ?? FALLBACK;

  // ── Original logic: first 2 chars of title ─────────────────────────────
  const chars = lesson.title?.substring(0, 2).toUpperCase().split("");

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={locked ? undefined : onPress}
      style={[
        styles.card,
        { backgroundColor: palette.bg },
        locked && styles.lockedCard,
      ]}
    >
      {/* ── Title + subtitle (top-left) ── */}
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>
          {lesson.type === "NAME" ? lesson.name ?? "—" : lesson.title ?? "—"}
        </Text>

      </View>

      {/* ── Decorative concentric circles + lesson number (bottom-right) ── */}
      <View style={styles.circleWrap} pointerEvents="none">
        {/* Outer ring */}
        <View style={[styles.circleOuter, { borderColor: palette.circle }]} />
        {/* Inner ring */}
        <View style={[styles.circleInner, { borderColor: palette.circle }]} />
        {/* Centre badge — lesson order number */}
        <View style={[styles.centreBadge, { backgroundColor: "rgba(255,255,255,0.28)" }]}>
          <Text style={[styles.centreNumber, { color: palette.text }]}>
            {lesson.lessonOrder ?? "—"}
          </Text>
        </View>
      </View>

      {/* ── Lock overlay (original logic) ── */}
      {locked && (
        <View style={styles.lockOverlay}>
          <View style={styles.lockBg} />
          <Image source={lockIcon} style={styles.lockIcon} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default LessonCard;

const CIRCLE_OUTER = 110;
const CIRCLE_INNER = 74;
const BADGE = 44;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1.15,
    borderRadius: 22,
    margin: 6,
    padding: 16,
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  lockedCard: {
    opacity: 0.6,
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  textBlock: {
    zIndex: 2,
    maxWidth: "65%",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 30,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 3,
    letterSpacing: 0.1,
  },

  // ── Concentric circles ────────────────────────────────────────────────────
  circleWrap: {
    position: "absolute",
    bottom: -CIRCLE_OUTER * 0.28,
    right:  -CIRCLE_OUTER * 0.28,
    width:  CIRCLE_OUTER,
    height: CIRCLE_OUTER,
    alignItems: "center",
    justifyContent: "center",
  },
  circleOuter: {
    position: "absolute",
    width:  CIRCLE_OUTER,
    height: CIRCLE_OUTER,
    borderRadius: CIRCLE_OUTER / 2,
    borderWidth: 1.5,
  },
  circleInner: {
    position: "absolute",
    width:  CIRCLE_INNER,
    height: CIRCLE_INNER,
    borderRadius: CIRCLE_INNER / 2,
    borderWidth: 1.5,
  },
  centreBadge: {
    width:  BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  centreNumber: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Lock (original) ───────────────────────────────────────────────────────
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  lockBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 22,
  },
  lockIcon: {
    width: 36,
    height: 36,
  },
});