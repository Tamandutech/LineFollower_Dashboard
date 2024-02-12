import UserAvatar from "@/components/media/user-avatar";
import RobotControlsPopover from "@/components/overlay/robot-controls-popover";
import { useRobotContext } from "@/contexts/robot";
import { useAuth } from "@/providers/auth";
import { HStack, Pressable } from "@gluestack-ui/themed";
import { Redirect, SplashScreen, Stack, router } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [robot] = useRobotContext();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <HStack alignItems="center" space="md">
            <Pressable
              onPress={() => router.push(user ? "/profile" : "/login")}
            >
              <UserAvatar user={user} />
            </Pressable>
          </HStack>
        ),
        headerLeft: () =>
          robot ? (
            <RobotControlsPopover
              placement="bottom left"
              onDisconnect={() => router.replace("/(app)/(root)/")}
            />
          ) : null,
        headerTitle: () => null,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Perfil",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
