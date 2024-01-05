import ErrorModal from "@/components/overlay/error-modal";
import { type ReactNode, useEffect, useState } from "react";

export type UseErrorModalReturn = ReactNode;

/**
 * Retorna um modal descrevendo o erro. O modal é exibido quando o erro não for nulo.
 *
 * @param error Erro a ser notificado ao usuário
 * @param onClose Função a ser executada ao fechar o modal
 * @returns {UseErrorModalReturn} Modal descrevendo o erro
 */
export function useErrorModal(
  error: Errors.IError | null,
  onClose: () => void,
): UseErrorModalReturn {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (error) {
      setShow(true);
    }
  }, [error]);

  return error && <ErrorModal error={error} isOpen={show} onClose={onClose} />;
}
