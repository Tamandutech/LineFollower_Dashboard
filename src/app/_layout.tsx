import ThemeProvider from "@/providers/theme";
import {
  Lato_100Thin,
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
  Lato_900Black,
} from "@expo-google-fonts/lato";
import { useColorMode, useToken } from "@gluestack-style/react";
import {
  type Theme as NavigationTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Lato_100Thin,
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const colorMode = useColorMode();

  const navigationLight: NavigationTheme = {
    dark: false,
    colors: {
      primary: useToken("colors", "primary"),
      background: useToken("colors", "backgroundDark50"),
      card: useToken("colors", "backgroundDark50"),
      text: useToken("colors", "textLight50"),
      border: useToken("colors", "borderLight50"),
      notification: useToken("colors", "error500"),
    },
  };

  const navigationDark: NavigationTheme = {
    dark: true,
    colors: {
      primary: useToken("colors", "primary"),
      background: useToken("colors", "backgroundDark950"),
      card: useToken("colors", "backgroundDark800"),
      text: useToken("colors", "textDark950"),
      border: useToken("colors", "borderLight800"),
      notification: useToken("colors", "error500"),
    },
  };

  return (
    <NavigationThemeProvider
      value={colorMode === "dark" ? navigationDark : navigationLight}
    >
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
        }}
      />
    </NavigationThemeProvider>
  );
}
