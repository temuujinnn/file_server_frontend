import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getUser,
  clearTokens,
  clearUser,
  isAuthenticated as checkAuth,
  setUser,
} from "../services/auth";
import {fetchUserProfile} from "../services/api";
import type {User} from "../types/index";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAuth = () => {
    console.log("Refreshing authentication state...");
    setIsLoading(true);

    try {
      const currentUser = getUser();
      const authStatus = checkAuth();

      console.log("Auth refresh - User:", currentUser);
      console.log("Auth refresh - Is authenticated:", authStatus);

      setUser(currentUser);
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    console.log("Login called with user:", userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log("Logout called");
    clearTokens();
    clearUser();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  // Check authentication status on mount
  useEffect(() => {
    refreshAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
