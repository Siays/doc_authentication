import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: React.ReactElement;
}

const RequireSuperUser = ({ children }: Props) => {
  const { user } = useAuth(); // Make sure this hook provides `user.isSuper`

  if (!user) {
    // Not logged in — redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!user.isSuper) {
    // Logged in but not a super user — redirect somewhere else
    return <Navigate to="/app/home-page" replace />;
  }

  // User is super — render the protected content
  return children;
};

export default RequireSuperUser;