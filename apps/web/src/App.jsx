import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, ProtectedRoute, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { EmployeeDashboard } from "./pages/employee/EmployeeDashboard";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user?.role === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/employee" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Executive Workspace - Strictly Protected for Role: Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Employee Task Workspace - Strictly Protected for Role: Employee */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute requiredRole="employee">
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            {/* Legacy /dashboard path safely redirects based on active role */}
            <Route path="/dashboard" element={<RootRedirect />} />

            {/* 403 Forbidden Access Page */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
