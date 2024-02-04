import type { RobotContextType } from "@/contexts/robot";
import { BatteryLevel, useRobotBatteryStatus } from "@/models/battery";
import {
  BluetoothState,
  BluetoothStateContext,
  RequestBluetoothPermissionsStrategyContext,
  RequestRobotDeviceStrategyContext,
  RobotBleClientContext,
} from "@/providers/robot-ble-adapter";
import { act, renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { SWRConfig } from "swr";
import { withRobotContext } from "../contexts/robot.test";

jest.mock("@/models/sessions");

describe("useRobotBatteryStatus", () => {
  const mockedDevice: unknown = { name: "test-device" };
  let mockedRobotContext: jest.Mocked<RobotContextType>;
  let mockedClient: jest.Mocked<RobotBleClient<unknown>>;
  let mockedRequestDeviceStrategy: jest.Mocked<
    RequestRobotDeviceStrategy<unknown>
  >;
  let mockedRequestPermissionStrategy: jest.Mocked<RequestBluetoothPermissionsStrategy>;
  let RobotBleAdapterMockProvider: React.FC<PropsWithChildren>;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(0);

    mockedClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
      subscribeToTxCharacteristic: jest.fn(),
      request: jest.fn(),
      isConnected: jest.fn(),
    };
    mockedRequestDeviceStrategy = {
      execute: jest
        .fn()
        .mockImplementation(() => Promise.resolve(mockedDevice)),
    };
    mockedRequestPermissionStrategy = {
      execute: jest.fn(() => Promise.resolve({ granted: true })),
    };

    [mockedRobotContext, RobotBleAdapterMockProvider] = withRobotContext(
      ({ children }: PropsWithChildren) => (
        <SWRConfig value={{ provider: () => new Map() }}>
          <BluetoothStateContext.Provider
            value={[BluetoothState.IDLE, jest.fn()]}
          >
            <RobotBleClientContext.Provider value={mockedClient}>
              <RequestRobotDeviceStrategyContext.Provider
                value={mockedRequestDeviceStrategy}
              >
                <RequestBluetoothPermissionsStrategyContext.Provider
                  value={mockedRequestPermissionStrategy}
                >
                  {children}
                </RequestBluetoothPermissionsStrategyContext.Provider>
              </RequestRobotDeviceStrategyContext.Provider>
            </RobotBleClientContext.Provider>
          </BluetoothStateContext.Provider>
        </SWRConfig>
      ),
    );

    mockedRobotContext[0] = {
      name: "test-device",
      id: "test-id",
      services: {},
      interface: "test",
    };
  });

  describe("battery status", () => {
    beforeEach(() => {
      mockedClient.request.mockImplementationOnce(
        (): Promise<Robot.Response<string>> =>
          Promise.resolve({ cmdExecd: "bat_voltage", data: "6000mV" }),
      );
    });

    it("should return the battery status", async () => {
      const { result } = renderHook(useRobotBatteryStatus, {
        wrapper: RobotBleAdapterMockProvider,
      });
      await act(() => jest.runAllTimers());
      expect(result.current.status?.voltage).toBe(6000);
      expect(result.current.status?.time.getTime()).toBe(3000);
    });

    it("should keep the history of the battery status reads", async () => {
      const { result } = renderHook(useRobotBatteryStatus, {
        wrapper: RobotBleAdapterMockProvider,
      });
      await act(() => jest.runAllTimers());
      expect(result.current.history.length).toBe(1);
      expect(result.current.history[0].voltage).toBe(6000);
    });
  });

  describe("battery level", () => {
    it("should be low if the voltage is bellow 6,00V", async () => {
      mockedClient.request.mockImplementationOnce(
        (): Promise<Robot.Response<string>> =>
          Promise.resolve({ cmdExecd: "bat_voltage", data: "600mV" }),
      );

      const { result } = renderHook(useRobotBatteryStatus, {
        wrapper: RobotBleAdapterMockProvider,
      });
      await act(() => jest.runAllTimers());

      expect(result.current.level).toBe(BatteryLevel.CRITIC);
    });

    it("should be low if the voltage is bellow the user defined threshold", async () => {
      mockedClient.request.mockImplementationOnce(
        (): Promise<Robot.Response<string>> =>
          Promise.resolve({ cmdExecd: "bat_voltage", data: "600mV" }),
      );

      const { result } = renderHook(useRobotBatteryStatus, {
        wrapper: RobotBleAdapterMockProvider,
      });
      await act(() => jest.runAllTimers());

      expect(result.current.level).toBe(BatteryLevel.CRITIC);
    });

    it("should be unknown if the voltage is not available", async () => {
      mockedClient.request.mockImplementationOnce(
        (): Promise<Robot.Response<string>> => Promise.reject(),
      );

      const { result } = renderHook(useRobotBatteryStatus, {
        wrapper: RobotBleAdapterMockProvider,
      });
      await act(() => jest.runAllTimers());

      expect(result.current.level).toBe(BatteryLevel.UNKNOWN);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    mockedClient.request.mockRestore();
  });
});
