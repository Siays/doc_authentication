import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RequireAuth({ children, firstLoginOnly = false }: { 
  children: JSX.Element, firstLoginOnly?: boolean; }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  
  console.log("RequireAuth ->", { path: location.pathname, user });


  if (!user) return <Navigate to="/login" replace />;

  if (firstLoginOnly && !user.first_time_login) {
    return <Navigate to="/home-page" replace />;
  }

  if (!firstLoginOnly && user.first_time_login) {
    return <Navigate to="/first-login" replace />;
  }

  return children;
}