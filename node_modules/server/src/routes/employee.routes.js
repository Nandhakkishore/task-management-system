import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../validators/validate.js";
import { createEmployeeSchema } from "../validators/employee.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendWelcomeEmail } from "../services/email.service.js";

const router = Router();

// Protect all employee routes with requireAuth & admin role gate
router.use(requireAuth);
router.use(requireRole(["admin"]));

// GET /api/employees - Get list of all employees
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return res.status(200).json({
      success: true,
      employees: allUsers,
    });
  })
);

// POST /api/employees - Create new employee
router.post(
  "/",
  validate(createEmployeeSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, department } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const [existing] = await db.select().from(users).where(eq(users.email, cleanEmail));
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: {
          email: "An account with this email address already exists",
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [newEmployee] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: role || "employee",
        department: department ? department.trim() : "General",
        isActive: true,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    // Send welcome email asynchronously
    sendWelcomeEmail(cleanEmail, name, password).catch(console.error);

    return res.status(201).json({
      success: true,
      message: "Employee account created successfully",
      employee: newEmployee,
    });
  })
);

export default router;
