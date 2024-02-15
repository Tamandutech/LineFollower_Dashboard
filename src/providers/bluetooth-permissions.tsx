import { BluetoothPermissionsContext } from "@/contexts/bluetooth-permissions";
import { type PropsWithChildren, useContext, useEffect, useState } from "react";

type UseBluetoothPermissionsReturn = {
  /**
   * O resultado da solicitação de permissões.
   */
  result: RequestBluetoothPermissionsResult | null;

  /**
   * A função para solicitar permissões.
   */
  request: () => Promise<void>;

  /**
   * Indica se a solicitação de permissões está em andamento.
   */
  isRequesting: boolean;
};

/**
 * Hook para obter o estado das permissões da dashboard sobre o
 * Bluetooth do dispositivo.
 */
export function useBluetoothPermissions(): UseBluetoothPermissionsReturn {
  const [requestPermissionsResult, requestPermissions] = useContext(
    BluetoothPermissionsContext,
  );
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    async function doRequest() {
      setIsRequesting(true);
      try {
        await requestPermissions();
      } finally {
        setIsRequesting(false);
      }
    }

    if (requestPermissionsResult === null) {
      doRequest();
    }
  }, [requestPermissionsResult, requestPermissions]);

  return {
    result: requestPermissionsResult,
    request: requestPermissions,
    isRequesting,
  };
}

type BluetoothPermissionsProviderProps = PropsWithChildren<{
  requestStrategy: RequestBluetoothPermissionsStrategy;
}>;

export default function BluetoothPermissionsContextProvider({
  children,
  requestStrategy,
}: BluetoothPermissionsProviderProps) {
  const [requestPermissionsResult, setRequestPermissionsResult] =
    useState<RequestBluetoothPermissionsResult | null>(null);

  async function requestPermissions() {
    const result = await requestStrategy.execute();
    setRequestPermissionsResult(result);
  }

  return (
    <BluetoothPermissionsContext.Provider
      value={[requestPermissionsResult, requestPermissions]}
    >
      {children}
    </BluetoothPermissionsContext.Provider>
  );
}
