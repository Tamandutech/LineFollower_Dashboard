import { useCallback, useEffect, useRef } from "react";
import type { Middleware } from "swr";

/**
 * Middleware para utilizar dados antigos enquanto os novos não são validados.
 */
const laggy: Middleware = (useSWRNext) => (key, fetcher, config) => {
  const laggyDataRef = useRef<ReturnType<Exclude<typeof fetcher, null>>>();

  const swr = useSWRNext(key, fetcher, config);

  useEffect(() => {
    if (swr.data) {
      laggyDataRef.current = swr.data;
    }
  }, [swr.data]);

  const resetLaggy = useCallback(() => {
    laggyDataRef.current = undefined;
  }, []);

  const dataOrLaggyData =
    swr.data === undefined ? laggyDataRef.current : swr.data;

  const isLagging =
    swr.data === undefined && laggyDataRef.current !== undefined;

  return Object.assign({}, swr, {
    data: dataOrLaggyData,
    isLagging,
    resetLaggy,
  });
};

export default laggy;
