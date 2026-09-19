import { Request, Response, NextFunction } from 'express';
import { IAadhaarOcrService } from '../interfaces/IAadhaarOcrService.interface.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { HTTP_MESSAGE } from '../constants/httpMessage.js';
import { catchAsync } from '../utils/catchAsync.js';
import { extractAadhaarFiles, toAadhaarResponseDto } from '../mappers/aadhaar.mapper.js';

export class OcrController {
  private ocrService: IAadhaarOcrService;

  constructor(ocrService: IAadhaarOcrService) {
    this.ocrService = ocrService;
  }

  public processAadhaar = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.ocrService.processAadhaar(extractAadhaarFiles(req.files));

    return ApiResponse.success(res, toAadhaarResponseDto(result), HTTP_MESSAGE.AADHAAR_PROCESSED_SUCCESS, HTTP_STATUS.OK);
  });
}
