import React, { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import axiosClient from "../services/axiosClient";

export interface User {
  email: string;
  is_super: boolean;
  name: string;
  profile_picture: string | null;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
    await fetchUser();
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

const fetchUser = async () => {
  try {
    const { data } = await axiosClient.get("/user", {
      withCredentials: true,
    });

    setUser({
      email: data.email,
      is_super: data.is_super,
      name: data.account_holder_name,
      profile_picture: data.profile_picture,
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    setUser(null);
  }finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchUser();
}, []);

  return (
    <AuthContext.Provider value={{ user, login, isLoading}}>
      {children}
    </AuthContext.Provider>
  );
};
