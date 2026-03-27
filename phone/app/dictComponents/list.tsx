import React, { useState, useMemo } from "react";
import { View, Text, SectionList, TextInput, StyleSheet } from "react-native";
import { Section, Word } from "../types";
import WordItem from "./wordItem";
import MyHeader from "@/components/cards/header";
import { useTheme } from "@/theme/global";

type Props = {
  sections: Section[];
  onSelectWord: (word: Word) => void;
};

const DictionaryList: React.FC<Props> = ({ sections, onSelectWord }) => {
  const theme = useTheme();
  const { colors, typography } = theme;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections;
    return sections
      .map(section => ({
        ...section,
        data: section.data.filter(word =>
          word.word.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter(section => section.data.length > 0);
  }, [searchQuery, sections]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MyHeader title="My Dictionary" />

      <TextInput
        placeholder="Search"
        placeholderTextColor={colors.text}
        style={[
          styles.search,
          {
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.md,
            color: colors.text,
            backgroundColor: colors.card,
          },
        ]}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <SectionList
        sections={filteredSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WordItem item={item} onPress={() => onSelectWord(item)} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            style={[
              styles.section,
              {
                fontFamily: typography.fontFamily.boldH,
                fontSize: typography.fontSize.md,
                fontWeight: "700",
                color: colors.text,
              },
            ]}
          >
            {title}
          </Text>
        )}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default DictionaryList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  search: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  section: {
    marginTop: 10,
  },
});