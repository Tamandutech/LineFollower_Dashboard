import { config } from "@/config/gluestack-ui.config";
import { COLOR_MODE_KEY as COLOR_MODE_OPTION_KEY } from "@/constants/keys";
import { ColorModeContext, type ColorModeOption } from "@/contexts/color-mode";
import {
  GluestackUIProvider,
  useColorMode,
  useToken,
} from "@gluestack-ui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
      primary: useToken("colors", "primary500"),
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
      primary: useToken("colors", "primary500"),
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

export default function UIThemeProvider({
  children,
  userColorModeOption = "automatic",
}: PropsWithChildren & { userColorModeOption?: ColorModeOption }) {
  const automaticColorMode = useColorScheme() || "dark";
  const [colorModeOption, setColorModeOption] =
    useState<ColorModeOption>(userColorModeOption);
  const colorMode =
    colorModeOption === "automatic" ? automaticColorMode : colorModeOption;

  function setAndStoreColorModeOption(option: ColorModeOption) {
    setColorModeOption(option);
    AsyncStorage.setItem(COLOR_MODE_OPTION_KEY, option);
  }

  return (
    <ColorModeContext.Provider
      value={[colorModeOption, setAndStoreColorModeOption]}
    >
      <GluestackUIProvider colorMode={colorMode} config={config}>
        <NavigationThemeProvider>{children}</NavigationThemeProvider>
      </GluestackUIProvider>
    </ColorModeContext.Provider>
  );
}
