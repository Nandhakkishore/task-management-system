import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../validators/validate.js";
import { createTaskSchema, updateTaskStatusSchema, listTasksQuerySchema } from "../validators/task.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listTasks, getTaskStats, createTask, updateTaskStatus } from "../services/task.service.js";

const router = Router();

// Require auth for all task endpoints
router.use(requireAuth);

// GET /api/tasks/stats (Admin dashboard counters)
router.get(
  "/stats",
  requireRole(["admin"]),
  asyncHandler(async (req, res) => {
    const stats = await getTaskStats();
    return res.status(200).json({
      success: true,
      stats,
    });
  })
);

// GET /api/tasks (Admin: all tasks, Employee: assigned to them; search, filters, pagination)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, status, priority, page, limit } = req.query;

    const result = await listTasks({
      userId: req.user.id,
      role: req.user.role,
      search,
      status,
      priority,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  })
);

// POST /api/tasks (Admin only - assign new task)
router.post(
  "/",
  requireRole(["admin"]),
  validate(createTaskSchema),
  asyncHandler(async (req, res) => {
    const task = await createTask(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Task created and assigned successfully",
      task,
    });
  })
);

// PATCH /api/tasks/:id/status (Employee or Admin updates task status)
router.patch(
  "/:id/status",
  validate(updateTaskStatusSchema),
  asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;

    const updatedTask = await updateTaskStatus(taskId, req.user, status);

    return res.status(200).json({
      success: true,
      message: `Task status updated to ${status.replace("_", " ")}`,
      task: updatedTask,
    });
  })
);

export default router;
