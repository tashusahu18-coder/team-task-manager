import { prisma } from "../../config/prisma.js";

export const getUserDashboard = async (userId: string) => {
  const projectIds = (
    await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    })
  ).map((membership) => membership.projectId);

  const [totalTasks, tasksByStatus, tasksPerUser, overdueTasks, recentActivity] =
    await Promise.all([
      prisma.task.count({
        where: {
          projectId: { in: projectIds },
          OR: [{ assigneeId: userId }, { project: { members: { some: { userId, role: "ADMIN" } } } }]
        }
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: { projectId: { in: projectIds } },
        _count: { status: true }
      }),
      prisma.task.groupBy({
        by: ["assigneeId"],
        where: { projectId: { in: projectIds }, assigneeId: { not: null } },
        _count: { assigneeId: true }
      }),
      prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
          dueDate: { lt: new Date() },
          status: { not: "DONE" }
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } }
        },
        orderBy: { dueDate: "asc" },
        take: 8
      }),
      prisma.activity.findMany({
        where: { projectId: { in: projectIds } },
        include: {
          user: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

  const assigneeIds = tasksPerUser.map((item) => item.assigneeId).filter(Boolean) as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true, email: true }
  });
  const userMap = new Map(users.map((user) => [user.id, user]));

  return {
    totalTasks,
    tasksByStatus: tasksByStatus.map((item) => ({
      status: item.status,
      count: item._count.status
    })),
    tasksPerUser: tasksPerUser.map((item) => ({
      user: item.assigneeId ? userMap.get(item.assigneeId) : null,
      count: item._count.assigneeId
    })),
    overdueTasks,
    recentActivity
  };
};
