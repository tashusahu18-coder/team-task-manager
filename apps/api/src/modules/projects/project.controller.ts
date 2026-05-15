import type { Request, Response } from "express";
import * as projectService from "./project.service.js";

export const listProjects = async (req: Request, res: Response) => {
  const projects = await projectService.listProjects(req.user!.id);
  res.json({ projects });
};

export const getProject = async (req: Request, res: Response) => {
  const project = await projectService.getProject(req.params.projectId, req.user!.id);
  res.json({ project });
};

export const createProject = async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.body, req.user!.id);
  res.status(201).json({ project });
};

export const updateProject = async (req: Request, res: Response) => {
  const project = await projectService.updateProject(req.params.projectId, req.body);
  res.json({ project });
};

export const deleteProject = async (req: Request, res: Response) => {
  await projectService.deleteProject(req.params.projectId);
  res.status(204).send();
};

export const addMember = async (req: Request, res: Response) => {
  const member = await projectService.addMember(req.params.projectId, req.body, req.user!.id);
  res.status(201).json({ member });
};

export const removeMember = async (req: Request, res: Response) => {
  await projectService.removeMember(req.params.projectId, req.params.userId, req.user!.id);
  res.status(204).send();
};
