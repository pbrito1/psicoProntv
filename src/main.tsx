import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext'
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
    <Toaster />
  </AuthProvider>
);