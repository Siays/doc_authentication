import { useContext } from "react";
import { AuthContext, type User } from "../context/AuthContext";

// Define the shape of the context (if not imported from AuthContext directly)
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};