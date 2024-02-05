import { useColorMode } from "@/contexts/color-mode";
import { useNavigationTheme } from "@/providers/theme";
import { Icon, Text, useToken } from "@gluestack-ui/themed";
import { Tabs } from "expo-router";
import {
  AreaChart,
  Home,
  MapIcon,
  Settings,
  Sliders,
} from "lucide-react-native";
import type { FC } from "react";

const pages = new Map<string, { title: string; icon: FC }>([
  ["index", { title: "Início", icon: Home }],
  [
    "parameters",
    {
      title: "Parâmetros",
      icon: Sliders,
    },
  ],
  [
    "mapping",
    {
      title: "Mapeamento",
      icon: MapIcon,
    },
  ],
  [
    "streams",
    {
      title: "Transmissões",
      icon: AreaChart,
    },
  ],
  ["options", { title: "Opções", icon: Settings }],
]);

export default function MainLayout() {
  const [colorMode] = useColorMode();
  const activeColor = useToken("colors", "primary500");
  const inactiveColor = useToken(
    "colors",
    colorMode === "dark" ? "tertiary500" : "tertiary300",
  );
  const {
    colors: { text: textColor },
  } = useNavigationTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarLabel: ({ children, color, focused }) =>
          focused && (
            <Text size="xs" color={color === activeColor ? textColor : color}>
              {children}
            </Text>
          ),
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
      }}
    >
      {Array.from(pages.entries()).map(([name, { title, icon }]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Icon as={icon} color={color} size="xl" />
            ),
            headerShown: false,
          }}
        />
      ))}
    </Tabs>
  );
}
