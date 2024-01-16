import { createContext, useContext } from "react";
import { Platform } from "react-native";
import getApp from "./_app";
import getAuthService from "./_auth";
import { getCloudFirestoreService } from "./_firestore";

const FirebaseBackendContext = createContext<Firebase.Backend | null>(null);

export function useFirebaseBackend(): Firebase.Backend {
  return useContext(FirebaseBackendContext) as Firebase.Backend;
}

export default function FirebaseBackendProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = getApp();
  const backend: Firebase.Backend = {
    app,
    auth: getAuthService(app, Platform.OS),
    db: getCloudFirestoreService(app),
  };
  return (
    <FirebaseBackendContext.Provider value={backend}>
      {children}
    </FirebaseBackendContext.Provider>
  );
}
