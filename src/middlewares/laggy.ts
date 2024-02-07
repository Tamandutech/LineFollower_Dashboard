import { useCallback, useEffect, useRef } from "react";
import type {
  BareFetcher,
  Key,
  SWRConfiguration,
  SWRHook,
  SWRResponse,
} from "swr";

/**
 * Middleware para utilizar dados antigos enquanto os novos não são validados.
 */
export default function laggy<Data>(
  useSWRNext: SWRHook,
): <Error>(
  key: Key,
  fetcher: BareFetcher<Data> | null,
  config: SWRConfiguration<Data, Error, BareFetcher<Data>>,
) => SWRResponse<
  Data,
  Error,
  SWRConfiguration<Data, Error, BareFetcher<Data>>
> {
  return (key, fetcher, config) => {
    const laggyDataRef = useRef<Data>();

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
}
