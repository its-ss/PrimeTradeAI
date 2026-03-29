import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@primetrade.ai' },
    update: {},
    create: {
      email: 'admin@primetrade.ai',
      username: 'admin',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('User@123456', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@primetrade.ai' },
    update: {},
    create: {
      email: 'user@primetrade.ai',
      username: 'testuser',
      passwordHash: userPassword,
      role: Role.USER,
    },
  });

  // Create sample tasks for user
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up project environment',
        description: 'Install all dependencies and configure environment variables',
        status: 'DONE',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'Implement authentication',
        description: 'Add JWT-based authentication with refresh tokens',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'Write unit tests',
        description: 'Add test coverage for all API endpoints',
        status: 'TODO',
        priority: 'MEDIUM',
        userId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding complete.');
  console.log('Admin credentials -> email: admin@primetrade.ai | password: Admin@123456');
  console.log('User credentials  -> email: user@primetrade.ai  | password: User@123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
