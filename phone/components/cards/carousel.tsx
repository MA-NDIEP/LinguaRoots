import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Post } from "@/app/types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const SPACING = (width - CARD_WIDTH) / 2;

type Props = {
  posts: Post[];
};

export default function PostCarousel({ posts }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= posts.length) return;

    flatListRef.current?.scrollToOffset({
      offset: index * CARD_WIDTH,
      animated: true,
    });

    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* LEFT BUTTON */}
      <TouchableOpacity
        style={[styles.navButton, { left: 10 }]}
        onPress={() => scrollToIndex(currentIndex - 1)}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* CAROUSEL */}
      <Animated.FlatList
        ref={flatListRef}
        data={posts}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SPACING }}
        keyExtractor={(item) => item.postId.toString()}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / CARD_WIDTH
          );
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * CARD_WIDTH,
            index * CARD_WIDTH,
            (index + 1) * CARD_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
          });

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => Linking.openURL("https://www.google.com")}
            >
              <Animated.View
                style={[styles.card, { transform: [{ scale }] }]}
              >
                {/* IMAGE/VIDEO */}
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                  />
                ) : (
                  <Image
                    source={require("../../assets/images/post.png")}
                    style={styles.image}
                  />
                )}

                {/* TEXT */}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description} numberOfLines={2}>
                    {item.content}
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        }}
      />

      {/* RIGHT BUTTON */}
      <TouchableOpacity
        style={[styles.navButton, { right: 10 }]}
        onPress={() => scrollToIndex(currentIndex + 1)}
      >
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </TouchableOpacity>

      {/* PAGINATION DOTS */}
      <View style={styles.pagination}>
        {posts.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginTop: 20,
  },

  card: {
    width: CARD_WIDTH,
    height: 260, // 🔥 taller card
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    marginHorizontal: 10,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  image: {
    width: "100%",
    height: 140,
  },

  textContainer: {
    padding: 15,
    justifyContent: "space-between",
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  description: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 6,
  },

  navButton: {
    position: "absolute",
    top: "40%",
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#fff",
    width: 16,
  },
});