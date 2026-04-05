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

interface LessonCardProps {
  lesson: Lesson;
  locked?: boolean;
  onPress?: () => void;
  lockIcon: ImageSourcePropType;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  locked = false,
  onPress,
  lockIcon,
}) => {
  const chars = lesson.title.substring(0, 2).toUpperCase().split("");

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={locked ? undefined : onPress}
      style={[styles.card, locked && styles.lockedCard]}
    >
      {/* Lesson title */}
      <Text style={styles.lessonText}>{lesson.title.toUpperCase()}</Text>

      {/* Background letters */}
      <View style={styles.lettersContainer}>
        {chars.map((char, index) => (
          <Text
            key={index}
            style={[
              styles.letter,
              { left: `${index * 55}%` }, 
            ]}
          >
            {char}
          </Text>
        ))}
      </View>

      {/* Lock overlay */}
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1.2,
    backgroundColor: "#5F7F77",
    borderRadius: 20,
    margin: 8,
    padding: 12,
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  lockedCard: {
    opacity: 0.7,
  },
  lessonText: {
    color: "#E6F0EC",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    zIndex: 2,
  },
  lettersContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    height: "70%",
    justifyContent: "center",
    zIndex: 0,
  },
  letter: {
    position: "absolute",
    fontSize: 60,
    fontWeight: "bold",
    color: "#2E4A45",
    opacity: 0.15,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  lockBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },
  lockIcon: {
    width: 36,
    height: 36,
  },
});