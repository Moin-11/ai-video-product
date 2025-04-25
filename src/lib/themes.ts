// Theme definitions for ShowReel app

export type ThemeColor = {
  main: string;
  light: string;
  dark: string;
  contrast: string;
};

export type ThemeColors = {
  primary: ThemeColor;
  secondary: ThemeColor;
  accent: ThemeColor;
  neutral: ThemeColor;
  success: ThemeColor;
  warning: ThemeColor;
  error: ThemeColor;
};

export type ThemeFonts = {
  heading: string;
  body: string;
  mono: string;
};

export type Theme = {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  borderRadius: string;
  isDark: boolean;
};

// Default fonts
const defaultFonts: ThemeFonts = {
  heading: "var(--font-geist-sans)",
  body: "var(--font-geist-sans)",
  mono: "var(--font-geist-mono)",
};

// Theme definitions
export const themes: Record<string, Theme> = {
  // Modern and clean theme with blue accent
  default: {
    id: "default",
    name: "Default",
    isDark: false,
    borderRadius: "0.5rem",
    fonts: defaultFonts,
    colors: {
      primary: {
        main: "#3b82f6", // Blue
        light: "#93c5fd",
        dark: "#1d4ed8",
        contrast: "#ffffff",
      },
      secondary: {
        main: "#6366f1", // Indigo
        light: "#a5b4fc",
        dark: "#4338ca",
        contrast: "#ffffff",
      },
      accent: {
        main: "#8b5cf6", // Violet
        light: "#c4b5fd",
        dark: "#6d28d9",
        contrast: "#ffffff",
      },
      neutral: {
        main: "#6b7280", // Gray
        light: "#f3f4f6",
        dark: "#1f2937",
        contrast: "#ffffff",
      },
      success: {
        main: "#10b981", // Emerald
        light: "#a7f3d0",
        dark: "#065f46",
        contrast: "#ffffff",
      },
      warning: {
        main: "#f59e0b", // Amber
        light: "#fcd34d",
        dark: "#b45309",
        contrast: "#ffffff",
      },
      error: {
        main: "#ef4444", // Red
        light: "#fca5a5",
        dark: "#b91c1c",
        contrast: "#ffffff",
      },
    },
  },
  
  // Dark theme with purple accent
  dark: {
    id: "dark",
    name: "Dark Mode",
    isDark: true,
    borderRadius: "0.5rem",
    fonts: defaultFonts,
    colors: {
      primary: {
        main: "#8b5cf6", // Violet
        light: "#c4b5fd",
        dark: "#6d28d9",
        contrast: "#ffffff",
      },
      secondary: {
        main: "#6366f1", // Indigo
        light: "#a5b4fc",
        dark: "#4338ca",
        contrast: "#ffffff",
      },
      accent: {
        main: "#ec4899", // Pink
        light: "#f9a8d4",
        dark: "#be185d",
        contrast: "#ffffff",
      },
      neutral: {
        main: "#9ca3af", // Gray
        light: "#374151",
        dark: "#111827",
        contrast: "#ffffff",
      },
      success: {
        main: "#10b981", // Emerald
        light: "#a7f3d0",
        dark: "#065f46",
        contrast: "#ffffff",
      },
      warning: {
        main: "#f59e0b", // Amber
        light: "#fcd34d",
        dark: "#b45309",
        contrast: "#ffffff",
      },
      error: {
        main: "#ef4444", // Red
        light: "#fca5a5",
        dark: "#b91c1c",
        contrast: "#ffffff",
      },
    },
  },
  
  // Luxurious theme with gold accent
  luxury: {
    id: "luxury",
    name: "Luxury",
    isDark: false,
    borderRadius: "0.5rem",
    fonts: defaultFonts,
    colors: {
      primary: {
        main: "#854d0e", // Amber
        light: "#d97706",
        dark: "#78350f",
        contrast: "#ffffff",
      },
      secondary: {
        main: "#713f12", // Yellow
        light: "#ca8a04",
        dark: "#422006",
        contrast: "#ffffff",
      },
      accent: {
        main: "#eab308", // Gold
        light: "#facc15",
        dark: "#a16207",
        contrast: "#27272a",
      },
      neutral: {
        main: "#57534e", // Stone
        light: "#f5f5f4",
        dark: "#292524",
        contrast: "#ffffff",
      },
      success: {
        main: "#10b981", // Emerald
        light: "#a7f3d0",
        dark: "#065f46",
        contrast: "#ffffff",
      },
      warning: {
        main: "#f59e0b", // Amber
        light: "#fcd34d",
        dark: "#b45309",
        contrast: "#ffffff",
      },
      error: {
        main: "#ef4444", // Red
        light: "#fca5a5",
        dark: "#b91c1c",
        contrast: "#ffffff",
      },
    },
  },
  
  // Minimalist monochrome theme
  monochrome: {
    id: "monochrome",
    name: "Monochrome",
    isDark: false,
    borderRadius: "0.25rem",
    fonts: defaultFonts,
    colors: {
      primary: {
        main: "#171717", // Neutral-900
        light: "#404040",
        dark: "#0a0a0a",
        contrast: "#ffffff",
      },
      secondary: {
        main: "#404040", // Neutral-700
        light: "#737373",
        dark: "#262626",
        contrast: "#ffffff",
      },
      accent: {
        main: "#737373", // Neutral-500
        light: "#a3a3a3",
        dark: "#525252",
        contrast: "#ffffff",
      },
      neutral: {
        main: "#a3a3a3", // Neutral-400
        light: "#f5f5f5",
        dark: "#262626",
        contrast: "#171717",
      },
      success: {
        main: "#16a34a", // Green
        light: "#86efac",
        dark: "#166534",
        contrast: "#ffffff",
      },
      warning: {
        main: "#ca8a04", // Yellow
        light: "#fde047",
        dark: "#854d0e",
        contrast: "#ffffff",
      },
      error: {
        main: "#dc2626", // Red
        light: "#fca5a5",
        dark: "#991b1b",
        contrast: "#ffffff",
      },
    },
  },
};

// Default theme
export const DEFAULT_THEME = "default";