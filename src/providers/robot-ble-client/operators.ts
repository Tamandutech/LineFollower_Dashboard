import { type Observable, type UnaryFunction, filter, map, pipe } from "rxjs";
import { TextDecoder } from "text-encoding";

/**
 * Converte um `Observable` que emite `DataView`s ou `string`s em um `Observable`
 * que emite mensagens (utilizado para converter os dados que os robôs enviam
 * para mensagens estruturadas).
 */
export function dataToMessages(): UnaryFunction<
  Observable<DataView | string>,
  Observable<unknown>
> {
  const decoder = new TextDecoder();
  let cache = "";
  return pipe(
    map((chunk) =>
      chunk instanceof DataView
        ? decoder.decode(new Uint8Array(chunk.buffer))
        : chunk,
    ),
    map((chunkStr: string) => {
      if (chunkStr.indexOf("\0") === -1) {
        cache += chunkStr;
        return null;
      }

      cache += chunkStr.split("\0").shift() ?? "";
      const messageJson = cache;
      cache = chunkStr.slice(chunkStr.indexOf("\0") + 1);
      return messageJson;
    }),
    filter(
      (messageJson: string | null): messageJson is string =>
        messageJson !== null,
    ),
    map((messageJson: string) => messageJson.replaceAll("\n", "\\n")),
    map((messageJson: string) => JSON.parse(messageJson)),
  );
}
