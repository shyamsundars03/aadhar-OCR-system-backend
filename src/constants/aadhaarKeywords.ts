export const AADHAAR_FRONT_KEYWORDS: readonly string[] = [
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

export const AADHAAR_BACK_KEYWORDS: readonly string[] = [
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

export const AADHAAR_KEYWORDS = {
  FRONT: AADHAAR_FRONT_KEYWORDS,
  BACK: AADHAAR_BACK_KEYWORDS
} as const;
