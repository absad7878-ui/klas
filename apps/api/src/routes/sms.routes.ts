// apps/api/src/routes/sms.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { sendSms, getTermiiBalance } from '../services/sms.service';
import prisma from '../lib/prisma';

const router = Router();
router.use(authenticate);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_REPLACE_WITH_YOUR_KEY';

const getApiKey    = () => process.env.TERMII_API_KEY   || '';
const getSenderId  = () => process.env.TERMII_SENDER_ID || 'SchoolAlert';

// ── GET /sms/settings ─────────────────────────────────────────────────────────
router.get('/settings', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const settings = await prisma.smsSettings.findUnique({ where: { schoolId } });

    if (!settings) {
      return res.json({ enabled: false, credits: 0, sendOnPresent: false, sendOnAbsent: true, senderId: 'SchoolAlert' });
    }

    res.json({
      enabled:       settings.enabled,
      credits:       settings.credits,
      sendOnPresent: settings.sendOnPresent,
      sendOnAbsent:  settings.sendOnAbsent,
      senderId:      settings.senderId,
    });
  } catch (error) {
    console.error('GET /sms/settings error:', error);
    res.status(500).json({ error: 'Failed to fetch SMS settings' });
  }
});

// ── PUT /sms/settings ─────────────────────────────────────────────────────────
router.put('/settings', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const { enabled, sendOnPresent, sendOnAbsent, senderId } = req.body;

    const settings = await prisma.smsSettings.upsert({
      where:  { schoolId },
      create: {
        schoolId,
        enabled:       enabled       ?? false,
        sendOnPresent: sendOnPresent ?? false,
        sendOnAbsent:  sendOnAbsent  ?? true,
        termiiApiKey:  '',
        senderId:      senderId ?? getSenderId(),
        credits:       0,
      },
      update: {
        ...(enabled       !== undefined && { enabled }),
        ...(sendOnPresent !== undefined && { sendOnPresent }),
        ...(sendOnAbsent  !== undefined && { sendOnAbsent }),
        ...(senderId      !== undefined && { senderId }),
      },
    });

    res.json({ success: true, enabled: settings.enabled, credits: settings.credits });
  } catch (error) {
    console.error('PUT /sms/settings error:', error);
    res.status(500).json({ error: 'Failed to update SMS settings' });
  }
});

// ── POST /sms/credits/topup ───────────────────────────────────────────────────
router.post('/credits/topup', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const { amount, reference, price } = req.body;
    const credits = parseInt(amount);

    if (!credits || credits < 1 || credits > 10000) return res.status(400).json({ error: 'Invalid credit amount' });
    if (!reference) return res.status(400).json({ error: 'Payment reference is required' });

    const alreadyUsed = await prisma.smsLog.findFirst({ where: { schoolId, message: { contains: reference } } });
    if (alreadyUsed) return res.status(400).json({ error: 'This payment reference has already been used' });

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );

    if (!paystackRes.ok) return res.status(402).json({ error: 'Could not reach Paystack to verify payment' });

    const paystackData = await paystackRes.json() as any;
    if (!paystackData.status || paystackData.data?.status !== 'success') {
      return res.status(402).json({ error: 'Payment was not successful — please try again' });
    }

    const expectedKobo = (price ?? 0) * 100;
    const paidKobo     = paystackData.data.amount;
    if (expectedKobo > 0 && paidKobo < expectedKobo) {
      return res.status(402).json({ error: 'Payment amount does not match the package price' });
    }

    const settings = await prisma.smsSettings.upsert({
      where:  { schoolId },
      create: { schoolId, enabled: false, sendOnPresent: false, sendOnAbsent: true, termiiApiKey: '', senderId: getSenderId(), credits },
      update: { credits: { increment: credits } },
    });

    await prisma.smsLog.create({
      data: {
        schoolId, studentId: 'SYSTEM', phone: 'SYSTEM',
        message:     `Paystack top-up: +${credits} credits | ref: ${reference} | NGN${price ?? paidKobo / 100}`,
        status:      'topup',
        creditsUsed: -credits,
      },
    });

    console.log(`Credits added | school=${schoolId} | +${credits} credits | ref=${reference}`);
    res.json({ success: true, credits: settings.credits, added: credits });
  } catch (error) {
    console.error('POST /sms/credits/topup error:', error);
    res.status(500).json({ error: 'Failed to process payment — please contact support' });
  }
});

// ── GET /sms/balance ──────────────────────────────────────────────────────────
router.get('/balance', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const settings = await prisma.smsSettings.findUnique({ where: { schoolId } });
    const apiKey   = getApiKey();
    if (!apiKey) return res.status(400).json({ error: 'SMS not configured on this platform' });

    const balance = await getTermiiBalance(apiKey);
    res.json({ balance, credits: settings?.credits ?? 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check balance' });
  }
});

