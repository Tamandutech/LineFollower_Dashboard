import { useEffect, useRef } from "react";
import type { BareFetcher, Middleware, SWRResponse } from "swr";
import type { SWRConfiguration } from "swr/_internal";

export type HistoricalSWRResponse<Data, Error> = SWRResponse<
  Data,
  Error,
  SWRConfiguration<Data, Error, BareFetcher<Data>>
> & { history: Data[] };

/**
 * Middleware para manter um histórico dos dados obtidos por um `SWRHook`.
 */
const historical: Middleware = (useSWRNext) => {
  return (key, fetcher, config) => {
    const history = useRef<ReturnType<Exclude<typeof fetcher, null>>[]>([]);

    const swr = useSWRNext(key, fetcher, config);

    useEffect(() => {
      if (swr.data) {
        history.current.push(swr.data);
      }
    }, [swr.data]);

    return Object.assign({}, swr, { history: history.current });
  };
};

export default historical;
