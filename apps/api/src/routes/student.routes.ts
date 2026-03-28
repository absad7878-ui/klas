// apps/api/src/routes/student.routes.ts
import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';

const router = Router();
router.use(authenticate);

const resend     = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET   = process.env.JWT_SECRET || 'secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.klas.ng';

// ── Helper: send parent invite email ──────────────────────────────────────
async function sendParentInvite(opts: {
  parentEmail: string;
  parentName:  string;
  studentName: string;
  schoolName:  string;
}) {
  try {
    const email = opts.parentEmail.trim().toLowerCase();

    // Upsert ParentAccount
    let parent = await prisma.parentAccount.findUnique({ where: { email } });
    if (!parent) {
      parent = await prisma.parentAccount.create({
        data: { email, name: opts.parentName || '', passwordHash: '', isVerified: false },
      });
    }

    // Only send if not yet verified (don't spam parents who already have accounts)
    if (parent.isVerified) return;

    const token = jwt.sign({ parentId: parent.id, type: 'parent_invite' }, JWT_SECRET, { expiresIn: '7d' });
    await prisma.parentAccount.update({ where: { id: parent.id }, data: { inviteToken: token } });

    const url = `${FRONTEND_URL}/parent/set-password?token=${token}`;

    await resend.emails.send({
      from:    'Klas Platform <noreply@klas.ng>',
      to:      email,
      subject: `Set up your Parent Account — ${opts.schoolName}`,
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:540px;margin:0 auto;background:#fff;">
          <div style="background:#0B1D3A;padding:2rem;border-radius:16px 16px 0 0;">
            <h1 style="color:#C9963A;font-size:1.4rem;margin:0 0 .25rem;">👨‍👩‍👧 Parent Portal</h1>
            <p style="color:#94A3B8;font-size:.85rem;margin:0;">${opts.schoolName}</p>
          </div>
          <div style="padding:2rem;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;">
            <p style="color:#0B1D3A;font-size:1rem;margin:0 0 1rem;">Dear ${opts.parentName || 'Parent'},</p>
            <p style="color:#475569;font-size:.9rem;line-height:1.7;margin:0 0 1.5rem;">
              Your child <strong>${opts.studentName}</strong> has been registered at <strong>${opts.schoolName}</strong>.
              Click the button below to create your parent account and access their attendance, results, and fees.
            </p>
            <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;font-size:.95rem;padding:.9rem 2rem;border-radius:12px;text-decoration:none;margin-bottom:1.5rem;">
              Set Up My Account →
            </a>
            <p style="color:#94A3B8;font-size:.78rem;margin:1rem 0 0;">This link expires in 7 days. Once set up, log in at <a href="${FRONTEND_URL}/parent/login" style="color:#C9963A;">${FRONTEND_URL}/parent/login</a></p>
          </div>
        </div>
      `,
    });
    console.log(`[Parent Invite] Sent to ${email}`);
  } catch (err) {
    // Non-fatal — student still created even if email fails
    console.error('[Parent Invite] Failed to send invite:', err);
  }
}

// ── GET: List students ─────────────────────────────────────────────────────
router.get('/', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const students = await prisma.student.findMany({
      where: { schoolId },
      select: {
        id: true, firstName: true, lastName: true,
        studentId: true, dateOfBirth: true, gender: true, className: true,
        parent: { select: { name: true, phone: true, email: true } },
      },
      orderBy: { lastName: 'asc' },
    });

    res.json(students);
  } catch (error) {
    console.error('GET /students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ── POST: Add student ──────────────────────────────────────────────────────
router.post('/', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const { firstName, lastName, studentId, dateOfBirth, gender, className,
            parentName, parentPhone, parentEmail } = req.body;

    if (!studentId?.trim()) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // ✅ Fix: check uniqueness per school only
    const existing = await prisma.student.findFirst({
      where: { studentId: studentId.trim(), schoolId },
    });
    if (existing) {
      return res.status(409).json({ error: 'Student ID already exists in this school — please choose a different one' });
    }

    let parentId: string | null = null;

    if (parentName || parentPhone || parentEmail) {
      const parent = await prisma.parent.upsert({
        where: { phone_schoolId: { phone: parentPhone || '', schoolId } },
        update: { name: parentName || undefined, phone: parentPhone || undefined, email: parentEmail || undefined },
        create: { name: parentName || 'Unknown Parent', phone: parentPhone || null, email: parentEmail || null, schoolId },
      });
      parentId = parent.id;
    }

    const student = await prisma.student.create({
      data: {
        firstName, lastName, studentId: studentId.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender, className, parentId, schoolId,
      },
    });

    // Send invite email if parent email provided (non-blocking)
    if (parentEmail?.trim()) {
      const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } });
      sendParentInvite({
        parentEmail: parentEmail.trim(),
        parentName:  parentName || 'Parent',
        studentName: `${firstName} ${lastName}`,
        schoolName:  school?.name || 'Your School',
      });
    }

    res.status(201).json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Student ID already exists — please choose a different one' });
    }
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// ── PUT: Update student ────────────────────────────────────────────────────
router.put('/:id', async (req: any, res) => {
  try {
    const schoolId  = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const studentDbId = req.params.id;
    const student = await prisma.student.findUnique({ where: { id: studentDbId } });
    if (!student || student.schoolId !== schoolId) {
      return res.status(404).json({ error: 'Student not found or not in your school' });
    }

    const { firstName, lastName, studentId: newStudentId, dateOfBirth, gender, className,
            parentName, parentPhone, parentEmail } = req.body;

    let parentId = student.parentId;

    if (parentName || parentPhone || parentEmail) {
      const parent = await prisma.parent.upsert({
        where: { phone_schoolId: { phone: parentPhone || '', schoolId } },
        update: { name: parentName || undefined, phone: parentPhone || undefined, email: parentEmail || undefined },
        create: { name: parentName || 'Unknown Parent', phone: parentPhone || null, email: parentEmail || null, schoolId },
      });
      parentId = parent.id;

      // Send invite if email changed and parent not yet verified
      if (parentEmail?.trim()) {
        const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } });
        sendParentInvite({
          parentEmail: parentEmail.trim(),
          parentName:  parentName || 'Parent',
          studentName: `${firstName || student.firstName} ${lastName || student.lastName}`,
          schoolName:  school?.name || 'Your School',
        });
      }
    }

    const updated = await prisma.student.update({
      where: { id: studentDbId },
      data: {
        firstName, lastName,
        studentId: newStudentId || student.studentId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender, className, parentId,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Update student error:', error);
    const message = error.meta?.target ? `Duplicate ${error.meta.target.join(', ')}` : error.message;
    res.status(500).json({ error: message || 'Failed to update student' });
  }
});

// ── DELETE: Delete student ─────────────────────────────────────────────────
router.delete('/:id', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student || student.schoolId !== schoolId) {
      return res.status(404).json({ error: 'Student not found or not in your school' });
    }

    await prisma.student.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('DELETE /students error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;