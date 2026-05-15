import { z } from "zod";

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Task title is required").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  dueDate: z.string().datetime().optional().nullable(),
  priority: taskPrioritySchema.default("MEDIUM"),
  assigneeId: z.string().cuid().optional().nullable()
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusSchema.optional()
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
