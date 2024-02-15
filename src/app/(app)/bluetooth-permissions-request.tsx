import Page from "@/components/layout/page";
import { withErrorModal } from "@/hooks/use-error-modal";
import { PermissionsNotGranted } from "@/lib/ble";
import { withAuthGuard } from "@/providers/auth";
import { useBluetoothPermissions } from "@/providers/bluetooth-permissions";
import {
  ArrowRightIcon,
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
  Center,
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Link, Redirect, router } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { useEffect } from "react";
import { Platform } from "react-native";
import useAsyncFn from "react-use/lib/useAsyncFn";

const BluetoothPermissionsRequestScreen = withErrorModal(({ onError }) => {
  const { request, result } = useBluetoothPermissions();
  const [{ loading }, doAuthorize] = useAsyncFn(request);

  useEffect(() => {
    if (!result?.granted) {
      onError(
        new PermissionsNotGranted({
          action:
            "Edite as permissões da dashboard nas configurações do seu dispositivo.",
        }),
      );
    } else {
      router.replace("/(app)/(root)/");
    }
  }, [result, onError]);

  return (
    <Page>
      <VStack space="md" mt="$7">
        <HStack alignItems="center">
          <Icon as={AlertTriangle} color="$primary500" mr="$2" size="lg" />
          <Heading size="lg">Permissões necessárias</Heading>
        </HStack>
        <Text textAlign="justify">
          {Platform.OS === "web"
            ? "Para utilizar a dashboard em um navegador, é necessário habilitar os recursos experimentais da plataforma."
            : "A dashboard precisa das permissões para utilizar o Bluetooth do seu dispositivo."}
        </Text>
        <Center h="$12">
          {Platform.OS === "web" ? (
            <Link
              asChild
              href={
                "chrome://flags/#enable-experimental-web-platform-features" as `http${string}`
              }
            >
              <Button variant="link">
                <ButtonText>Habilitar recursos experimentais</ButtonText>
                <ButtonIcon as={ArrowRightIcon} ml="$1" />
              </Button>
            </Link>
          ) : (
            <Button
              action="primary"
              variant="solid"
              onPress={doAuthorize}
              isDisabled={loading}
            >
              {loading ? <ButtonSpinner mr="$1" /> : null}
              <ButtonText>Autorizar</ButtonText>
            </Button>
          )}
        </Center>
      </VStack>
    </Page>
  );
});

export default withAuthGuard(
  BluetoothPermissionsRequestScreen,
  <Redirect href="/(app)/login" />,
);
