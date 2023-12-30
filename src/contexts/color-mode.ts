import { createContext, useContext } from "react";
import { type ColorSchemeName } from "react-native";

type ColorModeContextType = readonly [ColorSchemeName, () => void];

export const ColorModeContext = createContext<ColorModeContextType>([
  "dark",
  () => {},
]);

export function useColorMode(): ColorModeContextType {
  return useContext(ColorModeContext);
}
