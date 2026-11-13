import React, { createContext, useState, useEffect, useCallback } from "react";
import { api, getStoredTokens, setStoredTokens } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("placetrace_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens?.access) {
      setLoading(false);
      return;
    }
    try {
      const profileData = await api.auth.me();
      setUser(profileData);
      localStorage.setItem("placetrace_user", JSON.stringify(profileData));
    } catch (err) {
      if (err.status === 401) {
        setStoredTokens(null);
        localStorage.removeItem("placetrace_user");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials) => {
    const res = await api.auth.login(credentials);
    setStoredTokens(res.tokens);
    setUser(res.user);
    localStorage.setItem("placetrace_user", JSON.stringify(res.user));
    return res.user;
  };

  const register = async (payload) => {
    const res = await api.auth.register(payload);
    setStoredTokens(res.tokens);
    setUser(res.user);
    localStorage.setItem("placetrace_user", JSON.stringify(res.user));
    return res;
  };

  const logout = async () => {
    const tokens = getStoredTokens();
    try {
      if (tokens?.refresh) {
        await api.auth.logout(tokens.refresh);
      }
    } catch {
      // Ignore logout network error and clear local state
    } finally {
      setStoredTokens(null);
      localStorage.removeItem("placetrace_user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