// ── GET /sms/logs ─────────────────────────────────────────────────────────────
router.get('/logs', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const page  = parseInt(req.query.page  as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip  = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.smsLog.findMany({ where: { schoolId }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.smsLog.count({ where: { schoolId } }),
    ]);

    res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SMS logs' });
  }
});

// ── GET /sms/stats ────────────────────────────────────────────────────────────
router.get('/stats', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalSent, totalFailed, monthSent, settings] = await Promise.all([
      prisma.smsLog.count({ where: { schoolId, status: 'sent' } }),
      prisma.smsLog.count({ where: { schoolId, status: 'failed' } }),
      prisma.smsLog.count({ where: { schoolId, status: 'sent', createdAt: { gte: startOfMonth } } }),
      prisma.smsSettings.findUnique({ where: { schoolId } }),
    ]);

    res.json({ totalSent, totalFailed, monthSent, credits: settings?.credits ?? 0, enabled: settings?.enabled ?? false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SMS stats' });
  }
});

// ── POST /sms/send-fee-reminder ───────────────────────────────────────────────
router.post('/send-fee-reminder', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { studentId, studentName, amountDue, amountPaid, balance, term, className } = req.body;

    if (!studentId) return res.status(400).json({ error: 'studentId is required' });

    const student = await prisma.student.findFirst({ where: { id: studentId, schoolId }, include: { parent: true } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const phone = student.parent?.phone;
    if (!phone) return res.status(400).json({ error: 'No parent phone number registered for this student' });

    const smsSettings = await prisma.smsSettings.findUnique({ where: { schoolId } });
    if (!smsSettings?.enabled) return res.status(400).json({ error: 'SMS notifications are disabled. Enable them in SMS Settings.' });
    if ((smsSettings.credits ?? 0) <= 0) return res.status(400).json({ error: 'No SMS credits remaining. Please top up.' });

    const apiKey = getApiKey();
    if (!apiKey) return res.status(500).json({ error: 'SMS not configured on this platform. Contact admin.' });

    const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } });

    const message = `Dear Parent, this is a reminder that ${studentName}'s school fees for ${term} (${className}) has an outstanding balance of NGN ${balance.toLocaleString()}. Amount due: NGN ${amountDue.toLocaleString()}, Amount paid: NGN ${amountPaid.toLocaleString()}. Please pay at your earliest convenience. - ${school?.name}`;

    const result = await sendSms(phone, message, apiKey, smsSettings.senderId || getSenderId());

    if (!result.success) throw new Error(result.error || 'SMS delivery failed');

    await prisma.smsSettings.update({ where: { schoolId }, data: { credits: { decrement: 1 } } });
    await prisma.smsLog.create({ data: { schoolId, studentId, phone, message, status: 'sent', creditsUsed: 1 } });

    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (error: any) {
    console.error('Fee reminder SMS error:', error);
    res.status(500).json({ error: error.message || 'Failed to send reminder' });
  }
});

// ── POST /sms/send-fee-reminder/bulk ─────────────────────────────────────────
router.post('/send-fee-reminder/bulk', async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { students, term, className } = req.body;

    if (!Array.isArray(students) || students.length === 0) return res.status(400).json({ error: 'No students provided' });

    const smsSettings = await prisma.smsSettings.findUnique({ where: { schoolId } });
    if (!smsSettings?.enabled) return res.status(400).json({ error: 'SMS notifications are disabled.' });

    const credits = smsSettings.credits ?? 0;
    if (credits < students.length) return res.status(400).json({ error: `Not enough SMS credits. You need ${students.length} but only have ${credits}.` });

    const apiKey = getApiKey();
    if (!apiKey) return res.status(500).json({ error: 'SMS not configured on this platform. Contact admin.' });

    const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } });

    let sent = 0, failed = 0;

    for (const s of students) {
      try {
        const student = await prisma.student.findFirst({ where: { id: s.studentId, schoolId }, include: { parent: true } });
        const phone = student?.parent?.phone;
        if (!phone) { failed++; continue; }

        const message = `Dear Parent, this is a reminder that ${s.studentName}'s school fees for ${term} (${className}) has an outstanding balance of NGN ${s.balance.toLocaleString()}. Please pay at your earliest convenience. - ${school?.name}`;

        const result = await sendSms(phone, message, apiKey, smsSettings.senderId || getSenderId());

        await prisma.smsLog.create({
          data: { schoolId, studentId: s.studentId, phone, message, status: result.success ? 'sent' : 'failed', creditsUsed: result.success ? 1 : 0 },
        });

        if (result.success) sent++; else failed++;
      } catch {
        failed++;
      }
    }

    if (sent > 0) {
      await prisma.smsSettings.update({ where: { schoolId }, data: { credits: { decrement: sent } } });
    }

    res.json({ success: true, sent, failed });
  } catch (error: any) {
    console.error('Bulk fee reminder error:', error);
    res.status(500).json({ error: error.message || 'Failed to send bulk reminders' });
  }
});

export default router;