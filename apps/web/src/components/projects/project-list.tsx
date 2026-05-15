"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Users } from "lucide-react";
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

export function ProjectList() {
  const { user, isLoading: authLoading } = useAuth({ redirectToLogin: true });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ projects: Project[] }>("/projects")
      .then((response) => setProjects(response.data.projects))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (authLoading || isLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-card" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">Manage teams, assignments, and progress.</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">Create project</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>Create your first project and invite members by email.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/projects/new">Create project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const currentMember = project.members.find((member) => member.user.id === user?.id);
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-colors hover:border-primary/60">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <FolderKanban className="h-5 w-5 text-primary" />
                      <Badge tone={currentMember?.role === "ADMIN" ? "default" : "muted"}>
                        {currentMember?.role ?? "MEMBER"}
                      </Badge>
                    </div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description || "No description added."}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{project._count.tasks} tasks</span>
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {project.members.length}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
