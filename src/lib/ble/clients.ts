import { Buffer } from "buffer";
import mitt from "mitt";
import type { BleManager, Characteristic, Device } from "react-native-ble-plx";
import {
  type Connectable,
  Observable,
  Subject,
  type Subscription,
  connectable,
  first,
} from "rxjs";
import { TextDecoder, TextEncoder } from "text-encoding";
import { CharacteristicWriteError, ConnectionError } from "./errors";
import { dataToMessages } from "./operators";

enum RobotBleClientEvent {
  DISCONNECTED = "disconnected",
}

abstract class BleClient<TDevice> implements RobotBleClient<TDevice> {
  /**
   * Configurações da conexão bluetooth.
   */
  protected config?: Robot.BluetoothConnectionConfig;

  /**
   * `Observable`s que emitem mensagens recebidas através de uma característica.
   */
  protected observables: Map<string, Connectable<unknown>> = new Map();

  /**
   * Dispositivo Bluetooth representando o robô.
   */
  protected device?: TDevice;

  /**
   * Emissor de eventos.
   */
  protected readonly emitter = mitt();

  abstract connect(
    device: TDevice,
    config: Robot.BluetoothConnectionConfig,
  ): Promise<void>;

  abstract isConnected(): Promise<boolean>;

  abstract disconnect(): Promise<void>;

  abstract send(rxCharacteristicId: string, message: string): Promise<void>;

  /**
   * Verifica se é possível receber mensagens pela característica TX.
   *
   * @param {String} txCharacteristicId ID da característica TX.
   * @returns {Promise<void>}
   * @throws {ConnectionError} Caso não seja possível receber mensagens pela característica TX.
   */
  protected abstract checkTxCharacteristic(
    txCharacteristicId: string,
  ): Promise<void>;

  /**
   * Conecta os `Observable`s das características TX e configura
   * callbacks para a sua finalização quando o robô for desconectado.
   */
  protected connectTxObservables() {
    for (const observable of this.observables.values()) {
      const subscription = observable.connect();
      this.emitter.on(RobotBleClientEvent.DISCONNECTED, () =>
        subscription.unsubscribe(),
      );
    }
  }

  async subscribeToTxCharacteristic(
    txCharacteristicId: string,
    observer: (message: unknown) => void,
  ): Promise<Subscription> {
    await this.checkTxCharacteristic(txCharacteristicId);
    return (
      this.observables.get(txCharacteristicId) as Observable<unknown>
    ).subscribe(observer);
  }

  async request<T>(
    txCharacteristicId: string,
    rxCharacteristicId: string,
    message: string,
  ): Promise<T> {
    await this.checkTxCharacteristic(txCharacteristicId);

    const observable = this.observables.get(
      txCharacteristicId,
    ) as Observable<T>;
    return await new Promise<T>((resolve, reject) => {
      observable.pipe(first()).subscribe(resolve);
      this.send(rxCharacteristicId, message).catch(reject);
    });
  }
}

