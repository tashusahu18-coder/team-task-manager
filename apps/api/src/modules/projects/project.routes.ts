import { Router } from "express";
import {
  addProjectMemberSchema,
  createProjectSchema,
  updateProjectSchema
} from "@team-task-manager/shared";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireProjectMember, requireProjectRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as projectController from "./project.controller.js";

export const projectRoutes = Router();

projectRoutes.use(requireAuth);

projectRoutes.get("/", projectController.listProjects);
projectRoutes.post("/", validate(createProjectSchema), projectController.createProject);

projectRoutes.get("/:projectId", requireProjectMember, projectController.getProject);
projectRoutes.patch(
  "/:projectId",
  requireProjectMember,
  requireProjectRole("ADMIN"),
  validate(updateProjectSchema),
  projectController.updateProject
);
projectRoutes.delete(
  "/:projectId",
  requireProjectMember,
  requireProjectRole("ADMIN"),
  projectController.deleteProject
);
projectRoutes.post(
  "/:projectId/members",
  requireProjectMember,
  requireProjectRole("ADMIN"),
  validate(addProjectMemberSchema),
  projectController.addMember
);
projectRoutes.delete(
  "/:projectId/members/:userId",
  requireProjectMember,
  requireProjectRole("ADMIN"),
  projectController.removeMember
);
