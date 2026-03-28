// apps/api/src/routes/public.routes.ts
import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ── STUDENT PERFORMANCE ───────────────────────────────────────────────────────
// Accepts EITHER the database UUID or the studentId string (e.g. STD-001)

router.get('/student/:studentId/performance', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if it looks like a UUID (has dashes in UUID pattern)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);

    // Try to find by UUID first, then fall back to studentId string
    const student = await prisma.student.findFirst({
      where: isUUID
        ? { id: studentId }
        : { studentId },
      select: {
        id:        true,
        firstName: true,
        lastName:  true,
        studentId: true,
        className: true,
        schoolId:  true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const school = student.schoolId
      ? await prisma.school.findUnique({
          where: { id: student.schoolId },
          select: {
            id:            true,
            name:          true,
            subdomain:     true,
            bankName:      true,
            accountNumber: true,
            accountName:   true,
          },
        })
      : null;

    const [attendance, scores, fees, assignments] = await Promise.all([
      prisma.attendance.findMany({
        where:   { studentId: student.id },
        select:  { date: true, status: true, subject: true },
        orderBy: { date: 'desc' },
      }),
      prisma.score.findMany({
        where:   { studentId: student.id },
        select:  { term: true, assessmentType: true, score: true, maxScore: true, comments: true },
        orderBy: [{ term: 'asc' }, { assessmentType: 'asc' }],
      }),
      prisma.feeStatus.findMany({
        where:   { studentId: student.id },
        select:  { term: true, amountDue: true, amountPaid: true, status: true, lastPaymentDate: true },
        orderBy: { term: 'desc' },
      }),
      student.className && student.schoolId
        ? prisma.assignment.findMany({
            where:   { class: { name: student.className, schoolId: student.schoolId } },
            select:  { title: true, description: true, dueDate: true, createdAt: true },
            orderBy: { dueDate: 'desc' },
          })
        : Promise.resolve([]),
    ]);

    res.json({
      student: {
        firstName: student.firstName,
        lastName:  student.lastName,
        studentId: student.studentId,
        className: student.className,
      },
      attendance,
      scores,
      assignments,
      fees,
      school: {
        id:            school?.id            ?? null,
        name:          school?.name          ?? null,
        subdomain:     school?.subdomain     ?? null,
        bankName:      school?.bankName      ?? null,
        accountNumber: school?.accountNumber ?? null,
        accountName:   school?.accountName   ?? null,
      },
    });
  } catch (error) {
    console.error('Public performance error:', error);
    res.status(500).json({ error: 'Failed to fetch student performance' });
  }
});

// ── BANK DETAILS ──────────────────────────────────────────────────────────────

router.get('/bank-details', async (req, res) => {
  try {
    const { subdomain } = req.query;

    const school = await prisma.school.findFirst({
      where: subdomain ? { subdomain: subdomain as string } : undefined,
      select: { bankName: true, accountNumber: true, accountName: true },
    });

    if (!school?.bankName) {
      return res.status(404).json({ error: 'No bank details available' });
    }

    res.json({
      bankName:      school.bankName,
      accountNumber: school.accountNumber,
      accountName:   school.accountName,
    });
  } catch (error) {
    console.error('GET /public/bank-details error:', error);
    res.status(500).json({ error: 'Failed to fetch bank details' });
  }
});

// ── SCHOOL PROFILE BY SUBDOMAIN ───────────────────────────────────────────────

router.get('/school/:subdomain', async (req, res) => {
  const { subdomain } = req.params;
  try {
    const school = await prisma.school.findUnique({
      where: { subdomain },
      select: {
        id: true, name: true, subdomain: true,
        logoUrl: true, coverImageUrl: true, description: true,
        email: true, phone: true, address: true, website: true,
      },
    });
    if (!school) return res.status(404).json({ error: 'School not found' });
    return res.json(school);
  } catch (error) {
    console.error('Public school fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUBLIC ANNOUNCEMENTS ──────────────────────────────────────────────────────

router.get('/announcements', async (req, res) => {
  try {
    const { subdomain } = req.query;

    const school = subdomain
      ? await prisma.school.findFirst({
          where: { subdomain: subdomain as string },
          select: { id: true, name: true },
        })
      : null;

    if (!school) return res.json({ announcements: [], schoolName: 'School' });

    const announcements = await prisma.announcement.findMany({
      where:   { schoolId: school.id },
      orderBy: { createdAt: 'desc' },
      take:    30,
      select:  { id: true, title: true, content: true, targetAudience: true, createdAt: true },
    });

    res.json({ announcements, schoolName: school.name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

export default router;