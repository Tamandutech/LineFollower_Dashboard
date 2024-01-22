import { BaseError } from "@/errors";

export class RuntimeError extends BaseError {
  constructor(
    { message, action, cause }: Partial<Errors.ErrorOptions> = {},
    ...args: Array<string | undefined>
  ) {
    super(
      {
        message: message || "Ocorreu um erro no robô",
        action:
          action ||
          "Verifique se há erros não sendo tratados no microcontrolador do robô.",
        cause,
      },
      ...args,
    );
  }
}

export class DeviceNotFoundError extends BaseError {
  constructor(
    { message, action, cause }: Partial<Errors.ErrorOptions> = {},
    ...args: Array<string | undefined>
  ) {
    super(
      {
        message: message || "Robô não encontrado",
        action:
          action || "Certifique-se de o robô está ligado e aceitando conexões.",
        cause,
      },
      ...args,
    );
  }
}

export class DeviceError extends BaseError {
  constructor(
    { message, action, cause }: Partial<Errors.ErrorOptions> = {},
    ...args: Array<string | undefined>
  ) {
    super(
      {
        message:
          message ||
          "Ocorreu um erro durante o processamento da mensagem pelo robô",
        action:
          action ||
          "Verifique se o robô está processando os comandos corretamente.",
        cause,
      },
      ...args,
    );
  }
}

export class ConnectionError extends BaseError {
  constructor(
    { message, action, cause }: Partial<Errors.ErrorOptions> = {},
    ...args: Array<string | undefined>
  ) {
    super(
      {
        message: message || "Ocorreu um erro durante a conexão com o robô",
        action: action || "Verifique a conexão com o robô.",
        cause,
      },
      ...args,
    );
  }
}

export class CharacteristicWriteError extends BaseError {
  constructor(
    { message, action, cause }: Partial<Errors.ErrorOptions> = {},
    ...args: Array<string | undefined>
  ) {
    super(
      {
        message: message || "Ocorreu um erro durante o envio de dados ao robô",
        action: action || "Verifique a configuração da conexão com o robô.",
        cause,
      },
      ...args,
    );
  }
}

export class TimeoutError extends BaseError {
  constructor(
    { message, action, cause }: Partial<Errors.ErrorOptions> = {},
    ...args: Array<string | undefined>
  ) {
    super(
      {
        message:
          message || "O robô demorou tempo demais para responder aos comandos.",
        action:
          action ||
          "Verifique se o robô ainda está conectado e tente novamente.",
        cause,
      },
      ...args,
    );
  }
}

export class PermissionsNotGranted extends BaseError {
  constructor(
    { message, action, cause }: Partial<Errors.ErrorOptions> = {},
    ...args: Array<string | undefined>
  ) {
    super(
      {
        message:
          message || "Permissões para acesso a Bluetooth não concedidas.",
        action:
          action || "Conceda as permissões necessárias e tente novamente.",
        cause,
      },
      ...args,
    );
  }
}
