// apps/api/src/schemas/school.schema.ts
import { z } from 'zod';

const passwordStrength = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long')
  .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
  .refine((val) => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter' })
  .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number' });

export const createSchoolSchema = z.object({
  name: z
    .string()
    .min(3, 'School name must be at least 3 characters')
    .max(100, 'School name cannot exceed 100 characters')
    .trim(),

  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain cannot exceed 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomain can only contain lowercase letters, numbers, and hyphens (no spaces or special characters)'
    )
    .transform((val) => val.toLowerCase())
    .refine((val) => !val.startsWith('-') && !val.endsWith('-'), {
      message: 'Subdomain cannot start or end with a hyphen',
    }),

  gradingSystem: z
    .object({
      type: z.enum(['letter', 'gpa', 'percentage']),
      scale: z.array(z.string().min(1)).min(2).optional(),
    })
    .optional()
    .default({ type: 'letter', scale: ['A', 'B', 'C', 'D', 'F'] }),

  academicStructure: z
    .object({
      termsPerYear: z.number().int().min(1).max(4).default(3),
      usesSemesters: z.boolean().default(false),
    })
    .optional()
    .default({ termsPerYear: 3, usesSemesters: false }),

  adminEmail: z.string().email('Please provide a valid email address for the admin').trim(),

  adminPassword: passwordStrength,
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;