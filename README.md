# TaskDash

A web application for managing internal daily tasks and assigning them to team members.

## Overview

TaskDash is a lightweight, modern task management system built with Next.js, React, TypeScript, and Prisma. It allows teams to create projects, organize tasks into workflow stages (Planned, In Progress, Done), assign tasks to team members, set priorities, and track due dates.

All data is persisted in a remote MySQL database, making it accessible from anywhere and shareable across your team.

## Features

- 📋 **Project Management**: Create, view, and delete projects with descriptions
- ✅ **Task Board**: Kanban-style board with three workflow stages (Planned, In Progress, Done)
- 👤 **Task Assignment**: Assign tasks to team members
- 🎯 **Priority Levels**: Set task priority (Low, Medium, High) with visual indicators
- 📅 **Due Dates**: Track task deadlines
- 🔍 **Filtering**: Filter tasks by assignee and priority
- 💾 **Database Persistence**: All data stored in remote MySQL database via Prisma ORM
- 🚀 **RESTful API**: Clean API routes for all CRUD operations
- 🎨 **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14.2.5, React 18.3.1, TypeScript 5.6.2
- **Styling**: Tailwind CSS 3.4.13, PostCSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Build Tool**: Next.js built-in

## Project Structure

```
monday-lite-nextjs/
├── app/
│   ├── api/
│   │   └── projects/
│   │       ├── route.ts              # GET/POST projects
│   │       └── [projectId]/
│   │           ├── route.ts          # DELETE project
│   │           └── tasks/
│   │               └── route.ts      # CRUD tasks
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Main dashboard
├── components/
│   ├── ProjectList.tsx               # Project sidebar
│   ├── TaskBoard.tsx                 # Kanban board
│   └── TaskModal.tsx                 # Task editor modal
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   └── storage.ts                    # Legacy localStorage utilities
├── prisma/
│   └── schema.prisma                 # Database schema
├── types/
│   └── index.ts                      # TypeScript type definitions
├── .env.example                      # Environment variables template
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL database (local or remote)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anupamb-lab/TaskDash-codebuzzweb.git
   cd TaskDash-codebuzzweb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your MySQL database credentials:
   ```env
   DATABASE_URL="mysql://DB_USER:DB_PASSWORD@your-host:3306/your-database"
   ```

4. **Sync database schema**
   ```bash
   npx prisma db push
   ```
   This creates the `Project` and `Task` tables in your database.

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Running the Application

**Development mode:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production build:**
```bash
npm run build
npm start
```

**Inspect database with Prisma Studio:**
```bash
npx prisma studio
```
Opens a GUI at [http://localhost:5555](http://localhost:5555).

## API Routes

### Projects

- `GET /api/projects` — Fetch all projects
- `POST /api/projects` — Create a new project
- `DELETE /api/projects/[projectId]` — Delete a project

### Tasks

- `GET /api/projects/[projectId]/tasks` — Fetch tasks for a project
- `POST /api/projects/[projectId]/tasks` — Create a new task
- `PATCH /api/projects/[projectId]/tasks` — Update a task
- `DELETE /api/projects/[projectId]/tasks` — Delete a task

## Database Schema

### Project Model
```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tasks       Task[]   // Relation to tasks
}
```

### Task Model
```prisma
model Task {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title       String
  description String?
  status      Status   @default(todo)        // todo | in_progress | done
  priority    Priority @default(medium)      // low | medium | high
  assignee    String?
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Usage

1. **Create a Project**
   - Click "New project" in the sidebar
   - Enter project name and optional description
   - Press "Add project"

2. **Add Tasks**
   - Select a project from the sidebar
   - Click "+ New task" in the task board
   - Fill in task details (title, description, priority, assignee, due date)
   - Click "Save"

3. **Manage Tasks**
   - Drag tasks between columns (Planned → In Progress → Done) or use "Move to" buttons
   - Click on a task to edit it
   - Click the ✕ button to delete a task
   - Use filters to view tasks by assignee or priority

4. **Filter Tasks**
   - Use the "All assignees" dropdown to filter by team member
   - Use the "All priorities" dropdown to filter by priority level

## Environment Variables

Create a `.env` file in the root directory (do NOT commit this to Git):

```env
DATABASE_URL="mysql://username:password@host:port/database_name"
```

### For Hostinger/cPanel Hosting:
```env
DATABASE_URL="mysql://u292417179_admindash:YourPassword@srv1876.hstgr.io:3306/u292417179_TaskDash"
```

**Note**: `.env` is added to `.gitignore` to protect your credentials.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub (already done ✅)
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Import the `TaskDash-codebuzzweb` repository
4. Add environment variables:
   - `DATABASE_URL` — your remote MySQL connection string
5. Deploy!

Vercel will automatically build and deploy on every push to `main`.

### Deploy to Other Platforms

For Heroku, Railway, Render, or other Node.js platforms:
- Push your repo
- Set `DATABASE_URL` in environment variables
- Run `npm run build` as build command
- Run `npm start` as start command

## Troubleshooting

### Error: "User was denied access on the database"
- The MySQL user lacks `CREATE DATABASE` privileges
- **Solution**: Use `npx prisma db push` instead of `npx prisma migrate` (already done in setup)

### Error: "Cannot connect to database"
- Check your `DATABASE_URL` in `.env`
- Verify the MySQL host/port are correct
- Ensure your IP is whitelisted (for remote databases)

### API returns 500 errors
- Check the terminal for Prisma/database errors
- Verify `.env` is correctly set up
- Ensure database schema is synced: `npx prisma db push`

## Development Notes

- **Frontend**: All components are client-side React (`"use client"`)
- **Backend**: API routes are serverless functions
- **Database**: Using Prisma ORM for type-safe queries
- **Build**: TypeScript is type-checked during build
- **Migrations**: Using `prisma db push` (schema-first approach)

## Future Enhancements

- 🔐 Authentication & team permissions
- 📧 Email notifications for task assignments
- 📊 Analytics & task completion metrics
- 🔔 Real-time updates with WebSockets
- 📱 Mobile app (React Native)
- 💬 Task comments & team collaboration

## License

MIT — Feel free to use this project for your team!

## Support

For issues or feature requests, please open an issue on [GitHub](https://github.com/anupamb-lab/TaskDash-codebuzzweb/issues).

---

**Built with ❤️ for internal team task management**
