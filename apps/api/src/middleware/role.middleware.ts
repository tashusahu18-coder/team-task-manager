import type { NextFunction, Request, Response } from "express";
import type { ProjectRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const requireProjectMember = async (req: Request, res: Response, next: NextFunction) => {
  const projectId = req.params.projectId;
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError(401, "Authentication required", "UNAUTHENTICATED"));
  }

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });

  if (!membership) {
    return next(new AppError(403, "You do not have access to this project", "PROJECT_FORBIDDEN"));
  }

  res.locals.membership = membership;
  next();
};

export const requireProjectRole =
  (...roles: ProjectRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const membership =
      res.locals.membership ??
      (await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user?.id ?? "",
            projectId: req.params.projectId
          }
        }
      }));

    if (!membership || !roles.includes(membership.role)) {
      return next(new AppError(403, "You do not have permission for this action", "ROLE_FORBIDDEN"));
    }

    next();
  };
