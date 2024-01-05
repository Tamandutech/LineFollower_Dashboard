declare namespace Firebase {
  type App = import("firebase/app").FirebaseApp;

  namespace Services {
    type Auth = {
      instance: import("firebase/auth").Auth;
      provider: typeof import("firebase/auth").GithubAuthProvider;
    };

    type Firestore = import("firebase/firestore").Firestore;
  }

  type Backend = {
    app: App;
    auth: Services.Auth;
    db: Services.Firestore;
  };
}
