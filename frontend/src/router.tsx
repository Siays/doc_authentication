import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import GuestLayout from "./components/GuestLayout";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import HomePage from "./pages/HomePage";
import NewDocument from "./pages/NewDocument";
import CreateUser from "./pages/CreateUser";
import EditDocumentIndex from "./pages/EditPages/EditDocumentIndex";
import AuthenticateDocumentIndex from "./pages/AuthenticatePages/AuthenticateDocumentIndex";
import RequireSuperUser from "./components/RequireSuperUser";
import RequireGuest from "./components/RequireGuest";
import RequireAuth from "./components/RequireAuth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/login",
        element: (
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        ),
      },

    ],
  },
  {
    path: "/",
    element: <RequireAuth><AuthenticatedLayout /></RequireAuth>, // Requires user to be logged in
    children: [
      {
        path: "home-page",
        element: <HomePage />,
      },
      {
        path: "new-document",
        element: <NewDocument />,
      },
      {
        path: "edit-document",
        element: <EditDocumentIndex />,
      },
      {
        path: "authenticate-document",
        element: <AuthenticateDocumentIndex />,
      },
      {
        path: "create-user", // accesible only by super user
        element: (
          <RequireSuperUser>
            <CreateUser />
          </RequireSuperUser>
        ),
      },
    ],
  },
]);

export default router;
