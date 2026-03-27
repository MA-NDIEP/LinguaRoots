import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import DictionaryList from "../dictComponents/list";
import WordDetailsModal from "../dictComponents/wordDetail";
import { Section, Word } from "../types";
import { useTheme } from "@/theme/global";

// Sample dictionary A → F
const DATA: Section[] = [
  {
    title: "A",
    data: [
      { id: "1", word: "Ant", description: "A small insect." },
      { id: "2", word: "Apple", description: "A fruit." },
      { id: "3", word: "Arrow", description: "A pointed weapon shot from a bow." },
      { id: "4", word: "Axe", description: "A tool used for chopping wood." },
    ],
  },
  {
    title: "B",
    data: [
      { id: "5", word: "Ball", description: "A round object used in games and sports." },
      { id: "6", word: "Bat", description: "A flying mammal or a sports tool used in cricket/baseball." },
      { id: "7", word: "Bread", description: "A common baked food made from flour and water." },
      { id: "8", word: "Book", description: "A collection of pages with written content." },
    ],
  },
  {
    title: "C",
    data: [
      { id: "9", word: "Cat", description: "A small domesticated feline animal." },
      { id: "10", word: "Car", description: "A vehicle used for transportation." },
      { id: "11", word: "Cup", description: "A container used for drinking liquids." },
      { id: "12", word: "Camera", description: "A device used to take photographs." },
    ],
  },
  {
    title: "D",
    data: [
      { id: "13", word: "Dog", description: "A domesticated canine animal." },
      { id: "14", word: "Door", description: "A movable barrier used to open and close an entrance." },
      { id: "15", word: "Desk", description: "A piece of furniture used for work or study." },
      { id: "16", word: "Drum", description: "A musical instrument that is struck to produce sound." },
    ],
  },
  {
    title: "E",
    data: [
      { id: "17", word: "Elephant", description: "A large mammal with a trunk." },
      { id: "18", word: "Egg", description: "An oval object produced by birds, used for reproduction or food." },
      { id: "19", word: "Eagle", description: "A large bird of prey with sharp talons." },
      { id: "20", word: "Envelope", description: "A paper cover used to enclose letters." },
    ],
  },
  {
    title: "F",
    data: [
      { id: "21", word: "Fish", description: "A cold-blooded animal living in water." },
      { id: "22", word: "Flower", description: "The colorful part of a plant that blooms." },
      { id: "23", word: "Fan", description: "A device for creating airflow or cooling." },
      { id: "24", word: "Frog", description: "An amphibian with smooth skin and long legs for jumping." },
    ],
  },
];

const DictionaryScreen: React.FC = () => {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed header + search */}
      <DictionaryList sections={DATA} onSelectWord={setSelectedWord} />

      {/* Word details modal */}
      <WordDetailsModal
        word={selectedWord}
        visible={!!selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </View>
  );
};

export default DictionaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});