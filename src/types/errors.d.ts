declare namespace Errors {
  type ErrorOptions = {
    message: string;
    action: string;
    cause?: Error;
  };

  interface IError extends Error {
    /**
     * Mensagem descrevendo o erro.
     */
    readonly message: string;

    /**
     * Ação que o usuário deve tomar para resolver o erro.
     */
    readonly action: string;

    /**
     * Causa do erro.
     */
    readonly cause?: Error;
  }
}
