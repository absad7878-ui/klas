// apps/api/src/controllers/school.controller.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSchoolSchema } from '../schemas/school.schema';
import bcrypt from 'bcrypt';
import { Resend } from 'resend';

// ── Mailer setup ─────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendRegistrationConfirmation(opts: {
  adminEmail: string;
  officialEmail: string;
  schoolName: string;
  subdomain: string;
}) {
  const { adminEmail, officialEmail, schoolName, subdomain } = opts;

  const year     = new Date().getFullYear();
  const loginUrl = `${process.env.FRONTEND_URL}/school-login`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" />
      <style>
        body{font-family:Arial,sans-serif;background:#F7F6F2;margin:0;padding:40px 20px;}
        .card{background:#fff;border-radius:20px;max-width:520px;margin:0 auto;overflow:hidden;box-shadow:0 4px 30px rgba(11,29,58,.1);}
        .header{background:#0B1D3A;padding:36px 40px;text-align:center;}
        .header h1{color:#fff;font-size:20px;margin:0 0 4px;font-weight:700;}
        .header p{color:#64748B;font-size:13px;margin:0;}
        .mark{width:52px;height:52px;background:linear-gradient(135deg,#C9963A,#E8B85A);border-radius:14px;display:inline-block;line-height:52px;text-align:center;font-size:26px;font-weight:900;color:#0B1D3A;margin-bottom:16px;}
        .body{padding:32px 40px;}
        .body p{color:#334155;font-size:15px;line-height:1.7;margin:0 0 14px;}
        .row{display:flex;gap:8px;margin-bottom:8px;}
        .lbl{color:#94A3B8;font-size:13px;min-width:120px;}
        .val{color:#0B1D3A;font-size:13px;font-weight:600;}
        .btn{display:block;width:fit-content;margin:24px auto 0;padding:13px 32px;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;font-size:14px;text-decoration:none;border-radius:11px;}
        .footer{text-align:center;padding:20px 40px 28px;color:#94A3B8;font-size:12px;}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="mark">K</div>
          <h1>Klas School Management Platform</h1>
          <p>Registration Confirmed</p>
        </div>
        <div class="body">
          <p>Your school has been successfully registered on Klas School Management Platform.</p>
          <div class="row"><span class="lbl">School name</span><span class="val">${schoolName}</span></div>
          <div class="row"><span class="lbl">Subdomain</span><span class="val">${subdomain}</span></div>
          <div class="row"><span class="lbl">Admin email</span><span class="val">${adminEmail}</span></div>
          <div class="row"><span class="lbl">Free trial</span><span class="val">14 days from today</span></div>
          <a href="${loginUrl}" class="btn">Login to Dashboard &rarr;</a>
        </div>
        <div class="footer">&copy; ${year} Klas School Management Platform &middot; This is an automated message, please do not reply.</div>
      </div>
    </body>
    </html>
  `;

  const recipients = [...new Set([adminEmail, officialEmail].filter(Boolean))];

  await resend.emails.send({
    from: 'Klas Platform <noreply@klas.ng>',
    to:      recipients,
    subject: `Your school "${schoolName}" is now registered — Klas Platform`,
    html,
  });
}

// ── Controller ───────────────────────────────────────────────────────────────
export const registerSchool = async (req: Request, res: Response) => {
  try {
    let parsedBody: any;

    try {
      parsedBody = {
        name:              req.body.name,
        subdomain:         req.body.subdomain,
        adminEmail:        req.body.adminEmail,
        adminPassword:     req.body.adminPassword,
        officialEmail:     req.body.officialEmail,
        gradingSystem:     req.body.gradingSystem     ? JSON.parse(req.body.gradingSystem)     : undefined,
        academicStructure: req.body.academicStructure ? JSON.parse(req.body.academicStructure) : undefined,
        address:           req.body.address     || undefined,
        phoneNumber:       req.body.phoneNumber || undefined,
        website:           req.body.website     || undefined,
        description:       req.body.description || undefined,
      };
    } catch (parseErr) {
      console.error('JSON parse error in form fields:', parseErr);
      return res.status(400).json({ error: 'Invalid format in form data (JSON parsing failed)' });
    }

    console.log('[DEBUG] Full req.body:', JSON.stringify(req.body, null, 2));
    console.log('[DEBUG] req.files:', req.files ? Object.keys(req.files) : 'no files');
    console.log('[ZOD INPUT BEFORE PARSE]:', parsedBody);

    const parseResult = createSchoolSchema.safeParse(parsedBody);

    if (!parseResult.success) {
      console.log('[ZOD VALIDATION FAILED]:', parseResult.error.flatten().fieldErrors);
      return res.status(400).json({
        error:   'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
        issues:  parseResult.error.issues,
      });
    }

    const input = parseResult.data;
    console.log('[ZOD PASSED] Input:', input);

    const existingSchool = await prisma.school.findUnique({
      where: { subdomain: input.subdomain },
    });
    if (existingSchool) {
      return res.status(409).json({ error: 'Subdomain already taken. Please choose another.' });
    }

    const files       = req.files as Record<string, Express.Multer.File[]> | undefined;
    const logoUrl     = files?.['logo']?.[0]   ? (files['logo'][0]   as any).path : null;
    const coverImgUrl = files?.['cover']?.[0]  ? (files['cover'][0]  as any).path :
                        files?.['banner']?.[0] ? (files['banner'][0] as any).path : null;

    const newSchool = await prisma.school.create({
      data: {
        name:              input.name,
        subdomain:         input.subdomain,
        logoUrl,
        coverImageUrl:     coverImgUrl,
        address:           req.body.address       || null,
        phone:             req.body.phoneNumber   || null,
        email:             req.body.officialEmail || null,
        website:           req.body.website       || null,
        description:       req.body.description   || null,
        gradingSystem:     input.gradingSystem     ?? null,
        academicStructure: input.academicStructure ?? null,
      },
    });

    for (const role of [
      { name: 'SCHOOL_ADMIN', permissions: JSON.stringify(['*']) },
      { name: 'TEACHER',      permissions: JSON.stringify(['manage_students', 'input_results']) },
      { name: 'PARENT',       permissions: JSON.stringify(['view_child_data']) },
    ]) {
      await prisma.role.create({ data: { ...role, schoolId: newSchool.id } });
    }

    const adminRole = await prisma.role.findUnique({
      where: { name_schoolId: { name: 'SCHOOL_ADMIN', schoolId: newSchool.id } },
    });
    if (!adminRole) throw new Error('Failed to create or find SCHOOL_ADMIN role');

    const hashedPassword = await bcrypt.hash(input.adminPassword, 12);
    const adminUser = await prisma.user.create({
      data: {
        email:    input.adminEmail,
        password: hashedPassword,
        roleId:   adminRole.id,
        schoolId: newSchool.id,
      },
    });

    const trialStart = new Date();
    const trialEnd   = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 14);

    await prisma.subscription.create({
      data: {
        schoolId:       newSchool.id,
        status:         'trial',
        trialStartDate: trialStart,
        trialEndDate:   trialEnd,
      },
    });

    const officialEmail = req.body.officialEmail || input.adminEmail;
    sendRegistrationConfirmation({
      adminEmail:    input.adminEmail,
      officialEmail: officialEmail,
      schoolName:    newSchool.name,
      subdomain:     newSchool.subdomain,
    }).catch(err => console.error('[Email] Registration confirmation failed:', err));

    return res.status(201).json({
      message: 'School registered and provisioned successfully',
      school: {
        id:            newSchool.id,
        name:          newSchool.name,
        subdomain:     newSchool.subdomain,
        logoUrl:       newSchool.logoUrl,
        coverImageUrl: newSchool.coverImageUrl,
      },
      adminUser: { email: adminUser.email },
    });
  } catch (error) {
    console.error('School registration error:', error);
    return res.status(500).json({ error: 'Failed to register school' });
  }
};