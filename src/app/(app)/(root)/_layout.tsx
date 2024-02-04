import RobotBatteryStatusBox from "@/components/data/robot-batery-status-box";
import CompetitionSelect from "@/components/forms/competition-select";
import UserAvatar from "@/components/media/user-avatar";
import { useRobotContext } from "@/contexts/robot";
import { useCompetition } from "@/models/sessions";
import { useAuth } from "@/providers/auth";
import { HStack, Pressable } from "@gluestack-ui/themed";
import { Redirect, SplashScreen, Stack, router } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const { update } = useCompetition();
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
            {robot && <RobotBatteryStatusBox />}
            <Pressable
              onPress={() => router.push(user ? "/profile" : "/login")}
            >
              <UserAvatar user={user} />
            </Pressable>
          </HStack>
        ),
        headerLeft: () => (
          <CompetitionSelect
            onChange={(competition) => update(competition.ref)}
          />
        ),
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
