import { type Observable, type UnaryFunction, filter, map, pipe } from "rxjs";

/**
 * Converte um `Observable` que emite `string`s em um `Observable`
 * que emite mensagens (utilizado para converter os dados que os robôs enviam
 * para mensagens estruturadas).
 */
export function dataToMessages(): UnaryFunction<
  Observable<string>,
  Observable<unknown>
> {
  let cache = "";
  return pipe(
    map((chunk: string) => {
      if (chunk.indexOf("\0") === -1) {
        cache += chunk;
        return null;
      }

      cache += chunk.split("\0").shift() ?? "";
      const messageJson = cache;
      cache = chunk.slice(chunk.indexOf("\0") + 1);
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
