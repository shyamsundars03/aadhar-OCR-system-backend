import express from 'express';
import upload from '../middleware/upload.js';
import ocrController from '../controllers/ocr.controller.js';
import { validate } from '../middleware/validate.js';
import { aadhaarUploadSchema } from '../validations/ocr.validation.js';

const router = express.Router();

router.post('/aadhaar', upload, validate(aadhaarUploadSchema), ocrController.processAadhaar);

export default router;
