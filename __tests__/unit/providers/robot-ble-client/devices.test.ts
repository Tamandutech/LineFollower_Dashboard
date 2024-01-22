import { DeviceNotFoundError } from "@/providers/robot-ble-client";
import {
  RequestDeviceNativeStrategy,
  RequestDeviceWebStrategy,
} from "@/providers/robot-ble-client/devices";
import {
  BleError,
  type BleErrorCodeMessageMapping,
  type BleManager,
  type Device,
} from "react-native-ble-plx";

describe("RequestDeviceNativeStrategy", () => {
  let mockedManager: BleManager;
  let mockedDevice: Device;
  let strategy: RequestDeviceNativeStrategy;

  describe("execute", () => {
    beforeEach(() => {
      mockedManager = {
        startDeviceScan: jest.fn((services, options, listener) => {
          listener(null, mockedDevice);
        }),
        stopDeviceScan: jest.fn(),
      } as unknown as BleManager;
      mockedDevice = { name: "TEST_DEVICE" } as unknown as Device;
      strategy = new RequestDeviceNativeStrategy(mockedManager);
    });

    it("should resolve with the device if the device name starts with the name prefix", async () => {
      const result = await strategy.execute(["service1", "service2"], "TEST");
      expect(result).toBe(mockedDevice);
    });

    it("should stop scanning if a device is found", async () => {
      await strategy.execute(["service1", "service2"], "TEST");
      expect(mockedManager.stopDeviceScan).toHaveBeenCalled();
    });

    it("should reject with DeviceNotFoundError if there is an error", async () => {
      mockedManager.startDeviceScan = jest.fn((services, options, listener) => {
        listener(
          new BleError("test error", {
            0: "error",
          } as BleErrorCodeMessageMapping),
          mockedDevice,
        );
      });

      await expect(
        strategy.execute(["service1", "service2"], "TEST"),
      ).rejects.toThrow(DeviceNotFoundError);
      expect(mockedManager.stopDeviceScan).toHaveBeenCalled();
    });
  });
});

describe("RequestDeviceWebStrategy", () => {
  let mockedManager: Bluetooth;
  let mockedDevice: BluetoothDevice;
  let strategy: RequestDeviceWebStrategy;

  describe("execute", () => {
    beforeEach(() => {
      mockedManager = {
        requestDevice: jest.fn(() => Promise.resolve(mockedDevice)),
      } as unknown as Bluetooth;
      mockedDevice = { name: "TEST_DEVICE" } as unknown as BluetoothDevice;
      strategy = new RequestDeviceWebStrategy(mockedManager);
    });

    it("should resolve with the device if the device name starts with the name prefix", async () => {
      const result = await strategy.execute(["service1", "service2"], "TEST");
      expect(result).toBe(mockedDevice);
    });
  });
});
