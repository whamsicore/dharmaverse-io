import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession, getUser, signOut } from '../utils/auth';

// Define types
interface User {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: () => {},
  logout: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      try {
        setLoading(true);
        const currentUser = await getUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Failed to authenticate');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Redirect to Google sign-in
  const login = () => {
    window.location.href = '/api/auth/signin/google';
  };

  // Sign out user
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 