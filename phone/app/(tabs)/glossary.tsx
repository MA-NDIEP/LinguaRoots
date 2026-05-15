import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/global";
import MyHeader from "@/components/cards/header";

const SECTIONS = [
  {
    label: "Alphabet",
    description: "Characters, pronunciation & examples",
    icon: "text" as const,
    route: "/dictComponents/alphabet",
  },
  {
    label: "Words",
    description: "Vocabulary with translations & usage",
    icon: "book" as const,
    route: "/dictComponents/words",
  },
];

const DictionaryHome: React.FC = () => {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MyHeader title="Dictionary" />

      <View style={styles.cards}>
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.label}
            onPress={() => router.push(section.route as any)}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.boxBorder,
                borderRadius: radius.md,
              },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.secondary + "20" },
              ]}
            >
              <Ionicons name={section.icon} size={28} color={colors.secondary} />
            </View>

            <View style={styles.cardText}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.bold,
                    fontSize: typography.fontSize.md,
                  },
                ]}
              >
                {section.label}
              </Text>
              <Text
                style={[
                  styles.cardDesc,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.xs,
                  },
                ]}
              >
                {section.description}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default DictionaryHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  cards: {
    gap: 16,
    marginTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {},
  cardDesc: {},
});