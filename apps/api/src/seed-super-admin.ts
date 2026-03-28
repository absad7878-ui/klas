// apps/api/src/seed-super-admin.ts
import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

const SUPER_EMAIL = 'super@platform.com';
const SUPER_PASSWORD = 'SuperSecurePlatform2026!'; // CHANGE THIS in real production!

async function seedSuperAdmin() {
  try {
    console.log('Starting SUPER_ADMIN seed...');

    // 1. Find or create SUPER_ADMIN role (platform-level, schoolId = null)
    let superRole = await prisma.role.findFirst({
      where: {
        name: 'SUPER_ADMIN',
        schoolId: null,
      },
    });

    if (!superRole) {
      superRole = await prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',
          permissions: JSON.stringify(['*']),
          schoolId: null,
        },
      });
      console.log('→ Created SUPER_ADMIN role with ID:', superRole.id);
    } else {
      console.log('→ SUPER_ADMIN role already exists with ID:', superRole.id);
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(SUPER_PASSWORD, 12);

    // 3. Find super admin user by email (global lookup)
    const existingUser = await prisma.user.findFirst({
      where: { email: SUPER_EMAIL },
    });

    let superUser;
    if (existingUser) {
      // Update password & role if exists
      superUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          roleId: superRole.id,
          schoolId: null,
        },
      });
      console.log('→ Updated existing super admin user (ID:', superUser.id, ')');
    } else {
      // Create new
      superUser = await prisma.user.create({
        data: {
          email: SUPER_EMAIL,
          password: hashedPassword,
          roleId: superRole.id,
          schoolId: null,
        },
      });
      console.log('→ Created new super admin user (ID:', superUser.id, ')');
    }

    console.log('\n=== SUPER ADMIN ACCOUNT READY ===');
    console.log('Email:     ', SUPER_EMAIL);
    console.log('Password:  ', SUPER_PASSWORD);
    console.log('User ID:   ', superUser.id);
    console.log('Role ID:   ', superRole.id);
    console.log('==================================\n');

    console.log('Now login at http://localhost:3000/login');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();