import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import adminRoutes from './admin.routes';
import seedRoutes from './seed.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'PrimeTrade AI API v1',
    endpoints: {
      auth:  '/api/v1/auth',
      tasks: '/api/v1/tasks',
      admin: '/api/v1/admin (ADMIN role required)',
      docs:  '/api-docs',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/admin', adminRoutes);
router.use('/seed', seedRoutes);

export default router;
