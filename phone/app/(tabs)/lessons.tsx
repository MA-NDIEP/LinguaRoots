// app/lessons.tsx
import React from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import { router } from "expo-router";
import LessonCard from "@/components/cards/lesson";

const lockIcon = require("../../assets/images/lock.png"); // your lock.png

const LessonsScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.grid}>
        {/* Lesson 1 unlocked */}
        <LessonCard
          lesson={1}
          locked={false}
          onPress={() => router.push("/lessons/page")}
          lockIcon={lockIcon}
        />

        {/* Locked lessons */}
        <LessonCard lesson={2} locked={true} lockIcon={lockIcon} />
        <LessonCard lesson={3} locked={true} lockIcon={lockIcon} />
        <LessonCard lesson={4} locked={true} lockIcon={lockIcon} />
        <LessonCard lesson={5} locked={true} lockIcon={lockIcon} />
        <LessonCard lesson={6} locked={true} lockIcon={lockIcon} />
      </View>
    </ScrollView>
  );
};

export default LessonsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F2F5F3",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});