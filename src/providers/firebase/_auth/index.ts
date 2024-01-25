import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseError } from "firebase/app";
import {
  type Auth,
  GithubAuthProvider,
  // @ts-expect-error
  browserLocalPersistence,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import type { PlatformOSType } from "react-native";

export default function getAuthService(
  app: Firebase.App,
  platform: PlatformOSType,
): Firebase.Services.Auth {
  let auth: Auth;
  try {
    auth = initializeAuth(app, {
      persistence:
        platform === "web"
          ? browserLocalPersistence
          : getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === "auth/already-initialized"
    ) {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }

  return {
    instance: auth,
    provider: GithubAuthProvider,
  };
}
