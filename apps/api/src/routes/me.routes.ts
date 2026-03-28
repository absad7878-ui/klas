// apps/api/src/routes/me.routes.ts
import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req: any, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: { select: { name: true } },
        school: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logoUrl: true,
            isActive: true,
            gradingSystem: true,
            academicStructure: true,
            _count: {
              select: {
                students: true,
                teachers: true,
                classes:  true,
              },
            },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const school = user.school ? {
      ...user.school,
      studentCount: user.school._count.students,
      teacherCount: user.school._count.teachers,
      classCount:   user.school._count.classes,
      _count:       undefined, // clean up
    } : null;

    res.json({
      user:   { id: user.id, email: user.email, role: user.role.name },
      school,
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;