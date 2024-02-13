import ErrorModal from "@/components/overlay/error-modal";
import {
  type ComponentProps,
  type ComponentType,
  type JSXElementConstructor,
  type ReactNode,
  useEffect,
  useState,
} from "react";

export type UseErrorModalReturn = ReactNode;

export type ErrorModalWrapperProps<
  P,
  C extends keyof JSX.IntrinsicElements | JSXElementConstructor<P>,
> = ComponentProps<C> & { onError: (error: Errors.IError) => void };

/**
 * Retorna um modal descrevendo o erro. O modal é exibido quando o erro não for nulo.
 *
 * @param error Erro a ser notificado ao usuário
 * @param onClose Função a ser executada ao fechar o modal
 * @returns {UseErrorModalReturn} Modal descrevendo o erro
 */
export function useErrorModal(
  error: Errors.IError | null | undefined,
  onClose?: () => void,
): UseErrorModalReturn {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (error) {
      setShow(true);
    }
  }, [error]);

  function handleClose() {
    setShow(false);
    if (onClose) {
      onClose();
    }
  }

  return (
    error && <ErrorModal error={error} isOpen={show} onClose={handleClose} />
  );
}

/**
 * Adiciona um modal de erro ao componente, que é exibido ao usuário quando a
 * callback na propriedade `onError` é chamada.
 *
 * @param {ComponentType} Component Componente a ser envolvido
 * @returns Componente envolvido com o modal de erro
 */
export function withErrorModal<
  T extends {
    onError: (error: Errors.IError) => void;
  } & JSX.IntrinsicAttributes,
>(Component: ComponentType<T>) {
  return function ErrorModalWrapper(
    props: ErrorModalWrapperProps<T, ComponentType<T>>,
  ): ReturnType<typeof useErrorModal> {
    const [error, setError] = useState<Errors.IError | null>(null);

    function onClose() {
      setError(null);
    }

    return (
      <>
        <Component {...props} onError={setError} />
        {useErrorModal(error, onClose)}
      </>
    );
  };
}
