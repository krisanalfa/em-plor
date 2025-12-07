"use client";

import {
  useEffect,
  useState,
  ReactNode,
  createContext,
  useRef,
  useCallback,
  useContext,
} from "react";
import { ApolloProvider } from "@apollo/client/react";

import Login from "@/app/(auth)/login/page";
import { useAuthStore } from "@/lib/stores/auth.store";
import { apolloClient } from "@/lib/apollo";

import { useProfile } from "./hooks/auth";
import { XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { DeepPartial } from "@apollo/client/utilities";
import { IAccount } from "@em-plor/contracts";

// Create a context to provide authentication status to other components
interface AuthContextType {
  isAuthenticated: boolean;
  account: DeepPartial<IAccount> | undefined;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  account: undefined,
});

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuardProvider: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, token, setAccount } = useAuthStore();
  const { whoami, account } = useProfile();
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
      <div className="flex h-screen flex-col items-center justify-center bg-gray-800">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-cyan-500"></div>
        <h2 className="text-xl font-semibold text-gray-300">Loading...</h2>
        <p className="mt-2 text-gray-100">
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
    <AuthContext.Provider value={{ isAuthenticated, account }}>
      {children}
    </AuthContext.Provider>
  );
};

interface SnackbarContextType {
  (message: string, variant?: "success" | "error" | "warning" | "info"): void;
}

interface SnackbarProviderProps {
  children: ReactNode;
}

interface SnackbarState {
  show: boolean;
  message: string;
  variant: "success" | "error" | "warning" | "info";
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

const SNACKBAR_TIMER = 5000;

const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    show: false,
    message: "",
    variant: "success",
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, show: false }));
  };

  const showSnackbar = useCallback<SnackbarContextType>(
    (message, variant = "success") => {
      setSnackbar({ show: true, message, variant });

      // Clear the existing timer if it exists
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set a new timer to hide the snackbar after 5 seconds
      timerRef.current = setTimeout(() => {
        handleSnackbarClose();
        timerRef.current = null;
      }, SNACKBAR_TIMER);
    },
    [],
  );

  useEffect(() => {
    // Clean up the timer when the component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}

      <div
        className={classNames(
          "fixed bottom-8 left-1/2 flex min-h-12 max-w-[50vw] min-w-[300px] -translate-x-1/2 items-center justify-between gap-2 truncate rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-md transition-all",
          {
            ["bg-cyan-500"]: snackbar?.variant === "success",
            ["bg-red-500"]: snackbar?.variant === "error",
            ["bg-orange-500"]: snackbar?.variant === "warning",
            ["bg-blue-500"]: snackbar?.variant === "info",
            ["translate-y-[200%]"]: !snackbar?.show,
            ["translate-y-0"]: snackbar?.show,
          },
        )}
      >
        {snackbar?.message}
        <div
          className="cursor-pointer rounded-full p-1 hover:bg-black/20"
          onClick={handleSnackbarClose}
        >
          <XMarkIcon className="h-5 w-5" />
        </div>
      </div>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }

  return context;
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <SnackbarProvider>
        <AuthGuardProvider>{children}</AuthGuardProvider>
      </SnackbarProvider>
    </ApolloProvider>
  );
}
