import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT secret from environment - REQUIRED for production
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production");
}

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-key-DO-NOT-USE-IN-PRODUCTION";
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

export interface AuthPayload {
  userId: string;
  userType: "freelancer" | "product_owner" | "admin";
  email: string;
  roleId?: string; // For admin users
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

// Generate JWT token
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Check for token in Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "غير مصرح - يرجى تسجيل الدخول" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "رمز غير صالح - يرجى تسجيل الدخول مرة أخرى" });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "خطأ في المصادقة" });
  }
}

// Optional auth middleware (doesn't fail if no token)
export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        req.user = payload;
      }
    }
    next();
  } catch (error) {
    next();
  }
}

// Role-based authorization middleware
export function requireRole(allowedRoles: ("freelancer" | "product_owner" | "admin")[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "غير مصرح - يرجى تسجيل الدخول" });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ error: "ممنوع - ليس لديك صلاحية للوصول" });
    }

    next();
  };
}

// Admin authentication middleware
export function adminAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    if (req.user?.userType !== "admin") {
      return res.status(403).json({ error: "ممنوع - هذه الصفحة للمسؤولين فقط" });
    }
    next();
  });
}

// Permission-based authorization middleware for admin users
export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.userType !== "admin") {
      return res.status(403).json({ error: "ممنوع - ليس لديك صلاحية للوصول" });
    }

    try {
      // Import here to avoid circular dependencies
      const { db } = await import("../db");
      const { adminUsers, roles, permissions, rolePermissions } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      // Get admin user with role
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, req.user.userId));
      if (!admin || !admin.isActive) {
        return res.status(403).json({ error: "حساب غير نشط" });
      }

      // Get role
      const [role] = await db.select().from(roles).where(eq(roles.id, admin.roleId));
      if (!role) {
        return res.status(403).json({ error: "دور غير موجود" });
      }

      // Get role permissions
      const userPermissions = await db
        .select({
          name: permissions.name,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, role.id));

      const permissionNames = userPermissions.map(p => p.name);

      // Check if user has the required permission
      if (!permissionNames.includes(permission)) {
        return res.status(403).json({ error: `ليس لديك صلاحية: ${permission}` });
      }

      next();
    } catch (error) {
      console.error("Error checking permission:", error);
      return res.status(500).json({ error: "خطأ في التحقق من الصلاحيات" });
    }
  };
}
