import { useEffect, useRef } from "react";
import type { BareFetcher, Key, SWRHook, SWRResponse } from "swr";
import type { SWRConfiguration } from "swr/_internal";

/**
 * Middleware para manter um histórico dos dados obtidos por um `SWRHook`.
 */
export default function historical<Data>(
  useSWRNext: SWRHook,
): <Error>(
  key: Key,
  fetcher: BareFetcher<Data> | null,
  config: SWRConfiguration<Data, Error, BareFetcher<Data>>,
) => SWRResponse<
  Data,
  Error,
  SWRConfiguration<Data, Error, BareFetcher<Data>>
> & { history: Data[] } {
  return (key, fetcher, config) => {
    const history = useRef<Data[]>([]);

    const swr = useSWRNext(key, fetcher, config);

    useEffect(() => {
      if (swr.data) {
        history.current.push(swr.data as Data);
      }
    }, [swr.data]);

    return Object.assign({}, swr, { history: history.current });
  };
}
