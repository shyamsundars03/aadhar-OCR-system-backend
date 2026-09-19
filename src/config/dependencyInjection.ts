import path from 'path';
import { fileURLToPath } from 'url';
import { TesseractOcrEngine } from '../services/TesseractOcrEngine.js';
import { AadhaarValidationService } from '../services/AadhaarValidationService.js';
import { AadhaarOcrService } from '../services/AadhaarOcrService.js';
import { OcrController } from '../controllers/OcrController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tessdataPath = path.join(__dirname, '..', 'tessdata');

const ocrEngine = new TesseractOcrEngine(tessdataPath);
const aadhaarValidationService = new AadhaarValidationService();

const ocrService = new AadhaarOcrService(ocrEngine, aadhaarValidationService);

const ocrController = new OcrController(ocrService);

export { ocrController, ocrService, ocrEngine, aadhaarValidationService };
