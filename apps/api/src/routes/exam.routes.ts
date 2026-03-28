// apps/api/src/routes/exam.routes.ts
// Register in index.ts:  app.use('/exams', examRoutes);

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';

const router = Router();

// ─── Helper: find student by UUID or studentId string ─────────────────────────
async function findStudent(id: string) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  return prisma.student.findFirst({
    where: isUUID ? { id } : { studentId: id },
  });
}

// PARENT PORTAL — no login required, uses studentId query param
// ═══════════════════════════════════════════════════════════════════════════════

// GET /exams/parent/terms?studentId=  — list published terms for a student
router.get('/parent/terms', async (req: any, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ error: 'Student ID is required' });

    // Accept both UUID and human-readable studentId
    const student = await findStudent(studentId as string);
    if (!student) return res.status(404).json({ error: 'Student not found. Please check the Student ID.' });

    const cards = await prisma.reportCard.findMany({
      where:   { studentId: student.id, isPublished: true },
      select:  { term: true, session: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(cards);
  } catch (err) {
    console.error('parent/terms error:', err);
    res.status(500).json({ error: 'Failed to fetch terms' });
  }
});

// GET /exams/parent/report-card?studentId=&term=&session=
router.get('/parent/report-card', async (req: any, res) => {
  try {
    const { studentId, term, session } = req.query;
    if (!studentId) return res.status(400).json({ error: 'Student ID is required' });

    // Accept both UUID and human-readable studentId
    const student = await findStudent(studentId as string);
    if (!student) return res.status(404).json({ error: 'Student not found. Please check the Student ID.' });

    const [card, results] = await Promise.all([
      prisma.reportCard.findFirst({
        where: { studentId: student.id, term: term as string, session: session as string },
      }),
      prisma.examResult.findMany({
        where:   { studentId: student.id, term: term as string, session: session as string },
        include: { subject: true },
        orderBy: { subject: { order: 'asc' } },
      }),
    ]);

    if (!card) return res.status(404).json({ error: 'Report card not yet available for this term' });
    if (!card.isPublished) return res.status(403).json({ error: 'Report card has not been published yet' });

    res.json({ card, results, student });
  } catch (err) {
    console.error('parent/report-card error:', err);
    res.status(500).json({ error: 'Failed to fetch report card' });
  }
});

// ─── All routes below require authentication ───────────────────────────────────
router.use(authenticate);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGrade = (total: number): { grade: string; remark: string } => {
  if (total >= 70) return { grade: 'A', remark: 'Excellent' };
  if (total >= 60) return { grade: 'B', remark: 'Very Good' };
  if (total >= 50) return { grade: 'C', remark: 'Good' };
  if (total >= 40) return { grade: 'D', remark: 'Pass' };
  return { grade: 'F', remark: 'Fail' };
};

