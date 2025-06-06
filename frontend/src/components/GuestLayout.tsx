import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GuestLayout() {
  const { user } = useAuth();

  if (user){
    return <Navigate to="/home-page" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 b">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="h-15 w-auto mb-5"
          />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
