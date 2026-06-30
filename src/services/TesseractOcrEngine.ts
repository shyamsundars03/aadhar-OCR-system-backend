import { createWorker } from 'tesseract.js';
import { IOcrEngine } from '../interfaces/IOcrEngine.interface.js';

export class TesseractOcrEngine implements IOcrEngine {
  private tessdataPath: string;

  constructor(tessdataPath: string) {
    this.tessdataPath = tessdataPath;
  }

  async recognize(buffer: Buffer): Promise<string> {
    const worker = await createWorker('eng', 1, {
      langPath: this.tessdataPath,
      gzip: false
    });
    
    try {
      await worker.setParameters({ tessedit_pageseg_mode: '11' as any });
      const result = await worker.recognize(buffer);
      return result.data.text;
    } finally {
      await worker.terminate();
    }
  }
}
