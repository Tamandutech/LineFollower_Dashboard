import Page from "@/components/layout/page";
import { useColorMode } from "@/contexts/color-mode";
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
import type { ComponentProps } from "react";
import React from "react";

type GithubLoginButtonProps = ComponentProps<typeof Button>;

export default function Login() {
  const { login } = useAuth();
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Errors.IError | null>(null);
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

  React.useEffect(() => {
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
          <GitHubLoginButton
            onPress={redirectToGithubSignIn}
            isDisabled={isLoading}
          />
        </Center>
      </VStack>
      {errorDialog}
    </Page>
  );
}

function GitHubLoginButton({ onPress, isDisabled }: GithubLoginButtonProps) {
  const [colorMode] = useColorMode();
  return (
    <Button
      action="primary"
      $dark-bg="$white"
      $light-bg="$black"
      sx={{
        borderColor: "$black",
        _light: {
          ":hover": {
            backgroundColor: "$black",
            borderColor: "$black",
          },
        },
        _dark: {
          ":hover": {
            backgroundColor: "$white",
            borderColor: "$white",
          },
        },
      }}
      onPress={onPress}
      isDisabled={isDisabled}
    >
      <ButtonIcon
        as={Github}
        mr="$2"
        color={colorMode === "dark" ? "$black" : "$white"}
      />
      <ButtonText $dark-color="$black" $light-color="$white">
        Login
      </ButtonText>
    </Button>
  );
}
