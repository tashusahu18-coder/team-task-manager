import type { ProjectRole } from "@prisma/client";
import type {
  AddProjectMemberInput,
  CreateProjectInput,
  UpdateProjectInput
} from "@team-task-manager/shared";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";

const projectInclude = {
  members: {
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { joinedAt: "asc" as const }
  },
  _count: {
    select: { tasks: true }
  }
};

export const listProjects = (userId: string) =>
  prisma.project.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: projectInclude,
    orderBy: { updatedAt: "desc" }
  });

export const getProject = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: { some: { userId } }
    },
    include: projectInclude
  });

  if (!project) {
    throw new AppError(404, "Project not found", "PROJECT_NOT_FOUND");
  }

  return project;
};

export const createProject = async (input: CreateProjectInput, userId: string) =>
  prisma.project.create({
    data: {
      name: input.name,
      description: input.description || null,
      members: {
        create: {
          userId,
          role: "ADMIN"
        }
      },
      activities: {
        create: {
          userId,
          message: "created the project"
        }
      }
    },
    include: projectInclude
  });

export const updateProject = async (projectId: string, input: UpdateProjectInput) =>
  prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {})
    },
    include: projectInclude
  });

export const deleteProject = (projectId: string) =>
  prisma.project.delete({
    where: { id: projectId }
  });

export const addMember = async (
  projectId: string,
  input: AddProjectMemberInput,
  actorId: string
) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true }
  });

  if (!user) {
    throw new AppError(404, "No user found with this email", "USER_NOT_FOUND");
  }

  const membership = await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: user.id, projectId } },
    update: { role: input.role as ProjectRole },
    create: {
      userId: user.id,
      projectId,
      role: input.role as ProjectRole
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  await prisma.activity.create({
    data: {
      projectId,
      userId: actorId,
      message: `added ${user.name} as ${input.role.toLowerCase()}`
    }
  });

  return membership;
};

export const removeMember = async (projectId: string, userId: string, actorId: string) => {
  const adminCount = await prisma.projectMember.count({
    where: { projectId, role: "ADMIN" }
  });

  const target = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
    include: { user: { select: { name: true } } }
  });

  if (!target) {
    throw new AppError(404, "Member not found", "MEMBER_NOT_FOUND");
  }

  if (target.role === "ADMIN" && adminCount <= 1) {
    throw new AppError(400, "A project must keep at least one admin", "LAST_ADMIN");
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId, projectId } }
  });

  await prisma.task.updateMany({
    where: { projectId, assigneeId: userId },
    data: { assigneeId: null }
  });

  await prisma.activity.create({
    data: {
      projectId,
      userId: actorId,
      message: `removed ${target.user.name} from the project`
    }
  });
};
