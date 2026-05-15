import { AppShell } from "@/components/layout/app-shell";
import { TaskBoard } from "@/components/tasks/task-board";

export default async function ProjectTasksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  return (
    <AppShell>
      <TaskBoard projectId={projectId} />
    </AppShell>
  );
}
