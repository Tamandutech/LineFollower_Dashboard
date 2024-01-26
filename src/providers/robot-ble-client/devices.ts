import { type BleManager, type Device, ScanMode } from "react-native-ble-plx";
import { DeviceNotFoundError } from "./errors";

abstract class RequestDeviceStrategy<TDevice, TBluetoothManager>
  implements RequestRobotDeviceStrategy<TDevice>
{
  constructor(protected readonly manager: TBluetoothManager) {}
  abstract execute(services: string[], namePrefix: string): Promise<TDevice>;
}

export class RequestDeviceNativeStrategy
  extends RequestDeviceStrategy<Device, BleManager>
  implements RequestRobotDeviceStrategy<Device>
{
  async execute(_: string[], namePrefix: string): Promise<Device> {
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
  async execute(
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
