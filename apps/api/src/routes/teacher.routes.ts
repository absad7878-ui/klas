// apps/api/src/routes/teacher.routes.ts
import { Router } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { authenticate } from '../middlewares/auth.middleware';

const router  = Router();
const resend  = new Resend(process.env.RESEND_API_KEY);

router.use(authenticate);

// ── Email helper ──────────────────────────────────────────────────────────────
async function sendTeacherWelcomeEmail({
  to, firstName, lastName, email, password, schoolName,
}: {
  to: string; firstName: string; lastName: string;
  email: string; password: string; schoolName: string;
}) {
  try {
    const loginUrl     = `${process.env.FRONTEND_URL || 'https://www.klas.ng'}/teacher-login`;
    const forgotPwdUrl = `${process.env.FRONTEND_URL || 'https://www.klas.ng'}/forgot-password`;

    await resend.emails.send({
      from:    'Klas Platform <noreply@klas.ng>',
      to,
      subject: `Welcome to ${schoolName} — Your Teacher Account`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
        <body style="margin:0;padding:0;background:#F0EFE9;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:580px;margin:2rem auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(11,29,58,.1);">

            <div style="background:linear-gradient(135deg,#0B1D3A,#1A3A6A);padding:2rem;text-align:center;">
              <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#C9963A,#E8B85A);display:inline-flex;align-items:center;justify-content:center;margin-bottom:1rem;">
                <span style="font-size:1.5rem;">🎓</span>
              </div>
              <h1 style="color:#fff;font-size:1.4rem;font-weight:800;margin:0 0 .35rem;">Welcome to ${schoolName}!</h1>
              <p style="color:#94A3B8;font-size:.88rem;margin:0;">Your teacher account has been created</p>
            </div>

            <div style="padding:2rem;">
              <p style="color:#0B1D3A;font-size:1rem;font-weight:600;margin:0 0 .5rem;">Hello ${firstName} ${lastName},</p>
              <p style="color:#64748B;font-size:.9rem;line-height:1.7;margin:0 0 1.5rem;">
                Your teacher account on the <strong style="color:#0B1D3A;">${schoolName}</strong> school management platform has been set up.
                You can now log in to access your classes, take attendance, enter exam scores and post assignments.
              </p>

              <div style="background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:14px;padding:1.25rem;margin-bottom:1.5rem;">
                <p style="font-size:.7rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.08em;margin:0 0 .85rem;">Your Login Credentials</p>
                <div style="display:flex;flex-direction:column;gap:.65rem;">
                  <div style="padding:.75rem .85rem;background:#fff;border:1px solid #E2E8F0;border-radius:9px;">
                    <div style="color:#94A3B8;font-size:.75rem;font-weight:600;margin-bottom:.35rem;">Email</div>
                    <div style="color:#0B1D3A;font-weight:700;font-size:.88rem;word-break:break-all;">${email}</div>
                  </div>
                  <div style="padding:.75rem .85rem;background:#FFFBEB;border:1px solid #FDE68A;border-radius:9px;">
                    <div style="color:#92400E;font-size:.75rem;font-weight:600;margin-bottom:.35rem;">Temporary Password</div>
                    <div style="color:#92400E;font-weight:800;font-size:1.1rem;font-family:monospace;letter-spacing:.08em;word-break:break-all;">${password}</div>
                  </div>
                </div>
              </div>

              <div style="background:#FFF1F2;border:1px solid #FECDD3;border-radius:11px;padding:.85rem 1rem;margin-bottom:1.5rem;">
                <p style="color:#BE123C;font-size:.82rem;margin:0;line-height:1.55;">
                  ⚠️ Please change your password after your first login. Use the <strong>Forgot Password</strong> option on the login page if needed.
                </p>
              </div>

              <div style="text-align:center;margin-bottom:1.5rem;">
                <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;font-size:.95rem;padding:.9rem 2.5rem;border-radius:12px;text-decoration:none;box-shadow:0 4px 16px rgba(201,150,58,.35);">
                  Login to Teacher Portal →
                </a>
              </div>

              <p style="color:#94A3B8;font-size:.78rem;text-align:center;margin:0;">
                Forgot your password? <a href="${forgotPwdUrl}" style="color:#C9963A;font-weight:600;text-decoration:none;">Reset it here</a>
              </p>
            </div>

            <div style="background:#0B1D3A;padding:1rem 2rem;text-align:center;">
              <p style="color:#475569;font-size:.72rem;margin:0;">
                Powered by <span style="color:#C9963A;font-weight:600;">Klas School Management Platform</span> · klas.ng
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`[Teacher Welcome] Email sent to ${to}`);
  } catch (err) {
    console.error('[Teacher Welcome] Failed to send email:', err);
  }
}

// GET: List teachers
router.get('/', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId || req.user.role !== 'SCHOOL_ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const teachers = await prisma.teacher.findMany({
      where:   { schoolId },
      select:  { id: true, firstName: true, lastName: true, email: true, phone: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(teachers);
  } catch (error) {
    console.error('GET /teachers error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// POST: Create new teacher + send welcome email via Resend
router.post('/', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId || req.user.role !== 'SCHOOL_ADMIN') {
      return res.status(403).json({ error: 'Only school admins can create teachers' });
    }

    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'First name, last name, email and password are required' });
    }
    if (password.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser    = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return res.status(409).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password.trim(), 12);
    const teacherRole    = await prisma.role.findFirst({ where: { name: 'TEACHER', schoolId } });
    if (!teacherRole) return res.status(500).json({ error: 'TEACHER role not found. Contact system administrator.' });

    const school = await prisma.school.findUnique({
      where:  { id: schoolId },
      select: { name: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email: normalizedEmail, password: hashedPassword, roleId: teacherRole.id, schoolId },
      });
      const newTeacher = await tx.teacher.create({
        data: {
          firstName: firstName.trim(), lastName: lastName.trim(),
          email: normalizedEmail, phone: phone?.trim() || null,
          schoolId, userId: newUser.id,
        },
      });
      return { user: newUser, teacher: newTeacher };
    });

    // Send welcome email via Resend (non-blocking)
    sendTeacherWelcomeEmail({
      to:         normalizedEmail,
      firstName:  firstName.trim(),
      lastName:   lastName.trim(),
      email:      normalizedEmail,
      password:   password.trim(),
      schoolName: school?.name || 'Your School',
    });

    res.status(201).json({
      id:        result.teacher.id,
      firstName: result.teacher.firstName,
      lastName:  result.teacher.lastName,
      email:     result.teacher.email,
      phone:     result.teacher.phone,
      message:   'Teacher created successfully. A welcome email has been sent.',
    });
  } catch (error: any) {
    console.error('POST /teachers error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: error.message || 'Failed to create teacher' });
  }
});

