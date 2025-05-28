import type { ReactElement } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function RequireGuest({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  return user ? <Navigate to="/home-page" /> : children;
}