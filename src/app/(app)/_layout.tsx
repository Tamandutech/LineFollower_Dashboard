import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(root)",
};

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(root)" />
      <Stack.Screen
        name="login"
        options={{
          title: "Autenticação necessária",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="bluetooth-permissions-request"
        options={{
          title: "Permissões necessárias",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
