"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Project = {
  id: string;
  name: string;
  description: string | null;
  members: Array<{ role: "ADMIN" | "MEMBER"; user: { id: string; name: string; email: string } }>;
  _count: { tasks: number };
};

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { user, isLoading: authLoading } = useAuth({ redirectToLogin: true });
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get<{ project: Project }>(`/projects/${projectId}`).then((response) => setProject(response.data.project));
  }, [projectId, user]);

  if (authLoading || !project) {
    return <div className="h-40 animate-pulse rounded-lg bg-card" />;
  }

  const role = project.members.find((member) => member.user.id === user?.id)?.role;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge>{role}</Badge>
            <Badge tone="muted">{project._count.tasks} tasks</Badge>
          </div>
          <h2 className="text-2xl font-semibold">{project.name}</h2>
          <p className="text-sm text-muted-foreground">{project.description || "No description added."}</p>
        </div>
        <Button asChild>
          <Link href={`/projects/${project.id}/tasks`}>Open tasks</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Project members</CardTitle>
            <CardDescription>Admins manage members and task assignment.</CardDescription>
          </div>
          <Button size="sm" variant="outline" disabled={role !== "ADMIN"}>
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {project.members.map((member) => (
            <div key={member.user.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{member.user.name}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
              <Badge tone={member.role === "ADMIN" ? "default" : "muted"}>{member.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
