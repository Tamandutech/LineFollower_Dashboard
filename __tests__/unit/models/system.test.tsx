import type { RobotContextType } from "@/contexts/robot";
import { type UseRobotSystemReturn, useRobotSystem } from "@/models/system";
import {
  type RenderHookResult,
  act,
  renderHook,
} from "@testing-library/react-native";
import type { FC, PropsWithChildren } from "react";
import { SWRConfig } from "swr";
import { withRobotContext } from "../contexts/robot.test";

describe("useRobotSystem", () => {
  let mockedClient: jest.Mocked<RobotBleClient<unknown>>;
  let mockedRobotContext: jest.Mocked<RobotContextType>;
  let RobotContextMockProvider: FC<PropsWithChildren>;
  let renderResult: RenderHookResult<UseRobotSystemReturn, unknown>;
  const txCharacteristicId = "tx";
  const rxCharacteristicId = "rx";

  beforeEach(() => {
    mockedClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
      subscribeToTxCharacteristic: jest.fn(),
      request: jest.fn(),
      isConnected: jest.fn(),
    };

    [mockedRobotContext, RobotContextMockProvider] = withRobotContext(
      ({ children }: PropsWithChildren) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    );

    renderResult = renderHook(
      () =>
        useRobotSystem(mockedClient, txCharacteristicId, rxCharacteristicId),
      { wrapper: RobotContextMockProvider },
    );
  });

  it("should return the initial state", () => {
    const {
      result: { current },
    } = renderResult;
    expect(current.isPaused).toBe(false);
  });

  it("should pause the robot", async () => {
    const {
      result: { current },
    } = renderResult;

    await act(async () => {
      await current.pause();
    });

    expect(mockedClient.request).toHaveBeenCalledWith(
      txCharacteristicId,
      rxCharacteristicId,
      "pause",
    );
  });

  it("should resume the robot", async () => {
    const {
      result: { current },
    } = renderResult;

    await act(async () => {
      await current.resume();
    });

    expect(mockedClient.request).toHaveBeenCalledWith(
      txCharacteristicId,
      rxCharacteristicId,
      "resume",
    );
  });

  it("should toggle the robot", async () => {
    const {
      result: { current },
    } = renderResult;

    await act(async () => {
      await current.toggle();
    });

    expect(mockedClient.request).toHaveBeenCalledWith(
      txCharacteristicId,
      rxCharacteristicId,
      "pause",
    );
  });
});
