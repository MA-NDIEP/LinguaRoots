// app/lessons.tsx
import React from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import LessonCard from "@/components/cards/lesson";
import MyHeader from "@/components/cards/header";
import { useTheme } from "@/theme/global";

const lockIcon = require("../../assets/images/lock.png");

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const LessonsScreen: React.FC = () => {
    const theme = useTheme();
  const { colors, typography } = theme;
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background}]}>
            <MyHeader title="My Lessons" />
      
      <View style={styles.grid}>
        {/* Lesson 1 unlocked */}
        <View style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
          <LessonCard
            lesson={1}
            locked={false}
            onPress={() => router.push("/lessons/page")}
            lockIcon={lockIcon}
          />
        </View>

        {/* Locked lessons */}
        {[2, 3, 4, 5, 6].map((num) => (
          <View key={num} style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
            <LessonCard lesson={num} locked={true} lockIcon={lockIcon} />
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