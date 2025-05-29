import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './router.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import LoadingScreen from './components/LoadingScreen.tsx'
import { useAuth } from './hooks/useAuth.ts'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    setShowGate(true); // Wait 1 render cycle to mount anything that uses context
  }, []);

  return showGate ? <AppWrapper /> : null;
}

function AppWrapper(){
  const { isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-center" />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
