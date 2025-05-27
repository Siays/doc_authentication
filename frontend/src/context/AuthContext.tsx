import React, { createContext, useState } from "react";
import type { ReactNode } from "react";
import axiosClient from "../services/axiosClient";

export interface User {
  email: string;
  is_super: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
  //   // Simulate login (replace with API call)
  //   if (email === "admin@example.com") {
  //     setUser({ email, is_super: true });
  //   } else {
  //     setUser({ email, is_super: false });
  //   }
  // };

  try{
    await axiosClient.post("/login", {email, password});
    
    const { data } = await axiosClient.get("/user");
    setUser(data);
  }


  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
