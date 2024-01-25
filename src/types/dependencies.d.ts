declare module "fastestsmallesttextencoderdecoder" {
  export class TextDecoder {
    decode(bytes: Uint8Array): string;
  }
  export class TextEncoder {
    encode(str: string): Uint8Array;
  }
}
