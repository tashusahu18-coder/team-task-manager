# Team Task Manager

Production-style full-stack assignment project: a simplified Trello/Asana-style team task manager with project roles, task assignment, dashboards, and Railway deployment readiness.

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT, httpOnly cookie, bcrypt password hashing
- Validation: Zod
- API client: Axios
- Deployment target: Railway

## Architecture

```txt
apps/
  api/        Express REST API, Prisma schema, auth, projects, tasks, dashboard
  web/        Next.js frontend
packages/
  shared/     Shared Zod schemas and TypeScript types
```

Roles are project-specific through `ProjectMember`, so a user can be an Admin in one project and a Member in another.

## Local Setup

```bash
npm install
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

Demo users after seeding:

```txt
admin@example.com / Password123!
member@example.com / Password123!
```

## API Testing Guide

Signup:

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Taylor\",\"email\":\"taylor@example.com\",\"password\":\"Password123!\"}"
```

Login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Password123!\"}"
```

Create project:

```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d "{\"name\":\"Website Redesign\",\"description\":\"Marketing site refresh\"}"
```

List tasks:

```bash
curl http://localhost:4000/api/projects/<PROJECT_ID>/tasks \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Railway Deployment

1. Push this repository to GitHub.
2. Create a Railway project.
3. Add Railway PostgreSQL.
4. Add backend service:
   - Root directory: `apps/api`
   - Build command: `npm install && npm run build --workspace @team-task-manager/shared && npm run build`
   - Start command: `npm start`
   - Env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV=production`
5. Run backend migration:
   - `npx prisma migrate deploy`
6. Add frontend service:
   - Root directory: `apps/web`
   - Build command: `npm install && npm run build --workspace @team-task-manager/shared && npm run build`
   - Start command: `npm start`
   - Env var: `NEXT_PUBLIC_API_URL=https://your-api-service.railway.app/api`
7. Set backend `CLIENT_URL` to the public frontend Railway URL.
8. Test signup, login, project creation, task assignment, and dashboard metrics.

## Interview Talking Points

- Project-specific RBAC is implemented through a join table instead of a global user role.
- Passwords are hashed with bcrypt; JWTs are stored in httpOnly cookies.
- Zod schemas validate API input and are shared between frontend and backend.
- Prisma relationships model users, projects, memberships, tasks, and activity.
- Members can view assigned work and update task status; Admins manage projects, members, and task details.
- The dashboard aggregates total tasks, tasks by status, tasks per user, overdue tasks, and activity.
