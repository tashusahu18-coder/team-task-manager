import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword("Password123!");
  const memberPassword = await hashPassword("Password123!");

  const [admin, member] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "Avery Admin",
        email: "admin@example.com",
        passwordHash: adminPassword
      }
    }),
    prisma.user.upsert({
      where: { email: "member@example.com" },
      update: {},
      create: {
        name: "Mina Member",
        email: "member@example.com",
        passwordHash: memberPassword
      }
    })
  ]);

  const project = await prisma.project.upsert({
    where: { id: "demo-project" },
    update: {},
    create: {
      id: "demo-project",
      name: "Product Launch",
      description: "Demo workspace for the assignment walkthrough.",
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: member.id, role: "MEMBER" }
        ]
      },
      tasks: {
        create: [
          {
            title: "Finalize launch checklist",
            description: "Confirm QA, copy, and release readiness.",
            priority: "HIGH",
            status: "IN_PROGRESS",
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
            assigneeId: admin.id,
            createdById: admin.id
          },
          {
            title: "Prepare support notes",
            description: "Summarize known issues and response templates.",
            priority: "MEDIUM",
            status: "TODO",
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
            assigneeId: member.id,
            createdById: admin.id
          }
        ]
      },
      activities: {
        create: {
          userId: admin.id,
          message: "created demo launch project"
        }
      }
    }
  });

  console.log(`Seeded project: ${project.name}`);
  console.log("Admin login: admin@example.com / Password123!");
  console.log("Member login: member@example.com / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
