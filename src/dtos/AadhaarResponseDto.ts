export interface AadhaarResponseDto {
  name: string | null;
  aadhaarNumber: string | null;
  aadhaarSuffix: string | null;
  dob: string | null;
  gender: string | null;
  address: string | null;
  rawText?: string | null;
  verificationScore?: number;
}
