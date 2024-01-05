import { Icon, Text, useToken } from "@gluestack-ui/themed";
import { Tabs } from "expo-router";
import { AreaChart, Home, Map as Mapping, Sliders } from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";

function asTabBarIcon(Base: ComponentType<IconProps>) {
  return <Base size={24} />;
}

const pages = new Map<string, { title: string; icon: ReactNode }>([
  ["[id]", { title: "Início", icon: asTabBarIcon(Home) }],
  [
    "[id]/parameters",
    {
      title: "Parâmetros",
      icon: asTabBarIcon(Sliders),
    },
  ],
  [
    "[id]/mapping",
    {
      title: "Mapeamento",
      icon: asTabBarIcon(Mapping),
    },
  ],
  [
    "[id]/streams",
    {
      title: "Transmissões",
      icon: asTabBarIcon(AreaChart),
    },
  ],
]);

export default function MainLayout() {
  const activeColor = useToken("colors", "primary500");
  const inactiveColor = useToken("colors", "tertiary500");
  return (
    <Tabs
      screenOptions={{
        tabBarLabel: ({ children }) => <Text size="sm">{children}</Text>,
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
            tabBarIcon: ({ color }) => <Icon as={icon} color={color} />,
            headerShown: false,
          }}
        />
      ))}
    </Tabs>
  );
}
