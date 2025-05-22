import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import GuestLayout from "./components/GuestLayout";
import SignupPage from "./pages/SignupPage";

const router = createBrowserRouter(
    [
        {
            path:'/',
            element: <GuestLayout />,
            children:[
                {
                    path:'/login',
                    element: <LoginPage />
                },
                {
                    path:'/signup',
                    element: <SignupPage />
                },
            ] 
        }
    ]
);

export default router;