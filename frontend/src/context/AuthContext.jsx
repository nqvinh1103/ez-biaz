import { createContext, useCallback, useState } from "react";
import * as api from "../lib/ezbiasApi";

const STORAGE_KEY = "ezbias_user";
const ACCESS_TOKEN_KEY = "ezbias_accessToken";
const REFRESH_TOKEN_KEY = "ezbias_refreshToken";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

function persistTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        // Backend returns: { user, accessToken, refreshToken, ... }
        persist(res.data.user);
        persistTokens(res.data.accessToken, res.data.refreshToken);
      } else {
        setError(res.message);
      }
      return res;
    } catch (err) {
      const msg = err.message ?? "Login failed.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.register(userData);
      if (res.success) {
        persist(res.data.user);
        persistTokens(res.data.accessToken, res.data.refreshToken);
      } else {
        setError(res.message);
      }
      return res;
    } catch (err) {
      const msg = err.message ?? "Registration failed.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    persist(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, register, isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
