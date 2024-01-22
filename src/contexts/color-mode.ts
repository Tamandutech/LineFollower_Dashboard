import { createContext, useContext } from "react";
import type { ColorSchemeName } from "react-native";

export type ColorMode = Exclude<ColorSchemeName, null | undefined>;

export type ColorModeOption = ColorMode | "automatic";

export type ColorModeContextType = readonly [
  ColorMode,
  (mode: ColorModeOption) => void,
];

export const ColorModeContext = createContext<ColorModeContextType>([
  "dark",
  (() => {}) as ColorModeContextType[1],
]);

export function useColorMode(): ColorModeContextType {
  return useContext(ColorModeContext);
}
