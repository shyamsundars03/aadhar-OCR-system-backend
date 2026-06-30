import { Request, Response, NextFunction } from 'express';
import { IAadhaarOcrService } from '../interfaces/IAadhaarOcrService.interface.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { HTTP_MESSAGE } from '../constants/httpMessage.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { IUploadedFile } from '../types/aadhaar.types.js';

export class OcrController {
  private ocrService: IAadhaarOcrService;

  constructor(ocrService: IAadhaarOcrService) {
    this.ocrService = ocrService;
  }

  public processAadhaar = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    if (!files || !files.frontImage || !files.frontImage[0] || !files.backImage || !files.backImage[0]) {
      throw new AppError('Both front and back images are required.', HTTP_STATUS.BAD_REQUEST);
    }

    const frontFile: IUploadedFile = {
      fieldname: files.frontImage[0].fieldname,
      originalname: files.frontImage[0].originalname,
      encoding: files.frontImage[0].encoding,
      mimetype: files.frontImage[0].mimetype,
      buffer: files.frontImage[0].buffer,
      size: files.frontImage[0].size
    };

    const backFile: IUploadedFile = {
      fieldname: files.backImage[0].fieldname,
      originalname: files.backImage[0].originalname,
      encoding: files.backImage[0].encoding,
      mimetype: files.backImage[0].mimetype,
      buffer: files.backImage[0].buffer,
      size: files.backImage[0].size
    };

    const result = await this.ocrService.processAadhaar(frontFile, backFile);

    return ApiResponse.success(res, result, HTTP_MESSAGE.AADHAAR_PROCESSED_SUCCESS, HTTP_STATUS.OK);
  });
}
