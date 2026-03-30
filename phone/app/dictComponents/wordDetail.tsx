import React from "react";
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from "react-native";
import { Word } from "../types";
import { useTheme } from "@/theme/global";

type Props = {
  word: Word | null;
  visible: boolean;
  onClose: () => void;
};

const WordDetailsModal: React.FC<Props> = ({ word, visible, onClose }) => {
  const theme = useTheme();
  const { colors, typography } = theme;
  const bodyFont = typography.fontFamily.body;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: colors.background }]} onPress={(e) => e.stopPropagation()}>
          <ScrollView>
            <Text style={[styles.title, { fontFamily: typography.fontFamily.boldH, fontSize: typography.fontSize.lg, color: colors.text }]}>
              {word?.word}
            </Text>

            <Text style={[styles.section, { fontFamily: bodyFont, color: colors.text }]}>
              Definition
            </Text>
            <Text style={[styles.text, { fontFamily: bodyFont, color: colors.text }]}>
              {word?.description}
            </Text>

            <Text style={[styles.section, { fontFamily: bodyFont, color: colors.text }]}>
              Example
            </Text>
            <Text style={[styles.text, { fontFamily: bodyFont, color: colors.text }]}>
              Example sentence using {word?.word}.
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default WordDetailsModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  section: {
    marginTop: 12,
    fontWeight: "600",
    fontSize: 16,
  },
  text: {
    fontSize: 15,
    marginTop: 4,
  },
});