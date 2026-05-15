import type { Request, Response } from "express";
import * as dashboardService from "./dashboard.service.js";

export const getDashboard = async (req: Request, res: Response) => {
  const dashboard = await dashboardService.getUserDashboard(req.user!.id);
  res.json({ dashboard });
};
