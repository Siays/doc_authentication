import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return user ? children : <Navigate to="/login" replace />;
}