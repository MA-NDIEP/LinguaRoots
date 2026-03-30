import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Word } from "../types";
import { useTheme } from "@/theme/global";

type Props = {
  item: Word;
  onPress: () => void;
};

const WordItem: React.FC<Props> = ({ item, onPress }) => {
  const { colors, typography } = useTheme(); // get theme

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text
        style={{
          fontFamily: typography.fontFamily.body, // body font
          fontSize: typography.fontSize.md,       // theme font size
          color: colors.text,                     // dynamic text color
        }}
      >
        {item.word}
      </Text>
    </TouchableOpacity>
  );
};

export default WordItem;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
});