import { IAadhaarOcrService } from '../interfaces/IAadhaarOcrService.interface.js';
import { IOcrEngine } from '../interfaces/IOcrEngine.interface.js';
import { IAadhaarRepository } from '../interfaces/IAadhaarRepository.interface.js';
import { IAadhaarData, IUploadedFile } from '../types/aadhaar.types.js';
import { parse } from '../utils/aadhaarParser.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';

export class AadhaarOcrService implements IAadhaarOcrService {
  private ocrEngine: IOcrEngine;
  private aadhaarRepository: IAadhaarRepository;

  constructor(ocrEngine: IOcrEngine, aadhaarRepository: IAadhaarRepository) {
    this.ocrEngine = ocrEngine;
    this.aadhaarRepository = aadhaarRepository;
  }

  async processAadhaar(frontFile: IUploadedFile, backFile: IUploadedFile): Promise<IAadhaarData> {
    try {
      // Run both OCR jobs concurrently
      const [frontText, backText] = await Promise.all([
        this.ocrEngine.recognize(frontFile.buffer),
        this.ocrEngine.recognize(backFile.buffer)
      ]);

      const frontParsed = parse(frontText);
      const backParsed = parse(backText);

      const frontFull = frontParsed.aadhaarNumber;
      const backFull = backParsed.aadhaarNumber;
      const frontSuffix = frontParsed.aadhaarSuffix;
      const backSuffix = backParsed.aadhaarSuffix;

      if (frontFull && backFull && frontFull !== backFull) {
        throw new AppError(ERROR_MESSAGES.AADHAAR_NUMBERS_MISMATCH, HTTP_STATUS.BAD_REQUEST);
      } else if (frontSuffix && backSuffix && frontSuffix !== backSuffix) {
        throw new AppError(ERROR_MESSAGES.AADHAAR_NUMBERS_MISMATCH, HTTP_STATUS.BAD_REQUEST);
      }

      const combinedText = `${frontText}\n${backText}`;
      const parsedData = parse(combinedText);

      if (!parsedData.aadhaarNumber && backFull) {
        parsedData.aadhaarNumber = backFull;
        parsedData.aadhaarSuffix = backParsed.aadhaarSuffix;
      }

      if (!parsedData.aadhaarNumber && !parsedData.name) {
        throw new AppError(ERROR_MESSAGES.FAILED_TO_EXTRACT, HTTP_STATUS.BAD_REQUEST);
      }

      // Save to repository (Database abstraction)
      await this.aadhaarRepository.save(parsedData);

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
