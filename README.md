# TaskFlow - Full-Stack Task Management Application

A modern, production-grade Task Management web application built for creating, updating, and tracking tasks in real-time. Designed with a clean, responsive UI that works seamlessly across desktop and mobile screens.

---

## 🌟 Key Features

1. **User Authentication & Authorization**
   - Secure registration and login using **JWT (JSON Web Tokens)** and **bcryptjs** password hashing.
   - Role-based authorization (**Admin** and **Member**).
   - Protected API routes and client-side route guards.

2. **Complete CRUD Operations for Tasks**
   - **Create**: Add tasks with title, description, priority, due date, status, and team member assignment.
   - **Read**: View tasks in both an interactive **Kanban Board** and a filterable **List View**.
   - **Update**: Edit task details or quickly advance status (`To Do` → `In Progress` → `Under Review` → `Completed`).
   - **Delete**: Task creators or admins can delete tasks.
   - **Activity History**: Automatic logging of actions (status changes, reassignments, task edits).

3. **Real-Time Synchronization (WebSockets)**
   - Powered by **Socket.io**.
   - Changes made in one browser tab/window (e.g. creating a task, dragging to a new column, editing, or deleting) instantly sync to all connected users in real time with toast alerts.

4. **Responsive Design (Web & Mobile)**
   - Styled with **Tailwind CSS**.
   - Adaptive Kanban board with horizontal scrolling on mobile.
   - Responsive navigation bar with mobile hamburger drawer.

5. **Advanced Filtering, Sorting & Search**
   - Live search by title or description keywords.
   - Filter by Ownership (`All`, `Assigned to Me`, `Created by Me`).
   - Filter by Priority (`Urgent`, `High`, `Medium`, `Low`).
   - Filter by Assignee or unassigned tasks.
   - Sort by Creation Date, Due Date, Priority, or Title.

6. **Summary Metrics Dashboard**
   - Total Tasks, In-Progress/Review count, Completed tasks (with percentage progress bar), and Overdue task alerts.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Socket.io-client, React Hot Toast, date-fns.
- **Backend**: Node.js, Express, TypeScript, Socket.io, Prisma ORM, SQLite (`dev.db` - zero external database setup required!), JWT, bcryptjs.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm** (v9 or newer)

### 2. Installation
From the project root directory:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Database Initialization & Seeding
The backend uses SQLite with Prisma. Initialize and populate the database with realistic sample tasks:

```bash
cd server
# Generate database schema
npx prisma db push

# Seed sample users and tasks
npm run prisma:seed
```

### 4. Running the Application

Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:5000` with WebSocket server active.*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Demo Test Accounts

The seed script creates the following accounts with pre-loaded tasks:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `alex@taskflow.dev` | `password123` |
| **Member** | `sarah@taskflow.dev` | `password123` |
| **Member** | `david@taskflow.dev` | `password123` |

*(Tip: The login page includes **1-click quick fill buttons** for these demo accounts!)*

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & receive JWT
- `GET /api/auth/me` - Get current authenticated user profile

### Tasks (Protected)
- `GET /api/tasks` - Fetch tasks with optional filters (`search`, `status`, `priority`, `assigneeId`, `filter`, `sortBy`, `sortOrder`)
- `GET /api/tasks/stats` - Fetch task summary statistics
- `GET /api/tasks/:id` - Fetch single task with full activity history
- `POST /api/tasks` - Create a new task (emits `task:created`)
- `PUT /api/tasks/:id` - Update task details or status (emits `task:updated`)
- `DELETE /api/tasks/:id` - Delete a task (emits `task:deleted`)

### Users (Protected)
- `GET /api/users` - Fetch user directory for task assignment
