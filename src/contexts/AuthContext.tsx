import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserDto, RegisterDto } from "@/types";
import { apiClient, authApi } from "@/lib/api";
import { getUserFromToken } from "@/lib/jwt";

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userNameOrEmail: string, password: string) => Promise<UserDto>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        apiClient.setToken(storedToken);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (userNameOrEmail: string, password: string): Promise<UserDto> => {
    try {
      const response = await authApi.login(userNameOrEmail, password);
      
      // Backend returns { Token: "...", Message?: "..." } or { token: "...", user?: {...} }
      const token = (response as any).Token || (response as any).token;
      
      if (!token) {
        throw new Error("No token received from server");
      }

      // Use dedicated utility to extract user info including role
      const userData = getUserFromToken(token, userNameOrEmail);
      
      apiClient.setToken(token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const response = await authApi.register(data);
      
      // Similar to login, extract token
      const token = (response as any).Token || (response as any).token;
      
      if (!token) {
        throw new Error("No token received from server");
      }

      // Use dedicated utility
      const userData = getUserFromToken(token, data.email);
      
      apiClient.setToken(token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const token = apiClient.getToken();
    if (token) {
      try {
        const userData = getUserFromToken(token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        console.error("Error refreshing user:", error);
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
