import { config } from "@/config/gluestack-ui.config";
import {
  type ColorMode,
  ColorModeContext,
  type ColorModeOption,
} from "@/contexts/color-mode";
import {
  GluestackUIProvider,
  useColorMode,
  useToken,
} from "@gluestack-ui/themed";
import {
  type Theme as NavigationTheme,
  ThemeProvider,
  useTheme,
} from "@react-navigation/native";
import { type PropsWithChildren, useState } from "react";
import { useColorScheme } from "react-native";

export function useNavigationTheme(): NavigationTheme {
  return useTheme();
}

function NavigationThemeProvider({ children }: PropsWithChildren) {
  const colorMode = useColorMode();

  const navigationLight: NavigationTheme = {
    dark: false,
    colors: {
      primary: useToken("colors", "primary"),
      background: useToken("colors", "backgroundLight50"),
      card: useToken("colors", "backgroundLight50"),
      text: useToken("colors", "textDark950"),
      border: useToken("colors", "borderLight50"),
      notification: useToken("colors", "error600"),
    },
  };

  const navigationDark: NavigationTheme = {
    dark: true,
    colors: {
      primary: useToken("colors", "primary"),
      background: useToken("colors", "backgroundDark950"),
      card: useToken("colors", "backgroundDark900"),
      text: useToken("colors", "textLight50"),
      border: useToken("colors", "borderDark900"),
      notification: useToken("colors", "error600"),
    },
  };

  return (
    <ThemeProvider
      value={colorMode === "dark" ? navigationDark : navigationLight}
    >
      {children}
    </ThemeProvider>
  );
}

export default function UIThemeProvider({ children }: PropsWithChildren) {
  const colorSheme = useColorScheme();
  const automaticColorMode = colorSheme || "dark";
  const [colorMode, setColorMode] = useState<ColorMode>(automaticColorMode);

  function setColorModeWithDefault(option: ColorModeOption) {
    setColorMode(option === "automatic" ? automaticColorMode : option);
  }

  return (
    <ColorModeContext.Provider value={[colorMode, setColorModeWithDefault]}>
      <GluestackUIProvider colorMode={colorMode} config={config}>
        <NavigationThemeProvider>{children}</NavigationThemeProvider>
      </GluestackUIProvider>
    </ColorModeContext.Provider>
  );
}
