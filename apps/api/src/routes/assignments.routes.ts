import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// POST: Teacher creates a new assignment for a class
router.post('/', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const schoolId = req.user?.schoolId;

    if (!userId || !schoolId) {
      return res.status(401).json({ error: 'Unauthorized - missing user info' });
    }

    const { classId, title, description, dueDate } = req.body;

    if (!classId || !title) {
      return res.status(400).json({ error: 'classId and title are required' });
    }

    // Optional: verify class belongs to the school
    const classExists = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });

    if (!classExists) {
      return res.status(404).json({ error: 'Class not found or not in your school' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        classId,
        teacherId: userId,  // or userId if you renamed the field
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    res.status(201).json({
      message: 'Assignment posted successfully',
      assignment,
    });
  } catch (error: any) {
    console.error('POST /assignments error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

export default router;