import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginPayload, RegisterPayload } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [token, setToken] = useState<string | null>(authService.getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = authService.getStoredToken();
      if (storedToken) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          localStorage.setItem('rb_user', JSON.stringify(profile));
        } catch {
          // Token expired or invalid
          authService.clearSession();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (payload: LoginPayload): Promise<User> => {
    const res = await authService.login(payload);
    authService.saveSession(res);
    setUser(res.user);
    setToken(res.access_token);
    return res.user;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    const res = await authService.register(payload);
    authService.saveSession(res);
    setUser(res.user);
    setToken(res.access_token);
    return res.user;
  };

  const logout = () => {
    authService.clearSession();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getMe();
      setUser(profile);
      localStorage.setItem('rb_user', JSON.stringify(profile));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
