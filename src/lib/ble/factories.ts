import type { PlatformOSType } from "react-native";
import { BleManager, type Device } from "react-native-ble-plx";
import { BleNativeClient, BleWebClient } from "./clients";
import {
  RequestDeviceNativeStrategy,
  RequestDeviceWebStrategy,
} from "./devices";
import {
  RequestPermissionsAndroidStrategy,
  RequestPermissionsIOSStrategy,
  RequestPermissionsWebStrategy,
} from "./permissions";

/**
 * Cria um cliente para se conectar ao robô.
 *
 * @param {PlatformOSType} platform Plataforma do dispositivo.
 * @returns {Promise<RobotBleClient>} Cliente para se conectar ao robô.
 * @throws {PermissionsNotGranted} Caso o usuário não tenha concedido permissão para acessar
 * o Bluetooth no dispositivo.
 */
export function createRobotBleClientForPlatform(
  platform: PlatformOSType,
): RobotBleClient<Device> | RobotBleClient<BluetoothDevice> {
  if (platform === "web") {
    return new BleWebClient();
  }
  return new BleNativeClient(new BleManager());
}

/**
 * Cria uma estratégia para parear o dispositivo do usuário com um robô
 * que aceita conexões via bluetooth.
 *
 * @param {PlatformOSType} platform Plataforma do dispositivo.
 */
export function createRequestRobotDeviceStrategyForPlatform(
  platform: PlatformOSType,
):
  | RequestRobotDeviceStrategy<Device>
  | RequestRobotDeviceStrategy<BluetoothDevice> {
  if (platform === "web") {
    return new RequestDeviceWebStrategy(navigator.bluetooth);
  }
  return new RequestDeviceNativeStrategy(new BleManager());
}

/**
 * Cria uma estratégia para solicitar permissão ao usuário para acessar o
 * Bluetooth no dispositivo.
 *
 * @param {PlatformOSType} platform Plataforma do dispositivo.
 */
export function createRequestBluetoothPermissionsStrategyForPlatform(
  platform: PlatformOSType,
) {
  if (platform === "android") {
    return new RequestPermissionsAndroidStrategy();
  }
  if (platform === "ios") {
    return new RequestPermissionsIOSStrategy();
  }
  return new RequestPermissionsWebStrategy();
}
