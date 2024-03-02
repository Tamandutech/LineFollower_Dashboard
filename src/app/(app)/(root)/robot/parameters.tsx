import Page from "@/components/layout/page";
import PressableChevron from "@/components/ui/pressable-chevron";
import { withErrorModal } from "@/hooks/use-error-modal";
import { UART_RX, UART_TX } from "@/lib/ble";
import { useParameter, useRobotParameters } from "@/models/parameters";
import { withAuthGuard } from "@/providers/auth";
import { useRobotBleAdapter } from "@/providers/robot-ble-adapter";
import { useNavigationTheme } from "@/providers/theme";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  Avatar,
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
  Center,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Heading,
  Icon,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  KeyboardAvoidingView,
  ScrollView,
  Spinner,
  Text,
  VStack,
  useToken,
} from "@gluestack-ui/themed";
import { Redirect } from "expo-router";
import { Pencil, Save, Sliders } from "lucide-react-native";
import {
  type ComponentProps,
  type PropsWithChildren,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import { RefreshControl } from "react-native";
import useAsyncFn from "react-use/lib/useAsyncFn";

const ParametersScreen = withErrorModal(({ onError }) => {
  const { client: bleClient } = useRobotBleAdapter();
  const { dataClasses, isLoading, isValidating, refresh, error } =
    useRobotParameters(bleClient, UART_TX, UART_RX);
  const primaryColor = useToken("colors", "primary500");
  const {
    colors: { card: refreshControlBackgroundColor },
  } = useNavigationTheme();

  useEffect(() => {
    if (error) {
      onError(error as Errors.IError);
    }
  }, [error, onError]);

  return isLoading ? (
    <Center h="$full" w="$full">
      <Spinner size="large" />
    </Center>
  ) : (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isValidating}
          onRefresh={refresh}
          colors={[primaryColor]}
          progressBackgroundColor={refreshControlBackgroundColor}
        />
      }
    >
      <Page>
        <VStack space="lg" flex={1}>
          {[...(dataClasses || new Map()).entries()].map(
            ([className, parameters]) => (
              <ClassSection
                key={className}
                className={className}
                parameters={parameters}
                onError={onError}
              />
            ),
          )}
        </VStack>
      </Page>
    </ScrollView>
  );
});

type ClassSectionProps = PropsWithChildren<{
  className: string;
  parameters: Robot.DataClass;
  onError: (error: Errors.IError) => void;
}> &
  ComponentProps<typeof VStack>;

function ClassSection({
  className,
  parameters,
  onError,
  ...props
}: ClassSectionProps) {
  return (
    <VStack space="lg" {...props}>
      <Heading size="md">{className}</Heading>
      {[...parameters.entries()].map(([parameter, value]) => (
        <ParameterInput
          onError={onError}
          key={parameter}
          className={className}
          parameter={parameter}
          initialValue={value}
        />
      ))}
    </VStack>
  );
}

type ParameterInputProps = {
  className: string;
  parameter: string;
  initialValue?: Robot.ParameterValue;
  onError: (error: Errors.IError) => void;
};

const ParameterInput = memo(
  ({ className, parameter, initialValue, onError }: ParameterInputProps) => {
    const { client: bleClient } = useRobotBleAdapter();
    const [value, setValue] = useParameter(
      bleClient,
      UART_TX,
      UART_RX,
      className,
      parameter,
      initialValue,
    );
    const [{ error, loading }, doSetValue] = useAsyncFn(setValue, [
      value,
      value,
    ]);
    const [isEditActionSheetOpen, setIsShowEditActionSheetOpen] =
      useState(false);
    const [valueInput, setValueInput] = useState("");
    const valueInputRef = useRef(null);
    const primaryColor = useToken("colors", "primary500");

    useEffect(() => {
      if (error) {
        onError(error as Errors.IError);
      }
    }, [error, onError]);

    function toggleEditActionSheet() {
      setIsShowEditActionSheetOpen((prev) => !prev);
    }

    async function handleSave() {
      await doSetValue(valueInput);
      toggleEditActionSheet();
    }

    function handleValueInputChange(text: string) {
      setValueInput(text);
    }

    return (
      <HStack justifyContent="space-between" alignItems="center">
        <VStack justifyContent="space-around">
          <Text>{parameter}</Text>
          <Text sub>{value}</Text>
        </VStack>
        <PressableChevron onPress={toggleEditActionSheet} />
        <Actionsheet
          isOpen={isEditActionSheetOpen}
          onClose={toggleEditActionSheet}
          zIndex={999}
          initialFocusRef={valueInputRef}
        >
          <KeyboardAvoidingView
            behavior="position"
            style={{
              position: "relative",
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            <ActionsheetBackdrop />
            <ActionsheetContent h="$72" zIndex={999} maxHeight="75%">
              <ActionsheetDragIndicatorWrapper>
                <ActionsheetDragIndicator />
              </ActionsheetDragIndicatorWrapper>
              <VStack w="$full" p="$5">
                <HStack justifyContent="center" alignItems="center" space="md">
                  <Avatar size="md" sx={{ backgroundColor: "transparent" }}>
                    <Icon as={Sliders} size="xl" color="$primary500" />
                  </Avatar>
                  <VStack flex={1}>
                    <Text fontWeight="$bold">{parameter}</Text>
                    <Text sub>{className}</Text>
                  </VStack>
                </HStack>
                <FormControl mt={36}>
                  <FormControlLabel>
                    <FormControlLabelText>
                      Valor do parâmetro
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input w="$full">
                    <InputSlot>
                      <InputIcon as={Pencil} ml="$2" />
                    </InputSlot>
                    <InputField
                      inputMode="decimal"
                      onChangeText={handleValueInputChange}
                      ref={valueInputRef}
                      selectionColor={primaryColor}
                    />
                  </Input>
                  <Button onPress={handleSave} mt={20} isDisabled={loading}>
                    <ButtonText mr="$2">Salvar</ButtonText>
                    {loading ? <ButtonSpinner /> : <ButtonIcon as={Save} />}
                  </Button>
                </FormControl>
              </VStack>
            </ActionsheetContent>
          </KeyboardAvoidingView>
        </Actionsheet>
      </HStack>
    );
  },
);

export default withAuthGuard(
  ParametersScreen,
  <Redirect href="/(app)/login" />,
);
