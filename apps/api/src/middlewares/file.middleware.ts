// apps/api/src/middlewares/file.middleware.ts
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          (req: any, file: any) =>
                       file.fieldname === 'cover' || file.fieldname === 'banner'
                         ? 'klas-ng/banners'
                         : 'klas-ng/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    public_id:       (req: any, file: any) =>
                       `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  } as any,
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'logo',   maxCount: 1 },
  { name: 'cover',  maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

export const handleLogoUpload = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

const brandingUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'logo',   maxCount: 1 },
  { name: 'cover',  maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

export const handleBrandingUpload = (req: Request, res: Response, next: NextFunction) => {
  brandingUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};