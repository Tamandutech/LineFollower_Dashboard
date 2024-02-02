import type { TRobotContext } from "@/contexts/robot";
import {
  BluetoothState,
  type UseRobotBleClientReturn,
} from "@/providers/robot-ble-adapter";
import {
  type RenderHookResult,
  act,
  renderHook,
} from "@testing-library/react-native";
import { withRobotContext } from "__tests__/unit/contexts/robot.test";
import { type PropsWithChildren, useState } from "react";

const {
  BluetoothStateContext,
  PermissionsNotGranted,
  RequestBluetoothPermissionsStrategyContext,
  RequestRobotDeviceStrategyContext,
  RobotBleClientContext,
  useRobotBleAdapter,
} = jest.requireActual("@/providers/robot-ble-adapter");

describe("useRobotBleClient", () => {
  let mockedClient: RobotBleClient<unknown>;
  const mockedDevice: unknown = { name: "test-device" };
  let mockedRequestDeviceStrategy: RequestRobotDeviceStrategy<unknown>;
  let mockedRequestPermissionStrategy: RequestBluetoothPermissionsStrategy;
  let useRobotBleClientResultWrapper: RenderHookResult<
    UseRobotBleClientReturn,
    unknown
  >;
  let robotBleClientMockProvider: React.FC;
  let robotContextMock: jest.Mocked<TRobotContext>;

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
    [robotContextMock, robotBleClientMockProvider] = withRobotContext(
      function RobotBleClientMockProvider({ children }: PropsWithChildren) {
        return (
          <BluetoothStateContext.Provider value={useState(BluetoothState.IDLE)}>
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
        );
      },
    );

    useRobotBleClientResultWrapper = renderHook(useRobotBleAdapter, {
      wrapper: robotBleClientMockProvider,
    });
  });

  it("should return a client", () => {
    expect(useRobotBleClientResultWrapper.result.current.client).toBe(
      mockedClient,
    );
  });

  it("should execute the request device strategy", async () => {
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

  describe("user denied permissions", () => {
    beforeEach(() => {
      mockedRequestPermissionStrategy.execute = jest
        .fn()
        .mockResolvedValue({ granted: false, action: "Test" });
      useRobotBleClientResultWrapper = renderHook(useRobotBleAdapter, {
        wrapper: robotBleClientMockProvider,
      });
    });

    it("should throw an error if permissions are not granted", async () => {
      expect(
        useRobotBleClientResultWrapper.result.current.requestDevice(
          configMock,
          namePrefixMock,
        ),
      ).rejects.toThrow(PermissionsNotGranted);
    });
  });

  describe("user granted permissions", () => {
    beforeEach(() => {
      mockedRequestPermissionStrategy.execute = jest
        .fn()
        .mockResolvedValue({ granted: true });
      useRobotBleClientResultWrapper = renderHook(useRobotBleAdapter, {
        wrapper: robotBleClientMockProvider,
      });
    });

    describe("requestDevice", () => {
      it("should not throw an error if permissions are granted", async () => {
        await expect(
          useRobotBleClientResultWrapper.result.current.requestDevice(
            configMock,
            namePrefixMock,
          ),
        ).resolves.not.toThrow(PermissionsNotGranted);
      });
    });

    describe("connect", () => {
      it("should connect to the device", async () => {
        await act(
          async () =>
            await useRobotBleClientResultWrapper.result.current.connect(
              mockedDevice,
              configMock,
            ),
        );
        expect(mockedClient.connect).toHaveBeenCalledWith(
          mockedDevice,
          configMock,
        );
        expect(useRobotBleClientResultWrapper.result.current.state).toBe(
          BluetoothState.CONNECTED,
        );
      });

      it("should set the robot", async () => {
        await act(
          async () =>
            await useRobotBleClientResultWrapper.result.current.connect(
              mockedDevice,
              configMock,
            ),
        );
        expect(robotContextMock[1]).toHaveBeenCalledWith(configMock);
      });
    });

    describe("disconnect", () => {
      it("should disconnect from the device", async () => {
        await act(
          async () =>
            await useRobotBleClientResultWrapper.result.current.disconnect(),
        );
        expect(mockedClient.disconnect).toHaveBeenCalled();
        expect(useRobotBleClientResultWrapper.result.current.state).toBe(
          BluetoothState.IDLE,
        );
      });

      it("should set the robot to null", async () => {
        await act(
          async () =>
            await useRobotBleClientResultWrapper.result.current.disconnect(),
        );
        expect(robotContextMock[1]).toHaveBeenCalledWith(null);
      });
    });
  });
});
