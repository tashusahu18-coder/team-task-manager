import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import * as authService from "./auth.service.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7
};

export const signup = async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  res.cookie("token", result.token, cookieOptions);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.cookie("token", result.token, cookieOptions);
  res.json(result);
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);
  res.status(204).send();
};

export const me = (req: Request, res: Response) => {
  res.json({ user: req.user });
};
