import ConnectBluetoothButton from "@/components/forms/connect-bluetooth-button";
import type { RobotContextType } from "@/contexts/robot";
import {
  BluetoothState,
  BluetoothStateContext,
  RequestBluetoothPermissionsStrategyContext,
  RequestRobotDeviceStrategyContext,
  RobotBleClientContext,
} from "@/providers/robot-ble-adapter";
import UIThemeProvider from "@/providers/theme";
import { fireEvent, render } from "@testing-library/react-native";
import { withRobotContext } from "__tests__/unit/contexts/robot.test";
import type { PropsWithChildren } from "react";
import { SWRConfig } from "swr";

jest.mock("@/models/robots");

describe("ConnectBluetoothButton", () => {
  const mockedDevice: unknown = { name: "test-device" };
  let onConnectCallback: jest.Mock;
  let mockedRobotContext: jest.Mocked<RobotContextType>;
  let mockedClient: jest.Mocked<RobotBleClient<unknown>>;
  let mockedRequestDeviceStrategy: jest.Mocked<
    RequestRobotDeviceStrategy<unknown>
  >;
  let mockedRequestPermissionStrategy: jest.Mocked<RequestBluetoothPermissionsStrategy>;
  let RobotBleAdapterMockProvider: React.FC<PropsWithChildren>;
  let ui: JSX.Element;

  beforeEach(() => {
    onConnectCallback = jest.fn();
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
      services: { service1: { char1: "a" } },
      interface: "test",
    };

    ui = (
      <UIThemeProvider>
        <RobotBleAdapterMockProvider>
          <ConnectBluetoothButton onConnect={onConnectCallback} />
        </RobotBleAdapterMockProvider>
      </UIThemeProvider>
    );
  });

  it("should render without errors", () => {
    const wrapper = render(ui);
    expect(wrapper).toBeDefined();
  });

  describe("before connect", () => {
    it("should render the button with the correct label", () => {
      const { getByRole } = render(ui);
      expect(getByRole("button")).toBeVisible();
    });

    it("should display the action sheet when the button is pressed", async () => {
      const { getByText, getByRole, getByTestId } = render(ui);
      fireEvent.press(getByRole("button"));
      expect(getByTestId("robots-select-sheet")).toBeVisible();
      expect(getByText("Robot 1")).toBeVisible();
    });
  });
});
