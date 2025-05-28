import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './router.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import LoadingScreen from './components/LoadingScreen.tsx'
import { useAuth } from './hooks/useAuth.ts'

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

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
