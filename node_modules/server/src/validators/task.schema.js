import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title must be at least 2 characters long"),
    description: z.string().optional(),
    priority: z.enum(["high", "medium", "low"]).default("medium"),
    status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
    assignedToId: z.string().uuid("Invalid employee ID"),
    dueDate: z.string().optional().nullable(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(["not_started", "in_progress", "completed"]),
  }),
  params: z.object({
    id: z.string().uuid("Invalid task ID"),
  }),
});

export const listTasksQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(["not_started", "in_progress", "completed"]).optional(),
    priority: z.enum(["high", "medium", "low"]).optional(),
    page: z.string().transform((val) => parseInt(val, 10) || 1).optional(),
    limit: z.string().transform((val) => parseInt(val, 10) || 10).optional(),
  }),
});
