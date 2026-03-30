import React, { createContext, useContext, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";

// --------- LIGHT & DARK THEMES ----------
const lightTheme = {
  background: "#fbfff1",
  text: "#000000",
  white: "#ffffff",
  primary: "#21443D",
  secondary: "#779D28",
  link: "rgba(16, 126, 194, 0.5)",
  card: "#fff", 
  boxBorder: "rgba(0, 0, 0, 0.2)",
  muted: "rgba(253, 42, 155, 0.5)",
  red: "#F15249",
  yellow: "#FDCB50",
    black: "#000000",

};

const darkTheme = {
  background: "#353535",
  text: "#FFFFFF",
  white: "#ffffff",
  primary: "#21443D",
  secondary: "#779D28",
  card: "#3e3e3eff",
  boxBorder: "rgba(0, 0, 0, 0.2)",
  muted: "rgba(253, 42, 155, 0.5)",
  red: "#F15249",
  yellow: "#FDCB50",
 black: "#000000",
   link: "#fff",


};

// --------- BASE TYPOGRAPHY ETC ----------
const base = {
  typography: {
    fontFamily: {
      boldH: "CinzelBold",
      heading: "CinzelRegular",
      buttonText: "CorRegular",
      body: "CorRegular",
      bold: "CorBold",
    },
    fontSize: {
      xs: 14,
      sm: 16,
      md: 20,
      lg: 22,
      xl: 24,
      xxl: 26,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 10,
    md: 30,
    lg: 50,
  },
};

// --------- CONTEXT TYPE ----------
type ThemeContextType = {
  themeMode: "light" | "dark";
  setThemeMode: (mode: "light" | "dark") => void;
};

// --------- CREATE CONTEXT ----------
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --------- PROVIDER ----------
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const system = useColorScheme();
  const [themeMode, setThemeMode] = useState<"light" | "dark">(
    system === "dark" ? "dark" : "light"
  );

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }

  const system = useColorScheme(); // get the system preference
  const colors = ctx.themeMode === "dark" ? darkTheme : lightTheme;

  return {
    colors,
    ...base,
    themeMode: ctx.themeMode,
    setThemeMode: ctx.setThemeMode,
    colorScheme: system,
  };
}

