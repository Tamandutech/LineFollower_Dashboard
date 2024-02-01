import { withTimeout } from "@/lib/promises";
import { type BleManager, type Device, ScanMode } from "react-native-ble-plx";
import { DeviceNotFoundError, TimeoutError } from "./errors";

abstract class RequestDeviceStrategy<TDevice, TBluetoothManager>
  implements RequestRobotDeviceStrategy<TDevice>
{
  protected static readonly DEFAULT_OPTIONS: RequestDeviceStrategyOptions = {
    timeout: 5000,
  };
  protected readonly options: RequestDeviceStrategyOptions;

  constructor(
    protected readonly manager: TBluetoothManager,
    options?: Partial<RequestDeviceStrategyOptions>,
  ) {
    this.options = { ...RequestDeviceStrategy.DEFAULT_OPTIONS, ...options };
  }

  async execute(services: string[], namePrefix: string): Promise<TDevice> {
    return await withTimeout(
      this.procedure(services, namePrefix),
      this.options.timeout,
      new TimeoutError({
        message: "O robô não foi encontrado.",
        action: "Certifique-se de que o robô está ligado e aceitando conexões.",
      }),
    );
  }

  protected abstract procedure(
    service: string[],
    namePrefix: string,
  ): Promise<TDevice>;
}

export class RequestDeviceNativeStrategy
  extends RequestDeviceStrategy<Device, BleManager>
  implements RequestRobotDeviceStrategy<Device>
{
  async procedure(_: string[], namePrefix: string): Promise<Device> {
    return await new Promise((resolve, reject) => {
      this.manager.startDeviceScan(
        null,
        { allowDuplicates: false, scanMode: ScanMode.LowLatency },
        (error, device) => {
          if (device?.name?.startsWith(namePrefix)) {
            this.manager.stopDeviceScan();
            if (error) {
              reject(new DeviceNotFoundError({ cause: error }));
            }
            resolve(device);
          }
        },
      );
    });
  }
}

export class RequestDeviceWebStrategy
  extends RequestDeviceStrategy<BluetoothDevice, Bluetooth>
  implements RequestRobotDeviceStrategy<BluetoothDevice>
{
  async procedure(
    services: string[],
    namePrefix: string,
  ): Promise<BluetoothDevice> {
    const device = await this.manager.requestDevice({
      filters: [{ namePrefix }],
      optionalServices: services,
    });
    if (!device) {
      throw new DeviceNotFoundError();
    }
    return device;
  }
}
