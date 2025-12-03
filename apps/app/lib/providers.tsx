"use client";

import { useEffect, useState, ReactNode, createContext } from "react";
import { ApolloProvider } from "@apollo/client/react";

import Login from "@/app/(auth)/login/page";
import { useAuthStore } from "@/lib/stores/auth.store";
import { apolloClient } from "@/lib/apollo";

import { useProfile } from "./hooks/auth";

// Create a context to provide authentication status to other components
interface AuthContextType {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
});

interface AuthGuardProps {
  children: ReactNode;
}

function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, token, setAccount } = useAuthStore();
  const { whoami } = useProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!token) {
          setValidToken(false);
        } else {
          const { data } = await whoami();
          if (data?.whoami) {
            setAccount(data.whoami);
            setValidToken(true);
          } else {
            setValidToken(false);
          }
        }
      } catch {
        setValidToken(false);
      } finally {
        setTimeout(() => setIsLoading(false), 100);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-300">Loading...</h2>
        <p className="text-gray-100 mt-2">
          Please wait while we verify your session
        </p>
      </div>
    );
  }
  // If not authenticated, show login page
  if (!validToken) {
    return <Login />;
  }

  // If authenticated, provide auth context to children
  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthGuard>{children}</AuthGuard>
    </ApolloProvider>
  );
}
