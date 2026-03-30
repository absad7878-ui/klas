// apps/api/src/routes/announcement.routes.ts
import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { sendPushNotification } from '../services/firebase.service';
import jwt from 'jsonwebtoken';

const router  = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ── Safe upsert helper — works even after DB reset ────────────────────────────
async function safeUpsertSubscription(data: {
  fcmToken: string;
  schoolId: string;
  userId:   string;
  role:     string;
}) {
  try {
    await prisma.pushSubscription.upsert({
      where:  { fcmToken: data.fcmToken },
      create: data,
      update: { schoolId: data.schoolId, userId: data.userId, role: data.role },
    });
  } catch {
    // Fallback if upsert fails (e.g. stale unique index after DB reset)
    await prisma.pushSubscription.deleteMany({ where: { fcmToken: data.fcmToken } });
    await prisma.pushSubscription.create({ data });
  }
}

// ── GET /announcements — authenticated ────────────────────────────────────────
router.get('/', authenticate, async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const announcements = await prisma.announcement.findMany({
      where:   { schoolId },
      orderBy: { createdAt: 'desc' },
      take:    20,
    });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// ── POST /announcements — authenticated (admin) ───────────────────────────────
router.post('/', authenticate, async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    const userId   = req.user.id;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const { title, content, targetAudience = 'all' } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const announcement = await prisma.announcement.create({
      data: { schoolId, title, content, targetAudience, createdBy: userId },
    });

    const whereRole: any = { schoolId };
    if (targetAudience !== 'all') whereRole.role = targetAudience;

    const subscriptions = await prisma.pushSubscription.findMany({
      where:  whereRole,
      select: { fcmToken: true },
    });

    const tokens = subscriptions.map(s => s.fcmToken).filter(Boolean);

    const school = await prisma.school.findUnique({
      where:  { id: schoolId },
      select: { name: true, subdomain: true },
    });

    if (tokens.length > 0) {
      await sendPushNotification({
        tokens,
        title: `📢 ${school?.name ?? 'School'} Announcement`,
        body:  title,
        data: {
          type:           'announcement',
          announcementId: announcement.id,
          url: school?.subdomain
            ? `https://${school.subdomain}.klas.ng/announcements`
            : '/parent/dashboard',
        },
      });
    }

    res.json({ success: true, announcement, notified: tokens.length });
  } catch (error: any) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: error.message || 'Failed to create announcement' });
  }
});

// ── POST /announcements/subscribe ─────────────────────────────────────────────
router.post('/subscribe', async (req: any, res) => {
  try {
    const { fcmToken, role, schoolId: bodySchoolId } = req.body;

    if (!fcmToken || !role) {
      return res.status(400).json({ error: 'fcmToken and role are required' });
    }

    let schoolId: string | null = null;
    let userId   = 'anonymous';

    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const headerToken = authHeader.replace('Bearer ', '');
        const payload: any = jwt.verify(headerToken, JWT_SECRET);

        // School admin/teacher token
        if (payload.schoolId) {
          schoolId = payload.schoolId;
          userId   = payload.id || 'anonymous';
        }

        // Parent token — subscribe to ALL schools their children attend
        if (payload.parentId && payload.role === 'parent') {
          userId = payload.parentId;

          if (bodySchoolId) {
            schoolId = bodySchoolId;
          } else {
            const parent = await prisma.parentAccount.findUnique({
              where: { id: payload.parentId },
            });
            if (parent) {
              const students = await prisma.student.findMany({
                where:  { parent: { email: parent.email } },
                select: { schoolId: true },
              });
              const schoolIds = [...new Set(
                students.map(s => s.schoolId).filter(Boolean) as string[]
              )];

              // ── Use safe upsert for each school ──
              for (const sid of schoolIds) {
                await safeUpsertSubscription({ fcmToken, schoolId: sid, userId, role });
              }

              return res.json({ success: true, subscribedTo: schoolIds.length });
            }
          }
        }
      } catch { /* invalid token — fall through to body schoolId */ }
    }

    // Fallback: use schoolId from body
    if (!schoolId) schoolId = bodySchoolId;
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    // ── Use safe upsert ──
    await safeUpsertSubscription({ fcmToken, schoolId, userId, role });

    res.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to save push subscription' });
  }
});

// ── DELETE /announcements/subscribe ───────────────────────────────────────────
router.delete('/subscribe', async (req: any, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ error: 'fcmToken required' });
    await prisma.pushSubscription.deleteMany({ where: { fcmToken } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

// ── POST /announcements/report-card-published — authenticated ─────────────────
router.post('/report-card-published', authenticate, async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { term, session } = req.body;

    const subscriptions = await prisma.pushSubscription.findMany({
      where:  { schoolId, role: 'parent' },
      select: { fcmToken: true },
    });

    const tokens = subscriptions.map(s => s.fcmToken).filter(Boolean);

    const school = await prisma.school.findUnique({
      where:  { id: schoolId },
      select: { name: true },
    });

    if (tokens.length > 0) {
      await sendPushNotification({
        tokens,
        title: `📋 Report Cards Available — ${school?.name}`,
        body:  `${term} ${session} report cards have been published. Tap to view.`,
        data:  { type: 'report_card', url: '/parent/dashboard' },
      });
    }

    res.json({ success: true, notified: tokens.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
});

export default router;