import {
  BleNativeClient,
  BleWebClient,
} from "@/providers/robot-ble-client/clients";
import { randomUUID } from "expo-crypto";
import { TextEncoder } from "fastestsmallesttextencoderdecoder";
import type { BleManager, Characteristic, Device } from "react-native-ble-plx";

const SERVICE_MOCK_UUID = "aa3e85f8-3190-4135-a9c9-ef57dffb6ab1";

const TX_MOCK_UUID = "2605f8fa-b404-4837-b139-ac90594915ee";
const TX_MOCK_ID = "UART_TX";

const RX_MOCK_UUID = "22e10aa3-eece-4345-a958-e795d974d6f1";
const RX_MOCK_ID = "UART_RX";

const configMock = {
  services: {} as Robot.BluetoothConnectionConfig["services"],
} as Robot.BluetoothConnectionConfig;
configMock.services[SERVICE_MOCK_UUID] = {};
configMock.services[SERVICE_MOCK_UUID][TX_MOCK_ID] = TX_MOCK_UUID;
configMock.services[SERVICE_MOCK_UUID][RX_MOCK_ID] = RX_MOCK_UUID;

describe("RobotBleNativeClient", () => {
  function getCharacteristicMock(
    uuid: string,
    type: "TX" | "RX",
    value?: string,
  ): jest.Mocked<Characteristic> {
    return {
      id: (Math.random() * 1000).toFixed(0),
      uuid,
      value: value,
      isReadable: type === "TX",
      isWritableWithResponse: type === "RX",
      isWritableWithoutResponse: type === "RX",
      isNotifiable: type === "TX",
      isNotifying: type === "TX",
      serviceUUID: SERVICE_MOCK_UUID,
      serviceID: randomUUID(),
      service: jest.fn(),
      monitor: jest.fn(),
      read: jest.fn(),
      write: jest.fn(),
      writeWithResponse: jest.fn(),
      writeWithoutResponse: jest.fn(),
    } as unknown as jest.Mocked<Characteristic>;
  }

  let mockedDevice: Device;
  let mockedManager: BleManager;
  let mockedCharacteristics: Map<string, jest.Mocked<Characteristic>>;
  let client: BleNativeClient;

  beforeEach(() => {
    mockedCharacteristics = new Map([
      [TX_MOCK_ID, getCharacteristicMock(TX_MOCK_UUID, "TX")],
      [RX_MOCK_ID, getCharacteristicMock(RX_MOCK_UUID, "RX")],
    ]);
    mockedDevice = {
      id: "mocked-device",
      name: "mocked-device",
      serviceUUIDs: [SERVICE_MOCK_UUID],
      isConnected: jest.fn(() => Promise.resolve(true)),
      discoverAllServicesAndCharacteristics: jest.fn(),
      services: jest.fn(() => Promise.resolve([jest.fn()])),
      characteristicsForService: jest.fn(() =>
        Promise.resolve(mockedCharacteristics.values()),
      ),
    } as unknown as Device;
    mockedManager = {
      cancelDeviceConnection: jest.fn(),
      connectToDevice: jest.fn(() => Promise.resolve(mockedDevice)),
      isDeviceConnected: jest.fn(() => Promise.resolve(true)),
    } as unknown as BleManager;
    client = new BleNativeClient(mockedManager);
  });

  describe("connect", () => {
    it("should connect to the device", async () => {
      await client.connect(mockedDevice, configMock);
      expect(mockedManager.connectToDevice).toHaveBeenCalledWith(
        mockedDevice.id,
      );
    });

    it("should throw an error if no service is discovered", async () => {
      mockedDevice.services = jest.fn(() => Promise.resolve([]));
      await expect(client.connect(mockedDevice, configMock)).rejects.toThrow(
        "Ocorreu um erro durante a conexão com o robô",
      );
    });

    it("should throw an error if no characteristic is discovered", async () => {
      mockedDevice.characteristicsForService = jest.fn(() =>
        Promise.resolve([]),
      );
      await expect(client.connect(mockedDevice, configMock)).rejects.toThrow(
        "Ocorreu um erro durante a conexão com o robô",
      );
    });

    it("should start to monitor TX characteristics", async () => {
      await client.connect(mockedDevice, configMock);
      for (const characteristic of mockedCharacteristics.values()) {
        if (characteristic.isNotifiable) {
          expect(characteristic.monitor).toHaveBeenCalled();
        }
      }
    });
  });

  describe("subscribeToTxCharacteristic", () => {
    it("should throw an error if the characteristic is not found", async () => {
      await client.connect(mockedDevice, configMock);
      expect(
        client.subscribeToTxCharacteristic("NOT_FOUND", jest.fn()),
      ).rejects.toThrow(
        "Foram encontrados problemas na comunicação com o robô.",
      );
    });

    it("should throw an error if the characteristic is not notifiable", async () => {
      await client.connect(mockedDevice, configMock);
      const characteristic = mockedCharacteristics.get(
        TX_MOCK_ID,
      ) as Characteristic;
      characteristic.isNotifiable = false;
      expect(
        client.subscribeToTxCharacteristic(TX_MOCK_ID, jest.fn()),
      ).rejects.toThrow(
        "Foram encontrados problemas na comunicação com o robô.",
      );
    });

    it("should throw an error if the device is not connected", async () => {
      await expect(
        client.subscribeToTxCharacteristic(TX_MOCK_ID, jest.fn()),
      ).rejects.toThrow("Não há conexão bluetooth.");
    });
  });

  describe("isConnected", () => {
    it("should return false if there is no device connected", () => {
      expect(client.isConnected()).resolves.toBe(false);
    });

    it("should return true if there is a device connected", async () => {
      await client.connect(mockedDevice, configMock);
      expect(client.isConnected()).resolves.toBe(true);
    });

    it("should return false if the device disconnects unexpectedly", async () => {
      mockedDevice.isConnected = jest.fn(() => Promise.resolve(false));
      await client.connect(mockedDevice, configMock);
      expect(client.isConnected()).resolves.toBe(false);
    });
  });

  describe("disconnect", () => {
    it("should disconnect from the device", async () => {
      await client.connect(mockedDevice, configMock);
      await client.disconnect();
      expect(mockedManager.cancelDeviceConnection).toHaveBeenCalledWith(
        mockedDevice.id,
      );
    });

    it("should not throw an error if there is no device connected", async () => {
      await expect(client.disconnect()).resolves.not.toThrow();
    });
  });

  describe("send", () => {
    it("should throw an error if the device is not connected", async () => {
      await expect(client.send(RX_MOCK_ID, "test")).rejects.toThrow(
        "Característica para leitura não encontrada.",
      );
    });

    it("should throw an error if the characteristic is not found", async () => {
      await client.connect(mockedDevice, configMock);
      expect(client.send("NOT_FOUND", "test")).rejects.toThrow(
        "Característica para leitura não encontrada.",
      );
    });

    it("should write the message to the characteristic", async () => {
      await client.connect(mockedDevice, configMock);
      await client.send(RX_MOCK_ID, "test");

      const characteristic = mockedCharacteristics.get(
        RX_MOCK_ID,
      ) as Characteristic;
      expect(characteristic.writeWithoutResponse).toHaveBeenCalledWith("test");
    });
  });

  describe("request", () => {
    it("should throw an error if the device is not connected", async () => {
      await expect(
        client.request(TX_MOCK_ID, RX_MOCK_ID, "test"),
      ).rejects.toThrow("Não há conexão bluetooth.");
    });

    it("should throw an error if the characteristic is not found", async () => {
      await client.connect(mockedDevice, configMock);
      expect(client.request(TX_MOCK_ID, "NOT_FOUND", "test")).rejects.toThrow(
        "Característica para leitura não encontrada.",
      );
    });
  });
});

