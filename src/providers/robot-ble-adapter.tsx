import { useRobotContext } from "@/contexts/robot";
import {
  createRequestRobotDeviceStrategyForPlatform,
  createRobotBleClientForPlatform,
} from "@/lib/ble/factories";
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { Platform } from "react-native";

export enum BluetoothState {
  IDLE = "idle",
  REQUESTING_DEVICE = "requesting-device",
  CONNECTING = "connecting",
  CONNECTED = "connected",
}

export type BluetoothStateContextValue = readonly [
  BluetoothState,
  Dispatch<SetStateAction<BluetoothState>>,
];

export type UseRobotBleClientReturn = {
  /**
   * O cliente BLE para a plataforma atual.
   */
  client: RobotBleClient<unknown>;

  /**
   * Indica o estado atual da comunicação via Bluetooth.
   */
  state: BluetoothState;

  /**
   * Conecta o cliente com o robô e atualiza o estado `connected`.
   *
   * @param device O dispositivo BLE.
   * @param config A configuração de conexão.
   * @throws {ConnectionError} Se ocorrer algum erro na conexão.
   */
  connect: (
    device: unknown,
    config: Robot.BluetoothConnectionConfig,
  ) => Promise<void>;

  /**
   * Desconecta o cliente do robô e atualiza o estado `connected`.
   */
  disconnect: () => Promise<void>;

  /**
   * Solicita ao usuário que selecione um dispositivo BLE.
   *
   * @param config A configuração de conexão.
   * @param namePrefix O prefixo do nome do dispositivo.
   * @throws {DeviceNotFoundError} Se o usuário cancelar a conexão ou ocorra
   * algum erro durante a identificação do dispositivo.
   */
  requestDevice: (
    config: Robot.BluetoothConnectionConfig,
    namePrefix: string,
  ) => Promise<unknown>;
};

export const RobotBleClientContext = createContext(
  {} as RobotBleClient<unknown>,
);
export const RequestRobotDeviceStrategyContext = createContext(
  {} as RequestRobotDeviceStrategy<unknown>,
);
export const BluetoothStateContext = createContext(
  [] as unknown as BluetoothStateContextValue,
);

export function useRobotBleAdapter(): UseRobotBleClientReturn {
  const client = useContext(RobotBleClientContext);
  const requestDeviceStrategy = useContext(RequestRobotDeviceStrategyContext);
  const [state, setState] = useContext(BluetoothStateContext);
  const [, setRobot] = useRobotContext();

  async function requestDevice(
    config: Robot.BluetoothConnectionConfig,
    namePrefix: string,
  ): Promise<unknown> {
    setState(BluetoothState.REQUESTING_DEVICE);
    try {
      return await requestDeviceStrategy.execute(
        Object.keys(config.services),
        namePrefix,
      );
    } finally {
      setState(BluetoothState.IDLE);
    }
  }

  async function connect(
    device: unknown,
    config: Robot.BluetoothConnectionConfig,
  ): Promise<void> {
    setState(BluetoothState.CONNECTING);
    try {
      await client.connect(device, config);
      setRobot(config);
    } finally {
      setState(BluetoothState.CONNECTED);
    }
  }

  async function disconnect() {
    try {
      await client.disconnect();
      setRobot(null);
    } finally {
      setState(BluetoothState.IDLE);
    }
  }

  return {
    client,
    state,
    connect,
    disconnect,
    requestDevice,
  };
}

export default function RobotBleAdapterProvider({
  children,
}: PropsWithChildren) {
  return (
    <RobotBleClientContext.Provider
      value={
        createRobotBleClientForPlatform(Platform.OS) as RobotBleClient<unknown>
      }
    >
      <RequestRobotDeviceStrategyContext.Provider
        value={createRequestRobotDeviceStrategyForPlatform(Platform.OS)}
      >
        <BluetoothStateProvider>{children}</BluetoothStateProvider>
      </RequestRobotDeviceStrategyContext.Provider>
    </RobotBleClientContext.Provider>
  );
}

function BluetoothStateProvider({ children }: PropsWithChildren) {
  return (
    <BluetoothStateContext.Provider
      value={useState<BluetoothState>(BluetoothState.IDLE)}
    >
      {children}
    </BluetoothStateContext.Provider>
  );
}
