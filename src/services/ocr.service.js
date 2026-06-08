import path from 'path';
import { fileURLToPath } from 'url';
import { createWorker } from 'tesseract.js';
import { parse } from '../utils/aadhaarParser.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createOcrWorker = async (tessdataPath) => {
  const worker = await createWorker('eng', 1, {
    langPath: tessdataPath,
    gzip: false
  });
  await worker.setParameters({ tessedit_pageseg_mode: '11' });
  return worker;
};

export const processAadhaar = async (frontFile, backFile) => {
  const tessdataPath = path.join(__dirname, '..', 'tessdata');

  
  const [frontWorker, backWorker] = await Promise.all([
    createOcrWorker(tessdataPath),
    createOcrWorker(tessdataPath)
  ]);

  try {
    // Run both OCR jobs concurrently instead of sequentially
    const [frontOcr, backOcr] = await Promise.all([
      frontWorker.recognize(frontFile.buffer),
      backWorker.recognize(backFile.buffer)
    ]);

    const frontText = frontOcr.data.text;
    const backText = backOcr.data.text;

    const frontParsed = parse(frontText);
    const backParsed = parse(backText);


    const frontFull = frontParsed.aadhaarNumber;
    const backFull = backParsed.aadhaarNumber;
    const frontSuffix = frontParsed.aadhaarSuffix;
    const backSuffix = backParsed.aadhaarSuffix;

    if (frontFull && backFull && frontFull !== backFull) {
      
      throw new AppError(
        'The Aadhaar numbers on the front and back images do not match. Please upload images of the same Aadhaar card.',
        HTTP_STATUS.BAD_REQUEST
      );
    } else if (frontSuffix && backSuffix && frontSuffix !== backSuffix) {
      
      throw new AppError(
        'The Aadhaar numbers on the front and back images do not match. Please upload images of the same Aadhaar card.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const combinedText = `${frontText}\n${backText}`;
    const parsedData = parse(combinedText);

   
    if (!parsedData.aadhaarNumber && backFull) {
      parsedData.aadhaarNumber = backFull;
      parsedData.aadhaarSuffix = backParsed.aadhaarSuffix;
    }

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
  
    await Promise.allSettled([frontWorker.terminate(), backWorker.terminate()]);
  }
};