export class BleNativeClient
  extends BleClient<Device>
  implements RobotBleClient<Device>
{
  private readonly characteristics: Map<string, Characteristic> = new Map();
  private readonly manager: BleManager;

  constructor(manager: BleManager) {
    super();
    this.manager = manager;
  }

  /**
   * Adiciona um `Observable` que emite mensagens recebidas através de uma característica.
   *
   * @param {String} id ID da característica TX.
   * @param {Characteristic} txCharacteristic Característica TX.
   */
  private setObservableForTxCharacteristic(
    id: string,
    txCharacteristic: Characteristic,
  ): void {
    const connectableObservable = connectable(
      new Observable<string>((subscriber) => {
        txCharacteristic.monitor((error, characteristic) => {
          if (error) {
            subscriber.error(
              new ConnectionError({
                cause: error,
                message:
                  "A conexão com o robô está falhando e as mensagens estão sendo perdidas.",
              }),
            );
          } else if (characteristic?.value) {
            subscriber.next(
              Buffer.from(characteristic.value, "base64").toString("utf-8"),
            );
          }
        });
      }).pipe(dataToMessages()),
      { connector: () => new Subject(), resetOnDisconnect: false },
    );
    this.observables.set(id, connectableObservable);
  }

  async connect(device: Device, config: Robot.BluetoothConnectionConfig) {
    this.device = device;

    try {
      await this.manager.connectToDevice(device.id);
      await device.discoverAllServicesAndCharacteristics();

      const services = await device.services();
      if (services.length === 0) {
        throw new Error(
          "Não foi possível encontrar os serviços do dispositivo.",
        );
      }

      for (const [uuid, characteristicIdToUuidMap] of Object.entries(
        config.services,
      )) {
        const characteristics = await device.characteristicsForService(uuid);
        if (characteristics.length === 0) {
          throw new Error(
            "Não foi possível encontrar as características do serviço.",
          );
        }

        for (const characteristic of characteristics) {
          for (const [characteristicId, characteristicUuid] of Object.entries(
            characteristicIdToUuidMap,
          )) {
            if (characteristicUuid === characteristic.uuid) {
              this.characteristics.set(characteristicId, characteristic);

              if (characteristicId.endsWith("TX")) {
                this.setObservableForTxCharacteristic(
                  characteristicId,
                  characteristic,
                );
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new ConnectionError({ cause: error });
      }
    }

    this.connectTxObservables();
  }

  async isConnected(): Promise<boolean> {
    return (await this.device?.isConnected()) ?? Promise.resolve(false);
  }

  async disconnect() {
    if (this.device) {
      this.observables.clear();
      this.characteristics.clear();
      await this.manager.cancelDeviceConnection(this.device.id);
      this.emitter.emit(RobotBleClientEvent.DISCONNECTED);
    }
  }

  async send(rxCharacteristicId: string, message: string): Promise<void> {
    if (!this.characteristics.has(rxCharacteristicId)) {
      throw new ConnectionError({
        message: "Característica para leitura não encontrada.",
        action: "Verifique se as características estão disponíveis no robô.",
      });
    }

    try {
      await this.characteristics
        .get(rxCharacteristicId)
        ?.writeWithoutResponse(Buffer.from(message).toString("base64"));
    } catch (error) {
      if (error instanceof Error) {
        throw new CharacteristicWriteError({ cause: error });
      }
    }
  }

  protected async checkTxCharacteristic(
    txCharacteristicId: string,
  ): Promise<void> {
    if (!(await this.isConnected())) {
      throw new ConnectionError({
        message: "Não há conexão bluetooth.",
        action: "Conecte a dashboard a um seguidor de linha.",
      });
    }

    if (
      !this.characteristics.has(txCharacteristicId) ||
      !this.characteristics.get(txCharacteristicId)?.isNotifiable ||
      !this.observables.has(txCharacteristicId)
    ) {
      throw new ConnectionError({
        message: "Foram encontrados problemas na comunicação com o robô.",
        action:
          "Verifique se as configurações da interface bluetooth do robô estão corretas.",
      });
    }
  }
}

export class BleWebClient
  extends BleClient<BluetoothDevice>
  implements RobotBleClient<BluetoothDevice>
{
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();
  private readonly characteristics: Map<
    string,
    BluetoothRemoteGATTCharacteristic
  > = new Map();

  /**
   * Adiciona um `Observable` que emite mensagens recebidas através de uma característica.
   *
   * @param {String} id ID da característica TX.
   * @param {Characteristic} txCharacteristic Característica TX.
   */
  private setObservableForTxCharacteristic(
    id: string,
    txCharacteristic: BluetoothRemoteGATTCharacteristic,
  ): void {
    const connectableObservable = connectable(
      new Observable<string>((subscriber) => {
        txCharacteristic.addEventListener("characteristicvaluechanged", () => {
          if (txCharacteristic.value) {
            subscriber.next(
              this.decoder.decode(
                new Uint8Array(txCharacteristic.value.buffer),
              ),
            );
          }
        });
      }).pipe(dataToMessages()),
      { connector: () => new Subject(), resetOnDisconnect: false },
    );
    this.observables.set(id, connectableObservable);
  }

  async connect(
    device: BluetoothDevice,
    config: Required<Robot.BluetoothConnectionConfig>,
  ) {
    this.device = device;
    this.config = config;

    try {
      if (!device.gatt) {
        throw new Error(
          "Há problemas na configuração da interface bluetooth do robô.",
        );
      }

      await device.gatt.connect();

      for (const [uuid, characteristics] of Object.entries(config.services)) {
        const uartService = await device.gatt.getPrimaryService(uuid);

        for (const [id, uuid] of Object.entries(characteristics)) {
          const characteristic = await uartService.getCharacteristic(uuid);
          this.characteristics.set(id, characteristic);
          if (id.endsWith("TX")) {
            await characteristic.startNotifications();
            this.setObservableForTxCharacteristic(id, characteristic);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new ConnectionError({ cause: error });
      }
    }

    this.connectTxObservables();
  }

  async isConnected(): Promise<boolean> {
    return await Promise.resolve(this.device?.gatt?.connected ?? false);
  }

  async disconnect() {
    if (this.device?.gatt?.connected) {
      this.observables.clear();
      this.characteristics.clear();
      await this.device.gatt.disconnect();
    }
  }

  async send(rxCharacteristicId: string, message: string): Promise<void> {
    if (!this.characteristics.has(rxCharacteristicId)) {
      throw new ConnectionError({
        message: "Característica para leitura não encontrada.",
        action: "Verifique se as características estão disponíveis no robô.",
      });
    }

    try {
      await this.characteristics
        .get(rxCharacteristicId)
        ?.writeValueWithoutResponse(this.encoder.encode(message));
    } catch (error) {
      if (error instanceof Error) {
        throw new CharacteristicWriteError({ cause: error });
      }
    }
  }

  protected async checkTxCharacteristic(
    txCharacteristicId: string,
  ): Promise<void> {
    if (!(await this.isConnected())) {
      throw new ConnectionError({
        message: "Não há conexão bluetooth.",
        action: "Conecte a dashboard a um seguidor de linha.",
      });
    }

    if (
      !this.characteristics.has(txCharacteristicId) ||
      !this.characteristics.get(txCharacteristicId)?.properties.read ||
      !this.characteristics.get(txCharacteristicId)?.properties
        .writeWithoutResponse ||
      !this.observables.has(txCharacteristicId)
    ) {
      throw new ConnectionError({
        message: "Foram encontrados problemas na comunicação com o robô.",
        action:
          "Verifique se as configurações da interface bluetooth do robô estão corretas.",
      });
    }
  }
}
