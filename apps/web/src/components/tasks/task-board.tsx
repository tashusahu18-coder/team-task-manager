"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignee: { id: string; name: string; email: string } | null;
};

const columns: Array<{ status: Task["status"]; label: string }> = [
  { status: "TODO", label: "To do" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "DONE", label: "Done" }
];

export function TaskBoard({ projectId }: { projectId: string }) {
  const { user, isLoading: authLoading } = useAuth({ redirectToLogin: true });
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`).then((response) => setTasks(response.data.tasks));
  }, [projectId, user]);

  if (authLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-card" />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <p className="text-sm text-muted-foreground">Track status, priority, ownership, and overdue work.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);
          return (
            <Card key={column.status} className="min-h-80">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {column.label}
                  <Badge tone="muted">{columnTasks.length}</Badge>
                </CardTitle>
                <CardDescription>{column.status.replace("_", " ").toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnTasks.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No tasks here.</p>
                ) : (
                  columnTasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
                    return (
                      <div key={task.id} className="rounded-md border bg-background p-3">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <p className="text-sm font-medium">{task.title}</p>
                          <Badge tone={task.priority === "HIGH" ? "danger" : task.priority === "MEDIUM" ? "warning" : "muted"}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {task.description || "No description."}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{task.assignee?.name ?? "Unassigned"}</span>
                          {isOverdue ? <Badge tone="danger">Overdue</Badge> : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
