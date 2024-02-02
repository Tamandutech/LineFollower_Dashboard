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
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
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

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <RobotBleAdapterProvider>
      <UIThemeProvider>
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
