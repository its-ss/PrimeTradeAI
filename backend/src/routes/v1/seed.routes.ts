import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

/**
 * @openapi
 * /seed:
 *   post:
 *     tags: [Seed]
 *     summary: One-time database seed (disabled after use via SEED_DONE env var)
 *     parameters:
 *       - in: query
 *         name: secret
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Database seeded
 *       401:
 *         description: Invalid secret
 *       403:
 *         description: Seed already done
 */
router.get('/', async (req: Request, res: Response) => {
  // Block if already seeded
  if (process.env.SEED_DONE === 'true') {
    sendError(res, 'Seed already completed. Remove SEED_DONE or set it to false to re-run.', 403);
    return;
  }

  // Validate secret key
  const secret = req.query.secret as string;
  if (!secret || secret !== process.env.SEED_SECRET) {
    sendError(res, 'Invalid or missing seed secret', 401);
    return;
  }

  try {
    const adminHash = await bcrypt.hash('Admin@123456', 12);
    const userHash  = await bcrypt.hash('User@123456', 12);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@primetrade.ai' },
      update: {},
      create: {
        email: 'admin@primetrade.ai',
        username: 'admin',
        passwordHash: adminHash,
        role: 'ADMIN',
      },
    });

    const user = await prisma.user.upsert({
      where: { email: 'user@primetrade.ai' },
      update: {},
      create: {
        email: 'user@primetrade.ai',
        username: 'testuser',
        passwordHash: userHash,
        role: 'USER',
      },
    });

    await prisma.task.createMany({
      skipDuplicates: true,
      data: [
        { title: 'Set up project environment', status: 'DONE',        priority: 'HIGH',   userId: user.id },
        { title: 'Implement authentication',   status: 'IN_PROGRESS', priority: 'HIGH',   userId: user.id },
        { title: 'Write unit tests',           status: 'TODO',        priority: 'MEDIUM', userId: user.id },
      ],
    });

    sendSuccess(res, {
      users: ['admin@primetrade.ai (ADMIN)', 'user@primetrade.ai (USER)'],
      note: 'Now set SEED_DONE=true in your Render environment variables to disable this endpoint.',
    }, 'Database seeded successfully');
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Seed failed';
    sendError(res, msg, 500);
  }
});

export default router;
