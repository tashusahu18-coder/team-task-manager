import type { Prisma } from "@prisma/client";
import type { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from "@team-task-manager/shared";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";

const taskInclude = {
  assignee: {
    select: { id: true, name: true, email: true }
  },
  createdBy: {
    select: { id: true, name: true, email: true }
  }
};

export const listProjectTasks = async (
  projectId: string,
  filters: { status?: string; priority?: string; assignedToMe?: string },
  userId: string
) => {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });

  const where: Prisma.TaskWhereInput = {
    projectId,
    ...(filters.status ? { status: filters.status as Prisma.EnumTaskStatusFilter["equals"] } : {}),
    ...(filters.priority ? { priority: filters.priority as Prisma.EnumTaskPriorityFilter["equals"] } : {})
  };

  if (membership?.role === "MEMBER" || filters.assignedToMe === "true") {
    where.assigneeId = userId;
  }

  return prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
  });
};

export const createTask = async (projectId: string, input: CreateTaskInput, userId: string) => {
  if (input.assigneeId) {
    const assigneeMembership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: input.assigneeId, projectId } }
    });

    if (!assigneeMembership) {
      throw new AppError(400, "Assignee must be a project member", "INVALID_ASSIGNEE");
    }
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      priority: input.priority,
      assigneeId: input.assigneeId || null,
      projectId,
      createdById: userId
    },
    include: taskInclude
  });

  await prisma.activity.create({
    data: {
      projectId,
      userId,
      message: `created task "${task.title}"`
    }
  });

  return task;
};

export const getTask = async (taskId: string, userId: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: { members: { some: { userId } } }
    },
    include: {
      ...taskInclude,
      project: {
        select: {
          id: true,
          name: true,
          members: {
            where: { userId },
            select: { role: true }
          }
        }
      }
    }
  });

  if (!task) {
    throw new AppError(404, "Task not found", "TASK_NOT_FOUND");
  }

  const role = task.project.members[0]?.role;
  if (role === "MEMBER" && task.assigneeId !== userId) {
    throw new AppError(403, "Members can only view assigned tasks", "TASK_FORBIDDEN");
  }

  return task;
};

export const updateTask = async (taskId: string, input: UpdateTaskInput, userId: string) => {
  const existingTask = await getTask(taskId, userId);
  const membership = existingTask.project.members[0];

  if (membership?.role !== "ADMIN") {
    throw new AppError(403, "Only admins can edit task details", "ROLE_FORBIDDEN");
  }

  if (input.assigneeId) {
    const assigneeMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: input.assigneeId,
          projectId: existingTask.projectId
        }
      }
    });

    if (!assigneeMembership) {
      throw new AppError(400, "Assignee must be a project member", "INVALID_ASSIGNEE");
    }
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(input.dueDate) : null } : {}),
      ...(input.priority ? { priority: input.priority } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId || null } : {})
    },
    include: taskInclude
  });

  await prisma.activity.create({
    data: {
      projectId: existingTask.projectId,
      userId,
      message: `updated task "${task.title}"`
    }
  });

  return task;
};

export const updateTaskStatus = async (
  taskId: string,
  input: UpdateTaskStatusInput,
  userId: string
) => {
  const existingTask = await getTask(taskId, userId);

  if (existingTask.project.members[0]?.role === "MEMBER" && existingTask.assigneeId !== userId) {
    throw new AppError(403, "Members can only update assigned tasks", "TASK_FORBIDDEN");
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status: input.status },
    include: taskInclude
  });

  await prisma.activity.create({
    data: {
      projectId: existingTask.projectId,
      userId,
      message: `moved "${task.title}" to ${input.status.replace("_", " ").toLowerCase()}`
    }
  });

  return task;
};

export const deleteTask = async (taskId: string, userId: string) => {
  const existingTask = await getTask(taskId, userId);

  if (existingTask.project.members[0]?.role !== "ADMIN") {
    throw new AppError(403, "Only admins can delete tasks", "ROLE_FORBIDDEN");
  }

  await prisma.task.delete({ where: { id: taskId } });
  await prisma.activity.create({
    data: {
      projectId: existingTask.projectId,
      userId,
      message: `deleted task "${existingTask.title}"`
    }
  });
};