const ordinal = (n: number) => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /exams/subjects — list all subjects for this school
router.get('/subjects', async (req: any, res) => {
  try {
    const subjects = await prisma.examSubject.findMany({
      where:   { schoolId: req.user.schoolId, isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json(subjects);
  } catch { res.status(500).json({ error: 'Failed to fetch subjects' }); }
});

// POST /exams/subjects — create a subject
router.post('/subjects', async (req: any, res) => {
  try {
    const { name, order } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Subject name required' });

    const subject = await prisma.examSubject.create({
      data: { schoolId: req.user.schoolId, name: name.trim(), order: order ?? 0 },
    });
    res.status(201).json(subject);
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Subject already exists' });
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// PUT /exams/subjects/:id — rename / reorder
router.put('/subjects/:id', async (req: any, res) => {
  try {
    const { name, order, isActive } = req.body;
    const subject = await prisma.examSubject.updateMany({
      where: { id: req.params.id, schoolId: req.user.schoolId },
      data:  { name, order, isActive },
    });
    res.json(subject);
  } catch { res.status(500).json({ error: 'Failed to update subject' }); }
});

// DELETE /exams/subjects/:id
router.delete('/subjects/:id', async (req: any, res) => {
  try {
    await prisma.examSubject.updateMany({
      where: { id: req.params.id, schoolId: req.user.schoolId },
      data:  { isActive: false },
    });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete subject' }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXAM RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /exams/results?classId=&term=&session=
router.get('/results', async (req: any, res) => {
  try {
    const { classId, term, session, subjectId } = req.query;
    if (!classId || !term || !session) {
      return res.status(400).json({ error: 'classId, term and session are required' });
    }

    const where: any = { schoolId: req.user.schoolId, classId, term, session };
    if (subjectId) where.subjectId = subjectId;

    const results = await prisma.examResult.findMany({
      where,
      include: { student: true, subject: true },
      orderBy: [{ subject: { order: 'asc' } }, { student: { lastName: 'asc' } }],
    });
    res.json(results);
  } catch { res.status(500).json({ error: 'Failed to fetch results' }); }
});

// GET /exams/results/student/:studentId?term=&session=
router.get('/results/student/:studentId', async (req: any, res) => {
  try {
    const { term, session } = req.query;
    if (!term || !session) return res.status(400).json({ error: 'term and session required' });

    const results = await prisma.examResult.findMany({
      where: {
        schoolId:  req.user.schoolId,
        studentId: req.params.studentId,
        term:      term as string,
        session:   session as string,
      },
      include: { subject: true },
      orderBy: { subject: { order: 'asc' } },
    });
    res.json(results);
  } catch { res.status(500).json({ error: 'Failed to fetch student results' }); }
});

// POST /exams/results/bulk
router.post('/results/bulk', async (req: any, res) => {
  try {
    const { classId, subjectId, term, session, scores } = req.body;
    const schoolId = req.user.schoolId;

    if (!classId || !subjectId || !term || !session || !Array.isArray(scores)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const subject = await prisma.examSubject.findFirst({ where: { id: subjectId, schoolId } });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const upserted = await Promise.all(
      scores.map(async ({ studentId, caScore, examScore, teacherComment }: any) => {
        const ca    = Math.min(Math.max(parseFloat(caScore)   || 0, 0), 30);
        const exam  = Math.min(Math.max(parseFloat(examScore) || 0, 0), 70);
        const total = parseFloat((ca + exam).toFixed(2));
        const { grade, remark } = getGrade(total);

        return prisma.examResult.upsert({
          where: { schoolId_studentId_subjectId_term_session: { schoolId, studentId, subjectId, term, session } },
          create: { schoolId, studentId, subjectId, classId, term, session, caScore: ca, examScore: exam, total, grade, remark, teacherComment: teacherComment || '' },
          update: { caScore: ca, examScore: exam, total, grade, remark, teacherComment: teacherComment || '', classId },
        });
      })
    );

    res.json({ success: true, saved: upserted.length });
  } catch (error) {
    console.error('bulk results error:', error);
    res.status(500).json({ error: 'Failed to save results' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT CARDS
// ═══════════════════════════════════════════════════════════════════════════════

// POST /exams/report-cards/generate
router.post('/report-cards/generate', async (req: any, res) => {
  try {
    const { classId, term, session } = req.body;
    const schoolId = req.user.schoolId;

    if (!classId || !term || !session) {
      return res.status(400).json({ error: 'classId, term and session required' });
    }

    const classInfo = await prisma.class.findFirst({ where: { id: classId, schoolId } });
    if (!classInfo) return res.status(404).json({ error: 'Class not found' });

    const allResults = await prisma.examResult.findMany({
      where: { schoolId, classId, term, session },
      include: { student: true },
    });

    const studentMap = new Map<string, typeof allResults[0]['student']>();
    allResults.forEach(r => { if (!studentMap.has(r.studentId)) studentMap.set(r.studentId, r.student); });
    const students = Array.from(studentMap.values());
    if (!students.length) return res.status(400).json({ error: 'No exam results found for this class/term — enter scores first' });

    interface Summary { student: typeof students[0]; totalMarks: number; averageScore: number; numSubjects: number; grade: string; remark: string; }
    const studentSummaries: Summary[] = students.map((student) => {
      const studentResults = allResults.filter((r) => r.studentId === student.id);
      const totalMarks     = studentResults.reduce((sum: number, r) => sum + r.total, 0);
      const numSubjects    = studentResults.length;
      const averageScore   = numSubjects > 0 ? parseFloat((totalMarks / numSubjects).toFixed(2)) : 0;
      const { grade, remark } = getGrade(averageScore);
      return { student, totalMarks, averageScore, numSubjects, grade, remark };
    });

    studentSummaries.sort((a: Summary, b: Summary) => b.totalMarks - a.totalMarks);
    const totalStudents = studentSummaries.length;

    const cards = await Promise.all(
      studentSummaries.map(async ({ student, totalMarks, averageScore, numSubjects, grade, remark }: Summary, idx: number) => {
        const position = idx + 1;
        return prisma.reportCard.upsert({
          where:  { schoolId_studentId_term_session: { schoolId, studentId: student.id, term, session } },
          create: {
            schoolId, studentId: student.id, classId,
            className: classInfo.name, term, session,
            totalMarks, averageScore, numberOfSubjects: numSubjects,
            position, totalStudents, grade, remark,
          },
          update: {
            totalMarks, averageScore, numberOfSubjects: numSubjects,
            position, totalStudents, grade, remark,
            classId, className: classInfo.name,
          },
        });
      })
    );

    res.json({ success: true, generated: cards.length, message: `Report cards generated for ${cards.length} students` });
  } catch (error) {
    console.error('generate report cards error:', error);
    res.status(500).json({ error: 'Failed to generate report cards' });
  }
});

// GET /exams/report-cards?classId=&term=&session=
router.get('/report-cards', async (req: any, res) => {
  try {
    const { classId, term, session } = req.query;
    const schoolId = req.user.schoolId;

    const cards = await prisma.reportCard.findMany({
      where:   { schoolId, classId: classId as string, term: term as string, session: session as string },
      include: { student: true },
      orderBy: { position: 'asc' },
    });
    res.json(cards);
  } catch { res.status(500).json({ error: 'Failed to fetch report cards' }); }
});

// GET /exams/report-cards/:studentId?term=&session=
router.get('/report-cards/:studentId', async (req: any, res) => {
  try {
    const { term, session } = req.query;
    const schoolId = req.user.schoolId;

    const [card, results, student, school] = await Promise.all([
  prisma.reportCard.findUnique({
    where: { schoolId_studentId_term_session: { schoolId, studentId: req.params.studentId, term: term as string, session: session as string } },
  }),
  prisma.examResult.findMany({
    where:   { schoolId, studentId: req.params.studentId, term: term as string, session: session as string },
    include: { subject: true },
    orderBy: { subject: { order: 'asc' } },
  }),
  prisma.student.findFirst({ where: { id: req.params.studentId, schoolId } }),
  prisma.school.findUnique({ where: { id: schoolId }, select: { name: true, logoUrl: true, address: true } }),
]);

if (!student) return res.status(404).json({ error: 'Student not found' });

res.json({ card, results, student, school });
  } catch { res.status(500).json({ error: 'Failed to fetch report card' }); }
});

// PATCH /exams/report-cards/:studentId/remarks
router.patch('/report-cards/:studentId/remarks', async (req: any, res) => {
  try {
    const { term, session, classTeacherRemark, principalRemark } = req.body;
    const schoolId = req.user.schoolId;

    await prisma.reportCard.updateMany({
      where: { schoolId, studentId: req.params.studentId, term, session },
      data:  { classTeacherRemark, principalRemark },
    });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to update remarks' }); }
});

// PATCH /exams/report-cards/publish
router.patch('/report-cards/publish', async (req: any, res) => {
  try {
    const { classId, term, session, publish } = req.body;
    const schoolId = req.user.schoolId;

    await prisma.reportCard.updateMany({
      where: { schoolId, classId, term, session },
      data:  { isPublished: publish !== false },
    });
    res.json({ success: true, published: publish !== false });
  } catch { res.status(500).json({ error: 'Failed to publish report cards' }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
export default router;