// apps/api/src/routes/forgot-password.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Resend } from 'resend';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── POST /auth/forgot-password ─────────────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await prisma.user.findFirst({ where: { email: email.toLowerCase().trim() } });

    if (user) {
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });

      const rawToken    = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt   = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token: hashedToken, expiresAt },
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

      await resend.emails.send({
        from: 'Klas School Management Platform <noreply@klas.ng>',
        to:   user.email,
        subject: 'Reset your password — Klas School Management Platform',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: Arial, sans-serif; background: #F7F6F2; margin: 0; padding: 40px 20px; }
              .card { background: #fff; border-radius: 20px; max-width: 520px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 30px rgba(11,29,58,.1); }
              .header { background: #0B1D3A; padding: 36px 40px; text-align: center; }
              .logo-mark { width: 52px; height: 52px; background: linear-gradient(135deg,#C9963A,#E8B85A); border-radius: 14px; display: inline-block; line-height: 52px; text-align: center; font-size: 26px; font-weight: 900; color: #0B1D3A; margin-bottom: 16px; }
              .header h1 { color: #fff; font-size: 22px; margin: 0; font-weight: 700; }
              .header p { color: #64748B; font-size: 14px; margin: 6px 0 0; }
              .body { padding: 36px 40px; }
              .body p { color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
              .btn { display: block; width: fit-content; margin: 24px auto; padding: 14px 36px; background: linear-gradient(135deg,#C9963A,#E8B85A); color: #0B1D3A; font-weight: 700; font-size: 15px; text-decoration: none; border-radius: 12px; text-align: center; }
              .note { background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 12px; padding: 14px 18px; margin-top: 24px; }
              .note p { color: #92400E; font-size: 13px; margin: 0; }
              .footer { text-align: center; padding: 20px 40px 32px; color: #94A3B8; font-size: 12px; }
              .url-fallback { word-break: break-all; font-size: 12px; color: #94A3B8; margin-top: 16px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <div class="logo-mark">S</div>
                <h1>Klas School Management Platform</h1>
                <p>Password Reset Request</p>
              </div>
              <div class="body">
                <p>Hello,</p>
                <p>We received a request to reset the password for your account associated with <strong>${user.email}</strong>.</p>
                <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
                <a href="${resetUrl}" class="btn">Reset My Password</a>
                <div class="note">
                  <p>⚠️ If you did not request this, please ignore this email. Your password will remain unchanged.</p>
                </div>
                <p class="url-fallback">If the button doesn't work, copy and paste this link:<br />${resetUrl}</p>
              </div>
              <div class="footer">
                © ${new Date().getFullYear()} Klas School Management Platform · This is an automated message, please do not reply.
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /auth/reset-password ───────────────────────────────────────────────
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) return res.status(400).json({ error: 'Token and new password are required' });
  if (password.length < 8)  return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where:   { token: hashedToken },
      include: { user: true },
    });

    if (!resetToken)        return res.status(400).json({ error: 'Invalid or expired reset link' });
    if (resetToken.usedAt)  return res.status(400).json({ error: 'This reset link has already been used' });
    if (resetToken.expiresAt < new Date()) return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });

    const hashedPassword = bcrypt.hashSync(password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);

    return res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;