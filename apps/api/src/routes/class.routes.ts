import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// GET all classes for school
router.get('/', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    res.json(classes);
  } catch (error) {
    console.error('GET /classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// POST add class
router.post('/', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Class name required' });

    const newClass = await prisma.class.create({
      data: { name, schoolId },
    });

    res.status(201).json(newClass);
  } catch (error) {
    console.error('POST /classes error:', error);
    res.status(500).json({ error: 'Failed to add class' });
  }
});

// GET single class by ID
router.get('/:id', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const cls = await prisma.class.findFirst({
      where: { id: req.params.id, schoolId },
      select: { id: true, name: true },
    });

    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (error) {
    console.error('GET /classes/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// GET students in class
router.get('/:id/students', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const cls = await prisma.class.findFirst({
      where: { id: req.params.id, schoolId },
      select: { id: true, name: true },
    });

    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const students = await prisma.student.findMany({
      where: { schoolId, className: cls.name },
      select: {
        id: true, firstName: true, lastName: true,
        studentId: true, gender: true, className: true,
        parent: { select: { name: true, phone: true } },
      },
    });

    res.json({ class: cls, students });
  } catch (error) {
    console.error('GET /classes/:id/students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// DELETE class
router.delete('/:id', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const cls = await prisma.class.findFirst({
      where: { id: req.params.id, schoolId },
    });

    if (!cls) return res.status(404).json({ error: 'Class not found' });

    await prisma.class.delete({ where: { id: req.params.id } });

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('DELETE /classes/:id error:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

export default router;