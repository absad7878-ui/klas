// apps/api/src/routes/school.routes.ts
import { Router } from 'express';
import { registerSchool } from '../controllers/school.controller';
import { authenticate } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { handleLogoUpload, handleBrandingUpload } from '../middlewares/file.middleware';


const router = Router();

// Register new school
router.post('/register', handleLogoUpload, registerSchool);

// Search schools for landing page autocomplete
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length < 1) {
      return res.json({ schools: [] });
    }
    const searchTerm = q.trim();
    const schools = await prisma.school.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { subdomain: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, subdomain: true, logoUrl: true },
      take: 10,
      orderBy: { name: 'asc' },
    });
    res.json({ schools });
  } catch (error) {
    console.error('School search error:', error);
    res.status(500).json({ error: 'Failed to search schools' });
  }
});

// ── BANK DETAILS (protected) ──────────────────────────────────────────────────

/**
 * GET /schools/bank-details
 * Load the school's saved bank details (admin only).
 */
router.get('/bank-details', authenticate, async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { bankName: true, accountNumber: true, accountName: true },
    });

    if (!school?.bankName) {
      return res.status(404).json({ error: 'No bank details saved yet' });
    }

    res.json(school);
  } catch (error) {
    console.error('GET /schools/bank-details error:', error);
    res.status(500).json({ error: 'Failed to fetch bank details' });
  }
});

/**
 * PUT /schools/bank-details
 * Save or update the school's bank details (admin only).
 */
router.put('/bank-details', authenticate, async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const { bankName, accountNumber, accountName } = req.body;
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({ error: 'bankName, accountNumber, and accountName are all required' });
    }

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: { bankName, accountNumber, accountName },
      select: { bankName: true, accountNumber: true, accountName: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('PUT /schools/bank-details error:', error);
    res.status(500).json({ error: 'Failed to save bank details' });
  }
});


router.put('/branding', authenticate, handleBrandingUpload, async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const updateData: any = {};

    if (files?.['logo']?.[0])   updateData.logoUrl       = (files['logo'][0]   as any).path;
    if (files?.['cover']?.[0])  updateData.coverImageUrl = (files['cover'][0]  as any).path;
    if (files?.['banner']?.[0]) updateData.coverImageUrl = (files['banner'][0] as any).path;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: updateData,
      select: { logoUrl: true, coverImageUrl: true },
    });

    res.json({ message: 'Branding updated successfully', ...updated });
  } catch (error) {
    console.error('PUT /schools/branding error:', error);
    res.status(500).json({ error: 'Failed to update branding' });
  }
});

router.put('/contact', authenticate, async (req: any, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(403).json({ error: 'No school associated' });

    const { address, phone, email, website, description } = req.body;

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: {
        address:     address     || null,
        phone:       phone       || null,
        email:       email       || null,
        website:     website     || null,
        description: description || null,
      },
      select: {
        address: true, phone: true, email: true,
        website: true, description: true,
      },
    });

    res.json({ message: 'Contact details updated', ...updated });
  } catch (error) {
    console.error('PUT /schools/contact error:', error);
    res.status(500).json({ error: 'Failed to update contact details' });
  }
});
// ── SCHOOL PROFILE ────────────────────────────────────────────────────────────

// Get single school details (for profile page)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({
      where: { id },
      select: {
        id: true, name: true, subdomain: true, address: true,
        phone: true, email: true, website: true, description: true,
        logoUrl: true, coverImageUrl: true, createdAt: true, updatedAt: true,
      },
    });

    if (!school) return res.status(404).json({ error: 'School not found' });

    const counts = await prisma.school.findUnique({
      where: { id },
      select: { _count: { select: { students: true, teachers: true, classes: true } } },
    });

    res.json({
      ...school,
      studentCount: counts?._count.students ?? 0,
      teacherCount: counts?._count.teachers ?? 0,
      classCount:   counts?._count.classes  ?? 0,
    });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ error: 'Failed to fetch school details' });
  }
});

export default router;