import { RobotContext, type RobotContextType } from "@/contexts/robot";
import { BatteryLevel, useRobotBatteryStatus } from "@/models/battery";
import { RobotBleClientContext } from "@/providers/robot-ble-adapter";
import { renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { SWRConfig } from "swr";
import { waitForNextTick } from "./index.test";

jest.mock("@/models/sessions");

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

describe("useRobotBatteryStatus", () => {
  const mockedRobotContext: jest.Mocked<RobotContextType> = [
    {
      name: "test-device",
      id: "test-id",
      services: {},
      interface: "test",
    },
    jest.fn(),
  ];
  let mockedClient: jest.Mocked<RobotBleClient<unknown>>;
  let RobotBleAdapterMockProvider: React.FC<PropsWithChildren>;

  beforeEach(() => {
    mockedClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
      subscribeToTxCharacteristic: jest.fn(),
      request: jest.fn(),
      isConnected: jest.fn(),
    };

    RobotBleAdapterMockProvider = ({ children }: PropsWithChildren) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        <RobotContext.Provider value={mockedRobotContext}>
          <RobotBleClientContext.Provider value={mockedClient}>
            {children}
          </RobotBleClientContext.Provider>
        </RobotContext.Provider>
      </SWRConfig>
    );
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
      await waitForNextTick();
      expect(result.current.status?.voltage).toBe(6000);
      expect(result.current.status?.time).toBeDefined();
    });

    it("should keep the history of the battery status reads", async () => {
      const { result } = renderHook(useRobotBatteryStatus, {
        wrapper: RobotBleAdapterMockProvider,
      });
      await waitForNextTick();
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
      await waitForNextTick();

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
      await waitForNextTick();

      expect(result.current.level).toBe(BatteryLevel.CRITIC);
    });

    it("should be unknown if the voltage is not available", async () => {
      mockedClient.request.mockImplementationOnce(
        (): Promise<Robot.Response<string>> => Promise.reject(),
      );

      const { result } = renderHook(useRobotBatteryStatus, {
        wrapper: RobotBleAdapterMockProvider,
      });
      await waitForNextTick();

      expect(result.current.level).toBe(BatteryLevel.UNKNOWN);
    });
  });

  afterEach(() => {
    mockedClient.request.mockRestore();
  });
});
