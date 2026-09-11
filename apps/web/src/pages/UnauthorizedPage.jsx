import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft, LogOut, CheckSquare } from "lucide-react";

export const UnauthorizedPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isEmployee = user?.role === "employee";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 text-center">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600"></div>

          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-100 text-rose-600 shadow-lg shadow-rose-500/10 mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider mb-2">
            403 • Access Restricted
          </span>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Admin Privileges Required
          </h1>

          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            The page you are trying to access is restricted exclusively to <strong>System Administrators</strong>. Your account ({user?.email || "Employee"}) does not have clearance to view executive controls.
          </p>

          <div className="space-y-3">
            {isEmployee ? (
              <Link
                to="/employee"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <CheckSquare className="w-4 h-4" />
                Go to Employee Workspace
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign in with a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
