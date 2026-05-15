import type { Request, Response } from "express";
import * as taskService from "./task.service.js";

export const listProjectTasks = async (req: Request, res: Response) => {
  const tasks = await taskService.listProjectTasks(
    req.params.projectId,
    {
      status: req.query.status as string | undefined,
      priority: req.query.priority as string | undefined,
      assignedToMe: req.query.assignedToMe as string | undefined
    },
    req.user!.id
  );
  res.json({ tasks });
};

export const createTask = async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.params.projectId, req.body, req.user!.id);
  res.status(201).json({ task });
};

export const getTask = async (req: Request, res: Response) => {
  const task = await taskService.getTask(req.params.taskId, req.user!.id);
  res.json({ task });
};

export const updateTask = async (req: Request, res: Response) => {
  const task = await taskService.updateTask(req.params.taskId, req.body, req.user!.id);
  res.json({ task });
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const task = await taskService.updateTaskStatus(req.params.taskId, req.body, req.user!.id);
  res.json({ task });
};

export const deleteTask = async (req: Request, res: Response) => {
  await taskService.deleteTask(req.params.taskId, req.user!.id);
  res.status(204).send();
};
