"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Theme, themes, DEFAULT_THEME } from "@/lib/themes";

type ThemeContextType = {
  theme: Theme;
  setThemeId: (id: string) => void;
  availableThemes: string[];
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Get the current theme object
  const theme = themes[themeId] || themes[DEFAULT_THEME];
  const availableThemes = Object.keys(themes);

  // Apply theme to the document
  useEffect(() => {
    if (!mounted) {
      setMounted(true);

      // Load saved theme from localStorage (only in browser environment)
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem("showreel-theme");
        if (savedTheme && themes[savedTheme]) {
          setThemeId(savedTheme);
        }
      }
      return;
    }

    // Save current theme to localStorage (only in browser environment)
    if (typeof window !== 'undefined') {
      localStorage.setItem("showreel-theme", themeId);
    }

    // Apply theme class to document
    if (theme.isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply CSS variables
    const root = document.documentElement;

    // Apply color variables
    Object.entries(theme.colors).forEach(([colorKey, colorObj]) => {
      Object.entries(colorObj).forEach(([shade, value]) => {
        root.style.setProperty(`--color-${colorKey}-${shade}`, value);
      });
    });

    // Apply other theme variables
    root.style.setProperty("--border-radius", theme.borderRadius);
    root.style.setProperty("--font-heading", theme.fonts.heading);
    root.style.setProperty("--font-body", theme.fonts.body);
    root.style.setProperty("--font-mono", theme.fonts.mono);
  }, [themeId, theme, mounted]);

  // Don't render anything until mounted on client to prevent hydration mismatch
  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setThemeId,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
