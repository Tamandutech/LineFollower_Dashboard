import type { ConfirmActionModalState } from "@/components/ui/confirm-action-modal";
import { useState } from "react";

export type UseConfirmActionModalReturn = {
  /**
   * Estado do modal de confirmação de ação. Se for `null`, o modal não será exibido.
   */
  state: ConfirmActionModalState | null;

  /**
   * Indica se o modal está visível.
   */
  isRevealed: boolean;

  /**
   * Exibe o modal de confirmação de ação.
   */
  reveal: (state: ConfirmActionModalState) => void;
};

/**
 * Hook para controlar o estado do modal de confirmação de ação.
 */
export function useConfirmActionModal(): UseConfirmActionModalReturn {
  const [state, setState] = useState<ConfirmActionModalState | null>(null);
  const isRevealed = state !== null;

  function reveal(state: ConfirmActionModalState) {
    setState({
      ...state,
      onConfirm: () => {
        state.onConfirm();
        setState(null);
      },
      onCancel: () => {
        state.onCancel?.();
        setState(null);
      },
    });
  }

  return {
    state,
    reveal,
    isRevealed,
  };
}
