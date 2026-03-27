// app/lessons/lesson1.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

const Lesson1Screen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.text}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          ullamcorper, sapien at dapibus fermentum, leo elit interdum nisi, ut
          vehicula lacus purus eget nunc. Curabitur mollis, arcu vitae pretium
          finibus, justo lectus pharetra purus, nec dictum nisl magna non
          justo. Morbi euismod, tortor vel convallis dapibus, mauris ligula
          volutpat libero, ac dictum elit ipsum eget massa. Lorem ipsum dolor
          sit amet, consectetur adipiscing elit. Sed ullamcorper, sapien at
          dapibus fermentum, leo elit interdum nisi, ut vehicula lacus purus
          eget nunc. Curabitur mollis, arcu vitae pretium finibus, justo lectus
          pharetra purus, nec dictum nisl magna non justo. Morbi euismod,
          tortor vel convallis dapibus, mauris ligula volutpat libero, ac dictum
          elit ipsum eget massa.
        </Text>

        <Text style={styles.text}>
          Pellentesque habitant morbi tristique senectus et netus et malesuada
          fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus
          orci luctus et ultrices posuere cubilia curae; Integer eget tincidunt
          risus. Sed id eros vitae risus efficitur cursus. Sed id eros vitae
          risus efficitur cursus. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Sed ullamcorper, sapien at dapibus fermentum, leo
          elit interdum nisi, ut vehicula lacus purus eget nunc.
        </Text>

        {/* Next Lesson Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/lessons/page")}
        >
          <Text style={styles.buttonText}>Next Lesson</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Lesson1Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F5F3",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: "#2E4A45",
  },
  button: {
    backgroundColor: "#5F7F77",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  buttonText: {
    color: "#E6F0EC",
    fontWeight: "600",
    fontSize: 16,
  },
});