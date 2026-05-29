import React, { useRef, useState, useCallback } from "react";
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
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Audio } from "expo-av";

import { Post } from "@/app/types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const SPACING = (width - CARD_WIDTH) / 2;

type Props = {
  posts: Post[];
};

// ── Audio player state per card ───────────────────────────────
type AudioState = {
  sound: Audio.Sound | null;
  playing: boolean;
  progress: number; // 0–1
  duration: string;
  position: string;
};

function fmtTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Single card components ────────────────────────────────────

function VideoCard({ uri, title, content }: { uri: string; title: string; content: string }) {
  const videoRef = useRef<Video>(null);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);

  const toggle = async () => {
    if (!videoRef.current) return;
    if (playing) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setPlaying((p) => !p);
  };

  const progress =
    status?.isLoaded && status.durationMillis
      ? status.positionMillis / status.durationMillis
      : 0;

  const timeLabel =
    status?.isLoaded && status.durationMillis
      ? `${fmtTime(status.positionMillis)} / ${fmtTime(status.durationMillis)}`
      : "--:-- / --:--";

  return (
    <View style={styles.card}>
      <View style={styles.mediaWrap}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping={false}
          onPlaybackStatusUpdate={(s) => {
            setStatus(s);
            if (s.isLoaded && s.didJustFinish) setPlaying(false);
          }}
        />
        {/* Overlay play/pause */}
        <TouchableOpacity style={styles.videoOverlay} onPress={toggle} activeOpacity={0.8}>
          <View style={styles.playCircle}>
            <Ionicons name={playing ? "pause" : "play"} size={28} color="#fff" />
          </View>
        </TouchableOpacity>
        {/* Progress bar */}
        <View style={styles.videoBar}>
          <View style={[styles.videoFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.videoTime}>{timeLabel}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{content}</Text>
      </View>
    </View>
  );
}

function AudioCard({
  audioUri,
  coverUri,
  title,
  content,
}: {
  audioUri: string;
  coverUri?: string;
  title: string;
  content: string;
}) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    sound: null,
    playing: false,
    progress: 0,
    duration: "--:--",
    position: "0:00",
  });

  const toggle = useCallback(async () => {
    try {
      if (!soundRef.current) {
        // First play — create the sound
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setAudioState((s) => ({ ...s, playing: true }));

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          const dur = status.durationMillis ?? 0;
          setAudioState((s) => ({
            ...s,
            playing: !status.didJustFinish && status.isPlaying,
            progress: dur > 0 ? status.positionMillis / dur : 0,
            duration: dur > 0 ? fmtTime(dur) : "--:--",
            position: fmtTime(status.positionMillis),
          }));
          if (status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            soundRef.current = null;
          }
        });
      } else if (audioState.playing) {
        await soundRef.current.pauseAsync();
        setAudioState((s) => ({ ...s, playing: false }));
      } else {
        await soundRef.current.playAsync();
        setAudioState((s) => ({ ...s, playing: true }));
      }
    } catch (err) {
      console.error("Audio error:", err);
    }
  }, [audioUri, audioState.playing]);

  return (
    <View style={styles.card}>
      {/* Cover art */}
      <View style={styles.audioCoverWrap}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.audioCover} />
        ) : (
          <View style={styles.audioCoverFallback}>
            <Ionicons name="musical-notes" size={48} color="rgba(255,255,255,0.3)" />
          </View>
        )}
        {/* Play / pause button centred over cover */}
        <TouchableOpacity style={styles.videoOverlay} onPress={toggle} activeOpacity={0.8}>
          <View style={styles.playCircle}>
            <Ionicons name={audioState.playing ? "pause" : "play"} size={28} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Progress + time */}
      <View style={styles.audioControls}>
        <View style={styles.audioBarBg}>
          <View style={[styles.audioBarFill, { width: `${audioState.progress * 100}%` }]} />
        </View>
        <View style={styles.audioTimes}>
          <Text style={styles.audioTime}>{audioState.position}</Text>
          <Text style={styles.audioTime}>{audioState.duration}</Text>
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{content}</Text>
      </View>
    </View>
  );
}

function ImageCard({
  imageUri,
  title,
  content,
}: {
  imageUri?: string;
  title: string;
  content: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => Linking.openURL("https://linguawebsite.onrender.com")}
    >
      <View style={styles.card}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require("../../assets/images/post.png")
          }
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>{content}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main carousel ─────────────────────────────────────────────

export default function PostCarousel({ posts }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= posts.length) return;
    flatListRef.current?.scrollToOffset({
      offset: index * CARD_WIDTH,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const renderItem = ({ item, index }: { item: Post; index: number }) => {
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

    const type = (item.type ?? "IMAGE").toUpperCase();

    let cardContent: React.ReactNode;

    if (type === "VIDEO" && item.video) {
      cardContent = (
        <VideoCard uri={item.video} title={item.title} content={item.content} />
      );
    } else if (type === "AUDIO") {
      // The Post type stores audio URL — use item.video as audio fallback
      // if your backend puts it there, or cast via (item as any).audio
      const audioUri = (item as any).audio ?? item.video ?? "";
      cardContent = (
        <AudioCard
          audioUri={audioUri}
          coverUri={item.image}
          title={item.title}
          content={item.content}
        />
      );
    } else {
      cardContent = (
        <ImageCard
          imageUri={item.image}
          title={item.title}
          content={item.content}
        />
      );
    }

    return (
      <Animated.View
        style={[styles.cardWrapper, { transform: [{ scale }] }]}
      >
        {cardContent}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Left button */}
      <TouchableOpacity
        style={[styles.navButton, { left: 10 }]}
        onPress={() => scrollToIndex(currentIndex - 1)}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Carousel */}
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
        renderItem={renderItem}
      />

      {/* Right button */}
      <TouchableOpacity
        style={[styles.navButton, { right: 10 }]}
        onPress={() => scrollToIndex(currentIndex + 1)}
      >
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {posts.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginTop: 20,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: 10,
  },
  card: {
    width: "100%",
    height: 350,
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  // Image
  image: {
    width: "100%",
    height: 270,
  },

  // Video
  mediaWrap: {
    width: "100%",
    height: 270,
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  videoFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  videoTime: {
    position: "absolute",
    bottom: 6,
    right: 10,
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },

  // Audio
  audioCoverWrap: {
    width: "100%",
    height: 220,
    position: "relative",
    backgroundColor: "#111",
  },
  audioCover: {
    width: "100%",
    height: "100%",
  },
  audioCoverFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  audioControls: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  audioBarBg: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  audioBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  audioTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  audioTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },

  // Shared text
  textContainer: {
    padding: 14,
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  description: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 4,
  },

  // Nav
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

  // Pagination
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