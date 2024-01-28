import { BaseError } from "@/errors";
import { LINE_FOLLOWER_NAME_PREFIX } from "@/lib/ble/constants";
import { useRobots } from "@/models/use-robots";
import {
  BluetoothState,
  useRobotBleAdapter,
} from "@/providers/robot-ble-client";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
  Center,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipText,
} from "@gluestack-ui/themed";
import { BluetoothSearching } from "lucide-react-native";
import { type ComponentProps, useState } from "react";

type ConnectBluetoothButtonProps = {
  onConnect: (robot: Robot.BluetoothConnectionConfig) => void;
  onError?: (error: Errors.IError) => void;
} & Omit<ComponentProps<typeof Button>, `onPress${"In" | "Out" | ""}`>;

const bluetoothLoadingStateLabels = new Map<BluetoothState, string>([
  [BluetoothState.REQUESTING_DEVICE, "Procurando robô"],
  [BluetoothState.CONNECTING, "Conectando"],
  [BluetoothState.CONNECTED, "Conectado"],
]);

export default function ConnectBluetoothButton({
  onConnect,
  onError,
  ...props
}: ConnectBluetoothButtonProps) {
  const [showRobotsSelectSheet, setShowRobotsSelectSheet] = useState(false);
  const { robots, isLoading } = useRobots();
  const { state, requestDevice, connect } = useRobotBleAdapter();
  const isDisabled = bluetoothLoadingStateLabels.has(state);

  function toggleRobotsSelectSheet() {
    setShowRobotsSelectSheet((prev) => !prev);
  }

  async function handleRobotSelect(
    robotConfig: Robot.BluetoothConnectionConfig,
  ) {
    setShowRobotsSelectSheet(false);
    try {
      const device = await requestDevice(
        robotConfig,
        LINE_FOLLOWER_NAME_PREFIX,
      );
      await connect(device, robotConfig);
      onConnect(robotConfig);
    } catch (error) {
      if (error instanceof BaseError && onError) {
        onError(error);
      } else {
        throw error;
      }
    }
  }

  return (
    <>
      <Tooltip
        placement="top"
        trigger={(triggerProps) => (
          <Button
            action="primary"
            rounded="$full"
            size="xl"
            h="$20"
            {...triggerProps}
            {...props}
            onPress={toggleRobotsSelectSheet}
            isDisabled={isDisabled}
          >
            {!isDisabled ? (
              <ButtonIcon as={BluetoothSearching} color="$white" size="xl" />
            ) : (
              <>
                {state !== BluetoothState.CONNECTED && (
                  <ButtonSpinner size="large" mr="$4" />
                )}
                <ButtonText>
                  {bluetoothLoadingStateLabels.get(state)}
                </ButtonText>
              </>
            )}
          </Button>
        )}
      >
        <TooltipContent bg="$tertiary500">
          <TooltipText>
            Conecte o robô para começar a usar a dashboard
          </TooltipText>
        </TooltipContent>
      </Tooltip>
      <Actionsheet
        isOpen={showRobotsSelectSheet}
        onClose={toggleRobotsSelectSheet}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent h="$72" zIndex={999}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {isLoading ? (
            <Center h="$full" w="$full">
              <Spinner size="large" />
            </Center>
          ) : (
            robots?.map((robot) => (
              <ActionsheetItem
                key={robot.id}
                onPress={() => handleRobotSelect(robot)}
              >
                <ActionsheetItemText>{robot.name}</ActionsheetItemText>
              </ActionsheetItem>
            ))
          )}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
