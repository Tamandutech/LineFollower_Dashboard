import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import type { Device } from "react-native-ble-plx";
import { PermissionsNotGranted } from "./errors";
import {
  createRequestBluetoothPermissionsStrategyForPlatform,
  createRequestRobotDeviceStrategyForPlatform,
  createRobotBleClientForPlatform,
} from "./factories";

export * from "./errors";
export * from "./factories";
export * from "./clients";
export * from "./devices";
export * from "./permissions";

export enum BluetoothState {
  IDLE = "idle",
  REQUESTING_PERMISSIONS = "requesting-permissions",
  REQUESTING_DEVICE = "requesting-device",
  CONNECTING = "connecting",
  CONNECTED = "connected",
}

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

export const RobotBleClientContext = createContext<
  RobotBleClient<Device> | RobotBleClient<BluetoothDevice> | null
>(null);
export const RequestRobotDeviceStrategyContext =
  createContext<RequestRobotDeviceStrategy<unknown> | null>(null);
export const RequestBluetoothPermissionsStrategyContext =
  createContext<RequestBluetoothPermissionsStrategy | null>(null);

export function useRobotBleClient(): UseRobotBleClientReturn {
  const client = useContext(RobotBleClientContext) as RobotBleClient<unknown>;
  const requestDeviceStrategy = useContext(
    RequestRobotDeviceStrategyContext,
  ) as RequestRobotDeviceStrategy<unknown>;
  const requestPermissionStrategy = useContext(
    RequestBluetoothPermissionsStrategyContext,
  ) as RequestBluetoothPermissionsStrategy;
  const [state, setState] = useState<BluetoothState>(BluetoothState.IDLE);
  const [requestPermissionsResult, setRequestPermissionsResult] =
    useState<RequestBluetoothPermissionsResult | null>(null);

  useEffect(() => {
    async function requestPermissions() {
      setState(BluetoothState.REQUESTING_PERMISSIONS);
      try {
        setRequestPermissionsResult(await requestPermissionStrategy.execute());
      } finally {
        setState(BluetoothState.IDLE);
      }
    }

    if (requestPermissionsResult === null) {
      requestPermissions();
    }
  }, [requestPermissionStrategy, requestPermissionsResult]);

  function checkPermissions() {
    if (
      requestPermissionsResult === null ||
      !requestPermissionsResult.granted
    ) {
      throw new PermissionsNotGranted({
        action:
          requestPermissionsResult?.action ??
          "Não foi possível obter permissão para acessar o Bluetooth.",
      });
    }
  }

  async function requestDevice(
    config: Robot.BluetoothConnectionConfig,
    namePrefix: string,
  ): Promise<unknown> {
    checkPermissions();

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
  ) {
    setState(BluetoothState.CONNECTING);
    try {
      return await client.connect(device, config);
    } finally {
      setState(BluetoothState.CONNECTED);
    }
  }

  async function disconnect() {
    await client.disconnect();
    setState(BluetoothState.IDLE);
  }

  return {
    client,
    state,
    connect,
    disconnect,
    requestDevice,
  };
}

export default function BleClientProvider({ children }: PropsWithChildren) {
  return (
    <RequestBluetoothPermissionsStrategyContext.Provider
      value={createRequestBluetoothPermissionsStrategyForPlatform(Platform.OS)}
    >
      <RequestRobotDeviceStrategyContext.Provider
        value={createRequestRobotDeviceStrategyForPlatform(Platform.OS)}
      >
        <RobotBleClientContext.Provider
          value={createRobotBleClientForPlatform(Platform.OS)}
        >
          {children}
        </RobotBleClientContext.Provider>
      </RequestRobotDeviceStrategyContext.Provider>
    </RequestBluetoothPermissionsStrategyContext.Provider>
  );
}
