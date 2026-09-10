import { db } from "../db/index.js";
import { sessions, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { auth } from "../auth/auth.js";

export async function requireAuth(req, res, next) {
  try {
    // 1. Check Bearer token from Authorization header or session cookie
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies?.["better-auth.session_token"];

    if (token) {
      const [sessionRecord] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token));

      if (sessionRecord && sessionRecord.expiresAt > new Date()) {
        const [userRecord] = await db
          .select()
          .from(users)
          .where(eq(users.id, sessionRecord.userId));

        if (userRecord && userRecord.isActive) {
          req.user = {
            id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            role: userRecord.role,
            department: userRecord.department,
            isActive: userRecord.isActive,
          };
          req.session = sessionRecord;
          return next();
        }
      }
    }

    // 2. Fallback to Better Auth session API check
    const baSession = await auth.api
      .getSession({
        headers: req.headers,
      })
      .catch(() => null);

    if (baSession && baSession.user) {
      req.user = baSession.user;
      req.session = baSession.session;
      return next();
    }

    return res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid or expired session",
    });
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      error: "Unauthorized access",
    });
  }
}
