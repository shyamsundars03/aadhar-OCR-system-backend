/**
 * Verhoeff Algorithm Implementation for Aadhaar Number Validation
 * The Verhoeff algorithm is a checksum algorithm for error detection 
 * based on dihedral group D5. All 12-digit Aadhaar numbers adhere to this checksum.
 */

// Multiplication table (d)
const d: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 1, 2, 3, 4],
  [6, 5, 9, 8, 7, 1, 2, 3, 4, 0],
  [7, 6, 5, 9, 8, 2, 3, 4, 0, 1],
  [8, 7, 6, 5, 9, 3, 4, 0, 1, 2],
  [9, 8, 7, 6, 5, 4, 0, 1, 2, 3]
];

// Permutation table (p)
const p: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

/**
 * Validates a string of digits using the Verhoeff algorithm.
 * @param numStr The number string to validate (e.g. "367583920194")
 * @returns boolean True if valid Verhoeff checksum
 */
export const validateVerhoeff = (numStr: string): boolean => {
  const cleanStr = numStr.replace(/\D/g, '');
  if (!cleanStr || cleanStr.length !== 12) {
    return false;
  }

  let c = 0;
  const reversedArray = cleanStr.split('').map(Number).reverse();

  for (let i = 0; i < reversedArray.length; i++) {
    c = d[c][p[i % 8][reversedArray[i]]];
  }

  return c === 0;
};
