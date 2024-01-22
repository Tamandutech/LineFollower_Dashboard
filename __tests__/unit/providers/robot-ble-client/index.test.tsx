import {
  PermissionsNotGranted,
  RequestBluetoothPermissionsStrategyContext,
  RequestRobotDeviceStrategyContext,
  RobotBleClientContext,
  type UseRobotBleClientReturn,
  useRobotBleClient,
} from "@/providers/robot-ble-client";
import {
  type RenderHookResult,
  act,
  renderHook,
} from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

describe("useRobotBleClient", () => {
  let mockedClient: RobotBleClient<unknown>;
  const mockedDevice: unknown = { name: "test-device" };
  let mockedRequestDeviceStrategy: RequestRobotDeviceStrategy<unknown>;
  let mockedRequestPermissionStrategy: RequestBluetoothPermissionsStrategy;
  let useRobotBleClientResultWrapper: RenderHookResult<
    UseRobotBleClientReturn,
    unknown
  >;

  const configMock = {
    services: {
      service1: {
        CHAR_TX: "char_tx",
        CHAR_RX: "char_rx",
      },
    },
  } as unknown as Robot.BluetoothConnectionConfig;
  const namePrefixMock = "namePrefix";

  beforeEach(() => {
    mockedClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as RobotBleClient<unknown>;
    mockedRequestDeviceStrategy = {
      execute: jest.fn(() => Promise.resolve(mockedDevice)),
    } as unknown as RequestRobotDeviceStrategy<unknown>;
    mockedRequestPermissionStrategy = {
      execute: jest.fn(() => Promise.resolve({ granted: true })),
    } as unknown as RequestBluetoothPermissionsStrategy;

    function RobotBleClientMockProvider({ children }: PropsWithChildren) {
      return (
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
      );
    }

    useRobotBleClientResultWrapper = renderHook(() => useRobotBleClient(), {
      wrapper: RobotBleClientMockProvider,
    });
  });

  it("should return a client", () => {
    expect(useRobotBleClientResultWrapper.result.current.client).toBe(
      mockedClient,
    );
  });

  it("should throw an error if permissions are not granted", async () => {
    mockedRequestPermissionStrategy.execute = jest
      .fn()
      .mockResolvedValue({ granted: false, action: "test" });
    expect(
      useRobotBleClientResultWrapper.result.current.requestDevice(
        configMock,
        namePrefixMock,
      ),
    ).rejects.toThrow(PermissionsNotGranted);
  });

  it("should execute the request device strategy", async () => {
    useRobotBleClientResultWrapper.rerender({});
    await act(
      async () =>
        await useRobotBleClientResultWrapper.result.current.requestDevice(
          configMock,
          namePrefixMock,
        ),
    );
    expect(mockedRequestDeviceStrategy.execute).toHaveBeenCalledWith(
      Object.keys(configMock.services),
      namePrefixMock,
    );
  });

  it("should connect to the device", async () => {
    useRobotBleClientResultWrapper.rerender({});
    await act(
      async () =>
        await useRobotBleClientResultWrapper.result.current.connect(
          mockedDevice,
          configMock,
        ),
    );
    expect(mockedClient.connect).toHaveBeenCalledWith(mockedDevice, configMock);
  });
});