// PUT /:id — Update teacher
router.put('/:id', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId || req.user.role !== 'SCHOOL_ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id }    = req.params;
    const { firstName, lastName, email, phone } = req.body;

    const teacher = await prisma.teacher.findFirst({ where: { id, schoolId } });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const normalizedEmail = email?.toLowerCase().trim();

    if (normalizedEmail && normalizedEmail !== teacher.email) {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) return res.status(409).json({ error: 'Email already in use' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          firstName: firstName?.trim() || teacher.firstName,
          lastName:  lastName?.trim()  || teacher.lastName,
          email:     normalizedEmail   || teacher.email,
          phone:     phone?.trim()     || null,
        },
      });
      if (normalizedEmail && normalizedEmail !== teacher.email && teacher.userId) {
        await tx.user.update({
          where: { id: teacher.userId },
          data:  { email: normalizedEmail },
        });
      }
      return updatedTeacher;
    });

    res.json(updated);
  } catch (error: any) {
    console.error('PUT /teachers/:id error:', error);
    if (error.code === 'P2002') return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: error.message || 'Failed to update teacher' });
  }
});

// DELETE /:id — Delete teacher + user account
router.delete('/:id', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId || req.user.role !== 'SCHOOL_ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id }  = req.params;
    const teacher = await prisma.teacher.findFirst({ where: { id, schoolId } });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    await prisma.$transaction(async (tx) => {
      await tx.teacher.delete({ where: { id } });
      if (teacher.userId) await tx.user.delete({ where: { id: teacher.userId } });
    });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /teachers/:id error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete teacher' });
  }
});

export default router;