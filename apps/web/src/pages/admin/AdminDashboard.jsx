import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Navbar } from "../../components/Navbar";
import { StatsCard } from "../../components/StatsCard";
import { PriorityBadge, StatusBadge } from "../../components/Badge";
import { Pagination } from "../../components/Pagination";
import { Modal } from "../../components/Modal";
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  Plus,
  Users,
  Search,
  Filter,
  UserPlus,
  AlertCircle,
  Loader2,
} from "lucide-react";

export const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // Filter & Pagination state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  // Modal visibility states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isCreateEmployeeView, setIsCreateEmployeeView] = useState(false);

  // New Task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "not_started",
    assignedToId: "",
    dueDate: "",
  });

  // New Employee form state
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "Engineering",
  });

  const [formError, setFormError] = useState("");

  // Fetch Dashboard Stats
  const { data: statsData } = useQuery({
    queryKey: ["taskStats"],
    queryFn: async () => {
      const res = await api.get("/tasks/stats");
      return res.data.stats;
    },
    refetchInterval: 10000,
  });

  // Fetch Task List with pagination & filters
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["adminTasks", search, statusFilter, priorityFilter, page],
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

  // Fetch Employees list for dropdowns and employee management
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await api.get("/employees");
      return res.data.employees;
    },
  });

  // Mutation: Create Task
  const createTaskMutation = useMutation({
    mutationFn: async (taskPayload) => {
      const res = await api.post("/tasks", taskPayload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminTasks"]);
      queryClient.invalidateQueries(["taskStats"]);
      setIsAssignModalOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        status: "not_started",
        assignedToId: "",
        dueDate: "",
      });
      setFormError("");
    },
    onError: (err) => {
      setFormError(err.response?.data?.error || "Failed to create task");
    },
  });

  // Mutation: Create Employee
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeePayload) => {
      const res = await api.post("/employees", employeePayload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      setIsCreateEmployeeView(false);
      setNewEmployee({
        name: "",
        email: "",
        password: "",
        role: "employee",
        department: "Engineering",
      });
      setFormError("");
    },
    onError: (err) => {
      const details = err.response?.data?.details;
      if (details) {
        setFormError(Object.values(details).join(", "));
      } else {
        setFormError(err.response?.data?.error || "Failed to create employee");
      }
    },
  });

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTask.assignedToId) {
      setFormError("Please select an employee to assign this task to.");
      return;
    }
    setFormError("");
    createTaskMutation.mutate(newTask);
  };

  const handleCreateEmployeeSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    createEmployeeMutation.mutate(newEmployee);
  };

  const stats = statsData || { total: 0, not_started: 0, in_progress: 0, completed: 0 };
  const taskItems = tasksData?.items || [];
  const employees = employeesData || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Executive Workspace</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Manage team assignments, employee accounts, and task progress.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFormError("");
                setIsEmployeeModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-extrabold shadow-sm transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              Manage Employees
            </button>

            <button
              onClick={() => {
                setFormError("");
                setIsAssignModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl btn-gradient text-white text-xs font-extrabold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Assign New Task
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Tasks" value={stats.total} icon={CheckSquare} color="indigo" subtitle="Active tasks in system" />
          <StatsCard title="Not Started" value={stats.not_started} icon={Clock} color="slate" subtitle="Pending assignment execution" />
          <StatsCard title="In Progress" value={stats.in_progress} icon={PlayCircle} color="amber" subtitle="Currently being worked on" />
          <StatsCard title="Completed" value={stats.completed} icon={CheckCircle2} color="emerald" subtitle="Successfully finished tasks" />
        </div>

        {/* Task Search, Filters, and Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Filter Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search tasks by title..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors shadow-sm"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
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
              </div>

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
                  <th className="py-4 px-6">Task Title & Description</th>
                  <th className="py-4 px-6">Assigned Employee</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasksLoading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        <span>Loading workspace tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : taskItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      <p className="font-extrabold text-slate-800">No tasks found matching query.</p>
                      <p className="text-xs text-slate-400 mt-1">Try clearing filters or assign a new task.</p>
                    </td>
                  </tr>
                ) : (
                  taskItems.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-bold text-slate-900 text-sm">{task.title}</div>
                        {task.description && (
                          <div className="text-slate-500 text-xs mt-0.5 line-clamp-1">{task.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{task.assignedToName || "Unassigned"}</div>
                        <div className="text-slate-400 text-[11px] font-medium">{task.assignedToEmail}</div>
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono font-medium">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}
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
            total={tasksData?.total || 0}
            limit={limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </main>

      {/* MODAL: Assign Task */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign New Task">
        {formError && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g. Implement Auth Middleware"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Provide context and requirements..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Assign To *</label>
              <select
                required
                value={newTask.assignedToId}
                onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isLoading}
              className="px-4 py-2 btn-gradient text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2"
            >
              {createTaskMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign Task"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Employee Management */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title={isCreateEmployeeView ? "Add New Employee Account" : "Employee Directory"}
      >
        {isCreateEmployeeView ? (
          <div>
            {formError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="john.doe@company.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Role</label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    placeholder="Engineering, Sales..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsCreateEmployeeView(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  ← Back to Employee List
                </button>

                <button
                  type="submit"
                  disabled={createEmployeeMutation.isLoading}
                  className="px-4 py-2 btn-gradient text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2"
                >
                  {createEmployeeMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create & Send Welcome Email"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-semibold text-slate-500">Total registered members: {employees.length}</p>
              <button
                onClick={() => setIsCreateEmployeeView(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Employee
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      {emp.name}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-mono font-bold">
                        {emp.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">{emp.email} • {emp.department || "General"}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
