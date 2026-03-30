import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Linking } from "react-native";
import React from "react";
import FlowerCard from "@/components/cards/flowercard";
import { useTheme } from "@/theme/global";
import MyHeader from "@/components/cards/header";
import PostCarousel from "@/components/cards/carousel";
import { Ionicons } from "@expo/vector-icons";

const Index = () => {
  const theme = useTheme();
  const { colors, typography } = theme;

  const posts = [
    {
      id: "1",
      title: "Alphabet Basics",
      description: "Learn your ABCs step by step",
    },
    {
      id: "2",
      title: "Numbers",
      description: "Practice counting from 1–100",
    },
    {
      id: "3",
      title: "Fun Quiz",
      description: "Test what you've learned 🎯",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MyHeader title="Welcome back Astera" />

      <ScrollView>
        
        {/* Flower Card */}
        <FlowerCard greeting="Hello Jean!" />

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily:typography.fontFamily.boldH }]}>
            Recent Posts
          </Text>

          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => Linking.openURL("https://www.google.com")}
          >
            
            <Text style={[styles.viewAllText, { color: colors.link, fontFamily: typography.fontFamily.bold }]}>
              View All
            </Text>
            <Ionicons name="arrow-forward-circle" size={25} color={colors.link} />
          </TouchableOpacity>
        </View>

        {/* Carousel */}
        <PostCarousel posts={posts} />

      </ScrollView>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },



  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,

  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  viewAllText: {
    fontSize: 15,
    fontWeight: "600",
  },
});