import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
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

  // Separate state for the pull-to-refresh indicator so it can be
  // dismissed independently from the initial load spinner.
  const [refreshing, setRefreshing] = useState(false);

  const username = authService.getUsername() || "User";

  const fetchPosts = useCallback(async () => {
    try {
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts().finally(() => setLoading(false));
  }, [fetchPosts]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  // Icon button handler — reuses the same fetch, no spinner overlay needed
  const onPressRefresh = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MyHeader title={`Welcome back ${username}`} />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Flower Card */}
        <FlowerCard greeting={`Hello ${username}!`} />

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontFamily: typography.fontFamily.boldH },
            ]}
          >
            Recent Posts
          </Text>

          <View style={styles.headerActions}>
            {/* Refresh icon */}
            <TouchableOpacity
              onPress={onPressRefresh}
              style={styles.iconBtn}
              accessibilityLabel="Refresh posts"
              accessibilityRole="button"
            >
              <Ionicons name="refresh" size={22} color={colors.link} />
            </TouchableOpacity>

            {/* View All */}
            <TouchableOpacity
              style={styles.viewAll}
              onPress={() =>
                Linking.openURL("https://linguawebsite.onrender.com")
              }
            >
              <Text
                style={[
                  styles.viewAllText,
                  {
                    color: colors.link,
                    fontFamily: typography.fontFamily.bold,
                  },
                ]}
              >
                View All
              </Text>
              <Ionicons
                name="arrow-forward-circle"
                size={25}
                color={colors.link}
              />
            </TouchableOpacity>
          </View>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    padding: 4,
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