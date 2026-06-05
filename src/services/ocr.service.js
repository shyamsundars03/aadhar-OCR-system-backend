import { createWorker } from 'tesseract.js';
import { parse } from '../utils/aadhaarParser.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const processAadhaar = async (frontFile, backFile) => {
  const worker = await createWorker('eng');
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: '11', 
    });

    const frontOcr = await worker.recognize(frontFile.buffer);
    const frontText = frontOcr.data.text;

    const backOcr = await worker.recognize(backFile.buffer);
    const backText = backOcr.data.text;

    const frontParsed = parse(frontText);
    const backParsed = parse(backText);
    
    if (frontParsed.aadhaarNumber && backParsed.aadhaarNumber && frontParsed.aadhaarNumber !== backParsed.aadhaarNumber) {
      throw new AppError(
        'The Aadhaar numbers on the front and back images do not match. Please upload images of the same Aadhaar card.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

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
  } finally {
    await worker.terminate();
  }
};
