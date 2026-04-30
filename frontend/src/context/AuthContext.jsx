import { createContext, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authEvents } from "../lib/authEvents";
import * as api from "../lib/ezbiasApi";
import { useLoginModal } from "./LoginModalContext";

// Must match TOKEN_KEY in axiosInstance.js
const STORAGE_KEY = "ezbias_user";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

function clearAllStorage() {
  localStorage.removeItem(STORAGE_KEY);
  // Remove legacy keys if present
  localStorage.removeItem("ezbias_accessToken");
  localStorage.removeItem("ezbias_refreshToken");
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { openLoginModal } = useLoginModal();

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  // Listen for 401s from the axios interceptor and navigate via react-router
  // instead of doing a full-page reload.
  useEffect(() => {
    return authEvents.on("expired", () => {
      setUser(null);
      if (location.pathname !== "/") {
        navigate("/", { replace: true });
      }
      openLoginModal();
    });
  }, [navigate, location.pathname, openLoginModal]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        // Store user object — include token inside so axiosInstance can read it
        const userData = res.data?.user ?? res.data;
        const token = res.data?.accessToken ?? res.data?.token ?? null;
        persist({ ...userData, token });
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
      if (!res.success) {
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
    clearAllStorage();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, register, clearError, isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
