import { Response, NextFunction } from 'express';
import { TaskStatus, TaskPriority } from '@prisma/client';
import prisma from '../config/database';
import { sendSuccess, sendError, paginate } from '../utils/response';
import { AuthRequest } from '../types';
import { CreateTaskInput, UpdateTaskInput } from '../validators/task.validator';

export async function createTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { title, description, status, priority, dueDate } = req.body as CreateTaskInput;
    const userId = req.user!.userId;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId,
      },
    });

    sendSuccess(res, task, 'Task created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getTasks(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Users can only see their own tasks; admins see all
    if (role !== 'ADMIN') where.userId = userId;

    if (req.query.status) where.status = req.query.status as TaskStatus;
    if (req.query.priority) where.priority = req.query.priority as TaskPriority;
    if (req.query.search) {
      const search = String(req.query.search).trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: role === 'ADMIN' ? { user: { select: { id: true, username: true, email: true } } } : undefined,
      }),
      prisma.task.count({ where }),
    ]);

    sendSuccess(res, tasks, 'Tasks retrieved', 200, paginate(page, limit, total));
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const task = await prisma.task.findUnique({
      where: { id },
      include: role === 'ADMIN' ? { user: { select: { id: true, username: true, email: true } } } : undefined,
    });

    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    // Non-admin users can only access their own tasks
    if (role !== 'ADMIN' && task.userId !== userId) {
      sendError(res, 'Forbidden', 403);
      return;
    }

    sendSuccess(res, task, 'Task retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;
    const updates = req.body as UpdateTaskInput;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    if (role !== 'ADMIN' && task.userId !== userId) {
      sendError(res, 'Forbidden', 403);
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.status !== undefined && { status: updates.status as TaskStatus }),
        ...(updates.priority !== undefined && { priority: updates.priority as TaskPriority }),
        ...(updates.dueDate !== undefined && {
          dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
        }),
      },
    });

    sendSuccess(res, updated, 'Task updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    if (role !== 'ADMIN' && task.userId !== userId) {
      sendError(res, 'Forbidden', 403);
      return;
    }

    await prisma.task.delete({ where: { id } });
    sendSuccess(res, null, 'Task deleted');
  } catch (error) {
    next(error);
  }
}
