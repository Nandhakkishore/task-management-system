import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-slate-50/70 border-t border-slate-200 rounded-b-2xl">
      <div className="text-xs font-semibold text-slate-500">
        Showing <span className="font-extrabold text-slate-900">{startItem}</span> to{" "}
        <span className="font-extrabold text-slate-900">{endItem}</span> of{" "}
        <span className="font-extrabold text-slate-900">{total}</span> tasks
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </button>

        <span className="px-3 py-1 text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold shadow-sm"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
