import { AppShell } from "@/components/layout/app-shell";
import { ProjectDetail } from "@/components/projects/project-detail";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  return (
    <AppShell>
      <ProjectDetail projectId={projectId} />
    </AppShell>
  );
}
