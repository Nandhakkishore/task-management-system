import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const targetPaths = [
  "C:/Users/nandh/.gemini/antigravity-ide/brain/ff51f40f-ae16-4c34-b9aa-21f04b1ed5cf/project_report.pdf",
  "c:/Users/nandh/OneDrive/Desktop/Task Management System/project_report.pdf",
];

async function generatePDF() {
  console.log("📄 Generating Task Management System Technical Report PDF...");

  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
    info: {
      Title: "Task Management System - Technical Report & Interview Guide",
      Author: "Antigravity Pair Programmer",
      Subject: "Full-stack System Architecture and Interview Preparation",
    },
  });

  const streams = targetPaths.map((p) => {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return fs.createWriteStream(p);
  });

  doc.pipe(streams[0]);
  streams.slice(1).forEach((s) => doc.pipe(s));

  // Colors
  const primaryColor = "#4f46e5";
  const darkColor = "#0f172a";
  const lightBg = "#f8fafc";
  const accentColor = "#06b6d4";

  // Document Title Header
  doc
    .rect(0, 0, doc.page.width, 100)
    .fill(primaryColor);

  doc
    .fillColor("#ffffff")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("TASK MANAGEMENT SYSTEM", 40, 25);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text("Full-Stack Technical Architecture, System Design & Interview Guide", 40, 55);

  doc.moveDown(4);

  function addHeader(title) {
    doc
      .fillColor(primaryColor)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(title)
      .moveDown(0.3);

    doc
      .strokeColor(primaryColor)
      .lineWidth(1)
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .stroke()
      .moveDown(0.5);
  }

  function addSubHeader(title) {
    doc
      .fillColor(darkColor)
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(title)
      .moveDown(0.3);
  }

  function addBody(text) {
    doc
      .fillColor("#334155")
      .fontSize(10)
      .font("Helvetica")
      .text(text, { align: "justify" })
      .moveDown(0.4);
  }

  function addBullet(title, text) {
    doc
      .fillColor(darkColor)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`• ${title}: `, { continued: true })
      .font("Helvetica")
      .fillColor("#334155")
      .text(text)
      .moveDown(0.3);
  }

  // Section 1: Executive Summary
  addHeader("1. Executive Summary & Technology Stack");
  addBody(
    "The Task Management System is an enterprise-grade full-stack web application designed for organization-wide task delegation, workload monitoring, real-time status tracking, and transactional email alerts. Built using JavaScript (ES Modules) in an npm workspace monorepo architecture."
  );

  addBullet("Monorepo Framework", "npm Workspaces managing decoupled server (Express API) and web (React Vite) applications.");
  addBullet("Frontend", "React (Vite) + Tailwind CSS + TanStack Query (v5) + Lucide Icons + Plus Jakarta Sans font.");
  addBullet("Backend Framework", "Express.js (Node.js) with Zod validation middleware and async handler wrappers.");
  addBullet("Database & ORM", "Drizzle ORM paired with Neon Serverless PostgreSQL with pooled connections and SSL security.");
  addBullet("Authentication & RBAC", "Better Auth adapter, Bcrypt password hashing, session tokens, and Role-Based Access Control (Admin/Employee).");
  addBullet("Email Notifications", "Nodemailer transactional email dispatcher with non-blocking async execution.");
  doc.moveDown(1);

  // Section 2: Database Schema
  addHeader("2. Database Schema & Data Modeling");
  addBody(
    "The PostgreSQL database contains 5 core tables and 3 custom enums managed strictly via Drizzle ORM."
  );

  addSubHeader("PostgreSQL Custom Enums");
  addBullet("role", "'admin' | 'employee'");
  addBullet("priority", "'high' | 'medium' | 'low'");
  addBullet("status", "'not_started' | 'in_progress' | 'completed'");

  addSubHeader("Core Table Structures");
  addBullet("users Table", "id (UUID), name (Text), email (Unique Text), password_hash (Text), role (role Enum), department (Text), is_active (Boolean).");
  addBullet("tasks Table", "id (UUID), title (Text), description (Text), priority (Enum), status (Enum), assigned_to_id (FK -> users.id), assigned_by_id (FK -> users.id), due_date (Timestamp).");
  addBullet("sessions Table", "id (Text), user_id (FK -> users.id), token (Unique Text), expires_at (Timestamp).");
  doc.moveDown(1);

  // Section 3: Auth & Security
  addHeader("3. Authentication, Security & Workflows");
  addBullet("Bcrypt Password Hashing", "User passwords are salted and hashed prior to database persistence.");
  addBullet("Session Management", "Cryptographically generated 64-character hex tokens stored in sessions table and validated per HTTP request.");
  addBullet("Security Error Contracts", "Login failures return HTTP 401 'Invalid email or password' without revealing account existence.");
  addBullet("Role-Based Middleware", "requireAuth verifies valid token/cookie, requireRole(['admin']) restricts executive actions.");
  doc.moveDown(1);

  // Section 4: Endpoints
  addHeader("4. REST API Endpoint Specification");
  addBullet("POST /api/auth/login", "Public. Authenticates user & returns token + user profile.");
  addBullet("GET /api/auth/me", "Authenticated. Validates active session token.");
  addBullet("GET /api/employees", "Admin Only. Retrieves directory of all employees.");
  addBullet("POST /api/employees", "Admin Only. Creates employee account & triggers welcome email.");
  addBullet("GET /api/tasks/stats", "Admin Only. Computes real-time status counter metrics.");
  addBullet("GET /api/tasks", "Authenticated. Lists tasks with SQL search, status/priority filters, and pagination.");
  addBullet("POST /api/tasks", "Admin Only. Assigns task to employee & triggers notification email.");
  addBullet("PATCH /api/tasks/:id/status", "Authenticated. Updates task status (optimistic UI on frontend).");
  doc.moveDown(1);

  // Section 5: Interview Q&A
  addHeader("5. Interview Technical Preparation & Q&A Cheatsheet");

  addSubHeader("Q1: Why choose an npm workspace monorepo?");
  addBody("Answer: Keeps frontend and backend in a unified repository for developer productivity while permitting independent production builds and deployments (Express on Render, React Vite on Vercel).");

  addSubHeader("Q2: Why TanStack Query over basic useEffect fetching?");
  addBody("Answer: Handles server-state caching, deduplication, loading/error states out of the box, and provides optimistic UI updates for instant task status changes without network lag.");

  addSubHeader("Q3: How does backend pagination and search work?");
  addBody("Answer: Implemented at the database level using Drizzle ORM SQL queries (ilike pattern matching, limit, and offset) executed alongside parallel Promise.all total count queries.");

  addSubHeader("Q4: How do email notifications stay performant?");
  addBody("Answer: Email dispatch is non-blocking. Database transactions complete first and respond to the client immediately, while emails trigger asynchronously in the background.");

  doc.end();
  console.log("✅ PDF Generation Complete!");
}

generatePDF();
