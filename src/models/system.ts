import { useState } from "react";

export type UseRobotSystemReturn = {
  /**
   * Pausa o robô, fazendo ele parar de se mover.
   *
   * @returns `Promise` vazia que resolve quando o robô é pausado.
   * @throws {RuntimeError} Se ocorrer um erro durante a pausa do robô.
   */
  pause: () => Promise<void>;

  /**
   * Retoma a execução do robô, fazendo ele voltar a se mover.
   *
   * @returns `Promise` vazia que resolve quando o robô retoma a execução.
   * @throws {RuntimeError} Se ocorrer um erro durante a retomada da execução do robô.
   */
  resume: () => Promise<void>;

  /**
   * Alterna o estado do robô entre pausado e em execução.
   *
   * @returns `Promise` vazia que resolve quando o estado do robô é alterado.
   * @throws {RuntimeError} Se ocorrer um erro durante a alteração do estado do robô.
   */
  toggle: () => Promise<void>;

  /**
   * Estado atual do sistema do robô.
   */
  isPaused: boolean;
};

/**
 * Hook para gerenciar o sistema do robô.
 *
 * @param {RobotBleClient<unknown>} bleClient Adaptador para comunicação bluetooth
 * @param {String} txCharacteristicId ID da característica de transmissão
 * @param {String} rxCharacteristicId ID da característica de recepção
 * @returns {UseRobotSystemReturn}
 */
export const useRobotSystem = (
  bleClient: RobotBleClient<unknown>,
  txCharacteristicId: string,
  rxCharacteristicId: string,
): UseRobotSystemReturn => {
  const [isPaused, setIsPaused] = useState(false);

  async function pause() {
    await bleClient.request<string>(
      txCharacteristicId,
      rxCharacteristicId,
      "pause",
    );
    setIsPaused(true);
  }

  async function resume() {
    await bleClient.request<string>(
      txCharacteristicId,
      rxCharacteristicId,
      "resume",
    );
    setIsPaused(false);
  }

  async function toggle() {
    if (isPaused) {
      await resume();
    } else {
      await pause();
    }
  }

  return {
    pause,
    resume,
    toggle,
    isPaused,
  };
};
