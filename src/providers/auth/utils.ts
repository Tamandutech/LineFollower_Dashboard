import { NetworkError, createErrorForResponse } from "./errors";

/**
 * Busca o token de acesso do usuário no Github.
 *
 * @param {string} clientId Client ID da aplicação no Github.
 * @param {string} clientSecret Client Secret da aplicação no Github.
 * @param {string} code Código de autorização retornado pelo Github.
 * @returns {string} Token de acesso do usuário.
 * @throws {NetworkError} Se ocorrer um erro de conexão durante a requisição.
 * @throws {ServerError} Se ocorrer um erro interno no servidor do Github durante a requisição.
 * @throws {UnauthorizedError} Se o usuário não tiver acesso a uma conta no Github.
 */
export async function fetchGithubAccessToken(
  clientId: string,
  clientSecret: string,
  code: string,
): Promise<string> {
  const url = `https://github.com/login/oauth/access_token?code=${code}&client_id=${clientId}&client_secret=${clientSecret}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new NetworkError();
  }
  const error = createErrorForResponse(response);
  if (error) {
    throw error;
  }
  return (await response.json()).access_token;
}
