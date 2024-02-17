/**
 * Interface para um cliente Bluetooth Low Energy (BLE) para comunicação com robôs
 * via comandos.
 *
 * @template TDevice Tipo do dispositivo Bluetooth representando o robô.
 */
interface RobotBleClient<TDevice> {
  /**
   * Envia uma mensagem através de uma característica.
   *
   * @param {String} rxCharacteristicId ID da característica pela qual a mensagem será enviada.
   * @param {String} message Mensagem a ser enviada.
   *
   * @returns {Promise<void>}
   *
   * @throws {ConnectionError} Caso não seja possível enviar mensagens pela característica RX.
   * @throws {CharacteristicWriteError} Caso não seja possível escrever na característica RX.
   */
  send: (rxCharacteristicId: string, message: string) => Promise<void>;

  /**
   * @param {String} txCharacteristicId Característica onde o robô escreverá a resposta
   * @param {String} rxCharacteristicId Caraterística onde o comando será escrito
   * @param {String} command Comando a ser enviado
   *
   * @returns {Promise} Uma `Promise` que resolve com o novo valor da característica `txCharacteristicId`
   * quando o robô a altera como resposta ao comando enviado. Não chame esse método de forma
   * concorrente (em `.forEach(async () => ...)` ou `Promise.all(...)` por exemplo) pois o robô pode
   * não conseguir processar diversas alterações da característica RX em sequência.
   *
   * @throws {ConnectionError} Caso não seja possível enviar mensagens pela característica RX.
   *
   * @template T Tipo do valor esperado como resposta ao comando enviado.
   */
  request<T>(
    txCharacteristicId: string,
    rxCharacteristicId: string,
    command: string,
  ): Promise<T>;

  /**
   * @returns {Promise<Boolean>} `true` se o robô estiver conectado, `false` caso contrário.
   */
  isConnected(): Promise<boolean>;

  /**
   * Conecta ao robô.
   *
   * @param {Device} device Dispositivo Bluetooth representando o robô.
   * @param config Configuração da conexão.
   *
   * @throws {ConnectionError} Caso não seja possível conectar ao robô.
   */
  connect: (
    device: TDevice,
    config: Robot.BluetoothConnectionConfig,
  ) => Promise<void>;

  /**
   * Desconecta o dispositivo.
   */
  disconnect: () => void;

  /**
   * Adiciona um observador para uma característica de recebimento de dados (TX).
   *
   * @param {String} txCharacteristicId Identificador da característica TX.
   * @param {Function} observer Função que será chamada quando uma mensagem for recebida.
   *
   * @returns {Promise<Subscription>}
   *
   * @throws {ConnectionError} Caso não seja possível receber mensagens pela característica TX.
   *
   * @template T Tipo esperado da mensagem recebida.
   */
  subscribeToTxCharacteristic: <T>(
    txCharacteristicId: string,
    observer: (message: T) => void,
  ) => Promise<Subscription>;
}

type RequestDeviceStrategyOptions = {
  /**
   * Tempo máximo em milissegundos de espera para encontrar o robô.
   */
  timeout: number;
};

/**
 * Estratégia para parear com um robô que aceita conexões via bluetooth.
 *
 * @template TDevice Tipo do dispositivo Bluetooth representando o robô.
 */
interface RequestRobotDeviceStrategy<TDevice> {
  /**
   * @param {String[]} services Lista de serviços que o robô deve oferecer.
   * @param {String} namePrefix Prefixo do nome do robô.
   *
   * @returns {Promise<Device>} Dispositivo Bluetooth representando o robô.
   *
   * @throws {DeviceNotFoundError} Caso o robô não seja encontrado ou ocorra algum erro
   * durante o pareamento.
   */
  execute: (services: string[], namePrefix: string) => Promise<TDevice>;
}

type RequestBluetoothPermissionsResult =
  | {
      granted: true;
    }
  | {
      granted: false;
      action: string;
    };

interface RequestBluetoothPermissionsStrategy {
  /**
   * Solicita permissão ao usuário para acessar o Bluetooth no dispositivo.
   *
   * @returns {Promise<RequestBluetoothPermissionsResult>}
   */
  execute: () => Promise<RequestBluetoothPermissionsResult>;
}
