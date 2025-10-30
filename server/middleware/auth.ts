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
  userType: "freelancer" | "product_owner";
  email: string;
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
export function requireRole(allowedRoles: ("freelancer" | "product_owner")[]) {
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
