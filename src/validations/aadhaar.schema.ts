import { z } from 'zod';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadedFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(val => ALLOWED_MIME_TYPES.includes(val.toLowerCase()), {
    message: 'Only JPEG, JPG, PNG, and WebP images are allowed'
  }),
  buffer: z.custom<Buffer>(val => Buffer.isBuffer(val), {
    message: 'Expected a valid file buffer'
  }),
  size: z.number().max(MAX_FILE_SIZE, 'File size cannot exceed 5MB')
});

export const aadhaarUploadSchema = z.object({
  files: z.object({
    frontImage: z.array(uploadedFileSchema)
      .min(1, 'Front image of Aadhaar is required')
      .max(1, 'Only one front image is allowed'),
    backImage: z.array(uploadedFileSchema)
      .min(1, 'Back image of Aadhaar is required')
      .max(1, 'Only one back image is allowed')
  })
});

// Single source of truth: Infer TypeScript static types directly from Zod Schema
export type AadhaarUploadInput = z.infer<typeof aadhaarUploadSchema>;
export type UploadedFileDTO = z.infer<typeof uploadedFileSchema>;
