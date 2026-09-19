import { IAadhaarData, IUploadedFile } from '../types/aadhaar.types.js';
import { AadhaarResponseDto } from '../dtos/AadhaarResponseDto.js';
import { IAadhaarUploadPayload } from '../interfaces/IAadhaarOcrService.interface.js';

export const extractAadhaarFiles = (reqFiles: unknown): IAadhaarUploadPayload => {
  const files = reqFiles as { [fieldname: string]: Express.Multer.File[] };

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

  return { frontFile, backFile };
};

export const toAadhaarResponseDto = (data: IAadhaarData, score?: number): AadhaarResponseDto => {
  return {
    name: data.name || null,
    aadhaarNumber: data.aadhaarNumber || null,
    aadhaarSuffix: data.aadhaarSuffix || (data.aadhaarNumber ? data.aadhaarNumber.slice(-4) : null),
    dob: data.dob || null,
    gender: data.gender || null,
    address: data.address || null,
    rawText: data.rawText || '',
    ...(score !== undefined ? { verificationScore: score } : {})
  };
};
