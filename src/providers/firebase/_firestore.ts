import { FirebaseError } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

export function getCloudFirestoreService(
  app: Firebase.App,
): Firebase.Services.Firestore {
  let firestore: Firebase.Services.Firestore;
  try {
    firestore = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (error) {
    if (error instanceof FirebaseError) {
      firestore = getFirestore(app);
    } else {
      throw error;
    }
  }

  return firestore;
}
