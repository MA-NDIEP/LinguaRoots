import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import { WordEntry } from "../types/types";
import { dictionaryService } from "@/services/dictionaryService";
import { Audio } from "expo-av";

type WordSection = {
  title: string;
  data: WordEntry[];
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const WordsScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();
  const [selected, setSelected] = useState<WordEntry | null>(null);
  const [sections, setSections] = useState<WordSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const listRef = useRef<SectionList>(null);

  useEffect(() => {
    loadWords();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const loadWords = async () => {
    try {
      const words = await dictionaryService.getAllWords();
      const grouped = words.reduce((acc: { [key: string]: WordEntry[] }, word) => {
        const firstLetter = word.word.charAt(0).toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(word);
        return acc;
      }, {});

      const sectionData = Object.keys(grouped)
        .sort()
        .map((letter) => ({
          title: letter,
          data: grouped[letter].sort((a, b) => a.word.localeCompare(b.word)),
        }));

      setSections(sectionData);
    } catch (error) {
      console.error("Failed to load words", error);
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

  const sectionTitles = sections.map((s) => s.title);

  const scrollToSection = (letter: string) => {
    const index = sectionTitles.indexOf(letter);
    if (index !== -1) {
      listRef.current?.scrollToLocation({
        sectionIndex: index,
        itemIndex: 0,
        animated: true,
      });
    }
  };

  const getAvatarColor = (word: string) => {
    const palette = [
      colors.primary,
      colors.secondary,
      "#81C784",
      colors.muted,
      colors.link,
    ];
    return palette[word.charCodeAt(0) % palette.length];
  };

  const renderItem = ({ item }: { item: WordEntry }) => {
    const avatarColor = getAvatarColor(item.word);
    return (
      <TouchableOpacity
        onPress={() => setSelected(item)}
        style={[
          styles.row,
          { borderBottomColor: colors.boxBorder, backgroundColor: colors.background },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text
            style={[
              styles.avatarText,
              { color: colors.white, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.sm },
            ]}
          >
            {item.word.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.rowText}>
          <Text
            style={[
              styles.word,
              { color: colors.text, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.sm },
            ]}
          >
            {item.word}
          </Text>
          <Text
            style={[
              styles.translation,
              { color: colors.text, fontFamily: typography.fontFamily.body, fontSize: 13, opacity: 0.6 },
            ]}
          >
            {item.translation}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: WordSection }) => (
    <View
      style={[
        styles.sectionHeader,
        { backgroundColor: colors.background, borderBottomColor: colors.boxBorder },
      ]}
    >
      <Text
        style={[
          styles.sectionHeaderText,
          { color: colors.text, fontFamily: typography.fontFamily.bold, fontSize: 13, opacity: 0.5 },
        ]}
      >
        {section.title}
      </Text>
      <View style={[styles.sectionLine, { backgroundColor: colors.boxBorder }]} />
    </View>
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
          Words
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} style={{ flex: 1 }} />
        ) : sections.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={colors.text} style={{ opacity: 0.3 }} />
            <Text
              style={[
                styles.emptyTitle,
                { color: colors.text, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.sm },
              ]}
            >
              No Words Yet
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: colors.text, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.xs, opacity: 0.5 },
              ]}
            >
              Words and their translations will appear here once added.
            </Text>
          </View>
        ) : (
          <>
            <SectionList
              ref={listRef}
              sections={sections}
              keyExtractor={(item) => item.wordId.toString()}
              renderItem={renderItem}
              // renderSectionHeader={renderSectionHeader}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              stickySectionHeadersEnabled
              onScrollToIndexFailed={() => {}}
            />

            <View style={styles.alphabetIndex}>
              {ALPHABET.map((letter) => {
                const hasSection = sectionTitles.includes(letter);
                return (
                  <TouchableOpacity
                    key={letter}
                    onPress={() => scrollToSection(letter)}
                    disabled={!hasSection}
                  >
                    <Text
                      style={[
                        styles.indexLetter,
                        {
                          color: hasSection ? colors.secondary : colors.text,
                          fontFamily: typography.fontFamily.bold,
                          opacity: hasSection ? 1 : 0.3,
                        },
                      ]}
                    >
                      {letter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>

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
              <View style={styles.modalTop}>
                <View
                  style={[
                    styles.modalAvatar,
                    { backgroundColor: selected ? getAvatarColor(selected.word) : colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalAvatarText,
                      { color: colors.white, fontFamily: typography.fontFamily.boldH, fontSize: 36 },
                    ]}
                  >
                    {selected?.word.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.modalWord,
                    { color: colors.primary, fontFamily: typography.fontFamily.boldH, fontSize: typography.fontSize.xxl },
                  ]}
                >
                  {selected?.word}
                </Text>
              </View>

              <ModalRow label="Translation" value={selected?.translation} colors={colors} typography={typography} />
              {selected?.example && (
                <ModalRow label="Example" value={selected.example} colors={colors} typography={typography} />
              )}
              {selected?.exampleTranslation && (
                <ModalRow label="Example (Translation)" value={selected.exampleTranslation} colors={colors} typography={typography} />
              )}

              <TouchableOpacity
                style={[
                  styles.audioPlayBtn,
                  {
                    backgroundColor: selected?.audioUrl ? colors.secondary : colors.boxBorder,
                    borderRadius: radius.sm,
                  },
                ]}
                onPress={() => playSound(selected?.audioUrl)}
                disabled={!selected?.audioUrl}
              >
                <Ionicons name="volume-high" size={20} color={colors.white} />
                <Text
                  style={[
                    styles.audioPlayText,
                    { color: colors.white, fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.xs },
                  ]}
                >
                  {selected?.audioUrl ? "Play Pronunciation" : "No Audio Available"}
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

export default WordsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  headerTitle: {},
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  sectionHeaderText: {},
  sectionLine: { flex: 1, height: StyleSheet.hairlineWidth },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: {},
  rowText: { flex: 1, gap: 2 },
  word: {},
  translation: {},
  alphabetIndex: {
    width: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    gap: 2,
  },
  indexLetter: { fontSize: 11 },
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
  modalTop: {
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  modalAvatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
  },
  modalAvatarText: {},
  modalWord: {},
  audioPlayBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 14, marginTop: 20, marginBottom: 10,
  },
  audioPlayText: {},
  closeBtn: {
    borderWidth: 1, paddingVertical: 12,
    alignItems: "center", marginTop: 20, marginBottom: 8,
  },
  closeBtnText: {},
});