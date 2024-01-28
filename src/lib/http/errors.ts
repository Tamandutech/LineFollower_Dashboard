import { BaseError } from "@/errors";

export class UnauthorizedError extends BaseError {
  constructor(
    message = "Você não tem autorização para utilizar a dashboard.",
    cause?: Error,
  ) {
    super({
      message,
      action:
        "Certifique-se de você é um membro ativo da Tamandutech no Github.",
      cause,
    });
  }
}

export class ServerError extends BaseError {
  constructor(message = "Ocorreu um erro interno no servidor.", cause?: Error) {
    super({
      message,
      action: "Tente novamente mais tarde.",
      cause,
    });
  }
}

export class NetworkError extends BaseError {
  constructor(message = "Ocorreu um erro de conexão.", cause?: Error) {
    super({
      message,
      action: "Verifique sua conexão e tente novamente.",
      cause,
    });
  }
}

/**
 * @param {Response} response Resposta de uma requisição.
 * @returns {Errors.IError} Instância de `BaseError` dependendo do código de status da resposta:
 *
 * - `ServerError` se o código de status for maior que 500;
 * - `UnauthorizedError` se o código de status for igual a 403.
 */
export function createErrorForResponse(
  response: Response,
): Errors.IError | null {
  if (response.status > 500) {
    return new ServerError(
      "Ocorreu um erro ao tentar verificar sua atividade no Github.",
    );
  }
  if (response.status === 403) {
    return new UnauthorizedError(
      "Você precisa ter uma conta no Github para acessar a dashboard.",
    );
  }
  return null;
}
