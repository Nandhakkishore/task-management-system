import React from "react";

export const StatsCard = ({ title, value, icon: Icon, color = "indigo", subtitle }) => {
  const colorStyles = {
    indigo: "from-indigo-500/10 to-purple-500/5 text-indigo-600 border-indigo-200",
    amber: "from-amber-500/10 to-orange-500/5 text-amber-600 border-amber-200",
    emerald: "from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-200",
    purple: "from-purple-500/10 to-pink-500/5 text-purple-600 border-purple-200",
    slate: "from-slate-100 to-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm glass-panel-hover transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br border ${colorStyles[color] || colorStyles.indigo}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl pointer-events-none"></div>
    </div>
  );
};
