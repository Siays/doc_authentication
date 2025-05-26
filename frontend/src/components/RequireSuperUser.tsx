import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

const RequireSuperUser = ({ children }: Props): ReactElement => {
  const { user } = useAuth();

  console.log("Checking access:", user);

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!user.is_super) {
    // Logged in but not super
    return <Navigate to="/home-page" replace />;
  }

  // Super user — allow access
  return children;
};

export default RequireSuperUser;