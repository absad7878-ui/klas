import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// POST: Save multiple scores for a class
router.post('/', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const schoolId = req.user?.schoolId;

    console.log('POST /scores - User:', { userId, schoolId, role: req.user?.role });

    if (!userId || !schoolId) {
      return res.status(401).json({ error: 'Unauthorized - missing user/school' });
    }

    const { classId, term, assessmentType, maxScore, scores } = req.body;

    console.log('POST /scores - Payload:', { classId, term, assessmentType, maxScore, scoresCount: scores?.length });

    if (!classId || !term || !assessmentType || maxScore == null || !Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const classExists = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!classExists) return res.status(404).json({ error: 'Class not found' });

    const records = scores.map((s: any, index: number) => {
      const scoreVal = parseFloat(s.score);
      if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > maxScore) {
        throw new Error(`Invalid score at index ${index}`);
      }
      return {
        studentId: s.studentId,
        classId,
        userId,  // ← this is the fix
        term,
        assessmentType,
        score: scoreVal,
        maxScore,
        comments: s.comments?.trim() || null,
      };
    });

    await prisma.score.createMany({
      data: records,
      skipDuplicates: true,
    });

    res.status(201).json({ message: 'Scores saved successfully' });
  } catch (error: any) {
    console.error('POST /scores failed:', error);
    res.status(500).json({ error: error.message || 'Failed to save scores' });
  }
});

export default router;