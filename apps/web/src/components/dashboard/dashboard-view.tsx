"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Dashboard = {
  totalTasks: number;
  tasksByStatus: Array<{ status: string; count: number }>;
  tasksPerUser: Array<{ user: { id: string; name: string; email: string } | null; count: number }>;
  overdueTasks: Array<{ id: string; title: string; dueDate: string; priority: string; project: { name: string } }>;
  recentActivity: Array<{ id: string; message: string; createdAt: string; user: { name: string }; project: { name: string } }>;
};

export function DashboardView() {
  const { user, isLoading: authLoading } = useAuth({ redirectToLogin: true });
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get<{ dashboard: Dashboard }>("/dashboard").then((response) => setDashboard(response.data.dashboard));
  }, [user]);

  if (authLoading || !dashboard) {
    return <div className="h-40 animate-pulse rounded-lg bg-card" />;
  }

  const statusCount = (status: string) =>
    dashboard.tasksByStatus.find((item) => item.status === status)?.count ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total tasks" value={dashboard.totalTasks} icon={<ListTodo className="h-5 w-5" />} />
        <Metric title="To do" value={statusCount("TODO")} icon={<Clock3 className="h-5 w-5" />} />
        <Metric title="In progress" value={statusCount("IN_PROGRESS")} icon={<AlertTriangle className="h-5 w-5" />} />
        <Metric title="Done" value={statusCount("DONE")} icon={<CheckCircle2 className="h-5 w-5" />} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Overdue tasks</CardTitle>
            <CardDescription>Open work that needs attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.overdueTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue tasks yet.</p>
            ) : (
              dashboard.overdueTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project.name}</p>
                  </div>
                  <Badge tone="danger">{task.priority}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest project changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Activity will appear after your team starts working.</p>
            ) : (
              dashboard.recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-2 border-primary pl-3">
                  <p className="text-sm">{activity.user.name} {activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.project.name}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{title}</CardDescription>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
