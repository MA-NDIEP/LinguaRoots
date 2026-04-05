import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Linking } from "react-native";
import React, { useEffect, useState } from "react";
import FlowerCard from "@/components/cards/flowercard";
import { useTheme } from "@/theme/global";
import MyHeader from "@/components/cards/header";
import PostCarousel from "@/components/cards/carousel";
import { Ionicons } from "@expo/vector-icons";
import { postService } from "@/services/postService";
import { authService } from "@/services/authService";
import { Post } from "@/app/types";

const Index = () => {
  const theme = useTheme();
  const { colors, typography } = theme;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const username = authService.getUsername() || "User";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postService.getAllPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MyHeader title={`Welcome back ${username}`} />

      <ScrollView>
        
        {/* Flower Card */}
        <FlowerCard greeting={`Hello ${username}!`} />

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