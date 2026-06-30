import path from 'path';
import { fileURLToPath } from 'url';
import { TesseractOcrEngine } from '../services/TesseractOcrEngine.js';
import { MockAadhaarRepository } from '../repositories/MockAadhaarRepository.js';
import { AadhaarOcrService } from '../services/AadhaarOcrService.js';
import { OcrController } from '../controllers/OcrController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tessdataPath = path.join(__dirname, '..', 'tessdata');

// 1. Instantiate Low-level modules (Engines and repositories)
const ocrEngine = new TesseractOcrEngine(tessdataPath);
const aadhaarRepository = new MockAadhaarRepository();

// 2. Inject dependencies into services
const ocrService = new AadhaarOcrService(ocrEngine, aadhaarRepository);

// 3. Inject services into controllers
const ocrController = new OcrController(ocrService);

export { ocrController, ocrService, ocrEngine, aadhaarRepository };
