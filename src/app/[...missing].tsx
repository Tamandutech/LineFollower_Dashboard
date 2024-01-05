import {
  ArrowLeftIcon,
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Text,
} from "@gluestack-ui/themed";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <Box>
        <Text>Essa página não existe.</Text>
        <Link href="/" asChild>
          <Button variant="link">
            <ButtonIcon as={ArrowLeftIcon} />
            <ButtonText>Voltar</ButtonText>
          </Button>
        </Link>
      </Box>
    </>
  );
}
