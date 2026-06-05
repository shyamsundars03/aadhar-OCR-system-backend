import Tesseract from 'tesseract.js';
import { parse } from '../utils/aadhaarParser.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const processAadhaar = async (frontFile, backFile) => {
  try {
    const frontOcr = await Tesseract.recognize(frontFile.buffer, 'eng');
    const frontText = frontOcr.data.text;

    const backOcr = await Tesseract.recognize(backFile.buffer, 'eng');
    const backText = backOcr.data.text;

    const combinedText = `${frontText}\n${backText}`;
    const parsedData = parse(combinedText);

    if (!parsedData.aadhaarNumber && !parsedData.name) {
      throw new AppError(
        'Failed to extract valid Aadhaar information. Please upload clear, high-resolution front and back images of the card.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return parsedData;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(`OCR Processing failed: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
