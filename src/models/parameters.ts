import { useRobotContext } from "@/contexts/robot";
import { RuntimeError } from "@/lib/ble";
import responseData from "@/middlewares/data";
import parser from "@/middlewares/parser";
import { useState } from "react";
import useSWR from "swr";

export type UseRobotParametersReturn = {
  /**
   * Lista de classes de dados do robô.
   */
  dataClasses?: Robot.Parameters;

  /**
   * Erro ocorrido durante a leitura dos parâmetros.
   */
  error?: Errors.IError;

  /**
   * Indica se a leitura dos parâmetros está em andamento.
   */
  isLoading: boolean;

  /**
   * Indica se a revalidação dos parâmetros está em andamento.
   */
  isValidating: boolean;

  /**
   * Atualiza os parâmetros no robô.
   *
   * @returns {Promise<void>} `Promise` vazia que resolve quando a listagem é concluída.
   */
  refresh: () => Promise<Robot.Parameters | undefined>;

  /**
   * Instala os parâmetros no robô (define todos os parâmetros contidos na versão fornecida).
   *
   * @param dataClasses A lista de classes de dados a serem instaladas.
   * @returns {Promise<void>} `Promise` vazia que resolve quando a instalação é concluída.
   */
  install: (
    dataClasses: Robot.Parameters,
  ) => Promise<Robot.Parameters | undefined>;
};

export type UseRobotParameterReturn = readonly [
  Robot.ParameterValue | undefined,
  (value: Robot.ParameterValue) => Promise<void>,
];

/**
 * Converte um valor de parâmetro para string.
 *
 * @param value Valor do parâmetro.
 * @returns {String} String representando o valor do parâmetro.
 */
function valueToString(value: Robot.ParameterValue): string {
  let valueStr = "";
  valueStr = value.toString();
  if (Number(value) < 0) {
    valueStr = `!${valueStr}`;
  }
  return valueStr;
}

/**
 * Hook para manipulação dos parâmetros do robô.
 *
 * @param {RobotBleClient} bleClient Cliente BLE para comunicação com o robô.
 * @param {string} txCharacteristicId ID da característica de transmissão
 * @param {string} rxCharacteristicId ID da característica de recepção
 * @returns {UseRobotParametersReturn}
 */
export function useRobotParameters(
  bleClient: RobotBleClient<unknown>,
  txCharacteristicId: string,
  rxCharacteristicId: string,
): UseRobotParametersReturn {
  const [robot] = useRobotContext();
  const {
    data: dataClasses,
    isLoading,
    isValidating,
    error,
    mutate,
  } = useSWR<Robot.Parameters, Errors.IError>(
    robot && `/robots/${robot.id}/parameters`,
    () =>
      bleClient.request<Robot.Parameters>(
        txCharacteristicId,
        rxCharacteristicId,
        "param_list",
      ),
    {
      use: [
        parser((raw: string) => {
          const dataClasses: Robot.Parameters = new Map();

          const [, ...results] = raw.slice(0, -1).split("\n");
          for (const line of results) {
            const match = line.match(
              /^\s\d+\s-\s(\w+)\.(\w+):\s(.*)$/,
            ) as RegExpMatchArray;

            if (match) {
              const [, className, parameterName, value] = match;
              if (!dataClasses.has(className)) {
                dataClasses.set(className, new Map());
              }
              dataClasses.get(className)?.set(parameterName, value || "");
            }
          }

          return dataClasses;
        }),
        responseData,
      ],
    },
  );

  async function refresh() {
    return await mutate();
  }

  async function install(dataClasses: Robot.Parameters) {
    return await mutate(async (current?: Robot.Parameters) => {
      const error = new RuntimeError({
        message: "Ocorreu um erro durante a instalação dos parâmetros.",
        action:
          "A leitura dos parâmetros não foi completa. Recarregue os parâmetros na dashboard para checar os valores atuais.",
      });

      if (!current) {
        throw error;
      }

      for (const [className, parameters] of dataClasses.entries()) {
        for (const [parameterName, value] of parameters.entries()) {
          const status = await bleClient.request<string>(
            txCharacteristicId,
            rxCharacteristicId,
            `param_set ${className}.${parameterName} ${value}`,
          );
          if (status !== "OK") {
            throw error;
          }

          dataClasses.get(className)?.set(parameterName, value);

          /**
           * Dar um tempo para o robô concluir o processamento do último comando
           */
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return dataClasses;
    });
  }

  return {
    dataClasses,
    error,
    isLoading,
    isValidating,
    refresh,
    install,
  };
}

export function useParameter(
  bleClient: RobotBleClient<unknown>,
  txCharacteristicId: string,
  rxCharacteristicId: string,
  className: string,
  parameter: string,
  initialValue?: Robot.ParameterValue,
): UseRobotParameterReturn {
  const state = useState(initialValue);
  /**
   * Valor atual do parâmetro.
   */
  const value = state[0];
  const setValue = state[1];

  /**
   * Define o valor do parâmetro no robô.
   *
   * @param value Novo valor do parâmetro.
   * @returns {Promise} `Promise` com os parâmetros atualizados.
   */
  async function set(newValue: string | number): Promise<void> {
    if (value === newValue) {
      return;
    }

    const r = await bleClient.request<Robot.Response<string>>(
      txCharacteristicId,
      rxCharacteristicId,
      `param_set ${className}.${parameter} ${valueToString(newValue)}`,
    );

    if (r.data !== "OK") {
      throw new RuntimeError({
        message: `Ocorreu um erro durante a atualização do ${className}.${parameter}.`,
        action:
          "Recarregue os parâmetros na dashboard para checar o valor atual do parâmetro",
      });
    }

    setValue(
      await bleClient.request<string>(
        txCharacteristicId,
        rxCharacteristicId,
        `param_get ${className}.${parameter}`,
      ),
    );
  }

  return [value, set] as const;
}
