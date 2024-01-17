export class BaseError extends Error implements Errors.IError {
  readonly action: string;
  readonly message: string;
  readonly cause?: Error;

  constructor(
    { message, action, cause }: Errors.ErrorOptions,
    ...args: Array<string | undefined>
  ) {
    super(...args);
    this.message = message;
    this.action = action;
    this.cause = cause;
  }
}
