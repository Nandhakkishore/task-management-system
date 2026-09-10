import { db } from "../db/index.js";
import { tasks, users } from "../db/schema.js";
import { eq, and, ilike, count, desc, sql } from "drizzle-orm";
import { sendTaskAssignedEmail, sendStatusUpdateEmail } from "./email.service.js";

export async function listTasks({ userId, role, search, status, priority, page = 1, limit = 10 }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];

  if (role === "employee") {
    conditions.push(eq(tasks.assignedToId, userId));
  }

  if (status) {
    conditions.push(eq(tasks.status, status));
  }

  if (priority) {
    conditions.push(eq(tasks.priority, priority));
  }

  if (search && search.trim() !== "") {
    conditions.push(ilike(tasks.title, `%${search.trim()}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        priority: tasks.priority,
        status: tasks.status,
        assignedToId: tasks.assignedToId,
        assignedToName: users.name,
        assignedToEmail: users.email,
        assignedById: tasks.assignedById,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .where(whereClause)
      .limit(limitNum)
      .offset(offset)
      .orderBy(desc(tasks.createdAt)),

    db
      .select({ totalCount: count() })
      .from(tasks)
      .where(whereClause),
  ]);

  const total = Number(totalCount || 0);
  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
  };
}

export async function getTaskStats() {
  const [totalRes, notStartedRes, inProgressRes, completedRes] = await Promise.all([
    db.select({ count: count() }).from(tasks),
    db.select({ count: count() }).from(tasks).where(eq(tasks.status, "not_started")),
    db.select({ count: count() }).from(tasks).where(eq(tasks.status, "in_progress")),
    db.select({ count: count() }).from(tasks).where(eq(tasks.status, "completed")),
  ]);

  return {
    total: Number(totalRes[0]?.count || 0),
    not_started: Number(notStartedRes[0]?.count || 0),
    in_progress: Number(inProgressRes[0]?.count || 0),
    completed: Number(completedRes[0]?.count || 0),
  };
}

export async function createTask(taskData, assignedById) {
  const [newTask] = await db
    .insert(tasks)
    .values({
      title: taskData.title,
      description: taskData.description || null,
      priority: taskData.priority || "medium",
      status: taskData.status || "not_started",
      assignedToId: taskData.assignedToId,
      assignedById,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
    })
    .returning();

  // Send assignment notification asynchronously
  db.select()
    .from(users)
    .where(eq(users.id, taskData.assignedToId))
    .then(([employee]) => {
      if (employee && employee.email) {
        sendTaskAssignedEmail(employee.email, newTask.title, newTask.priority).catch(console.error);
      }
    })
    .catch(console.error);

  return newTask;
}

export async function updateTaskStatus(taskId, user, newStatus) {
  // Fetch existing task
  const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));

  if (!existingTask) {
    throw new Error("Task not found");
  }

  // Employees can only update their own task
  if (user.role === "employee" && existingTask.assignedToId !== user.id) {
    const error = new Error("Forbidden: You can only update tasks assigned to you");
    error.status = 403;
    throw error;
  }

  const [updatedTask] = await db
    .update(tasks)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  // Notify task creator/admin asynchronously if updated by employee
  if (user.role === "employee") {
    db.select()
      .from(users)
      .where(eq(users.id, existingTask.assignedById))
      .then(([adminUser]) => {
        if (adminUser && adminUser.email) {
          sendStatusUpdateEmail(adminUser.email, user.name, updatedTask.title, newStatus).catch(console.error);
        }
      })
      .catch(console.error);
  }

  return updatedTask;
}
