import 'dotenv/config';
import app from './app';
import prisma from './config/database';
import logger from './config/logger';

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`API docs:  http://localhost:${PORT}/api-docs`);
      logger.info(`Health:    http://localhost:${PORT}/health`);
      logger.info(`API base:  http://localhost:${PORT}/api/v1`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', { reason });
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception:', { err });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', { error });
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
