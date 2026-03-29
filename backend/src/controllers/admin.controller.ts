import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendSuccess, sendError, paginate } from '../utils/response';
import { AuthRequest } from '../types';
import { Role } from '@prisma/client';

export async function getAllUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, username: true, role: true,
          isActive: true, createdAt: true, updatedAt: true,
          _count: { select: { tasks: true } },
        },
      }),
      prisma.user.count(),
    ]);

    sendSuccess(res, users, 'Users retrieved', 200, paginate(page, limit, total));
  } catch (error) {
    next(error);
  }
}

export async function getUserById(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, username: true, role: true,
        isActive: true, createdAt: true, updatedAt: true,
        tasks: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { tasks: true } },
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user, 'User retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(Role).includes(role)) {
      sendError(res, 'Invalid role', 400);
      return;
    }

    if (id === req.user!.userId) {
      sendError(res, 'You cannot change your own role', 400);
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, username: true, role: true },
    });

    sendSuccess(res, user, 'User role updated');
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (id === req.user!.userId) {
      sendError(res, 'You cannot deactivate yourself', 400);
      return;
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, 'User not found', 404);
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: !existing.isActive },
      select: { id: true, email: true, username: true, isActive: true },
    });

    sendSuccess(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    next(error);
  }
}

export async function getStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [totalUsers, totalTasks, tasksByStatus, tasksByPriority] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.task.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.task.groupBy({ by: ['priority'], _count: { id: true } }),
    ]);

    sendSuccess(res, {
      users: { total: totalUsers },
      tasks: {
        total: totalTasks,
        byStatus: Object.fromEntries(tasksByStatus.map((s) => [s.status, s._count.id])),
        byPriority: Object.fromEntries(tasksByPriority.map((p) => [p.priority, p._count.id])),
      },
    }, 'Stats retrieved');
  } catch (error) {
    next(error);
  }
}
