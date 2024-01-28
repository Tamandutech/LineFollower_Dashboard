import { PermissionsAndroid } from "react-native";

export class RequestPermissionsAndroidStrategy
  implements RequestBluetoothPermissionsStrategy
{
  async execute(): Promise<RequestBluetoothPermissionsResult> {
    if (PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
      if (
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      ) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        if (
          result["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          return { granted: true };
        }
        return {
          granted: false,
          action:
            "Permita que a dashboard tenha acesso às funcionalidades Bluetooth no seu dispositivo.",
        };
      }
    }
    return {
      granted: false,
      action:
        "Verifique se o Bluetooth no seu dispositivo está ativo e funcionando corretamente.",
    };
  }
}

export class RequestPermissionsWebStrategy
  implements RequestBluetoothPermissionsStrategy
{
  /**
   * @returns {Promise<RequestBluetoothPermissionsResult>}
   */
  async execute(): Promise<RequestBluetoothPermissionsResult> {
    if (!navigator.bluetooth) {
      return {
        granted: false,
        action:
          "Habilite a Web Bluetooth API em seu navegador para conectar-se ao robô.",
      };
    }
    return { granted: true };
  }
}

export class RequestPermissionsIOSStrategy
  implements RequestBluetoothPermissionsStrategy
{
  async execute(): Promise<RequestBluetoothPermissionsResult> {
    return { granted: true };
  }
}
