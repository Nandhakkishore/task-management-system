import bcrypt from "bcryptjs";
import { db, pool } from "./index.js";
import { users, tasks } from "./schema.js";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting Database Seed...");

  try {
    // 1. Create tables if they do not exist (Auto schema initialization for easy testing)
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      DO $$ BEGIN
        CREATE TYPE "role" AS ENUM ('admin', 'employee');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "priority" AS ENUM ('high', 'medium', 'low');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "status" AS ENUM ('not_started', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "email_verified" BOOLEAN DEFAULT false,
        "image" TEXT,
        "password_hash" TEXT,
        "role" role NOT NULL DEFAULT 'employee',
        "department" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN DEFAULT false;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT;
      ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;


      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT PRIMARY KEY,
        "expires_at" TIMESTAMP NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "ip_address" TEXT,
        "user_agent" TEXT,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" TEXT NOT NULL,
        "description" TEXT,
        "priority" priority NOT NULL DEFAULT 'medium',
        "status" status NOT NULL DEFAULT 'not_started',
        "assigned_to_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "assigned_by_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "due_date" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("✅ Database tables ensured.");

    // 2. Seed Admin User
    const adminEmail = "admin@example.com";
    const [existingAdmin] = await db.select().from(users).where(eq(users.email, adminEmail));

    let adminId;

    if (!existingAdmin) {
      const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
      const [insertedAdmin] = await db
        .insert(users)
        .values({
          name: "System Admin",
          email: adminEmail,
          passwordHash: adminPasswordHash,
          role: "admin",
          department: "Executive Management",
          isActive: true,
        })
        .returning();
      adminId = insertedAdmin.id;
      console.log(`👤 Created Admin Account: ${adminEmail} (Password: AdminPass123!)`);
    } else {
      adminId = existingAdmin.id;
      console.log(`ℹ️ Admin Account already exists: ${adminEmail}`);
    }

    // 3. Seed Demo Employee User
    const empEmail = "employee@example.com";
    const [existingEmp] = await db.select().from(users).where(eq(users.email, empEmail));

    let empId;

    if (!existingEmp) {
      const empPasswordHash = await bcrypt.hash("EmployeePass123!", 10);
      const [insertedEmp] = await db
        .insert(users)
        .values({
          name: "Sarah Jenkins",
          email: empEmail,
          passwordHash: empPasswordHash,
          role: "employee",
          department: "Software Engineering",
          isActive: true,
        })
        .returning();
      empId = insertedEmp.id;
      console.log(`👤 Created Employee Account: ${empEmail} (Password: EmployeePass123!)`);
    } else {
      empId = existingEmp.id;
      console.log(`ℹ️ Employee Account already exists: ${empEmail}`);
    }

    // 4. Seed Demo Tasks
    const existingTasks = await db.select().from(tasks);
    if (existingTasks.length === 0) {
      await db.insert(tasks).values([
        {
          title: "Implement Better Auth Integration",
          description: "Configure Drizzle ORM adapter and role-based session middleware.",
          priority: "high",
          status: "in_progress",
          assignedToId: empId,
          assignedById: adminId,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Setup Nodemailer Service",
          description: "Wire up transactional emails for task assignment and status alerts.",
          priority: "medium",
          status: "not_started",
          assignedToId: empId,
          assignedById: adminId,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Design Admin & Employee Dashboards",
          description: "Build sleek UI components with Tailwind CSS and TanStack Query.",
          priority: "high",
          status: "completed",
          assignedToId: empId,
          assignedById: adminId,
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ]);
      console.log("📋 Created initial sample tasks.");
    }

    console.log("🎉 Seed finished successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await pool.end();
  }
}

seed();
