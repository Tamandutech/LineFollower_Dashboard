import { useRobotContext } from "@/contexts/robot";
import { UART_RX, UART_TX } from "@/lib/ble";
import responseData from "@/middlewares/data";
import historical from "@/middlewares/historical";
import parser from "@/middlewares/parser";
import { useRobotBleAdapter } from "@/providers/robot-ble-adapter";
import useSWR, { type SWRResponse } from "swr";
import { useSettings } from "./sessions";

export enum BatteryLevel {
  OK = "OK",
  LOW = "LOW",
  CRITIC = "CRITIC",
  UNKNOWN = "UNKNOWN",
}

export type UseRobotBatteryStatusReturn = {
  /**
   * Status da bateria do robô.
   */
  status?: Robot.BatteryStatus;

  /**
   * Erro ocorrido durante a leitura da tensão da bateria.
   */
  error?: Errors.IError;

  /**
   * Indica se a leitura da tensão da bateria está em andamento.
   */
  isLoading: boolean;

  /**
   * Nível da bateria do robô de acordo com a
   * tensão lida e a definição de níveis pelo usuário.
   */
  level: BatteryLevel;

  /**
   * Histórico de leituras da tensão da bateria.
   */
  history: Robot.BatteryStatus[];
};

export function useRobotBatteryStatus(): UseRobotBatteryStatusReturn {
  const [robot] = useRobotContext();
  const { settings } = useSettings();
  const { client: bleClient } = useRobotBleAdapter();
  const { data, error, isLoading, history } = useSWR(
    robot && `/robots/${robot.id}/battery`,
    () =>
      bleClient.request<Robot.Response<string>>(
        UART_TX,
        UART_RX,
        "bat_voltage",
      ),
    {
      use: [
        historical,
        parser((raw: string) => {
          const [, measurement] = raw.match(/(\d+\.*\d+)\w+/) || [];
          return { voltage: Number(measurement), time: new Date() };
        }),
        responseData,
      ],
      refreshInterval: settings.batteryLowWarningInterval,
    },
  ) as unknown as SWRResponse<Robot.BatteryStatus, Errors.IError> & {
    history: Robot.BatteryStatus[];
  };

  function calculateLevel(): BatteryLevel {
    if (data) {
      if (data.voltage < settings.batteryLowWarningThreshold) {
        return BatteryLevel.LOW;
      }
      if (data.voltage < 6000) {
        return BatteryLevel.CRITIC;
      }
      return BatteryLevel.OK;
    }
    return BatteryLevel.UNKNOWN;
  }

  return {
    status: data,
    error,
    isLoading,
    level: calculateLevel(),
    history,
  };
}
