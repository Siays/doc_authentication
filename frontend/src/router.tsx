import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import GuestLayout from "./components/GuestLayout";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import HomePage from "./pages/HomePage";
import NewDocument from "./pages/NewDocument";
import CreateUser from "./pages/CreateUserPage";
import EditDocumentIndex from "./pages/EditPages/EditDocumentIndex";
import AuthenticateDocumentIndex from "./pages/AuthenticatePages/AuthenticateDocumentIndex";
import AuthenticateUploadPage from "./pages/AuthenticatePages/AuthenticateUploadPage";
import RequireSuperUser from "./components/RequireSuperUser";
import RequireGuest from "./components/RequireGuest";
import RequireAuth from "./components/RequireAuth";
import ModifyUserPage from "./pages/ModifyUserPage";
import RootRedirect from "./components/RootRedirect";
import EditDocument from "./pages/EditPages/EditDocument";
import RecoverDocument from "./pages/RecoverDocument";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "",
        element: <RootRedirect />
      },
      {
        path: "login",
        element: (
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        ),
      },

    ],
  },
  {
    path: "first-login",  //first time login after user creation
    element: (
      <RequireAuth firstLoginOnly>
        <ModifyUserPage />
      </RequireAuth>
    )
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
        path: "edit-document/edit/:doc_encrypted_id",
        element: <EditDocument />,
      },
      {
        path: "authenticate-document",
        element: <AuthenticateDocumentIndex />,
      },
      {
        path: "authenticate-document/upload/:doc_encrypted_id",
        element: <AuthenticateUploadPage />,
      },
      {
        path: "recover-document", // accesible only by super user
        element: (
          <RequireSuperUser>
            <RecoverDocument />
          </RequireSuperUser>
        ),
      },
      {
        path: "create-user", // accesible only by super user
        element: (
          <RequireSuperUser>
            <CreateUser />
          </RequireSuperUser>
        ),
      },
      {
        path: "modify-user", // user menu version
        element: <ModifyUserPage />,
      },
    ],
  },
]);

export default router;
