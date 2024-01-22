import {
  BleNativeClient,
  BleWebClient,
} from "@/providers/robot-ble-client/clients";
import {
  RequestDeviceNativeStrategy,
  RequestDeviceWebStrategy,
} from "@/providers/robot-ble-client/devices";
import {
  createRequestRobotDeviceStrategyForPlatform,
  createRobotBleClientForPlatform,
} from "@/providers/robot-ble-client/factories";

jest.mock("react-native-ble-plx", () => ({
  BleManager: jest.fn(),
}));

const BleManager: jest.MockedClass<
  typeof import("react-native-ble-plx").BleManager
> = require("react-native-ble-plx").BleManager;
beforeEach(() => {
  BleManager.mockReset();
});

describe("createRobotBleClientForPlatform", () => {
  it("should return a BleWebClient if the platform is web", () => {
    expect(createRobotBleClientForPlatform("web")).toBeInstanceOf(BleWebClient);
  });

  it("should return a BleNativeClient instantiated with a BleManager if the platform is not web", () => {
    for (const platform of ["android", "ios"] as const) {
      expect(createRobotBleClientForPlatform(platform)).toBeInstanceOf(
        BleNativeClient,
      );
    }
    expect(BleManager).toHaveBeenCalledTimes(2);
  });
});

describe("createRequestRobotDeviceStrategyForPlatform", () => {
  it("should return a RequestDeviceWebStrategy if the platform is web", () => {
    expect(createRequestRobotDeviceStrategyForPlatform("web")).toBeInstanceOf(
      RequestDeviceWebStrategy,
    );
  });

  it("should return a RequestDeviceNativeStrategy if the platform is not web", () => {
    for (const platform of ["android", "ios"] as const) {
      expect(
        createRequestRobotDeviceStrategyForPlatform(platform),
      ).toBeInstanceOf(RequestDeviceNativeStrategy);
    }
    expect(BleManager).toHaveBeenCalledTimes(2);
  });
});

describe("createRequestBluetoothPermissionsStrategyForPlatform", () => {
  it("should return a RequestPermissionsWebStrategy if the platform is web", () => {
    expect(createRequestRobotDeviceStrategyForPlatform("web")).toBeInstanceOf(
      RequestDeviceWebStrategy,
    );
  });

  it("should return a RequestPermissionsAndroidStrategy if the platform is android", () => {
    expect(
      createRequestRobotDeviceStrategyForPlatform("android"),
    ).toBeInstanceOf(RequestDeviceNativeStrategy);
  });

  it("should return a RequestPermissionsIOSStrategy if the platform is ios", () => {
    expect(createRequestRobotDeviceStrategyForPlatform("ios")).toBeInstanceOf(
      RequestDeviceNativeStrategy,
    );
  });
});
