import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Clean existing data
  await prisma.activityLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Users
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex@taskflow.dev',
      password: passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah@taskflow.dev',
      password: passwordHash,
      role: 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    }
  });

  const david = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'david@taskflow.dev',
      password: passwordHash,
      role: 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Design Dark Mode Design System',
      description: 'Create standardized Tailwind color palette, typography tokens, and responsive mobile components.',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date(now.getTime() - 2 * dayMs),
      creatorId: alex.id,
      assigneeId: sarah.id
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement WebSocket Real-Time Sync',
      description: 'Connect client board with Socket.io server to broadcast task updates, drag-and-drop actions, and deletions.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: new Date(now.getTime() + 1 * dayMs),
      creatorId: alex.id,
      assigneeId: alex.id
    }
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Setup JWT Authentication & Protected Routes',
      description: 'Implement token-based authentication with bcrypt password hashing and user roles (Admin & Member).',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date(now.getTime() - 1 * dayMs),
      creatorId: sarah.id,
      assigneeId: david.id
    }
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Conduct Mobile Responsiveness Audit',
      description: 'Ensure Kanban board scrolls horizontally smoothly on small screens, and forms are thumb-friendly.',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      dueDate: new Date(now.getTime() + 3 * dayMs),
      creatorId: david.id,
      assigneeId: sarah.id
    }
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Write Comprehensive Unit & Integration Tests',
      description: 'Cover auth routes, task creation, status updates, and unauthorized access denials.',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(now.getTime() + 5 * dayMs),
      creatorId: alex.id,
      assigneeId: david.id
    }
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'Resolve Overdue Task Notification Bug',
      description: 'Overdue badges should highlight in red when due date is past current time and task is not completed.',
      status: 'TODO',
      priority: 'LOW',
      dueDate: new Date(now.getTime() - 3 * dayMs), // overdue
      creatorId: sarah.id,
      assigneeId: null
    }
  });

  // Create Sample Activity Logs
  await prisma.activityLog.create({
    data: {
      taskId: task2.id,
      userId: alex.id,
      action: 'UPDATED',
      details: 'status changed from TODO to IN_PROGRESS'
    }
  });

  await prisma.activityLog.create({
    data: {
      taskId: task1.id,
      userId: sarah.id,
      action: 'COMPLETED',
      details: 'marked task as COMPLETED'
    }
  });

  console.log('Seeding completed successfully!');
  console.log('Default credentials:');
  console.log('Admin: alex@taskflow.dev / password123');
  console.log('Member: sarah@taskflow.dev / password123');
  console.log('Member: david@taskflow.dev / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
