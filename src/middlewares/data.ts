import type { SWRHook } from "swr";
import parser from "./parser";

/**
 * Middleware para extrair os dados das respostas de um robô.
 */
export default function data<Data>(useSWRNext: SWRHook) {
  return parser<Robot.Response<Data>, Data>(
    (response: Robot.Response<Data>) => response.data,
  )(useSWRNext);
}
