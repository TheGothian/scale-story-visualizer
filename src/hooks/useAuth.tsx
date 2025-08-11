
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Minimal user type for custom auth
export type AuthUser = {
  id: string;
  email: string;
  display_name?: string | null;
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setAuth: (token: string, user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'custom_auth_token';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from token
  const loadFromToken = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('custom-auth-me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (error || !data?.user) {
      console.error('custom-auth-me error', error);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } else {
      setUser(data.user as AuthUser);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFromToken();
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        loadFromToken();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setAuth = (token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
