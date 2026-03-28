import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import { sendPushNotification } from '../services/firebase.service';

const router = Router();

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

// ── POST /announcements — authenticated ───────────────────────────────────────
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

    const tokens = subscriptions.map(s => s.fcmToken);

    const school = await prisma.school.findUnique({
      where:  { id: schoolId },
      select: { name: true, subdomain: true },
    });

    await sendPushNotification({
      tokens,
      title: `📢 ${school?.name ?? 'School'} Announcement`,
      body:  title,
      data:  {
        type:           'announcement',
        announcementId: announcement.id,
        url: school?.subdomain 
  ? `https://${school.subdomain}.klas.ng/announcements` 
  : '/announcements',
      },
    });

    res.json({ success: true, announcement, notified: tokens.length });
  } catch (error: any) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: error.message || 'Failed to create announcement' });
  }
});

// ── POST /announcements/subscribe — PUBLIC (no auth needed) ───────────────────
router.post('/subscribe', async (req: any, res) => {
  try {
    const { fcmToken, role, schoolId: bodySchoolId } = req.body;

    // Use schoolId from JWT if authenticated, otherwise from body (parents have no login)
    const schoolId = req.user?.schoolId || bodySchoolId;
    const userId   = req.user?.id       || 'anonymous';

    if (!fcmToken || !role) {
      return res.status(400).json({ error: 'fcmToken and role are required' });
    }
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    await prisma.pushSubscription.upsert({
      where:  { fcmToken },
      create: { schoolId, userId, role, fcmToken },
      update: { schoolId, userId, role },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save push subscription' });
  }
});

// ── DELETE /announcements/subscribe — authenticated ───────────────────────────
router.delete('/subscribe', authenticate, async (req: any, res) => {
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

    const tokens = subscriptions.map(s => s.fcmToken);

    const school = await prisma.school.findUnique({
      where:  { id: schoolId },
      select: { name: true },
    });

    await sendPushNotification({
      tokens,
      title: `📋 Report Cards Available — ${school?.name}`,
      body:  `${term} ${session} report cards have been published. Tap to view.`,
      data:  { type: 'report_card', url: '/parent/view' },
    });

    res.json({ success: true, notified: tokens.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
});

export default router;