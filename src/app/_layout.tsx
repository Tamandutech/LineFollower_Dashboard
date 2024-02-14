import { COLOR_MODE_KEY } from "@/constants/keys";
import type { ColorModeOption } from "@/contexts/color-mode";
import { RobotContextProvider } from "@/contexts/robot";
import AuthProvider from "@/providers/auth";
import FirebaseBackendProvider from "@/providers/firebase";
import RobotBleAdapterProvider from "@/providers/robot-ble-adapter";
import UIThemeProvider from "@/providers/theme";
import {
  Lato_100Thin,
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
  Lato_900Black,
} from "@expo-google-fonts/lato";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    Lato_100Thin,
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
  });
  const [userColorMode, setUserColorMode] = useState<ColorModeOption | null>();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function loadColorMode() {
      const colorMode = await AsyncStorage.getItem(COLOR_MODE_KEY);
      setUserColorMode(colorMode as ColorModeOption | null);
    }

    if (userColorMode === undefined) {
      loadColorMode();
    }
  });

  if (!fontsLoaded || userColorMode === undefined) {
    return null;
  }

  return (
    <RobotBleAdapterProvider>
      <UIThemeProvider userColorModeOption={userColorMode || undefined}>
        <FirebaseBackendProvider>
          <AuthProvider>
            <RobotContextProvider>
              <Slot />
            </RobotContextProvider>
          </AuthProvider>
        </FirebaseBackendProvider>
      </UIThemeProvider>
    </RobotBleAdapterProvider>
  );
}
