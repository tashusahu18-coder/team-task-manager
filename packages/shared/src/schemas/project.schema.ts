import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required").max(80),
  description: z.string().trim().max(500).optional().or(z.literal(""))
});

export const updateProjectSchema = createProjectSchema.partial();

export const addProjectMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid user email").toLowerCase(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
