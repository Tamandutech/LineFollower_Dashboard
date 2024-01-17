import { NetworkError, createErrorForResponse } from "./errors";

export type ValidationResult = [boolean, null] | [null, Errors.IError];

/**
 * Verifica se o usuário é um membro ativo da Tamandutech no Github.
 *
 * @param {string} gitHubAccessToken Token de acesso do usuário.
 * @returns {boolean} `true` se o usuário for um membro ativo da Tamandutech no Github.
 * @throws {NetworkError} Se ocorrer um erro de conexão durante a requisição.
 * @throws {ServerError} Se ocorrer um erro interno no servidor do Github durante a requisição.
 * @throws {UnauthorizedError} Se o usuário não tiver acesso a uma conta no Github.
 */
export async function isTamandutechMember(
  gitHubAccessToken: string,
): Promise<ValidationResult> {
  let response: Response;
  try {
    response = await fetch(
      "https://api.github.com/user/memberships/orgs/Tamandutech",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${gitHubAccessToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
  } catch (error) {
    return [null, new NetworkError()];
  }

  const error = createErrorForResponse(response);
  if (error) {
    return [null, error];
  }
  const membership = await response.json();
  return [membership.state === "active", null];
}
