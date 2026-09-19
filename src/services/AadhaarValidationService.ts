import { validateVerhoeff } from '../utils/verhoeff.js';
import { parse } from '../utils/aadhaarParser.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export interface IAadhaarVerificationResult {
  isValidAadhaar: boolean;
  score: number;
  reasons: string[];
}

export class AadhaarValidationService {
  private static FRONT_KEYWORDS = [
    'government of india',
    'bharat sarkar',
    'unique identification authority',
    'authority of india',
    'uidai',
    'aadhaar',
    'adhar',
    'dob',
    'date of birth',
    'year of birth',
    'yob',
    'male',
    'female',
    'भारत सरकार'
  ];

  private static BACK_KEYWORDS = [
    'address',
    'पता',
    'unique identification authority',
    'uidai',
    's/o',
    'd/o',
    'w/o',
    'c/o',
    'help@uidai.gov.in',
    'www.uidai.gov.in',
    '1947'
  ];

  public verifyDocument(frontText: string, backText: string): IAadhaarVerificationResult {
    let score = 0;
    const reasons: string[] = [];

    const lowerFront = (frontText || '').toLowerCase();
    const lowerBack = (backText || '').toLowerCase();
    const combinedText = `${lowerFront}\n${lowerBack}`;

    // 1. Check for Duplicate Side Uploads (Two Fronts or Two Backs)
    const hasFrontDOB = /(?:dob|d\.o\.b|date of birth|year of birth)/i.test(lowerFront);
    const hasBackDOB = /(?:dob|d\.o\.b|date of birth|year of birth)/i.test(lowerBack);
    const hasFrontAddress = /(?:address|पता|s\/o|d\/o|w\/o|c\/o)/i.test(lowerFront);
    const hasBackAddress = /(?:address|पता|s\/o|d\/o|w\/o|c\/o)/i.test(lowerBack);

    if (hasFrontDOB && hasBackDOB && !hasBackAddress) {
      throw new AppError(
        'Both uploaded images appear to be the front side of an Aadhaar card. Please upload one front side image and one back side image.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (hasFrontAddress && hasBackAddress && !hasFrontDOB) {
      throw new AppError(
        'Both uploaded images appear to be the back side of an Aadhaar card. Please upload one front side image and one back side image.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 2. Keyword check for front side
    let frontKeywordCount = 0;
    for (const kw of AadhaarValidationService.FRONT_KEYWORDS) {
      if (lowerFront.includes(kw)) {
        frontKeywordCount++;
      }
    }
    if (frontKeywordCount > 0) {
      score += Math.min(40, frontKeywordCount * 15);
      reasons.push(`Matched ${frontKeywordCount} front Aadhaar document keywords`);
    }

    // 3. Keyword check for back side
    let backKeywordCount = 0;
    for (const kw of AadhaarValidationService.BACK_KEYWORDS) {
      if (lowerBack.includes(kw)) {
        backKeywordCount++;
      }
    }
    if (backKeywordCount > 0) {
      score += Math.min(30, backKeywordCount * 15);
      reasons.push(`Matched ${backKeywordCount} back Aadhaar document keywords`);
    }

    // 4. Aadhaar number pattern check & Verhoeff algorithm validation
    const aadhaarMatches = combinedText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/g) || [];
    let validVerhoeffFound = false;

    for (const match of aadhaarMatches) {
      const cleanNum = match.replace(/\s+/g, '');
      if (cleanNum.length === 12 && validateVerhoeff(cleanNum)) {
        validVerhoeffFound = true;
        break;
      }
    }

    if (validVerhoeffFound) {
      score += 30;
      reasons.push('Valid 12-digit Aadhaar number with Verhoeff checksum verified');
    } else {
      if (/(?:[Xx*]{4}[-\s]*[Xx*]{4}[-\s]*\d{4})/.test(combinedText)) {
        score += 20;
        reasons.push('Masked Aadhaar pattern detected');
      }
    }

    // 5. DOB / Gender / Pincode
    if (/(?:dob|d\.o\.b|date of birth|year of birth|\b\d{2}[/-]\d{2}[/-]\d{4}\b)/i.test(combinedText)) {
      score += 10;
    }
    if (/male|female|पुरुष|महिला/i.test(combinedText)) {
      score += 10;
    }
    if (/\b\d{6}\b/.test(lowerBack)) {
      score += 10;
    }

    const isValidAadhaar = score >= 35;

    if (!isValidAadhaar) {
      throw new AppError(
        'The uploaded image does not appear to be a valid Aadhaar card. Please upload clear photos of an official Aadhaar card.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 6. Check for Front and Back Card Ownership Matching
    this.verifyMatchingCards(frontText, backText);

    return {
      isValidAadhaar,
      score,
      reasons
    };
  }

  /**
   * Verifies that the uploaded front image and back image belong to the SAME Aadhaar card.
   */
  public verifyMatchingCards(frontText: string, backText: string): void {
    const frontData = parse(frontText);
    const backData = parse(backText);

    const frontNum = frontData.aadhaarNumber;
    const backNum = backData.aadhaarNumber;

    const frontSuffix = frontData.aadhaarSuffix;
    const backSuffix = backData.aadhaarSuffix;

    // Direct comparison if full 12-digit Aadhaar numbers extracted on both sides
    if (frontNum && backNum && frontNum !== backNum) {
      throw new AppError(
        `Aadhaar card mismatch: The uploaded front image (Aadhaar ending in ${frontNum.slice(-4)}) and back image (Aadhaar ending in ${backNum.slice(-4)}) belong to different people. Please upload both sides of the same Aadhaar card.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Direct comparison if 4-digit suffixes extracted on both sides
    if (frontSuffix && backSuffix && frontSuffix !== backSuffix) {
      throw new AppError(
        `Aadhaar card mismatch: The uploaded front image (Aadhaar ending in ${frontSuffix}) and back image (Aadhaar ending in ${backSuffix}) belong to different people. Please upload both sides of the same Aadhaar card.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Deep Digit Sequence Matching: Extract 8 to 12 digit candidate sequences from both sides
    const extractDigitSequences = (text: string): string[] => {
      const matches = (text || '').match(/(?:^|\D)(\d{4}[\s.-]*\d{4}(?:[\s.-]*\d{3,4})?)(?:\D|$)/g) || [];
      return matches.map(m => m.replace(/\D/g, '')).filter(s => s.length >= 8);
    };

    const frontSeqs = extractDigitSequences(frontText);
    const backSeqs = extractDigitSequences(backText);

    if (frontSeqs.length > 0 && backSeqs.length > 0) {
      const hasMatchingSequence = frontSeqs.some(fSeq =>
        backSeqs.some(bSeq => {
          const fSuffix = fSeq.slice(-4);
          const bSuffix = bSeq.slice(-4);
          const fPrefix = fSeq.slice(0, 8);
          const bPrefix = bSeq.slice(0, 8);
          return fSuffix === bSuffix || fPrefix === bPrefix;
        })
      );

      if (!hasMatchingSequence) {
        const frontEnding = frontSuffix || frontSeqs[0].slice(-4);
        const backEnding = backSuffix || backSeqs[0].slice(-4);
        throw new AppError(
          `Aadhaar card mismatch: The front image (ending in ${frontEnding}) and back image (ending in ${backEnding}) do not belong to the same Aadhaar card. Please upload both sides of the same card.`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
  }
}
