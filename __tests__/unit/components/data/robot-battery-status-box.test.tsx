import RobotBatteryStatusBox from "@/components/data/robot-batery-status-box";
import { RobotContext, type RobotContextType } from "@/contexts/robot";
import {
  BluetoothState,
  BluetoothStateContext,
  RequestRobotDeviceStrategyContext,
  RobotBleClientContext,
} from "@/providers/robot-ble-adapter";
import UIThemeProvider from "@/providers/theme";
import { render, screen } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { SWRConfig } from "swr";

jest.mock("@/models/sessions");

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

describe("RobotBatteryStatusBox", () => {
  const mockedDevice: unknown = { name: "test-device" };
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
  let mockedRequestDeviceStrategy: jest.Mocked<
    RequestRobotDeviceStrategy<unknown>
  >;
  let RobotBleAdapterMockProvider: React.FC<PropsWithChildren>;
  let ui: JSX.Element;

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

    RobotBleAdapterMockProvider = ({ children }: PropsWithChildren) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        <BluetoothStateContext.Provider
          value={[BluetoothState.IDLE, jest.fn()]}
        >
          <RobotContext.Provider value={mockedRobotContext}>
            <RobotBleClientContext.Provider value={mockedClient}>
              <RequestRobotDeviceStrategyContext.Provider
                value={mockedRequestDeviceStrategy}
              >
                {children}
              </RequestRobotDeviceStrategyContext.Provider>
            </RobotBleClientContext.Provider>
          </RobotContext.Provider>
        </BluetoothStateContext.Provider>
      </SWRConfig>
    );

    ui = (
      <UIThemeProvider>
        <RobotBleAdapterMockProvider>
          <RobotBatteryStatusBox />
        </RobotBleAdapterMockProvider>
      </UIThemeProvider>
    );
  });

  it("should render the loading spinner when the status is not available", async () => {
    const { getByTestId } = render(ui);
    expect(getByTestId("loading-spinner")).toBeDefined();
  });

  it("should render the battery status when its available", async () => {
    mockedClient.request.mockImplementationOnce(() =>
      Promise.resolve({ cmdExecd: "bat_voltage", data: "6000mV" }),
    );
    const { findByText } = render(ui);
    expect(findByText("6,00V")).resolves.toHaveLength(1);
  });

  describe("battery level feedback", () => {
    it("should render the battery full icon if the level is OK", () => {
      mockedClient.request.mockImplementationOnce(() =>
        Promise.resolve({ cmdExecd: "bat_voltage", data: "7000mV" }),
      );
      const { findByTestId } = render(ui);
      expect(findByTestId("battery-ok-icon")).resolves.toBeDefined();
    });

    it("should render the battery low icon if the level is LOW", () => {
      mockedClient.request.mockImplementationOnce(() =>
        Promise.resolve({ cmdExecd: "bat_voltage", data: "6600mV" }),
      );
      const { findByTestId } = render(ui);
      expect(findByTestId("battery-low-icon")).resolves.toBeDefined();
    });

    it("should render the battery warning icon if the level is CRITIC", () => {
      mockedClient.request.mockImplementationOnce(() =>
        Promise.resolve({ cmdExecd: "bat_voltage", data: "600mV" }),
      );
      const { findByTestId } = render(ui);
      expect(findByTestId("battery-critic-icon")).resolves.toBeDefined();
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    mockedClient.request.mockRestore();
    screen.unmount();
  });
});
