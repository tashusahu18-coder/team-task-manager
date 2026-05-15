import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as dashboardController from "./dashboard.controller.js";

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);
dashboardRoutes.get("/", dashboardController.getDashboard);
