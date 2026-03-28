// apps/api/src/routes/attendance.routes.ts
import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { sendSms, buildAttendanceMessage } from '../services/sms.service';

const router = Router();

router.use(authenticate);

// ── GET /attendance?classId=xxx&date=YYYY-MM-DD ───────────────────────────────
// Fetch attendance for a class on a specific date
router.get('/', async (req: any, res) => {
  const { classId, date } = req.query as { classId: string; date: string };
  if (!classId || !date) {
    return res.status(400).json({ error: 'classId and date are required' });
  }
  try {
    const records = await prisma.attendance.findMany({
      where: { classId, date: new Date(date) },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
      orderBy: { student: { firstName: 'asc' } },
    });

    res.json(records.map(r => ({
      studentId:   r.studentId,
      studentName: `${r.student.firstName} ${r.student.lastName}`,
      status:      r.status,
      subject:     r.subject,
      date:        r.date,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch attendance' });
  }
});

// ── GET /attendance/history?classId=xxx&limit=30 ──────────────────────────────
// Returns list of past dates attendance was taken, with summary counts per date
router.get('/history', async (req: any, res) => {
  const { classId, limit = '30' } = req.query as { classId: string; limit?: string };
  if (!classId) return res.status(400).json({ error: 'classId is required' });

  try {
    const raw = await prisma.attendance.findMany({
      where:   { classId },
      select:  { date: true, status: true, subject: true },
      orderBy: { date: 'desc' },
    });

    // Group by date
    const dateMap: Record<string, any> = {};
    for (const r of raw) {
      const key = r.date.toISOString().split('T')[0]!;
      if (!dateMap[key]) {
        dateMap[key] = { date: key, presentCount: 0, absentCount: 0, lateCount: 0, subject: r.subject || 'General' };
      }
      if (r.status === 'PRESENT')      dateMap[key].presentCount++;
      else if (r.status === 'ABSENT')  dateMap[key].absentCount++;
      else if (r.status === 'LATE')    dateMap[key].lateCount++;
    }

    res.json(Object.values(dateMap).slice(0, parseInt(limit)));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch history' });
  }
});

// ── GET /attendance/monthly?classId=xxx&month=YYYY-MM ─────────────────────────
// Returns per-day summaries for admin monthly report view
router.get('/monthly', async (req: any, res) => {
  const { classId, month } = req.query as { classId: string; month: string };
  if (!classId || !month) {
    return res.status(400).json({ error: 'classId and month (YYYY-MM) are required' });
  }

  const [y, m]    = month.split('-').map(Number);
  const startDate = new Date(y!, m! - 1, 1);
  const endDate   = new Date(y!, m!, 0, 23, 59, 59);

  try {
    const raw = await prisma.attendance.findMany({
      where:   { classId, date: { gte: startDate, lte: endDate } },
      select:  { date: true, status: true, subject: true },
      orderBy: { date: 'asc' },
    });

    const dateMap: Record<string, any> = {};
    for (const r of raw) {
      const key = r.date.toISOString().split('T')[0]!;
      if (!dateMap[key]) {
        dateMap[key] = { date: key, presentCount: 0, absentCount: 0, lateCount: 0, total: 0, subject: r.subject || 'General' };
      }
      dateMap[key].total++;
      if (r.status === 'PRESENT')      dateMap[key].presentCount++;
      else if (r.status === 'ABSENT')  dateMap[key].absentCount++;
      else if (r.status === 'LATE')    dateMap[key].lateCount++;
    }

    res.json(Object.values(dateMap));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch monthly data' });
  }
});

// ── POST /attendance (existing single-record route — unchanged) ───────────────
router.post('/', async (req: any, res) => {
  try {
    const userId   = req.user?.id;
    const schoolId = req.user?.schoolId;

    if (!userId || !schoolId) {
      return res.status(401).json({ error: 'Unauthorized - missing user or school information' });
    }

    const { classId, subject, date, attendance } = req.body;

    if (!classId || !attendance || !Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: classId and attendance array' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const records = attendance.map((record: any) => {
      if (!record.studentId || !record.status) {
        throw new Error('Each attendance record must have studentId and status');
      }
      if (!['PRESENT', 'ABSENT', 'LATE'].includes(record.status)) {
        throw new Error('Invalid status value');
      }
      return {
        studentId: record.studentId,
        classId,
        userId,
        subject:   subject || 'General Attendance',
        date:      attendanceDate,
        status:    record.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const classExists = await prisma.class.findFirst({ where: { id: classId, schoolId } });
    if (!classExists) return res.status(404).json({ error: 'Class not found or not in your school' });

    await prisma.attendance.createMany({ data: records, skipDuplicates: true });

    triggerSmsNotifications(schoolId, attendance, attendanceDate).catch(err =>
      console.error('SMS notification error (non-fatal):', err)
    );

    res.status(201).json({ message: 'Attendance saved successfully' });
  } catch (error: any) {
    console.error('POST /attendance failed:', error);
    const message = error.meta?.target
      ? `Duplicate or constraint violation on ${error.meta.target.join(', ')}`
      : error.message || 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ── POST /attendance/bulk ─────────────────────────────────────────────────────
router.post('/bulk', async (req: any, res) => {
  try {
    const schoolId = req.user?.schoolId;
    const userId   = req.user?.id;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const { classId, date, records } = req.body;

    if (!classId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'classId, date, and records[] are required' });
    }

    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const classExists = await prisma.class.findFirst({ where: { id: classId, schoolId } });
    if (!classExists) return res.status(404).json({ error: 'Class not found' });

    await Promise.all(
      records.map((r: { studentId: string; status: string; subject?: string }) =>
        prisma.attendance.upsert({
          where:  { studentId_date: { studentId: r.studentId, date: attendanceDate } },
          create: {
            studentId: r.studentId, classId, userId,
            date: attendanceDate, status: r.status,
            subject: r.subject || 'General Attendance',
          },
          update: {
            status: r.status,
            subject: r.subject || 'General Attendance',
          },
        })
      )
    );

    const { smsSent, smsSkipped, smsFailed } =
      await triggerSmsNotifications(schoolId, records, attendanceDate);

    const smsSettings = await prisma.smsSettings.findUnique({ where: { schoolId } });

    res.json({
      saved: records.length,
      smsSent, smsSkipped, smsFailed,
      smsEnabled: smsSettings?.enabled ?? false,
      credits:    smsSettings?.credits ?? 0,
    });
  } catch (error: any) {
    console.error('POST /attendance/bulk failed:', error);
    res.status(500).json({ error: error.message || 'Failed to save attendance' });
  }
});

// ── Shared SMS helper ─────────────────────────────────────────────────────────
async function triggerSmsNotifications(
  schoolId: string,
  records: { studentId: string; status: string }[],
  date: Date,
): Promise<{ smsSent: number; smsSkipped: number; smsFailed: number }> {
  let smsSent = 0, smsSkipped = 0, smsFailed = 0;

  const smsSettings = await prisma.smsSettings.findUnique({ where: { schoolId } });

  const termiiApiKey = process.env.TERMII_API_KEY || '';
if (!smsSettings?.enabled || !termiiApiKey || smsSettings.credits <= 0) {
  return { smsSent: 0, smsSkipped: records.length, smsFailed: 0 };
}

  const school = await prisma.school.findUnique({
    where:  { id: schoolId },
    select: { name: true },
  });

  let remainingCredits = smsSettings.credits;

  for (const record of records) {
    if (remainingCredits <= 0) { smsSkipped++; continue; }

    const shouldSend =
      (record.status === 'ABSENT'  && smsSettings.sendOnAbsent)  ||
      (record.status === 'PRESENT' && smsSettings.sendOnPresent) ||
      (record.status === 'LATE'    && smsSettings.sendOnAbsent);

    if (!shouldSend) { smsSkipped++; continue; }

    const student = await prisma.student.findUnique({
      where:  { id: record.studentId },
      select: {
        firstName: true, lastName: true,
        parent: { select: { phone: true, name: true } },
      },
    });

    const parentPhone = student?.parent?.phone;
    if (!parentPhone) { smsSkipped++; continue; }

    const message = buildAttendanceMessage({
      parentName:  student.parent?.name  || 'Parent',
      studentName: `${student.firstName} ${student.lastName}`,
      status:      record.status,
      date,
      schoolName:  school?.name || 'School',
    });

 const result = await sendSms(
  parentPhone, message,
  termiiApiKey,
  smsSettings.senderId || process.env.TERMII_SENDER_ID || 'SchoolAlert'
);

    await prisma.smsSettings.update({
      where: { schoolId },
      data:  { credits: { decrement: 1 } },
    });

    await prisma.smsLog.create({
      data: {
        schoolId, studentId: record.studentId,
        phone: parentPhone, message,
        status: result.success ? 'sent' : 'failed',
        creditsUsed: 1,
      },
    });

    remainingCredits--;
    if (result.success) smsSent++; else smsFailed++;
  }

  return { smsSent, smsSkipped, smsFailed };
}


export default router;