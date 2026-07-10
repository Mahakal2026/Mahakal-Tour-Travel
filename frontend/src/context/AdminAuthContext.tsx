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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    }
  };

  const handleSilentRefresh = async () => {
    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/admin/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken = refreshResponse.data?.data?.token || refreshResponse.data?.token;
      if (newToken) {
        setToken(newToken);
        await fetchAdminDetails(newToken);
      }
    } catch (err) {
      // Ignore silent refresh error on mount (means no active cookie)
      console.log("No active refresh token session detected");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSilentRefresh();
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
