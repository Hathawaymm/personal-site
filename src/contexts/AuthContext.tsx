"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Permissions } from "@/lib/permissions";
import { EMPTY_PERMISSIONS } from "@/lib/permissions";
import { parseTokenPayload } from "@/lib/token";

interface AuthState {
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  status: string;
  nickname: string;
  needsInit: boolean;
  permissions: Permissions;
  githubUser: { gid: string; login: string } | null;
}

interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    loading: true,
    isLoggedIn: false,
    isAdmin: false,
    status: "pending",
    nickname: "",
    needsInit: false,
    permissions: EMPTY_PERMISSIONS,
    githubUser: null,
  });

  const checkAuth = useCallback(async () => {
    const token = getCookie("github_token");
    if (!token) {
      setState({ loading: false, isLoggedIn: false, isAdmin: false, status: "pending", nickname: "", needsInit: false, permissions: EMPTY_PERMISSIONS, githubUser: null });
      return;
    }

    const ghUser = parseTokenPayload(token);
    if (!ghUser) {
      setState({ loading: false, isLoggedIn: false, isAdmin: false, status: "pending", nickname: "", needsInit: false, permissions: EMPTY_PERMISSIONS, githubUser: null });
      return;
    }

    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const perms = data.isAdmin ? EMPTY_PERMISSIONS : (data.permissions || EMPTY_PERMISSIONS);
        // Admin always has all permissions
        if (data.isAdmin) {
          Object.keys(perms).forEach(k => { perms[k as keyof typeof perms] = true; });
        }
        setState({
          loading: false,
          isLoggedIn: data.isLoggedIn === true,
          isAdmin: data.isAdmin === true,
          status: data.status || "pending",
          nickname: data.nickname || ghUser.login,
          needsInit: data.needsInit === true,
          permissions: perms,
          githubUser: ghUser,
        });
      } else {
        setState({
          loading: false,
          isLoggedIn: false,
          isAdmin: false,
          status: "pending",
          nickname: "",
          needsInit: false,
          permissions: EMPTY_PERMISSIONS,
          githubUser: null,
        });
      }
    } catch {
      setState({
        loading: false,
        isLoggedIn: false,
        isAdmin: false,
        status: "pending",
        nickname: "",
        needsInit: false,
        permissions: EMPTY_PERMISSIONS,
        githubUser: null,
      });
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async () => {
    try {
      const res = await fetch("/api/auth/github");
      if (!res.ok) throw new Error(`请求失败 (${res.status})`);
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("GitHub login error:", err);
    }
  };

  const logout = async () => {
    document.cookie = "github_token=; Path=/; Max-Age=0";
    setState({ loading: false, isLoggedIn: false, isAdmin: false, status: "pending", nickname: "", needsInit: false, permissions: EMPTY_PERMISSIONS, githubUser: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
