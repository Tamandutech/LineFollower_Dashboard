import { config } from "@/config/gluestack-ui.config";
import { ColorModeContext } from "@/contexts/color-mode";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { type PropsWithChildren, useState } from "react";
import { type ColorSchemeName, useColorScheme } from "react-native";

export default function ThemeProvider({ children }: PropsWithChildren) {
  const colorSheme = useColorScheme();
  const [colorMode, setColorMode] = useState<
    Exclude<ColorSchemeName, undefined | null>
  >(colorSheme || "dark");

  const toggleColorMode = async () => {
    setColorMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ColorModeContext.Provider value={[colorMode, toggleColorMode]}>
      <GluestackUIProvider colorMode={colorMode} config={config}>
        {children}
      </GluestackUIProvider>
    </ColorModeContext.Provider>
  );
}
