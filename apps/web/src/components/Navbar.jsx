import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckSquare, LogOut, Shield, User, Zap } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-lg font-black text-slate-900 tracking-tight">Task<span className="text-indigo-600">Flow</span></span>
                <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-widest">Enterprise Pro</span>
              </div>
            </Link>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center ml-8 space-x-1">
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  location.pathname === "/admin" || location.pathname === "/dashboard"
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Tasks Dashboard
              </Link>
            </nav>
          </div>

          {/* User Account Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-100/80 border border-slate-200">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs uppercase flex items-center justify-center shadow-sm">
                {user?.name ? user.name.slice(0, 2) : "US"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-extrabold text-slate-900 leading-tight">{user?.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                    isAdmin ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  }`}>
                    {isAdmin ? <Shield className="w-2.5 h-2.5 mr-0.5" /> : <User className="w-2.5 h-2.5 mr-0.5" />}
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-all text-xs font-semibold flex items-center gap-1.5"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
