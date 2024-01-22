import {
  RequestPermissionsAndroidStrategy,
  RequestPermissionsIOSStrategy,
  RequestPermissionsWebStrategy,
} from "@/providers/robot-ble-client/permissions";
import { PermissionsAndroid } from "react-native";

describe("RequestPermissionsIOSStrategy", () => {
  let strategy: RequestPermissionsIOSStrategy;

  beforeEach(() => {
    strategy = new RequestPermissionsIOSStrategy();
  });

  describe("execute", () => {
    it("should resolve with granted true", async () => {
      const result = await strategy.execute();
      expect(result).toEqual({ granted: true });
    });
  });
});

describe("RequestPermissionsWebStrategy", () => {
  let strategy: RequestPermissionsWebStrategy;

  beforeEach(() => {
    strategy = new RequestPermissionsWebStrategy();
  });

  describe("execute", () => {
    it("should resolve with granted true if the Web Bluetooth API is enabled", async () => {
      navigator.bluetooth = jest.fn() as unknown as Bluetooth;
      const result = await strategy.execute();
      expect(result).toEqual({ granted: true });
    });

    it("should resolve with granted false if the Web Bluetooth API is not enabled", async () => {
      navigator.bluetooth = null as unknown as Bluetooth;
      const result = await strategy.execute();
      expect(result).toEqual({
        granted: false,
        action:
          "Habilite a Web Bluetooth API em seu navegador para conectar-se ao robô.",
      });
    });
  });
});

describe("RequestPermissionsAndroidStrategy", () => {
  let strategy: RequestPermissionsAndroidStrategy;

  beforeEach(() => {
    strategy = new RequestPermissionsAndroidStrategy();
  });

  it("should resolve with granted true if all permissions are granted", async () => {
    PermissionsAndroid.requestMultiple = jest.fn().mockResolvedValue({
      "android.permission.BLUETOOTH_CONNECT":
        PermissionsAndroid.RESULTS.GRANTED,
      "android.permission.BLUETOOTH_SCAN": PermissionsAndroid.RESULTS.GRANTED,
      "android.permission.ACCESS_FINE_LOCATION":
        PermissionsAndroid.RESULTS.GRANTED,
    });

    const result = await strategy.execute();
    expect(result).toEqual({ granted: true });
  });

  it("should resolve with granted false if the ACCESS_FINE_LOCATION permission is not granted", async () => {
    PermissionsAndroid.requestMultiple = jest.fn().mockResolvedValue({
      "android.permission.BLUETOOTH_CONNECT":
        PermissionsAndroid.RESULTS.GRANTED,
      "android.permission.BLUETOOTH_SCAN": PermissionsAndroid.RESULTS.GRANTED,
      "android.permission.ACCESS_FINE_LOCATION":
        PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
    });

    const result = await strategy.execute();
    expect(result).toEqual({
      granted: false,
      action:
        "Permita que a dashboard tenha acesso às funcionalidades Bluetooth no seu dispositivo.",
    });
  });

  it("should resolve with granted false if the BLUETOOTH_SCAN permission is not granted", async () => {
    PermissionsAndroid.requestMultiple = jest.fn().mockResolvedValue({
      "android.permission.BLUETOOTH_CONNECT":
        PermissionsAndroid.RESULTS.GRANTED,
      "android.permission.BLUETOOTH_SCAN":
        PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      "android.permission.ACCESS_FINE_LOCATION":
        PermissionsAndroid.RESULTS.GRANTED,
    });

    const result = await strategy.execute();
    expect(result).toEqual({
      granted: false,
      action:
        "Permita que a dashboard tenha acesso às funcionalidades Bluetooth no seu dispositivo.",
    });
  });

  it("should resolve with granted false if the BLUETOOTH_CONNECT permission is not granted", async () => {
    PermissionsAndroid.requestMultiple = jest.fn().mockResolvedValue({
      "android.permission.BLUETOOTH_CONNECT":
        PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      "android.permission.BLUETOOTH_SCAN": PermissionsAndroid.RESULTS.GRANTED,
      "android.permission.ACCESS_FINE_LOCATION":
        PermissionsAndroid.RESULTS.GRANTED,
    });

    const result = await strategy.execute();
    expect(result).toEqual({
      granted: false,
      action:
        "Permita que a dashboard tenha acesso às funcionalidades Bluetooth no seu dispositivo.",
    });
  });
});
