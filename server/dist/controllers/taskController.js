"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskStats = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const socketHandler_1 = require("../sockets/socketHandler");
const getTasks = async (req, res) => {
    try {
        const { search, status, priority, assigneeId, filter, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const userId = req.user?.id;
        const where = {};
        if (search && typeof search === 'string') {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } }
            ];
        }
        if (status && typeof status === 'string' && status !== 'ALL') {
            where.status = status;
        }
        if (priority && typeof priority === 'string' && priority !== 'ALL') {
            where.priority = priority;
        }
        if (assigneeId && typeof assigneeId === 'string' && assigneeId !== 'ALL') {
            where.assigneeId = assigneeId === 'UNASSIGNED' ? null : assigneeId;
        }
        if (filter === 'assigned_to_me' && userId) {
            where.assigneeId = userId;
        }
        else if (filter === 'created_by_me' && userId) {
            where.creatorId = userId;
        }
        const orderBy = {};
        if (sortBy === 'dueDate') {
            orderBy.dueDate = sortOrder === 'asc' ? 'asc' : 'desc';
        }
        else if (sortBy === 'priority') {
            orderBy.priority = sortOrder === 'asc' ? 'asc' : 'desc';
        }
        else if (sortBy === 'title') {
            orderBy.title = sortOrder === 'asc' ? 'asc' : 'desc';
        }
        else {
            orderBy.createdAt = sortOrder === 'asc' ? 'asc' : 'desc';
        }
        const tasks = await prisma_1.default.task.findMany({
            where,
            orderBy,
            include: {
                creator: {
                    select: { id: true, name: true, email: true, avatar: true }
                },
                assignee: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });
        res.json({ tasks, count: tasks.length });
    }
    catch (error) {
        console.error('getTasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma_1.default.task.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true, name: true, email: true, avatar: true }
                },
                assignee: {
                    select: { id: true, name: true, email: true, avatar: true }
                },
                activities: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, name: true, avatar: true }
                        }
                    }
                }
            }
        });
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json({ task });
    }
    catch (error) {
        console.error('getTaskById error:', error);
        res.status(500).json({ error: 'Failed to fetch task details' });
    }
};
exports.getTaskById = getTaskById;
const createTask = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { title, description, status = 'TODO', priority = 'MEDIUM', dueDate, assigneeId } = req.body;
        if (!title || typeof title !== 'string' || title.trim() === '') {
            res.status(400).json({ error: 'Task title is required' });
            return;
        }
        const task = await prisma_1.default.task.create({
            data: {
                title: title.trim(),
                description: description ? description.trim() : null,
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                creatorId: userId,
                assigneeId: assigneeId || null
            },
            include: {
                creator: {
                    select: { id: true, name: true, email: true, avatar: true }
                },
                assignee: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });
        // Create activity log
        const activity = await prisma_1.default.activityLog.create({
            data: {
                taskId: task.id,
                userId: userId,
                action: 'CREATED',
                details: `Created task "${task.title}"`
            },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });
        // Broadcast real-time update
        (0, socketHandler_1.broadcastTaskEvent)('task:created', task);
        (0, socketHandler_1.broadcastActivity)(activity);
        res.status(201).json({ message: 'Task created successfully', task });
    }
    catch (error) {
        console.error('createTask error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const existingTask = await prisma_1.default.task.findUnique({
            where: { id }
        });
        if (!existingTask) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        const { title, description, status, priority, dueDate, assigneeId } = req.body;
        const dataToUpdate = {};
        const changes = [];
        if (title !== undefined) {
            dataToUpdate.title = title.trim();
            if (dataToUpdate.title !== existingTask.title) {
                changes.push(`renamed to "${dataToUpdate.title}"`);
            }
        }
        if (description !== undefined) {
            dataToUpdate.description = description ? description.trim() : null;
        }
        if (status !== undefined && status !== existingTask.status) {
            dataToUpdate.status = status;
            changes.push(`status changed from ${existingTask.status} to ${status}`);
        }
        if (priority !== undefined && priority !== existingTask.priority) {
            dataToUpdate.priority = priority;
            changes.push(`priority changed from ${existingTask.priority} to ${priority}`);
        }
        if (dueDate !== undefined) {
            dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;
            changes.push('due date updated');
        }
        if (assigneeId !== undefined && assigneeId !== existingTask.assigneeId) {
            dataToUpdate.assigneeId = assigneeId || null;
            changes.push(assigneeId ? 'reassigned' : 'unassigned');
        }
        const updatedTask = await prisma_1.default.task.update({
            where: { id },
            data: dataToUpdate,
            include: {
                creator: {
                    select: { id: true, name: true, email: true, avatar: true }
                },
                assignee: {
                    select: { id: true, name: true, email: true, avatar: true }
                }
            }
        });
        // Log activity if meaningful changes were made
        if (changes.length > 0) {
            const activity = await prisma_1.default.activityLog.create({
                data: {
                    taskId: updatedTask.id,
                    userId,
                    action: 'UPDATED',
                    details: changes.join(', ')
                },
                include: {
                    user: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            });
            (0, socketHandler_1.broadcastActivity)(activity);
        }
        // Broadcast real-time update
        (0, socketHandler_1.broadcastTaskEvent)('task:updated', updatedTask);
        res.json({ message: 'Task updated successfully', task: updatedTask });
    }
    catch (error) {
        console.error('updateTask error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const existingTask = await prisma_1.default.task.findUnique({
            where: { id }
        });
        if (!existingTask) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        // Check authorization: creator or admin
        if (existingTask.creatorId !== userId && userRole !== 'ADMIN') {
            res.status(403).json({ error: 'Only the task creator or an admin can delete this task' });
            return;
        }
        await prisma_1.default.task.delete({
            where: { id }
        });
        // Broadcast deletion
        (0, socketHandler_1.broadcastTaskEvent)('task:deleted', { id });
        res.json({ message: 'Task deleted successfully', id });
    }
    catch (error) {
        console.error('deleteTask error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};
exports.deleteTask = deleteTask;
const getTaskStats = async (req, res) => {
    try {
        const tasks = await prisma_1.default.task.findMany({
            select: {
                id: true,
                status: true,
                priority: true,
                dueDate: true
            }
        });
        const now = new Date();
        const stats = {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'TODO').length,
            inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
            inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
            completed: tasks.filter(t => t.status === 'COMPLETED').length,
            overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED').length,
            priorityCounts: {
                LOW: tasks.filter(t => t.priority === 'LOW').length,
                MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
                HIGH: tasks.filter(t => t.priority === 'HIGH').length,
                URGENT: tasks.filter(t => t.priority === 'URGENT').length
            }
        };
        res.json({ stats });
    }
    catch (error) {
        console.error('getTaskStats error:', error);
        res.status(500).json({ error: 'Failed to calculate stats' });
    }
};
exports.getTaskStats = getTaskStats;
