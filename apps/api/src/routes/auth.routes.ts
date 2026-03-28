// apps/api/src/routes/auth.routes.ts
import { Router } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // IMPORTANT: Because email is only unique PER SCHOOL (compound unique),
    // we CANNOT use where: { email } alone.
    // Solution 1: If you want global unique email → remove @@unique([email, schoolId]) and keep @unique on email
    // Solution 2: Require school subdomain in login (multi-tenant aware login)
    // For now: let's assume global unique email for simplicity (change schema if needed)
    // If you keep compound → login needs subdomain too (see comment below)

    const user = await prisma.user.findFirst({
      where: { email }, // use findFirst if email not globally unique
      include: {
        role: true,     // ← this fixes "Property 'role' does not exist"
      },
    });

    // Alternative if you want to enforce compound uniqueness during login:
    // const user = await prisma.user.findUnique({
    //   where: {
    //     email_schoolId: {
    //       email,
    //       schoolId: "some-school-id-from-subdomain", // you'd need to resolve school from subdomain first
    //     }
    //   },
    //   include: { role: true }
    // });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role.name, schoolId: user.schoolId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;