import type { Middleware, SWRHook } from "swr";

/**
 * Middleware para processar os dados obtidos pelo SWR.
 *
 * @param {Function} fn Função que processa os dados. Ela é chamada apenas
 * quando o SWR obtém os dados com sucesso.
 * @returns {Middleware} O middleware que processa os dados.
 */
export default function parser<Data, Parsed>(
  fn: (data: Data) => Parsed,
): Middleware {
  return (useSWRNext: SWRHook) => (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config);
    return Object.assign({}, swr, {
      data: swr.data ? fn(swr.data as Data) : undefined,
    });
  };
}
