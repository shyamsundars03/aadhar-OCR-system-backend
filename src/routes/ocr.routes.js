import express from 'express';
import upload from '../middleware/upload.js';
import ocrController from '../controllers/ocr.controller.js';

const router = express.Router();

router.post('/aadhaar', upload, ocrController.processAadhaar);

export default router;
