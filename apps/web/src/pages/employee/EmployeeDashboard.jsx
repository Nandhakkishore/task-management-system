import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "../../components/Navbar";
import { PriorityBadge, StatusBadge } from "../../components/Badge";
import { Pagination } from "../../components/Pagination";
import {
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";

export const EmployeeDashboard = () => {
  const { user } = useAuth();

  // If an admin navigates to /employee, redirect to /admin
  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  // Fetch employee tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["myTasks", search, statusFilter, priorityFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      params.append("page", page);
      params.append("limit", limit);

      const res = await api.get(`/tasks?${params.toString()}`);
      return res.data.data;
    },
    keepPreviousData: true,
  });

  // Mutation: Optimistic Status Update
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      return res.data;
    },
    onMutate: async ({ taskId, newStatus }) => {
      await queryClient.cancelQueries(["myTasks"]);
      const previousData = queryClient.getQueryData(["myTasks", search, statusFilter, priorityFilter, page]);

      if (previousData) {
        queryClient.setQueryData(["myTasks", search, statusFilter, priorityFilter, page], {
          ...previousData,
          items: previousData.items.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          ),
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["myTasks", search, statusFilter, priorityFilter, page],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["myTasks"]);
    },
  });

  const handleStatusChange = (taskId, newStatus) => {
    updateStatusMutation.mutate({ taskId, newStatus });
  };

  const items = tasksData?.items || [];
  const total = tasksData?.total || 0;

  const notStartedCount = items.filter((t) => t.status === "not_started").length;
  const inProgressCount = items.filter((t) => t.status === "in_progress").length;
  const completedCount = items.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Personal Task Workspace
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name || "Employee"}! 👋
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Review your assigned tasks, update work statuses, and meet project deadlines.
            </p>
          </div>
        </div>

        {/* Stat Counter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Assigned Tasks</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{total}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Not Started</div>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">{notStartedCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm">
            <div className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">In Progress</div>
            <div className="text-2xl font-extrabold text-amber-800 mt-1">{inProgressCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm">
            <div className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-extrabold text-emerald-800 mt-1">{completedCount}</div>
          </div>
        </div>

        {/* Task List Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Filters */}
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search my tasks..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 shadow-sm"
              >
                <option value="">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 shadow-sm"
              >
                <option value="">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-4 px-6">Task Title & Details</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        <span>Loading your tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500">
                      <p className="font-extrabold text-slate-800">You currently have no tasks assigned.</p>
                      <p className="text-xs text-slate-400 mt-1">Enjoy your day or check back later!</p>
                    </td>
                  </tr>
                ) : (
                  items.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 max-w-sm">
                        <div className="font-bold text-slate-900 text-sm">{task.title}</div>
                        {task.description && (
                          <div className="text-slate-500 text-xs mt-1 leading-relaxed">{task.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono font-medium">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="bg-white border border-slate-300 hover:border-indigo-600 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors cursor-pointer shadow-sm"
                        >
                          <option value="not_started">⚪ Not Started</option>
                          <option value="in_progress">🟡 In Progress</option>
                          <option value="completed">🟢 Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={tasksData?.totalPages || 1}
            total={total}
            limit={limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </main>
    </div>
  );
};
