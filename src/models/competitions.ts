import { useFirebaseBackend } from "@/providers/firebase";
import {
  type DocumentReference,
  type FirestoreDataConverter,
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import useSWR from "swr";

export type CompetitionWithRef = Competition & {
  ref: DocumentReference<Competition>;
  toString(): string;
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

/**
 * Conversor de dados do Firestore para competições.
 */
export const converter: FirestoreDataConverter<CompetitionWithRef> = {
  toFirestore(competition: CompetitionWithRef) {
    return {
      name: competition.name,
      year: competition.year,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as Competition;
    return {
      ...data,
      id: snapshot.id,
      ref: snapshot.ref,
      toString() {
        return `${this.name} (${this.year})`;
      },
    } as CompetitionWithRef;
  },
};

export function useCompetitions(): UseRobotsReturn {
  const { db } = useFirebaseBackend();
  const { data, error, isLoading } = useSWR("/competitions", async () => {
    const collectionSnapshot = await getDocs(
      query(collection(db, "competitions").withConverter(converter)),
    );
    return collectionSnapshot.docs.map((doc) => doc.data());
  });

  return {
    competitions: data,
    error,
    isLoading,
  };
}
