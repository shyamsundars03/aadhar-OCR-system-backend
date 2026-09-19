import { IAadhaarOcrService, IAadhaarUploadPayload } from '../interfaces/IAadhaarOcrService.interface.js';
import { IOcrEngine } from '../interfaces/IOcrEngine.interface.js';
import { AadhaarValidationService } from './AadhaarValidationService.js';
import { IAadhaarData } from '../types/aadhaar.types.js';
import { parse } from '../utils/aadhaarParser.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';

export class AadhaarOcrService implements IAadhaarOcrService {
  private ocrEngine: IOcrEngine;
  private validationService: AadhaarValidationService;

  constructor(ocrEngine: IOcrEngine, validationService: AadhaarValidationService) {
    this.ocrEngine = ocrEngine;
    this.validationService = validationService;
  }

  async processAadhaar(payload: IAadhaarUploadPayload): Promise<IAadhaarData> {
    const { frontFile, backFile } = payload;
    
    try {
      // 1. Run both OCR jobs concurrently
      const [frontText, backText] = await Promise.all([
        this.ocrEngine.recognize(frontFile.buffer),
        this.ocrEngine.recognize(backFile.buffer)
      ]);

      // 2. Perform all document validations (Aadhaar detection, side orientation, front-back matching, Verhoeff checksum)
      this.validationService.verifyDocument(frontText, backText);

      // 3. Parse combined text to extract fields
      const combinedText = `${frontText}\n${backText}`;
      const parsedData = parse(combinedText);

      // 4. Verify extraction succeeded
      if (!parsedData.aadhaarNumber && !parsedData.name) {
        throw new AppError(ERROR_MESSAGES.FAILED_TO_EXTRACT, HTTP_STATUS.BAD_REQUEST);
      }

      return parsedData;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error
        ? `${ERROR_MESSAGES.PROCESSING_FAILED}: ${error.message}`
        : ERROR_MESSAGES.PROCESSING_FAILED;
      throw new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
