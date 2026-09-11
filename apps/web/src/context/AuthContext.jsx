import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me");
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data?.success) {
        const { user: userData, token } = res.data;
        if (token) {
          localStorage.setItem("token", token);
        }
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      let message = err.response?.data?.error;
      if (!message) {
        if (err.message === "Network Error" || !err.response) {
          message = "Cannot reach server. If the backend is waking up from sleep, please try again in 10-20 seconds.";
        } else {
          message = "Failed to log in. Please check your credentials.";
        }
      }
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // Ignore logout api failure and clear local state
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    authError,
    login,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (requiredRole === "admin" && user?.role === "employee") {
      return <Navigate to="/unauthorized" replace />;
    }
    const defaultPath = user?.role === "admin" ? "/admin" : "/employee";
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};
