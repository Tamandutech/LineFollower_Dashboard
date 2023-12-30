import { Icon, Text, useToken } from "@gluestack-ui/themed";
import { Tabs } from "expo-router";
import {
  AreaChart,
  Heading,
  Home,
  Map as Mapping,
  Sliders,
} from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";

function asTabBarIcon(Base: ComponentType<IconProps>) {
  return <Base size={24} />;
}

const pages = new Map<
  string,
  { title: string; icon: ReactNode; headerShown: boolean }
>([
  ["[id]", { title: "Início", icon: asTabBarIcon(Home), headerShown: false }],
  [
    "[id]/parameters",
    {
      title: "Parâmetros",
      icon: asTabBarIcon(Sliders),
      headerShown: true,
    },
  ],
  [
    "[id]/mapping",
    {
      title: "Mapeamento",
      icon: asTabBarIcon(Mapping),
      headerShown: true,
    },
  ],
  [
    "[id]/streams",
    {
      title: "Transmissões",
      icon: asTabBarIcon(AreaChart),
      headerShown: true,
    },
  ],
]);

export default function MainLayout() {
  const activeColor = useToken("colors", "primary500");
  const inactiveColor = useToken("colors", "tertiary500");
  return (
    <Tabs
      screenOptions={{
        headerTitle: ({ children }) => <Heading>{children}</Heading>,
        tabBarLabel: ({ children }) => <Text size="sm">{children}</Text>,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
      }}
    >
      {Array.from(pages.entries()).map(
        ([name, { title, icon, headerShown }]) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              tabBarIcon: ({ color }) => <Icon as={icon} color={color} />,
              headerShown,
            }}
          />
        ),
      )}
    </Tabs>
  );
}
