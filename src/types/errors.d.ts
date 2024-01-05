declare namespace Errors {
  type ErrorOptions = {
    message: string;
    action: string;
    cause?: Error;
  };

  interface IError extends Error {
    readonly message: string;
    readonly action: string;
    readonly cause?: Error;
  }
}
