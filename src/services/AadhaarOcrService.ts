import { IAadhaarOcrService } from '../interfaces/IAadhaarOcrService.interface.js';
import { IOcrEngine } from '../interfaces/IOcrEngine.interface.js';
import { IAadhaarRepository } from '../interfaces/IAadhaarRepository.interface.js';
import { IAadhaarData, IUploadedFile } from '../types/aadhaar.types.js';
import { parse } from '../utils/aadhaarParser.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

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
        throw new AppError(
          'The Aadhaar numbers on the front and back images do not match. Please upload images of the same Aadhaar card.',
          HTTP_STATUS.BAD_REQUEST
        );
      } else if (frontSuffix && backSuffix && frontSuffix !== backSuffix) {
        throw new AppError(
          'The Aadhaar numbers on the front and back images do not match. Please upload images of the same Aadhaar card.',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const combinedText = `${frontText}\n${backText}`;
      const parsedData = parse(combinedText);

      if (!parsedData.aadhaarNumber && backFull) {
        parsedData.aadhaarNumber = backFull;
        parsedData.aadhaarSuffix = backParsed.aadhaarSuffix;
      }

      if (!parsedData.aadhaarNumber && !parsedData.name) {
        throw new AppError(
          'Failed to extract valid Aadhaar information. Please upload clear, high-resolution front and back images of the card.',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Save to repository (Database abstraction)
      await this.aadhaarRepository.save(parsedData);

      return parsedData;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new AppError(`OCR Processing failed: ${message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
