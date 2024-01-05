import { ServerError, UnauthorizedError } from ".";

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
