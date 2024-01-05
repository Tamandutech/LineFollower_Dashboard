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

export class UnauthorizedError extends BaseError {
  constructor(
    message = "Você não tem autorização para utilizar a dashboard.",
    cause?: Error,
  ) {
    super({
      message,
      action:
        "Certifique-se de você é um membro ativo da Tamandutech no Github.",
      cause,
    });
  }
}

export class ServerError extends BaseError {
  constructor(message = "Ocorreu um erro interno no servidor.", cause?: Error) {
    super({
      message,
      action: "Tente novamente mais tarde.",
      cause,
    });
  }
}

export class NetworkError extends BaseError {
  constructor(message = "Ocorreu um erro de conexão.", cause?: Error) {
    super({
      message,
      action: "Verifique sua conexão e tente novamente.",
      cause,
    });
  }
}
