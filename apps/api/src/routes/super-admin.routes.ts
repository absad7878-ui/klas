import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN']));

// ── GET /super-admin/schools ──────────────────────────────────────────────────
router.get('/schools', async (req, res) => {
  const schools = await prisma.school.findMany({
    select: {
      id:        true,
      name:      true,
      subdomain: true,
      logoUrl:   true,
      isActive:  true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(schools);
});

// ── PATCH /super-admin/schools/:id/toggle-active ──────────────────────────────
router.patch('/schools/:id/toggle-active', async (req, res) => {
  const { id } = req.params;

  const school = await prisma.school.findUnique({ where: { id } });
  if (!school) return res.status(404).json({ error: 'School not found' });

  const updated = await prisma.school.update({
    where:  { id },
    data:   { isActive: !school.isActive },
    select: { id: true, name: true, isActive: true },
  });

  res.json(updated);
});

// ── GET /super-admin/schools/:id/sms-stats ────────────────────────────────────
router.get('/schools/:id/sms-stats', async (req, res) => {
  try {
    const { id } = req.params;

    const settings = await prisma.smsSettings.findUnique({
      where: { schoolId: id },
    });

    res.json({
      credits: settings?.credits  ?? 0,
      enabled: settings?.enabled  ?? false,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SMS stats' });
  }
});

// ── POST /super-admin/schools/:id/sms-credits ─────────────────────────────────
// You (super admin) manually top up a school's credits from the dashboard
router.post('/schools/:id/sms-credits', async (req, res) => {
  try {
    const { id }    = req.params;
    const { amount } = req.body;
    const credits   = parseInt(amount);

    if (!credits || credits < 1) {
      return res.status(400).json({ error: 'Invalid credit amount' });
    }

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) return res.status(404).json({ error: 'School not found' });

    const settings = await prisma.smsSettings.upsert({
      where:  { schoolId: id },
      create: {
        schoolId:      id,
        enabled:       false,
        sendOnPresent: false,
        sendOnAbsent:  true,
        senderId:      'SchoolApp',
        credits,
      },
      update: { credits: { increment: credits } },
    });

    // Log the manual top-up
    await prisma.smsLog.create({
      data: {
        schoolId:    id,
        studentId:   'SYSTEM',
        phone:       'SYSTEM',
        message:     `Super admin manual top-up: +${credits} credits`,
        status:      'topup',
        creditsUsed: -credits,
      },
    });

    res.json({ success: true, credits: settings.credits, added: credits });
  } catch (error: any) {
    console.error('SMS credits top-up error:', error);
    res.status(500).json({ error: error.message || 'Failed to add credits' });
  }
});

// ── GET /super-admin/at-config ────────────────────────────────────────────────
// Fetch the platform-wide Africa's Talking credentials
router.get('/at-config', async (req, res) => {
  try {
    const config = await prisma.platformConfig.findFirst();

    res.json({
      atApiKey:   config?.atApiKey  ? '••••' + config.atApiKey.slice(-4) : '',
      atUsername: config?.atUsername ?? 'sandbox',
      senderId:   config?.senderId   ?? 'SchoolApp',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Africa\'s Talking config' });
  }
});

// ── PUT /super-admin/at-config ────────────────────────────────────────────────
// Save the platform-wide Africa's Talking credentials
router.put('/at-config', async (req, res) => {
  try {
    const { atApiKey, atUsername, senderId } = req.body;
    const isNewKey = atApiKey && !atApiKey.startsWith('••••');

    const existing = await prisma.platformConfig.findFirst();

    if (existing) {
      await prisma.platformConfig.update({
        where: { id: existing.id },
        data: {
          ...(isNewKey               && { atApiKey }),
          ...(atUsername !== undefined && { atUsername }),
          ...(senderId   !== undefined && { senderId }),
        },
      });
    } else {
      // First time saving — create the single config row
      await prisma.platformConfig.create({
        data: {
          atApiKey:   isNewKey ? atApiKey : '',
          atUsername: atUsername ?? 'sandbox',
          senderId:   senderId   ?? 'SchoolApp',
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save Africa\'s Talking config' });
  }
});

export default router;