export interface IAadhaarData {
  name: string | null;
  aadhaarNumber: string | null;
  aadhaarSuffix: string | null;
  dob: string | null;
  gender: string | null;
  address: string | null;
  rawText: string;
}

export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface IOcrResult {
  text: string;
}
