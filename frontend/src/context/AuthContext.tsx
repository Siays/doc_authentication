// context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface User {
  email: string;
  isSuper: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Replace with your real login logic/API call
    if (email === "admin@example.com") {
      setUser({ email, isSuper: true });
    } else {
      setUser({ email, isSuper: false });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
