import { useAuth } from "@/providers/auth";
import { useFirebaseBackend } from "@/providers/firebase";
import {
  type DocumentReference,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import useSWR, { type KeyedMutator } from "swr";

export type UseSessionReturn = {
  /**
   * Sessão do usuário atual.
   */
  session?: Session;

  /**
   * Indica se a busca pela sessão está em andamento.
   */
  isLoading: boolean;

  /**
   * Erro ocorrido durante a busca pela sessão.
   */
  error: Error | null;

  /**
   * Atualiza a sessão do usuário.
   */
  mutate: KeyedMutator<Session | undefined>;
};

export type UseCompetitionReturn = {
  /**
   * Competição selecionada pelo usuário.
   */
  competition?: Competition;

  /**
   * Indica se a busca pela competição está em andamento.
   */
  isLoading: boolean;

  /**
   * Erro ocorrido durante a busca pela competição.
   */
  error: Error | null;

  /**
   * Atualiza a competição selecionada pelo usuário.
   */
  update: (ref: DocumentReference<Competition>) => Promise<void>;
};

export type UseSettingsReturn = {
  /**
   * Configurações do usuário.
   */
  settings: Settings;

  /**
   * Atualiza as configurações do usuário.
   */
  update: (settings: Partial<Settings>) => Promise<void>;
};

/**
 * Configurações padrão do usuário.
 */
const defaultSettings: Settings = {
  batteryStatusUpdateInterval: 60000,
  batteryLowWarningThreshold: 6000,
  batteryLowWarningInterval: 60000,
};

/**
 * Hook para acessar a sessão do usuário (preferências e competição atual).
 */
export function useSession(): UseSessionReturn {
  const { user } = useAuth();
  const { db } = useFirebaseBackend();
  const { data, error, isLoading, mutate } = useSWR(
    `/sessions/${user?.uid}`,
    async () => {
      if (!user) {
        return undefined;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const session = userDocSnapshot.data() as Session;

        return session;
      }

      const session: Session = {
        userId: user.uid,
        settings: defaultSettings,
        competition: null,
      };
      setDoc(userDocRef, session);

      return session;
    },
  );

  return {
    session: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook para acessar e atualizar a competição selecionada pelo usuário.
 */
export function useCompetition(): UseCompetitionReturn {
  const { db } = useFirebaseBackend();
  const { session, mutate } = useSession();
  const { data, error, isLoading } = useSWR(session?.competition, async () => {
    const competitionDocRef = session?.competition;
    if (!competitionDocRef) {
      return undefined;
    }

    const competitionDocSnapshot = await getDoc(competitionDocRef);
    if (competitionDocSnapshot.exists()) {
      const competition = competitionDocSnapshot.data() as Competition;
      return competition;
    }

    return undefined;
  });

  return {
    competition: data,
    isLoading,
    error,
    update: async (ref) => {
      await mutate(async (prev) => {
        if (!prev) {
          return undefined;
        }

        const userDocRef = doc(db, "users", prev.userId);
        await setDoc(
          userDocRef,
          { ...prev, competition: ref },
          { merge: true },
        );
      });
    },
  };
}

/**
 * Hook para acessar e atualizar as configurações do usuário.
 */
export function useSettings(): UseSettingsReturn {
  const { db } = useFirebaseBackend();
  const { session, mutate } = useSession();

  return {
    settings: session?.settings ?? defaultSettings,
    update: async (settings) => {
      await mutate(async (prev) => {
        if (!prev) {
          return undefined;
        }

        const userDocRef = doc(db, "users", prev.userId);
        await setDoc(
          userDocRef,
          { ...prev, settings: { ...prev.settings, ...settings } },
          { merge: true },
        );
      });
    },
  };
}
