import { File, Paths } from "expo-file-system";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

export type AccentColors = {
  /** Icons, links and accent text. */
  primary: string;
  /** Filled buttons and selected states. */
  primaryStrong: string;
  /** Tinted backgrounds: avatars, icon circles, selected cards. */
  soft: string;
  /** Faint tint for selected rows. */
  softer: string;
  /** Borders of tinted elements. */
  border: string;
};

export const THEMES = {
  blue: {
    primary: "#2160e8",
    primaryStrong: "#2863ea",
    soft: "#e7f0ff",
    softer: "#f2f7ff",
    border: "#d5e5ff",
  },
  red: {
    primary: "#d8173a",
    primaryStrong: "#ed1b3a",
    soft: "#ffe8ec",
    softer: "#fff4f6",
    border: "#ffd0d8",
  },
  green: {
    primary: "#178a4c",
    primaryStrong: "#1f9e5a",
    soft: "#e3f6eb",
    softer: "#f2fbf6",
    border: "#c9ecd8",
  },
  purple: {
    primary: "#6a3fd4",
    primaryStrong: "#7a4fe6",
    soft: "#efe9ff",
    softer: "#f7f4ff",
    border: "#ddd2ff",
  },
  orange: {
    primary: "#d5620a",
    primaryStrong: "#ec7414",
    soft: "#fff0e2",
    softer: "#fff8f1",
    border: "#ffdcbd",
  },
} satisfies Record<string, AccentColors>;

export type ThemeName = keyof typeof THEMES;

// Saved in the app's documents folder; web keeps it for the session only.
const persistent = Platform.OS !== "web";
const THEME_FILE = "theme.json";

function loadThemeName(): ThemeName {
  if (!persistent) return "blue";
  try {
    const file = new File(Paths.document, THEME_FILE);
    if (!file.exists) return "blue";
    const name = JSON.parse(file.textSync()).name;
    return name in THEMES ? name : "blue";
  } catch {
    return "blue";
  }
}

type ThemeContextValue = {
  themeName: ThemeName;
  colors: AccentColors;
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(loadThemeName);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    if (!persistent) return;
    new File(Paths.document, THEME_FILE)
      .write(JSON.stringify({ name }))
      .catch((error) => console.error("Unable to save theme.", error));
  }, []);

  const value = useMemo(
    () => ({ themeName, colors: THEMES[themeName], setTheme }),
    [themeName, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider.");
  return value;
}

/** Builds a component's styles from the current accent colours, rebuilt only when the theme changes. */
export function useThemedStyles<T>(create: (colors: AccentColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => create(colors), [create, colors]);
}
