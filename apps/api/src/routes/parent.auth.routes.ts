// apps/api/src/routes/parent.auth.routes.ts
import { Router } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET   = process.env.JWT_SECRET || 'secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.klas.ng';

// ── Helper: normalise email ────────────────────────────────────────────────
const normalEmail = (e: string) => e.trim().toLowerCase();

// ── POST /parent/send-invite ───────────────────────────────────────────────
// Called by admin when adding a student whose parent has an email.
// Creates a ParentAccount (if not existing) and sends a set-password email.
router.post('/send-invite', async (req: any, res) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const { parentEmail, parentName, studentName } = req.body;
    if (!parentEmail) return res.status(400).json({ error: 'parentEmail is required' });

    const email = normalEmail(parentEmail);

    // Upsert parent account (email is global across schools — one parent can have children in multiple schools)
    let parent = await prisma.parentAccount.findUnique({ where: { email } });
    if (!parent) {
      parent = await prisma.parentAccount.create({
        data: { email, name: parentName || '', passwordHash: '', isVerified: false },
      });
    }

    // Generate a 1-hour invite token
    const token = jwt.sign({ parentId: parent.id, type: 'parent_invite' }, JWT_SECRET, { expiresIn: '48h' });

    // Store token hash in db
    await prisma.parentAccount.update({
      where: { id: parent.id },
      data:  { inviteToken: token },
    });

    const setPasswordUrl = `${FRONTEND_URL}/parent/set-password?token=${token}`;

    const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } });

    await resend.emails.send({
      from:    'Klas Platform <noreply@klas.ng>',
      to:      email,
      subject: `Set up your Parent Account — ${school?.name || 'Klas'}`,
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:540px;margin:0 auto;background:#fff;">
          <div style="background:#0B1D3A;padding:2rem 2rem 1.5rem;border-radius:16px 16px 0 0;">
            <h1 style="color:#C9963A;font-size:1.5rem;margin:0 0 .25rem;">👨‍👩‍👧 Parent Portal</h1>
            <p style="color:#94A3B8;font-size:.85rem;margin:0;">${school?.name || 'Klas School Management'}</p>
          </div>
          <div style="padding:2rem;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;">
            <p style="color:#0B1D3A;font-size:1rem;margin:0 0 1rem;">Dear ${parentName || 'Parent'},</p>
            <p style="color:#475569;font-size:.9rem;line-height:1.7;margin:0 0 1.5rem;">
              Your child <strong>${studentName || 'your ward'}</strong> has been registered at <strong>${school?.name}</strong>.
              Please click the button below to create your parent account and access their attendance, results, and fees.
            </p>
            <a href="${setPasswordUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;font-size:.95rem;padding:.9rem 2rem;border-radius:12px;text-decoration:none;margin-bottom:1.5rem;">
              Set Up My Account →
            </a>
            <p style="color:#94A3B8;font-size:.78rem;margin:0;">This link expires in 48 hours. If you did not expect this email, you can ignore it.</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Invite email sent' });
  } catch (err: any) {
    console.error('POST /parent/send-invite error:', err);
    res.status(500).json({ error: err.message || 'Failed to send invite' });
  }
});

// ── POST /parent/set-password ──────────────────────────────────────────────
// Parent clicks link in email → sets their password
router.post('/set-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Invalid or expired link. Please ask the school to resend your invite.' });
    }

    if (payload.type !== 'parent_invite') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    const parent = await prisma.parentAccount.findFirst({
      where: { id: payload.parentId, inviteToken: token },
    });

    if (!parent) {
      return res.status(400).json({ error: 'This invite link has already been used or is invalid.' });
    }

    const hash = await bcrypt.hash(password, 12);

    await prisma.parentAccount.update({
      where: { id: parent.id },
      data:  { passwordHash: hash, isVerified: true, inviteToken: null },
    });

    // Return a login token immediately so they're logged in right away
    const authToken = jwt.sign({ parentId: parent.id, role: 'parent' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token: authToken, email: parent.email });
  } catch (err: any) {
    console.error('POST /parent/set-password error:', err);
    res.status(500).json({ error: err.message || 'Failed to set password' });
  }
});

// ── POST /parent/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const parent = await prisma.parentAccount.findUnique({ where: { email: normalEmail(email) } });

    if (!parent || !parent.isVerified || !parent.passwordHash) {
      return res.status(401).json({ error: 'Account not found or not yet activated. Check your email for a setup link.' });
    }

    const valid = await bcrypt.compare(password, parent.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ parentId: parent.id, role: 'parent' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, name: parent.name, email: parent.email });
  } catch (err: any) {
    console.error('POST /parent/login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── POST /parent/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const parent = await prisma.parentAccount.findUnique({ where: { email: normalEmail(email) } });

    // Always respond success to prevent email enumeration
    if (!parent) return res.json({ success: true });

    const token = jwt.sign({ parentId: parent.id, type: 'parent_invite' }, JWT_SECRET, { expiresIn: '1h' });
    await prisma.parentAccount.update({ where: { id: parent.id }, data: { inviteToken: token } });

    const url = `${FRONTEND_URL}/parent/set-password?token=${token}`;

    await resend.emails.send({
      from:    'Klas Platform <noreply@klas.ng>',
      to:      parent.email,
      subject: 'Reset your Parent Portal password',
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:540px;margin:0 auto;">
          <div style="background:#0B1D3A;padding:2rem;border-radius:16px 16px 0 0;">
            <h2 style="color:#C9963A;margin:0;">Reset Password</h2>
          </div>
          <div style="padding:2rem;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;">
            <p style="color:#475569;">Click below to reset your parent portal password. This link expires in 1 hour.</p>
            <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;padding:.9rem 2rem;border-radius:12px;text-decoration:none;">
              Reset Password →
            </a>
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// ── GET /parent/me — get children ─────────────────────────────────────────
// Requires parent JWT
router.get('/me', async (req: any, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.replace('Bearer ', '');

    let payload: any;
    try { payload = jwt.verify(token, JWT_SECRET); }
    catch { return res.status(401).json({ error: 'Invalid or expired session' }); }

    if (payload.role !== 'parent') return res.status(403).json({ error: 'Not a parent account' });

    const parent = await prisma.parentAccount.findUnique({ where: { id: payload.parentId } });
    if (!parent) return res.status(404).json({ error: 'Account not found' });

    // Find all students whose parent email matches
    const students = await prisma.student.findMany({
      where: {
        parent: { email: parent.email },
      },
      select: {
        id:        true,
        firstName: true,
        lastName:  true,
        studentId: true,
        className: true,
        school: {
          select: { id: true, name: true, subdomain: true, logoUrl: true },
        },
      },
    });

    res.json({
      parent: { id: parent.id, name: parent.name, email: parent.email },
      children: students.map(s => ({
        id:        s.id,
        firstName: s.firstName,
        lastName:  s.lastName,
        studentId: s.studentId,
        className: s.className,
        school:    s.school,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load account' });
  }
});

export default router;