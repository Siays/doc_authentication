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

  try{
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    await axiosClient.post("/login", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  
    const { data } = await axiosClient.get("/user", {
      withCredentials: true,
    });

    setUser({
      email: data.email,
      is_super: data.is_super,
    });
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
