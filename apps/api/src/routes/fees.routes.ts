// apps/api/src/routes/fees.routes.ts
import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

/**
 * GET /fees?classId=xxx&term=Term+1+2025/2026
 * Returns all students in the class with their fee status for the given term.
 * If a student has no FeeStatus record yet, returns a zeroed-out entry.
 */
router.get('/', async (req: any, res) => {
  try {
    const { classId, term } = req.query;
    const schoolId = req.user.schoolId;

    if (!classId || !term) {
      return res.status(400).json({ error: 'classId and term are required' });
    }

    // Verify class belongs to this school
    const cls = await prisma.class.findFirst({
      where: { id: classId as string, schoolId },
    });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    // Get all students in this class (by className matching class.name)
    const students = await prisma.student.findMany({
      where: { schoolId, className: cls.name },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        feeStatuses: {
          where: { term: term as string },
          select: {
            id: true,
            term: true,
            amountDue: true,
            amountPaid: true,
            status: true,
            lastPaymentDate: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    // Merge: for students without a fee record, return a default zero entry
    const result = students.map(s => {
      const fee = s.feeStatuses[0];
      return {
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        term: (term as string),
        amountDue:       fee?.amountDue       ?? 0,
        amountPaid:      fee?.amountPaid      ?? 0,
        status:          (fee?.status         ?? 'Unpaid') as 'Paid' | 'Partial' | 'Unpaid',
        lastPaymentDate: fee?.lastPaymentDate ?? null,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('GET /fees error:', error);
    res.status(500).json({ error: 'Failed to fetch fee records' });
  }
});

/**
 * POST /fees/bulk
 * Sets the amountDue for all students in a class for a given term.
 * Creates FeeStatus records if they don't exist; updates amountDue if they do.
 */
router.post('/bulk', async (req: any, res) => {
  try {
    const { classId, term, amountDue } = req.body;
    const schoolId = req.user.schoolId;

    if (!classId || !term || amountDue == null) {
      return res.status(400).json({ error: 'classId, term, and amountDue are required' });
    }

    const cls = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const students = await prisma.student.findMany({
      where: { schoolId, className: cls.name },
      select: { id: true },
    });

    // Upsert FeeStatus for each student
    await Promise.all(
      students.map(s =>
        prisma.feeStatus.upsert({
          where: {
            // Composite unique key — add this to your schema if not present:
            // @@unique([studentId, term])
            studentId_term: { studentId: s.id, term },
          },
          update: { amountDue },
          create: {
            studentId: s.id,
            term,
            amountDue,
            amountPaid: 0,
            status: 'Unpaid',
          },
        })
      )
    );

    res.json({ message: `Fee amount set for ${students.length} students`, count: students.length });
  } catch (error) {
    console.error('POST /fees/bulk error:', error);
    res.status(500).json({ error: 'Failed to set bulk fee amounts' });
  }
});

/**
 * PUT /fees/:studentId
 * Records a payment update for a specific student + term.
 */
router.put('/:studentId', async (req: any, res) => {
  try {
    const { studentId } = req.params;
    const { term, amountDue, amountPaid, status, lastPaymentDate } = req.body;
    const schoolId = req.user.schoolId;

    // Verify student belongs to this school
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const updated = await prisma.feeStatus.upsert({
      where: {
        studentId_term: { studentId, term },
      },
      update: {
        amountDue,
        amountPaid,
        status,
        lastPaymentDate: lastPaymentDate ? new Date(lastPaymentDate) : null,
      },
      create: {
        studentId,
        term,
        amountDue,
        amountPaid,
        status,
        lastPaymentDate: lastPaymentDate ? new Date(lastPaymentDate) : null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('PUT /fees/:studentId error:', error);
    res.status(500).json({ error: 'Failed to update fee record' });
  }
});

export default router;