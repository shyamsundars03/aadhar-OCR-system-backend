import { z } from 'zod';

const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(val => ['image/jpeg', 'image/png', 'image/jpg'].includes(val), {
    message: 'Only JPEG, JPG, and PNG images are allowed'
  }),
  buffer: z.any(),
  size: z.number().max(5 * 1024 * 1024, 'File size cannot exceed 5MB')
});

export const aadhaarUploadSchema = z.object({
  files: z.object({
    frontImage: z.array(fileSchema).min(1, 'Front image is required').max(1),
    backImage: z.array(fileSchema).min(1, 'Back image is required').max(1)
  }, { required_error: 'Both front and back images are required' })
});
