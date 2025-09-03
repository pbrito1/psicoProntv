// // src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/auth';
import api from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  role: 'ADMIN' | 'THERAPIST';
  company: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tacar_token');
    const userData = localStorage.getItem('tacar_user');
    if (token && userData) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  },[]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin(email, password);
      const { access_token, refresh_token, user } = response as { access_token: string; refresh_token?: string; user: User };
      localStorage.setItem('tacar_token', access_token);
      if (refresh_token) localStorage.setItem('tacar_refresh', refresh_token);
      localStorage.setItem('tacar_user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(user);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const response = await apiRegister(email, password, name);
      const { access_token, refresh_token, user } = response as { access_token: string; refresh_token?: string; user: User };
      localStorage.setItem('tacar_token', access_token);
      if (refresh_token) localStorage.setItem('tacar_refresh', refresh_token);
      localStorage.setItem('tacar_user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(user);
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    }
  };

  const logout = () => {
    apiLogout().finally(() => {
      setUser(null);
      localStorage.removeItem('tacar_token');
      localStorage.removeItem('tacar_refresh');
      localStorage.removeItem('tacar_user');
      delete api.defaults.headers.common['Authorization'];
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
