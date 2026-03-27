// components/cards/FlowerCard.tsx
import { useTheme } from "@/theme/global";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../button/button";
import { router } from "expo-router";
import React from "react";

interface FlowerCardProps {
  greeting: string;
  subtitle?: string;
}

export default function FlowerCard({ greeting, subtitle = "Ready to dive back into your lessons?" }: FlowerCardProps) {
  const theme = useTheme();
  const { colors, typography } = theme;

  return (
    <ImageBackground
      source={require("../../assets/images/card.png")}
      style={styles.background}
      imageStyle={{ borderRadius: 20 }}
    >
      

      <View style={styles.container}>
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={[styles.subtitle, { fontFamily: typography.fontFamily.bold, color: colors.white, }]}>
            {subtitle}
          </Text>
          <Button
              title="Start"
              onPress={() => router.push("/(tabs)/lessons")}
              style={{paddingVertical: 3,
          paddingHorizontal: 18, }}
            />
         
        </View>

        {/* Book Stack Image */}
        <Image 
          source={require('../../assets/images/bam.png')} 
          style={styles.bookImage}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: 380,
    height: 210,
    
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  container: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: 25,
    paddingHorizontal: 22,
    paddingLeft:50,
    justifyContent: 'space-between',

  },
    hero: {
    width:  350,
    height: 300,
    marginBottom: 30,
    borderRadius: 20,
  },
  textContainer: {
    flex: 1,
    maxWidth: '54%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    paddingLeft: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
    color: '#fff',
    lineHeight: 30,
  },
  subtitle: {
    fontSize:22,
    color: '#fff',
    paddingBottom:10,
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  bookImage: {
    width: 150,
    height: 150,
    position: 'absolute',
    right: 5,
    top: 6,
  },

});
