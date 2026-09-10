import React from "react";

export const PriorityBadge = ({ priority }) => {
  const styles = {
    high: "bg-rose-50 text-rose-700 border-rose-200 shadow-sm",
    medium: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
        styles[priority] || styles.medium
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          priority === "high"
            ? "bg-rose-500 animate-pulse"
            : priority === "medium"
            ? "bg-amber-500"
            : "bg-emerald-500"
        }`}
      ></span>
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const labels = {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const styles = {
    not_started: "bg-slate-100 text-slate-700 border-slate-200",
    in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
        styles[status] || styles.not_started
      }`}
    >
      {labels[status] || status}
    </span>
  );
};
