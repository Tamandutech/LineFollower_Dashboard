import Page from "@/components/layout/page";
import { colorModeOptions } from "@/constants/options";
import { useColorMode } from "@/contexts/color-mode";
import { useAuth, withAuthGuard } from "@/providers/auth";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Button,
  ButtonIcon,
  ButtonText,
  Divider,
  HStack,
  Heading,
  Icon,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  VStack,
  useToken,
} from "@gluestack-ui/themed";
import { Redirect } from "expo-router";
import type { User } from "firebase/auth";
import { ChevronDownIcon, LogOut, Palette } from "lucide-react-native";
import { useMemo } from "react";

function Profile() {
  const { user, logout } = useAuth();
  const iconColor = useToken("colors", "primary500");

  if (!user) {
    return null;
  }

  return (
    <Page>
      <VStack space="lg" flex={1} mt="$5">
        <Heading>Perfil</Heading>
        <PersonalInfoSection user={user} />
        <Divider />
        <PreferencesSection />
        <Button onPress={logout} variant="outline">
          <ButtonIcon
            mr="$1"
            as={({ ...props }) => <LogOut {...props} color={iconColor} />}
          />
          <ButtonText>Logout</ButtonText>
        </Button>
      </VStack>
    </Page>
  );
}

function PersonalInfoSection({ user }: { user: User }) {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack space="md">
        <Avatar>
          <AvatarFallbackText>
            {user.displayName || "Desconhecido"}
          </AvatarFallbackText>
          {user.photoURL && (
            <AvatarImage
              source={{
                uri: user.photoURL,
              }}
              alt={user.displayName || "Usuário"}
            />
          )}
        </Avatar>
        <VStack>
          <Text>{user.displayName}</Text>
          <Text color="$textLight500" size="sm">
            {user.email}
          </Text>
        </VStack>
      </HStack>
    </HStack>
  );
}

function PreferencesSection() {
  const [colorMode, setColorMode] = useColorMode();
  const initialColorModeLabel = useMemo(
    () => colorModeOptions.find((option) => option.value === colorMode)?.label,
    [colorMode],
  );
  return (
    <VStack space="md">
      <Heading>Preferências</Heading>
      <HStack justifyContent="space-between">
        <HStack space="md" alignItems="center">
          <Icon as={Palette} />
          <Text>Tema</Text>
        </HStack>
        <Select
          selectedValue={colorMode}
          initialLabel={initialColorModeLabel}
          w="$32"
          onValueChange={setColorMode as (value: string) => void}
        >
          <SelectTrigger variant="outline" size="sm">
            <SelectInput placeholder="Selecione" />
            <SelectIcon mr="$3" as={ChevronDownIcon} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {colorModeOptions.map((option) => (
                <SelectItem key={option.value} {...option} />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </HStack>
    </VStack>
  );
}

export default withAuthGuard(Profile, <Redirect href="/(app)/login" />);
