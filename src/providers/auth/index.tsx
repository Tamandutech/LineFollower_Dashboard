import { ServerError, UnauthorizedError } from "@/errors";
import { useFirebaseBackend } from "@/providers/firebase";
import {
  type AuthError,
  type User,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import type { ValidationResult } from "./validators";

export type AuthContextType = {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
  login(
    accessToken: string,
    validators: ((accessToken: string) => Promise<ValidationResult>)[],
  ): Promise<void>;
  logout(): Promise<void>;
};

export type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { auth: service } = useFirebaseBackend();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !isLoading && !!user;

  async function login(
    accessToken: string,
    validators: ((accessToken: string) => Promise<ValidationResult>)[] = [],
  ): Promise<void> {
    for (const validator of validators) {
      const [isValid, error] = await validator(accessToken);
      if (error) {
        throw error;
      }
      if (!isValid) {
        throw new UnauthorizedError();
      }
    }

    const oAuthCredential = service.provider.credential(accessToken);
    try {
      const userCredential = await signInWithCredential(
        service.instance,
        oAuthCredential,
      );
      setUser(userCredential.user);
    } catch (error) {
      throw new ServerError(
        "Ocorreu um erro ao fazer login.",
        error as AuthError,
      );
    }
  }

  async function logout() {
    try {
      await signOut(service.instance);
    } catch (error) {
      throw new ServerError(
        "Ocorreu um erro ao fazer logout.",
        error as AuthError,
      );
    }
    setUser(null);
  }

  useEffect(() => {
    return onAuthStateChanged(service.instance, (user) => {
      setUser(user);
      setIsLoading(false);
    });
  }, [service.instance]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
