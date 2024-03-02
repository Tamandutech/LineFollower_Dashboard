import type { RobotContextType } from "@/contexts/robot";
import {
  type UseRobotParametersReturn,
  useParameter,
  useRobotParameters,
} from "@/models/parameters";
import {
  type RenderHookResult,
  act,
  renderHook,
} from "@testing-library/react-native";
import type { FC, PropsWithChildren } from "react";
import { SWRConfig } from "swr";
import { withRobotContext } from "../contexts/robot.test";
import { waitForNextTick } from "./index.test";

describe("useRobotParameters", () => {
  let mockedClient: jest.Mocked<RobotBleClient<unknown>>;
  let mockedRobotContext: jest.Mocked<RobotContextType>;
  let RobotContextMockProvider: FC<PropsWithChildren>;
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
  });

  describe("no robot connected", () => {
    it("should return undefined", () => {
      const {
        result: {
          current: { dataClasses, error, isLoading, refresh, install },
        },
      } = renderHook(
        () =>
          useRobotParameters(
            mockedClient,
            txCharacteristicId,
            rxCharacteristicId,
          ),
        { wrapper: RobotContextMockProvider },
      );

      expect(dataClasses).toBeUndefined();
      expect(error).toBeUndefined();
      expect(isLoading).toBe(false);
      expect(refresh).toBeInstanceOf(Function);
      expect(install).toBeInstanceOf(Function);
    });
  });

  describe("robot connected", () => {
    beforeEach(() => {
      mockedRobotContext[0] = {
        name: "test-device",
        id: "test-id",
        services: {},
        interface: "test",
      };
    });

    it("should start in the loading state", () => {
      mockedClient.request.mockResolvedValue("");

      const {
        result: {
          current: { isLoading },
        },
      } = renderHook(
        () =>
          useRobotParameters(
            mockedClient,
            txCharacteristicId,
            rxCharacteristicId,
          ),
        { wrapper: RobotContextMockProvider },
      );

      expect(isLoading).toBeTruthy();
    });

    it("should validate the robot response and return undefined if it does not match the expected format", async () => {
      mockedClient.request.mockResolvedValue("");
      const {
        result: {
          current: { dataClasses },
        },
      } = renderHook(
        () =>
          useRobotParameters(
            mockedClient,
            txCharacteristicId,
            rxCharacteristicId,
          ),
        { wrapper: RobotContextMockProvider },
      );

      expect(dataClasses).toBeUndefined();
    });

    it.skip("should return the data classes registered in the robot", async () => {
      mockedClient.request.mockResolvedValue({
        cmdExecd: "param_list",
        data:
          "Dados parametrizados registrados: 69\n" +
          " 0 - sLatMarks.marks: \n" +
          " 1 - sLatMarks.thresholdToCurve: 251\n" +
          " 2 - sLatMarks.MarkstoStop: 10\n",
      });

      const {
        result: {
          current: { dataClasses },
        },
      } = renderHook(
        () =>
          useRobotParameters(
            mockedClient,
            txCharacteristicId,
            rxCharacteristicId,
          ),
        { wrapper: RobotContextMockProvider },
      );
      await waitForNextTick();

      expect(dataClasses).toBeInstanceOf(Map);
      expect(dataClasses?.size).toBe(4);
      expect(dataClasses?.get("sLatMarks")).toMatchObject(
        new Map([
          ["marks", ""],
          ["thresholdToCurve", "251"],
          ["MarkstoStop", "10"],
        ]),
      );
    });

    describe.skip("install", () => {
      let renderResult: RenderHookResult<UseRobotParametersReturn, unknown>;
      const dataClasses = new Map([
        [
          "sLatMarks",
          new Map([
            ["marks", "0,0,0,0"],
            ["thresholdToCurve", "251"],
            ["MarkstoStop", "10"],
          ]),
        ],
      ]);

      beforeEach(() => {
        mockedClient.request.mockResolvedValueOnce({
          cmdExecd: "param_list",
          data: "Dados parametrizados registrados: 69\n",
        });
        renderResult = renderHook(
          () =>
            useRobotParameters(
              mockedClient,
              txCharacteristicId,
              rxCharacteristicId,
            ),
          { wrapper: RobotContextMockProvider },
        );
      });

      it("should set the parameters in the data classes", async () => {
        mockedClient.request.mockResolvedValue("OK");

        await waitForNextTick();
        await act(() => {
          renderResult.result.current.install(dataClasses);
        });

        for (const [className, parameters] of dataClasses) {
          for (const [parameterName, value] of parameters) {
            expect(mockedClient.request).toHaveBeenCalledWith(
              txCharacteristicId,
              rxCharacteristicId,
              `param_set ${className}.${parameterName} ${value}`,
            );
          }
        }
      });
    });
  });
});

describe("useRobotParameter", () => {
  let mockedClient: jest.Mocked<RobotBleClient<unknown>>;
  let mockedRobotContext: jest.Mocked<RobotContextType>;
  let RobotContextMockProvider: FC<PropsWithChildren>;
  const txCharacteristicId = "tx";
  const rxCharacteristicId = "rx";

  beforeEach(() => {
    mockedClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
      subscribeToTxCharacteristic: jest.fn(),
      request: jest.fn().mockReturnValueOnce(
        Promise.resolve({
          cmdExecd: "param_list",
          data:
            "Dados parametrizados registrados: 69\n" +
            " 0 - sLatMarks.marks: 0,0,0,0\n" +
            " 1 - sLatMarks.thresholdToCurve: 251\n" +
            " 2 - sLatMarks.MarkstoStop: 10\n",
        }),
      ),
      isConnected: jest.fn(),
    };

    [mockedRobotContext, RobotContextMockProvider] = withRobotContext(
      ({ children }: PropsWithChildren) => (
        <SWRConfig
          value={{
            provider: () => new Map(),
          }}
        >
          {children}
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

  it.skip("should return the parameter value", () => {
    const {
      result: {
        current: [value],
      },
    } = renderHook(
      () =>
        useParameter(
          mockedClient,
          txCharacteristicId,
          rxCharacteristicId,
          "sLatMarks",
          "thresholdToCurve",
        ),
      { wrapper: RobotContextMockProvider },
    );

    expect(value).toBe("251");
  });

  describe("set", () => {
    it.skip("should set the parameter with the formatted value", async () => {
      const {
        result: {
          current: [, set],
        },
      } = renderHook(
        () =>
          useParameter(
            mockedClient,
            txCharacteristicId,
            rxCharacteristicId,
            "sLatMarks",
            "thresholdToCurve",
          ),
        { wrapper: RobotContextMockProvider },
      );

      await act(() => set(-1));
      expect(mockedClient.request).toHaveBeenCalledWith(
        txCharacteristicId,
        rxCharacteristicId,
        "param_set sLatMarks.thresholdToCurve !1",
      );
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });
});
