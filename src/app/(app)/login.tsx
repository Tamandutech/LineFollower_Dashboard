import Page from "@/components/layout/page";
import { useErrorModal } from "@/hooks/use-error-modal";
import { useAuth } from "@/providers/auth";
import { fetchGithubAccessToken } from "@/providers/auth/utils";
import { isTamandutechMember } from "@/providers/auth/validators";
import {
  Button,
  ButtonIcon,
  ButtonText,
  Center,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  AuthSessionResult,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import { Github } from "lucide-react-native";
import { useEffect, useState } from "react";

export default function Login() {
  const { login } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Errors.IError | null>(null);
  const errorDialog = useErrorModal(error, () => setError(null));
  const [, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID as string,
      scopes: ["identity", "user:email", "user:follow", "repo"],
      redirectUri: makeRedirectUri(),
    },
    {
      authorizationEndpoint:
        process.env.EXPO_PUBLIC_GITHUB_AUTHORIZATION_ENDPOINT,
      tokenEndpoint: process.env.EXPO_PUBLIC_GITHUB_TOKEN_ENDPOINT,
      revocationEndpoint: process.env.EXPO_PUBLIC_GITHUB_REVOCATION_ENDPOINT,
    },
  );

  async function handleGithubResponse(authSessionResult: AuthSessionResult) {
    if (authSessionResult?.type !== "success") {
      return;
    }

    const { code } = authSessionResult.params;
    try {
      const accessToken = await fetchGithubAccessToken(
        process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID as string,
        process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET as string,
        code,
      );
      login(accessToken, [isTamandutechMember]);
    } catch (error) {
      setError(error as Errors.IError);
    }
  }

  useEffect(() => {
    if (!response) {
      return;
    }
    handleGithubResponse(response);
  }, [response]);

  async function redirectToGithubSignIn() {
    setLoading(true);
    await promptAsync({
      windowName: "Line Follower Dashboard",
    });
  }

  return (
    <Page>
      <VStack space="md">
        <Text>Faça login com sua conta do Github para usar a dashboard</Text>
        <Center h="$12">
          <Button
            action="primary"
            sx={{
              backgroundColor: "$black",
              borderRadius: "$md",
              borderWidth: 1,
              borderColor: "$black",
            }}
            onPress={redirectToGithubSignIn}
            isDisabled={isLoading}
          >
            <ButtonIcon as={Github} color="$white" mr="$2" />
            <ButtonText>Login</ButtonText>
            Button
          </Button>
        </Center>
      </VStack>
      {errorDialog}
    </Page>
  );
}
