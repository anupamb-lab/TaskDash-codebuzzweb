import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin user already exists
  const existing = await prisma.user.findUnique({
    where: { email: 'support@codebuzzweb.net' },
  });

  if (existing) {
    console.log('Admin user already exists');
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin1234', salt);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: 'admin',
      email: 'support@codebuzzweb.net',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
