import { IAadhaarData } from '../types/aadhaar.types.js';

export interface IAadhaarRepository {
  save(aadhaar: IAadhaarData): Promise<IAadhaarData>;
  findById(id: string): Promise<IAadhaarData | null>;
  findAll(): Promise<IAadhaarData[]>;
}
