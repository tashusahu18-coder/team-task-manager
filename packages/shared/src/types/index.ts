export type ProjectRole = "ADMIN" | "MEMBER";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};
