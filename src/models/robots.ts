import { useFirebaseBackend } from "@/providers/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import useSWR from "swr";

export type UseRobotsReturn = {
  /**
   * Lista de robôs que implementam a interface de comandos.
   */
  robots?: Robot.BluetoothConnectionConfig[];

  /**
   * Erro ocorrido durante a busca pelos robôs disponíveis.
   */
  error: Error;

  /**
   * Indica se a busca pelos robôs está em andamento.
   */
  isLoading: boolean;
};

export function useRobots(): UseRobotsReturn {
  const { db } = useFirebaseBackend();
  const { data, error, isLoading } = useSWR("/robots", () =>
    getDocs(query(collection(db, "robots"))).then(
      (snapshot) =>
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Robot.BluetoothConnectionConfig[],
    ),
  );

  return {
    robots: data,
    error,
    isLoading,
  };
}
