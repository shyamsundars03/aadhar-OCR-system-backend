import { IAadhaarData, IUploadedFile } from '../types/aadhaar.types.js';

export interface IAadhaarOcrService {
  processAadhaar(frontFile: IUploadedFile, backFile: IUploadedFile): Promise<IAadhaarData>;
}
