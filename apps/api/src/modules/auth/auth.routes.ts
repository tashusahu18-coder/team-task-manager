import { Router } from "express";
import { loginSchema, signupSchema } from "@team-task-manager/shared";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as authController from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/signup", validate(signupSchema), authController.signup);
authRoutes.post("/login", validate(loginSchema), authController.login);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", requireAuth, authController.me);
