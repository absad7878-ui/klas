// apps/api/src/routes/subscription.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';
import crypto from 'crypto';
import https from 'https';

const router = Router();

const PAYSTACK_SECRET  = process.env.PAYSTACK_SECRET_KEY!;
const PRICE_PER_STUDENT = 20;       // ₦20 per student per month
const MINIMUM_AMOUNT    = 0;        // No minimum — pay exactly students × ₦20
const TRIAL_DAYS        = 14;
const SUBSCRIPTION_DAYS = 30;

// ─── Paystack API helper ────────────────────────────────────────────────────
function paystackRequest(method: string, path: string, body?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => (responseData += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(responseData)); }
        catch { reject(new Error('Failed to parse Paystack response')); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ─── Compute status ─────────────────────────────────────────────────────────
function computeStatus(sub: any): 'trial' | 'active' | 'grace' | 'expired' {
  const now = new Date();
  if (sub.status === 'active' && sub.currentPeriodEnd) {
    const end      = new Date(sub.currentPeriodEnd);
    const daysLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysLeft < 0)  return 'expired';
    if (daysLeft <= 3) return 'grace';
    return 'active';
  }
  if (new Date(sub.trialEndDate) > now) return 'trial';
  return 'expired';
}

// ─── GET /subscription/status ───────────────────────────────────────────────
router.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    const schoolId = (req as any).user?.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    // Get student count for this school
    const studentCount = await prisma.student.count({ where: { schoolId } });
    const amountDue    = Math.max(MINIMUM_AMOUNT, studentCount * PRICE_PER_STUDENT);

    let sub = await prisma.subscription.findUnique({
      where:   { schoolId },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });

    // Auto-create if missing
    if (!sub) {
      const school     = await prisma.school.findUnique({ where: { id: schoolId } });
      const trialStart = school?.createdAt || new Date();
      const trialEnd   = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
      sub = await prisma.subscription.create({
        data:    { schoolId, status: 'trial', trialStartDate: trialStart, trialEndDate: trialEnd },
        include: { payments: true },
      });
    }

    const computedStatus = computeStatus(sub);
    const now = new Date();
    let daysLeft = 0;
    if (computedStatus === 'trial') {
      daysLeft = Math.ceil((new Date(sub.trialEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else if (computedStatus === 'active' || computedStatus === 'grace') {
      daysLeft = Math.ceil((new Date(sub.currentPeriodEnd!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return res.json({
      status:           computedStatus,
      trialEndDate:     sub.trialEndDate,
      currentPeriodEnd: sub.currentPeriodEnd,
      lastPaymentDate:  sub.lastPaymentDate,
      daysLeft:         Math.max(0, daysLeft),
      amountDue,               // ← dynamic: students × ₦20
      studentCount,            // ← send to frontend so it can show breakdown
      pricePerStudent:  PRICE_PER_STUDENT,
      payments:         sub.payments,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /subscription/initialize ──────────────────────────────────────────
router.post('/initialize', authenticate, async (req: Request, res: Response) => {
  try {
    const schoolId = (req as any).user?.schoolId;
    const userId   = (req as any).user?.id;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const user   = await prisma.user.findUnique({ where: { id: userId } });
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!user || !school) return res.status(404).json({ error: 'User or school not found' });

    // Calculate amount based on current student count
    const studentCount = await prisma.student.count({ where: { schoolId } });
    const amountNaira  = Math.max(MINIMUM_AMOUNT, studentCount * PRICE_PER_STUDENT);

    if (amountNaira === 0) {
      return res.status(400).json({
        error: 'No students registered yet. Add students before subscribing.',
      });
    }

    const amountKobo = amountNaira * 100;
    const reference  = `sub_${schoolId.slice(0, 8)}_${Date.now()}`;

    const paystackRes = await paystackRequest('POST', '/transaction/initialize', {
      email:        user.email,
      amount:       amountKobo,
      reference,
      currency:     'NGN',
      callback_url: `${process.env.FRONTEND_URL}/subscription?verify=${reference}`,
      metadata: {
        schoolId,
        schoolName:   school.name,
        studentCount,
        pricePerStudent: PRICE_PER_STUDENT,
        paymentType:  'monthly_subscription',
        custom_fields: [
          { display_name: 'School',    variable_name: 'school_name',    value: school.name },
          { display_name: 'Students',  variable_name: 'student_count',  value: `${studentCount} students` },
          { display_name: 'Plan',      variable_name: 'plan',           value: `₦${PRICE_PER_STUDENT}/student/month` },
          { display_name: 'Amount',    variable_name: 'amount',         value: `₦${amountNaira.toLocaleString()}` },
        ],
      },
    });

    if (!paystackRes.status) {
      return res.status(400).json({ error: paystackRes.message || 'Paystack initialization failed' });
    }

    return res.json({
      authorization_url: paystackRes.data.authorization_url,
      reference:         paystackRes.data.reference,
      amountNaira,
      studentCount,
    });
  } catch (error) {
    console.error('Subscription initialize error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /subscription/verify/:reference ───────────────────────────────────
router.post('/verify/:reference', authenticate, async (req: Request, res: Response) => {
  try {
    const reference = req.params.reference as string;
    const schoolId  = (req as any).user?.schoolId as string;

    const paystackRes = await paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);

    if (!paystackRes.status || paystackRes.data?.status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful', details: paystackRes.data?.status });
    }

    const meta = paystackRes.data.metadata;
    if (meta?.schoolId && meta.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Payment does not belong to this school' });
    }

    const existing = await prisma.subscriptionPayment.findUnique({ where: { paystackReference: reference } });
    if (existing) return res.json({ success: true, message: 'Already applied', alreadyApplied: true });

    await activateSubscription(schoolId, reference, paystackRes.data.amount / 100);
    return res.json({ success: true, message: 'Subscription activated' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /subscription/webhook ─────────────────────────────────────────────
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (hash !== req.headers['x-paystack-signature']) return res.status(401).send('Invalid signature');

    const { event, data } = req.body;
    if (event === 'charge.success' && data?.metadata?.paymentType === 'monthly_subscription') {
      const schoolId = data.metadata?.schoolId;
      if (schoolId) {
        const existing = await prisma.subscriptionPayment.findUnique({ where: { paystackReference: data.reference } });
        if (!existing) await activateSubscription(schoolId, data.reference, data.amount / 100);
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// ─── Shared: activate subscription ──────────────────────────────────────────
async function activateSubscription(schoolId: string, reference: string, amountNaira: number) {
  const now       = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + SUBSCRIPTION_DAYS);

  await prisma.$transaction([
    prisma.subscriptionPayment.create({
      data: {
        subscription:      { connect: { schoolId } },
        paystackReference: reference,
        amount:            amountNaira,
        status:            'success',
        paidAt:            now,
        periodStart:       now,
        periodEnd,
      },
    }),
    prisma.subscription.update({
      where: { schoolId },
      data: {
        status:             'active',
        currentPeriodStart: now,
        currentPeriodEnd:   periodEnd,
        lastPaymentDate:    now,
        paystackReference:  reference,
        amountPaid:         amountNaira,
      },
    }),
  ]);
}

export default router;