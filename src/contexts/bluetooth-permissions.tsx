import { createContext } from "react";

type BluetoothPermissionsContextValue = readonly [
  RequestBluetoothPermissionsResult | null,
  () => Promise<void>,
];

export const BluetoothPermissionsContext = createContext(
  {} as BluetoothPermissionsContextValue,
);
