"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createProjectSchema, type CreateProjectInput } from "@team-task-manager/shared";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProjectForm() {
  const router = useRouter();
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await api.post<{ project: { id: string } }>("/projects", values);
      toast.success("Project created");
      router.push(`/projects/${response.data.project.id}`);
    } catch {
      toast.error("Could not create project");
    }
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>The creator becomes the project admin automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" {...form.register("name")} />
            <p className="min-h-5 text-xs text-destructive">{form.formState.errors.name?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
            <p className="min-h-5 text-xs text-destructive">{form.formState.errors.description?.message}</p>
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
