import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { AlphabetEntry } from "../types/types";
import { dictionaryService } from "@/services/dictionaryService";
import { Audio } from "expo-av";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const AlphabetScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();
  const [selected, setSelected] = useState<AlphabetEntry | null>(null);
  const [data, setData] = useState<AlphabetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadAlphabets();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const loadAlphabets = async () => {
    try {
      const alphabets = await dictionaryService.getAllAlphabets();
      setData(alphabets);
    } catch (error) {
      console.error("Failed to load alphabets", error);
    } finally {
      setLoading(false);
    }
  };

  const playSound = async (uri?: string) => {
    if (!uri) return;
    try {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound", error);
    }
  };

  const renderItem = ({ item }: { item: AlphabetEntry }) => (
    <TouchableOpacity
      onPress={() => setSelected(item)}
      style={[
        styles.card,
        {
          width: CARD_WIDTH,
          backgroundColor: colors.card,
          borderColor: colors.boxBorder,
          borderRadius: radius.sm,
        },
      ]}
    >
      <View style={[styles.characterBox, { backgroundColor: colors.secondary + "15" }]}>
        <Text
          style={[
            styles.character,
            { color: colors.secondary, fontFamily: typography.fontFamily.boldH },
          ]}
        >
          {item.character}
        </Text>
      </View>

      <Text
        style={[
          styles.cardTitle,
          { color: colors.text, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xs },
        ]}
      >
        {item.englishEquivalent}
      </Text>

      <Text
        style={[
          styles.cardSub,
          { color: colors.text, fontFamily: typography.fontFamily.body, fontSize: 12 },
        ]}
      >
        e.g. {item.nativeExample}
      </Text>

      <TouchableOpacity
        style={[
          styles.audioPill,
          { backgroundColor: item.nativePronunciation ? colors.secondary + "20" : colors.boxBorder },
        ]}
        onPress={(e) => {
          e.stopPropagation();
          playSound(item.nativePronunciation);
        }}
        disabled={!item.nativePronunciation}
      >
        <Ionicons
          name="volume-high"
          size={12}
          color={item.nativePronunciation ? colors.secondary : colors.text}
        />
        <Text
          style={[
            styles.audioPillText,
            {
              color: item.nativePronunciation ? colors.secondary : colors.text,
              fontFamily: typography.fontFamily.body,
              fontSize: 11,
            },
          ]}
        >
          {item.nativePronunciation ? "Play" : "No Audio"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/glossary")}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.boxBorder }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text, fontFamily: typography.fontFamily.boldH, fontSize: typography.fontSize.lg },
          ]}
        >
          Alphabet
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.secondary} style={{ flex: 1 }} />
      ) : data.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="text-outline" size={48} color={colors.text} style={{ opacity: 0.3 }} />
          <Text
            style={[
              styles.emptyTitle,
              { color: colors.text, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.sm },
            ]}
          >
            No Alphabet Entries Yet
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.text, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.xs, opacity: 0.5 },
            ]}
          >
            Alphabet characters will appear here once added.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          <Pressable
            style={[styles.modal, { backgroundColor: colors.background, borderRadius: radius.sm }]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={[
                  styles.modalCharacterBox,
                  { backgroundColor: colors.card, borderColor: colors.boxBorder },
                ]}
              >
                <Text
                  style={[
                    styles.modalCharacter,
                    { color: colors.text, fontFamily: typography.fontFamily.boldH },
                  ]}
                >
                  {selected?.character}
                </Text>
              </View>

              <ModalRow label="English" value={selected?.englishEquivalent} colors={colors} typography={typography} />
              <ModalRow label="Native Example" value={selected?.nativeExample} colors={colors} typography={typography} />
              <ModalRow label="English Example" value={selected?.englishExample} colors={colors} typography={typography} />

              <TouchableOpacity
                style={[
                  styles.audioPlayBtn,
                  {
                    backgroundColor: selected?.nativePronunciation ? colors.secondary : colors.boxBorder,
                    borderRadius: radius.sm,
                  },
                ]}
                onPress={() => playSound(selected?.nativePronunciation)}
                disabled={!selected?.nativePronunciation}
              >
                <Ionicons name="volume-high" size={20} color={colors.white} />
                <Text
                  style={[
                    styles.audioPlayText,
                    { color: colors.white, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xs },
                  ]}
                >
                  {selected?.nativePronunciation ? "Play Pronunciation" : "No Audio Available"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelected(null)}
                style={[styles.closeBtn, { borderColor: colors.boxBorder, borderRadius: radius.sm }]}
              >
                <Text
                  style={[
                    styles.closeBtnText,
                    { color: colors.text, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xs },
                  ]}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const ModalRow = ({
  label,
  value,
  colors,
  typography,
}: {
  label: string;
  value?: string;
  colors: any;
  typography: any;
}) => (
  <View style={modalRowStyles.row}>
    <Text style={[modalRowStyles.label, { color: colors.secondary, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xs }]}>
      {label}
    </Text>
    <Text style={[modalRowStyles.value, { color: colors.text, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.xs }]}>
      {value}
    </Text>
  </View>
);

const modalRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  label: { flex: 1 },
  value: { flex: 2, textAlign: "right" },
});

export default AlphabetScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  headerTitle: {},
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  row: { justifyContent: "space-between" },
  card: {
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  characterBox: {
    width: "100%",
    height: 90,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  character: { fontSize: 42 },
  cardTitle: { textAlign: "center" },
  cardSub: { textAlign: "center", opacity: 0.7 },
  audioPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  audioPillText: {},
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: { textAlign: "center" },
  emptySubtitle: { textAlign: "center", lineHeight: 20 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: { padding: 24, maxHeight: "85%" },
  modalCharacterBox: {
    height: 140, borderRadius: 16, borderWidth: 1,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  modalCharacter: { fontSize: 80 },
  audioPlayBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 14, marginTop: 20, marginBottom: 10,
  },
  audioPlayText: {},
  closeBtn: {
    borderWidth: 1, paddingVertical: 12,
    alignItems: "center", marginBottom: 8,
  },
  closeBtnText: {},
});