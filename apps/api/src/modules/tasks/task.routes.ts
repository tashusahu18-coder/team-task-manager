import { Router } from "express";
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from "@team-task-manager/shared";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireProjectMember, requireProjectRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as taskController from "./task.controller.js";

export const projectTaskRoutes = Router({ mergeParams: true });
export const taskRoutes = Router();

projectTaskRoutes.use(requireAuth, requireProjectMember);
projectTaskRoutes.get("/", taskController.listProjectTasks);
projectTaskRoutes.post(
  "/",
  requireProjectRole("ADMIN"),
  validate(createTaskSchema),
  taskController.createTask
);

taskRoutes.use(requireAuth);
taskRoutes.get("/:taskId", taskController.getTask);
taskRoutes.patch("/:taskId", validate(updateTaskSchema), taskController.updateTask);
taskRoutes.patch(
  "/:taskId/status",
  validate(updateTaskStatusSchema),
  taskController.updateTaskStatus
);
taskRoutes.delete("/:taskId", taskController.deleteTask);
