export const ERROR_MESSAGES = {
  AADHAAR_NUMBERS_MISMATCH: 'The Aadhaar numbers on the front and back images do not match. Please upload images of the same Aadhaar card.',
  FAILED_TO_EXTRACT: 'Failed to extract valid Aadhaar information. Please upload clear, high-resolution front and back images of the card.',
  INVALID_FILE_TYPE: 'Invalid file type. Only JPEG and PNG are allowed.',
  PROCESSING_FAILED: 'OCR Processing failed',
  UPLOAD_ERROR: 'File upload error.',
  FILE_TOO_LARGE: 'File size is too large. Max limit is 2MB.',
  UNEXPECTED_FIELD: 'Unexpected field in upload request.'
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
