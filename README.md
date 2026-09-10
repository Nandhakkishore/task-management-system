# Task Management System (Monorepo)

A full-stack, enterprise-grade Task Management System built with a Node.js/Express backend, React (Vite) frontend, Drizzle ORM on Neon Postgres, Better Auth authentication, Nodemailer notifications, and TanStack Query state management.

---

## 🚀 Tech Stack

| Layer | Choice |
|---|---|
| **Frontend** | React (Vite JS/JSX), React Router v7, TanStack Query v5, Tailwind CSS |
| **Backend** | Express.js (Node.js) |
| **ORM** | Drizzle ORM |
| **Database** | Neon (Serverless Postgres) / PostgreSQL |
| **Auth** | Better Auth + Session Cookies / Bearer Tokens |
| **Email** | Nodemailer with Gmail SMTP & Mock Fallback |
| **Monorepo** | npm Workspaces (`apps/server`, `apps/web`) |

---

## 📁 Monorepo Structure

```
task-management-system/
├── apps/
│   ├── server/
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.js         # Drizzle schema (Users, Tasks, Sessions)
│   │   │   │   ├── index.js          # Drizzle ORM client
│   │   │   │   └── seed.js           # Database seeder (Admin & Employee accounts)
│   │   │   ├── auth/
│   │   │   │   └── auth.js           # Better Auth adapter configuration
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.js    # Login, logout, session check
│   │   │   │   ├── employee.routes.js# Admin employee management
│   │   │   │   └── task.routes.js    # Task CRUD, stats, status updates
│   │   │   ├── middleware/
│   │   │   │   ├── requireAuth.js    # Session auth guard
│   │   │   │   └── requireRole.js    # Admin role gate
│   │   │   ├── services/
│   │   │   │   ├── email.service.js  # Transactional email dispatcher
│   │   │   │   └── task.service.js   # SQL filtering & business logic
│   │   │   ├── validators/
│   │   │   │   ├── task.schema.js    # Zod schemas
│   │   │   │   └── employee.schema.js
│   │   │   └── index.js              # Express server entry point
│   │   ├── drizzle.config.js
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── components/           # UI Kit (Badge, Modal, StatsCard, Pagination, Navbar)
│       │   ├── context/
│       │   │   └── AuthContext.jsx   # Session state & ProtectedRoute
│       │   ├── lib/
        │   │   ├── api.js            # Axios client with credential interceptors
        │   │   └── auth-client.js
│       │   ├── pages/
│       │   │   ├── LoginPage.jsx
│       │   │   ├── admin/AdminDashboard.jsx
│       │   │   └── employee/EmployeeDashboard.jsx
│       │   ├── App.jsx
│       │   └── main.jsx
│       └── package.json
├── package.json                      # Monorepo workspace root
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Monorepo Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` in `apps/server`:

```env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/task_management_db
BETTER_AUTH_SECRET=super-secret-key-task-management-system-2026
BETTER_AUTH_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

Create `.env` in `apps/web`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database (Admin & Sample Tasks)

```bash
npm run seed
```

This automatically creates the database tables, seeds an Admin account (`admin@example.com` / `AdminPass123!`), an Employee account (`employee@example.com` / `EmployeePass123!`), and initial sample tasks.

### 4. Run Development Servers

```bash
# Run backend server (http://localhost:5000)
npm run dev:server

# Run frontend web client (http://localhost:5173)
npm run dev:web
```

---

## 🔑 Key Features

1. **Role-Based Access Control (RBAC)**:
   - `admin`: Full access to create employee accounts, assign tasks, view global statistics, and manage all tasks.
   - `employee`: Personal dashboard to view assigned tasks and update progress (`not_started` -> `in_progress` -> `completed`).
2. **Dynamic Search & SQL Pagination**:
   - Case-insensitive search on task titles.
   - SQL filtering by `status` and `priority`.
   - Paginated API responses (`page`, `limit`, `totalPages`, `total`).
3. **Optimistic UI Updates**:
   - Instant status updates in Employee dashboard backed by TanStack Query cache management.
4. **Non-Blocking Email Notifications**:
   - Sends task assignment alerts to employees.
   - Sends task status update alerts to task assigners.
   - Graceful mock logger when live SMTP credentials are not present.

---

## 🌐 API Specification

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates user & sets session |
| `POST` | `/api/auth/logout` | Authenticated | Clears session cookie/token |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current user session |
| `GET` | `/api/employees` | Admin | Lists all employee accounts |
| `POST` | `/api/employees` | Admin | Creates employee & sends welcome email |
| `GET` | `/api/tasks/stats` | Admin | Retrieves dashboard status counters |
| `GET` | `/api/tasks` | Authenticated | Lists tasks with search & pagination |
| `POST` | `/api/tasks` | Admin | Assigns a new task to an employee |
| `PATCH` | `/api/tasks/:id/status` | Authenticated | Updates task status (`not_started`, `in_progress`, `completed`) |
