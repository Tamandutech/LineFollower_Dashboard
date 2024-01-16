import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GithubAuthProvider,
  // @ts-expect-error
  browserLocalPersistence,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { PlatformOSType } from "react-native";

export default function getAuthService(
  app: Firebase.App,
  platform: PlatformOSType,
): Firebase.Services.Auth {
  return {
    instance: initializeAuth(app, {
      persistence:
        platform === "web"
          ? browserLocalPersistence
          : getReactNativePersistence(AsyncStorage),
    }),
    provider: GithubAuthProvider,
  };
}
