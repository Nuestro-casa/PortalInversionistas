'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserSessionPersistence, inMemoryPersistence } from 'firebase/auth'
import { auth } from '../ConfigFirebase/firebase'
import { UserCredential } from "firebase/auth";
import { User } from "firebase/auth";


interface AuthContextType {
  singUp: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  user: User | null;
  userEmail: string | null;
  loading: boolean;
  setUserEmail: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
const authContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(authContext);
  if (!context) throw new Error('useAuth debe estar dentro del proveedor');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const singUp = async (email: string, password: string): Promise<UserCredential> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    setUser(credential.user);
    setUserEmail(email);
    return credential;
  };

  const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
      await setPersistence(auth, inMemoryPersistence);
      /*   await setPersistence(auth, inMemoryPersistence); */
      const credential = await signInWithEmailAndPassword(auth, email, password);
      setUser(credential.user);
      setUserEmail(email);
      // Almacenar información de autenticación en el localStorage
      localStorage.setItem('userEmail', email);  

      return credential;
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      throw error;
    }
  };



  /*   const logout = async (): Promise<void> => signOut(auth); */
  const logout = async (): Promise<void> => {
    // Realizar el logout en Firebase Authentication
    await signOut(auth);

    // Limpiar la información almacenada en el localStorage
    localStorage.removeItem('userEmail');

    // Limpiar el estado local de usuario y correo electrónico
    setUser(null);
    setUserEmail(null);
  };

    useEffect(() => {
      const storedEmail = localStorage.getItem('userEmail');
        
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (storedEmail) {
          // If there is a stored user, set the user and email
          setUser(currentUser);
          setUserEmail(storedEmail);
        }
        setLoading(false);
      });
    
      return () => unsubscribe();
    }, []);
    
  const contextValue: AuthContextType = {
    singUp,
    login,
    logout,
    user,
    userEmail,
    loading,
    setUserEmail,
    setUser,
  };

  return (
    <authContext.Provider value={contextValue}>
      {children}
    </authContext.Provider>
  )

}
/* Consumir el contexto */
export function useAuthContext() {
  return useContext(authContext);
}