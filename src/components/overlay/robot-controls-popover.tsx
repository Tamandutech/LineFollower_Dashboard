import { useRobotContext } from "@/contexts/robot";
import { useConfirmActionModal } from "@/hooks/use-confirm-action-modal";
import { useErrorModal } from "@/hooks/use-error-modal";
import { UART_RX, UART_TX } from "@/lib/ble";
import { calculateTimeDifferenceInMinutes } from "@/lib/dates";
import { useRobotBatteryStatus } from "@/models/battery";
import { useRobotSystem } from "@/models/system";
import { useRobotBleAdapter } from "@/providers/robot-ble-adapter";
import {
  Avatar,
  Button,
  ButtonIcon,
  ButtonText,
  Center,
  CircleIcon,
  Divider,
  HStack,
  Heading,
  Icon,
  Popover,
  PopoverBackdrop,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  Pressable,
  Spinner,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { BluetoothOff, Bot, Pause, Play } from "lucide-react-native";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import useAsyncFn from "react-use/lib/useAsyncFn";
import RobotBatteryStatusBox from "../data/robot-batery-status-box";
import ConfirmActionModal from "../ui/confirm-action-modal";

type RobotControlsPopoverProps = Omit<
  ComponentProps<typeof Popover>,
  "children" | "trigger"
> & {
  onDisconnect: () => void;
};

export default function RobotControlsPopover({
  onDisconnect,
  ...props
}: RobotControlsPopoverProps) {
  const [robot] = useRobotContext();
  const { reveal, isRevealed, state } = useConfirmActionModal();
  const { client: bleClient, disconnect } = useRobotBleAdapter();
  const { status } = useRobotBatteryStatus();
  const { toggle, isPaused } = useRobotSystem(bleClient, UART_TX, UART_RX);
  const [connected, setConnected] = useState(false);
  const [{ error: disconnectError }, doDisconnect] = useAsyncFn(async () => {
    await disconnect();
    onDisconnect();
  });
  const [{ error: toggleError }, doToggle] = useAsyncFn(async () => {
    await toggle();
  });
  const errorModal = useErrorModal(
    useMemo(
      () => disconnectError || toggleError,
      [disconnectError, toggleError],
    ) as Errors.IError | undefined,
  );

  useEffect(() => {
    async function checkIsConnected() {
      setConnected(await bleClient.isConnected());
    }
    if (!connected) {
      checkIsConnected();
    }
  }, [connected, bleClient]);

  function handleDisconnect() {
    reveal({
      header: "Desconectar robô",
      content:
        "Tem certeza que deseja desconectar o robô? Transmissões em andamento serão interrompidas e alterações não salvas serão perdidas.",
      onConfirm: doDisconnect,
    });
  }

  return (
    <Popover
      {...props}
      trigger={(triggerProps) => (
        <Pressable {...triggerProps}>
          <VStack space="xs">
            <Text sub>{robot?.name}</Text>
            <HStack alignItems="center" space="md">
              <RobotBatteryStatusBox />
              {connected ? <ConnectedIcon /> : null}
            </HStack>
          </VStack>
        </Pressable>
      )}
    >
      <PopoverBackdrop />
      <PopoverContent>
        <PopoverHeader px="$5" pt="$5">
          <HStack>
            <Avatar size="md" sx={{ backgroundColor: "transparent" }}>
              <Icon as={Bot} size="xl" color="$primary500" />
            </Avatar>
            <VStack ml="$2.5" space="xs">
              <Heading size="sm">{robot?.name}</Heading>
              {connected ? (
                <HStack alignItems="center">
                  <ConnectedIcon />
                  <Text size="xs" pl="$1.5">
                    Conectado
                  </Text>
                </HStack>
              ) : null}
            </VStack>
          </HStack>
        </PopoverHeader>
        <PopoverBody px="$5">
          <VStack space="sm">
            <Divider />
            {status ? (
              <RobotControlSection title="Bateria">
                <RobotControlInfo
                  label="Tensão atual"
                  value={status ? `${status.voltage}mV` : "Indisponível"}
                />
                <RobotControlInfo
                  label="Ultima medição"
                  value={`${calculateTimeDifferenceInMinutes(
                    status?.time as Date,
                  )}m atrás`}
                />
              </RobotControlSection>
            ) : (
              <Center>
                <Spinner size="small" />
              </Center>
            )}
          </VStack>
        </PopoverBody>
        <PopoverFooter justifyContent="center">
          <VStack space="md" w="$full">
            <Button bg="$primary500" onPress={doToggle}>
              <ButtonIcon
                as={isPaused ? Play : Pause}
                key={String(isPaused)}
                mr="$2"
              />
              <ButtonText>
                {isPaused ? "Retomar" : "Pausar"} execução
              </ButtonText>
            </Button>
            <Button variant="outline" onPress={handleDisconnect}>
              <ButtonIcon as={BluetoothOff} mr="$2" />
              <ButtonText>Desconectar</ButtonText>
            </Button>
          </VStack>
        </PopoverFooter>
        {state && <ConfirmActionModal {...state} isOpen={isRevealed} />}
        {errorModal}
      </PopoverContent>
    </Popover>
  );
}

type RobotControlSectionProps = { title: string; children: ReactNode };

function RobotControlSection({ title, children }: RobotControlSectionProps) {
  return (
    <VStack space="sm">
      <Heading size="sm" mb="$1">
        {title}
      </Heading>
      {children}
    </VStack>
  );
}

type RobotControlInfoProps = { label: string; value: ReactNode };

function RobotControlInfo({ label, value }: RobotControlInfoProps) {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Text size="sm">{label}</Text>
      <Text sub>{value}</Text>
    </HStack>
  );
}

function ConnectedIcon() {
  return <Icon as={CircleIcon} color="$primary500" h="$2" w="$2" />;
}
