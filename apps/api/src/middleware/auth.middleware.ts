import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { verifyAuthToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
      };
    }
  }
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    const token = req.cookies?.token ?? bearerToken;

    if (!token) {
      throw new AppError(401, "Authentication required", "UNAUTHENTICATED");
    }

    const payload = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      throw new AppError(401, "Invalid session", "INVALID_SESSION");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, "Invalid session", "INVALID_SESSION"));
  }
};
