// apps/api/src/routes/terms.routes.ts
// Mount at: app.use('/terms', termsRoutes)

import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// GET /terms — list all terms for this school (teachers + admins)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const schoolId = (req as any).user?.schoolId;
    const terms = await prisma.academicTerm.findMany({
      where:   { schoolId },
      orderBy: [{ session: 'desc' }, { createdAt: 'asc' }],
    });
    return res.json(terms);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch terms' });
  }
});

// POST /terms — create a new term (admin only)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const schoolId = (req as any).user?.schoolId;
    const { name, session, startDate, endDate } = req.body;

    if (!name || !session || !startDate || !endDate) {
      return res.status(400).json({ error: 'name, session, startDate and endDate are required' });
    }
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'endDate must be after startDate' });
    }

    const existing = await prisma.academicTerm.findFirst({
      where: { schoolId, name, session },
    });
    if (existing) {
      return res.status(409).json({ error: `${name} for ${session} already exists` });
    }

    const term = await prisma.academicTerm.create({
      data: {
        schoolId,
        name,
        session,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        isCurrent: false,
      },
    });

    return res.status(201).json(term);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create term' });
  }
});

// PATCH /terms/:id — update a term
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const schoolId = (req as any).user?.schoolId;
    const id = String(req.params.id);
    const { name, session, startDate, endDate } = req.body;

    const term = await prisma.academicTerm.findFirst({ where: { id, schoolId } });
    if (!term) return res.status(404).json({ error: 'Term not found' });

    const updated = await prisma.academicTerm.update({
      where: { id },
      data: {
        ...(name      && { name }),
        ...(session   && { session }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate   && { endDate:   new Date(endDate) }),
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update term' });
  }
});

// PATCH /terms/:id/set-current — mark a term as the current one
router.patch('/:id/set-current', authenticate, async (req: Request, res: Response) => {
  try {
    const schoolId = (req as any).user?.schoolId;
    const { id }   = req.params as { id: string };

    await prisma.academicTerm.updateMany({
      where: { schoolId },
      data:  { isCurrent: false },
    });
    await prisma.academicTerm.update({
      where: { id },
      data:  { isCurrent: true },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update current term' });
  }
});

// DELETE /terms/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const schoolId = (req as any).user?.schoolId;
    const { id }   = req.params as { id: string };

    const term = await prisma.academicTerm.findFirst({ where: { id, schoolId } });
    if (!term) return res.status(404).json({ error: 'Term not found' });

    await prisma.academicTerm.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete term' });
  }
});

export default router;