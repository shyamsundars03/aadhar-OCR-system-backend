import { IAadhaarRepository } from '../interfaces/IAadhaarRepository.interface.js';
import { IAadhaarData } from '../types/aadhaar.types.js';

export class MockAadhaarRepository implements IAadhaarRepository {
  private records: Map<string, IAadhaarData> = new Map();

  async save(aadhaar: IAadhaarData): Promise<IAadhaarData> {
    const key = aadhaar.aadhaarNumber || `temp_${Date.now()}`;
    this.records.set(key, aadhaar);
    console.log(`[Repository] Saved Aadhaar record: ${key}`);
    return aadhaar;
  }

  async findById(id: string): Promise<IAadhaarData | null> {
    return this.records.get(id) || null;
  }

  async findAll(): Promise<IAadhaarData[]> {
    return Array.from(this.records.values());
  }
}
