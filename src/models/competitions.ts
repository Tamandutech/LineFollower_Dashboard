import { useFirebaseBackend } from "@/providers/firebase";
import {
  type DocumentReference,
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import useSWR from "swr";

export type CompetitionWithRef = Competition & {
  ref: DocumentReference<Competition>;
};

export type UseRobotsReturn = {
  /**
   * Lista de competições registradas.
   */
  competitions?: CompetitionWithRef[];

  /**
   * Erro ocorrido durante a busca pelas competições.
   */
  error: Error;

  /**
   * Indica se a busca pelas competições está em andamento.
   */
  isLoading: boolean;
};

export function useCompetitions(): UseRobotsReturn {
  const { db } = useFirebaseBackend();
  const { data, error, isLoading } = useSWR("/competitions", async () => {
    const collectionSnapshot = await getDocs(
      query(collection(db, "competitions")),
    );
    return collectionSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ref: doc.ref,
          ...doc.data(),
        }) as CompetitionWithRef,
    );
  });

  return {
    competitions: data,
    error,
    isLoading,
  };
}
