import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GithubAuthProvider,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

export default function getAuthService(
  app: Firebase.App,
): Firebase.Services.Auth {
  return {
    instance: initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    }),
    provider: GithubAuthProvider,
  };
}
