'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User type based on your Prisma schema
interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN';
  isRegular: boolean;
  totalSpent: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current session on mount
  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    await fetchSession();
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

// Custom hook to use the session
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Example usage component
function ExampleUsage() {
  const { user, isLoading, isAuthenticated, login, logout } = useSession();

  if (isLoading) {
    return <div className="p-4">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Not logged in</h2>
        <button
          onClick={() => login('user@example.com', 'password')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Welcome, {user?.fullName}!</h2>
      <div className="text-sm text-gray-600 mb-4">
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
        <p>Total Spent: ₦{user?.totalSpent.toFixed(2)}</p>
        {user?.isRegular && (
          <p className="text-green-600 font-semibold">⭐ Regular Customer</p>
        )}
      </div>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}