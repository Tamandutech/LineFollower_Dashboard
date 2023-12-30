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
        <Text>This screen doesn't exist.</Text>
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