describe("RobotBleWebClient", () => {
  function getCharacteristicMock(
    uuid: string,
    type: "TX" | "RX",
    value?: string,
  ): jest.Mocked<BluetoothRemoteGATTCharacteristic> {
    return {
      uuid,
      value: value,
      properties: {
        read: type === "TX",
        write: type === "RX",
        notify: type === "TX",
      },
      service: jest.fn(),
      startNotifications: jest.fn(),
      writeValueWithoutResponse: jest.fn(),
      addEventListener: jest.fn(),
    } as unknown as jest.Mocked<BluetoothRemoteGATTCharacteristic>;
  }

  let mockedDevice: BluetoothDevice;
  let mockedCharacteristics: Map<
    string,
    jest.Mocked<BluetoothRemoteGATTCharacteristic>
  >;
  let client: BleWebClient;

  beforeEach(() => {
    mockedCharacteristics = new Map([
      [TX_MOCK_ID, getCharacteristicMock(TX_MOCK_UUID, "TX")],
      [RX_MOCK_ID, getCharacteristicMock(RX_MOCK_UUID, "RX")],
    ]);
    mockedDevice = {
      id: "mocked-device",
      name: "mocked-device",
      gatt: {
        connected: true,
        connect: jest.fn(),
        disconnect: jest.fn(),
        getPrimaryService: jest.fn(() =>
          Promise.resolve({
            getCharacteristic: jest.fn((uuid) =>
              Promise.resolve(
                [...mockedCharacteristics.values()].find(
                  (characteristic) => characteristic.uuid === uuid,
                ),
              ),
            ),
          }),
        ),
      },
    } as unknown as BluetoothDevice;
    client = new BleWebClient();
  });

  describe("connect", () => {
    it("should connect to the device", async () => {
      await client.connect(mockedDevice, configMock);
      expect(mockedDevice.gatt?.connect).toHaveBeenCalled();
    });

    it("should throw an error when connection fails", async () => {
      const server = mockedDevice.gatt as BluetoothRemoteGATTServer;
      server.connect = jest.fn(() => {
        throw new Error("test");
      });
      await expect(client.connect(mockedDevice, configMock)).rejects.toThrow();
    });

    it("should throw an error if no service is discovered", async () => {
      const server = mockedDevice.gatt as BluetoothRemoteGATTServer;
      server.getPrimaryService = jest.fn(() => {
        throw new Error("test");
      });
      await expect(client.connect(mockedDevice, configMock)).rejects.toThrow();
    });

    it("should throw an error if no characteristic is discovered", async () => {
      const service = mockedDevice.gatt?.getPrimaryService as jest.Mock;
      service.mockReturnValueOnce({
        getCharacteristic: jest.fn(() => {
          throw new Error("test");
        }),
      });
      await expect(client.connect(mockedDevice, configMock)).rejects.toThrow();
    });

    it("should start to monitor TX characteristics", async () => {
      await client.connect(mockedDevice, configMock);
      for (const characteristic of mockedCharacteristics.values()) {
        if (characteristic.properties.notify) {
          expect(characteristic.addEventListener).toHaveBeenCalled();
        }
      }
    });
  });

  describe("isConnected", () => {
    it("should return false if there is no device connected", () => {
      expect(client.isConnected()).resolves.toBe(false);
    });

    it("should return true if there is a device connected", async () => {
      await client.connect(mockedDevice, configMock);
      expect(client.isConnected()).resolves.toBe(true);
    });
  });

  describe("disconnect", () => {
    it("should disconnect from the device", async () => {
      await client.connect(mockedDevice, configMock);
      await client.disconnect();
      expect(mockedDevice.gatt?.disconnect).toHaveBeenCalled();
    });

    it("should not throw an error if there is no device connected", async () => {
      await expect(client.disconnect()).resolves.not.toThrow();
    });
  });

  describe("subscribeToTxCharacteristic", () => {
    it("should throw an error if the characteristic is not found", async () => {
      await client.connect(mockedDevice, configMock);
      expect(
        client.subscribeToTxCharacteristic("NOT_FOUND", jest.fn()),
      ).rejects.toThrow(
        "Foram encontrados problemas na comunicação com o robô.",
      );
    });
  });

  describe("send", () => {
    it("should throw an error if the device is not connected", async () => {
      await expect(client.send(RX_MOCK_ID, "test")).rejects.toThrow(
        "Característica para leitura não encontrada.",
      );
    });

    it("should throw an error if the characteristic is not found", async () => {
      await client.connect(mockedDevice, configMock);
      expect(client.send("NOT_FOUND", "test")).rejects.toThrow(
        "Característica para leitura não encontrada.",
      );
    });

    it("should encode the message and write it into the characteristic", async () => {
      await client.connect(mockedDevice, configMock);
      await client.send(RX_MOCK_ID, "test");

      const characteristic = mockedCharacteristics.get(
        RX_MOCK_ID,
      ) as BluetoothRemoteGATTCharacteristic;
      expect(characteristic.writeValueWithoutResponse).toHaveBeenCalledWith(
        new TextEncoder().encode("test"),
      );
    });
  });

  describe("request", () => {
    it("should throw an error if the device is not connected", async () => {
      await expect(
        client.request(TX_MOCK_ID, RX_MOCK_ID, "test"),
      ).rejects.toThrow("Não há conexão bluetooth.");
    });

    it("should throw an error if the characteristic is not found", async () => {
      await client.connect(mockedDevice, configMock);
      expect(client.request(TX_MOCK_ID, "NOT_FOUND", "test")).rejects.toThrow(
        "Foram encontrados problemas na comunicação com o robô.",
      );
    });
  });
});
