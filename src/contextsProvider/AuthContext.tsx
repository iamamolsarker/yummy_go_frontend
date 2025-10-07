import { createContext } from "react";
import type { User, UserCredential } from "firebase/auth";

interface UpdateUserInfo {
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  createUser: (email: string, password: string) => Promise<UserCredential>;
  updateUser: (userInfo: UpdateUserInfo) => Promise<void>;
  logIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
  logInWithGoogle: () => Promise<UserCredential>;
  logInWithGoogleRedirect: () => Promise<never>;
  getGoogleRedirectResult: () => Promise<UserCredential | null>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  email: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);