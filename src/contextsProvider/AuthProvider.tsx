import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { auth } from "../firebase/firebase.config";

import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

interface UpdateUserInfo {
  displayName?: string;
  photoURL?: string;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const provider = new GoogleAuthProvider();
  //   creat user
  const createUser = (email: string, password: string) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };
  const updateUser = (userInfo: UpdateUserInfo) => {
    if (auth.currentUser) {
      return updateProfile(auth.currentUser, userInfo);
    }
    return Promise.reject(new Error("No user is currently signed in"));
  };
  //console.log(user);
  //   log out
  const logOut = () => {
    return signOut(auth);
  };
  //   log in
  const logIn = (email: string, password: string) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };
  // log in with google (popup method)
  const logInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, provider);
  };

  // log in with google (redirect method - fallback for COOP issues)
  const logInWithGoogleRedirect = () => {
    setLoading(true);
    return signInWithRedirect(auth, provider);
  };

  // get redirect result
  const getGoogleRedirectResult = () => {
    return getRedirectResult(auth);
  };

  useEffect(() => {
    // Check for redirect result on app load
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("Google redirect sign-in successful:", result.user);
          // Handle successful redirect sign-in here if needed
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser && currentUser.email) {
        setEmail(currentUser.email);
      } else {
        setEmail("");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const authData = {
    createUser,
    updateUser,
    logIn,
    logOut,
    logInWithGoogle,
    logInWithGoogleRedirect,
    getGoogleRedirectResult,
    loading,
    setLoading,
    user,
    setUser,
    email,
  };
  return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>;
};
export default AuthProvider;
