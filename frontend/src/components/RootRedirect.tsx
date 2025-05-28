import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RootRedirect() {
  const { user } = useAuth();

  if (user === null) {
    return <Navigate to="/login" />;
  }

  return <Navigate to="/home-page" />;
}