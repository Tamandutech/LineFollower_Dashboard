interface Settings {
  readonly batteryStatusUpdateInterval: number; // ms
  readonly batteryLowWarningThreshold: number; // mV
  readonly batteryLowWarningInterval: number; // ms
}

interface Competition {
  readonly id: string;
  readonly name: string;
  readonly year: string;
}

interface Session {
  readonly competition:
    | import("firebase/firestore").DocumentReference<Competition>
    | null;
  readonly userId: string;
  readonly settings: Settings;
}
