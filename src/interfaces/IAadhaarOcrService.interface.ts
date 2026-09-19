import { IAadhaarData, IUploadedFile } from '../types/aadhaar.types.js';

export interface IAadhaarUploadPayload {
  frontFile: IUploadedFile;
  backFile: IUploadedFile;
}

export interface IAadhaarOcrService {
  processAadhaar(payload: IAadhaarUploadPayload): Promise<IAadhaarData>;
}
