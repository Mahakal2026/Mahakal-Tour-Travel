"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { setAccessToken, adminApi } from "@/lib/adminApi";

interface AdminUser {
  email: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  accessToken: string;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

  const fetchAdminDetails = async (accessTokenStr: string) => {
    try {
      setAccessToken(accessTokenStr);
      const res = await adminApi.get("/admin/verify");
      if (res.data?.success && res.data?.data?.admin) {
        setUser(res.data.data.admin);
      }
    } catch (err) {
      console.error("Failed to verify token admin details", err);
      // Clean up on verification failure
      setAccessToken("");
      setUser(null);
      setToken("");
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
      }
    }
  };

  const initializeAuth = async () => {
    try {
      let currentToken = "";
      if (typeof window !== "undefined") {
        currentToken = localStorage.getItem("admin_token") || "";
      }

      if (currentToken) {
        setToken(currentToken);
        await fetchAdminDetails(currentToken);
      } else {
        // Fallback to silent refresh if no token in localStorage
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/admin/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshResponse.data?.data?.token || refreshResponse.data?.token;
        if (newToken) {
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_token", newToken);
          }
          setToken(newToken);
          await fetchAdminDetails(newToken);
        }
      }
    } catch (err) {
      console.log("No active refresh token session or verification failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // Guard routing on path change
  useEffect(() => {
    if (!isLoading) {
      const isAuthPath = pathname.startsWith("/admin");
      const isLoginPath = pathname === "/admin/login";

      if (isAuthPath && !isLoginPath && !token) {
        router.push("/admin/login");
      }
    }
  }, [pathname, token, isLoading, router]);

  const login = async (accessTokenStr: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_token", accessTokenStr);
    }
    setToken(accessTokenStr);
    await fetchAdminDetails(accessTokenStr);
    router.push("/admin");
  };

  const logout = async () => {
    try {
      await adminApi.post("/admin/logout");
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
      }
      setAccessToken("");
      setToken("");
      setUser(null);
      router.push("/admin/login");
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        accessToken: token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
