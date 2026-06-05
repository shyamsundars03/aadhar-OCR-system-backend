export const parse = (rawText) => {
  if (!rawText) {
    return {
      name: null,
      aadhaarNumber: null,
      dob: null,
      gender: null,
      address: null,
      rawText: ''
    };
  }

  // Strip non-ASCII characters to remove native language scripts
  const cleanedText = rawText.replace(/[^\x20-\x7E\n\r]/g, '');
  rawText = cleanedText;

  console.log("========== RAW OCR TEXT ==========");
  console.log(rawText);
  console.log("==================================");


  let aadhaarNumber = null;
  const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b/;
  const aadhaarMatch = rawText.match(aadhaarRegex);
  if (aadhaarMatch) {
    aadhaarNumber = aadhaarMatch[0].replace(/\s+/g, '');
  } else {
    const contiguousMatch = rawText.match(/\b\d{12}\b/);
    if (contiguousMatch) {
      aadhaarNumber = contiguousMatch[0];
    }
  }

  let dob = null;
  const dobRegex = /(?:D[O0]B|D\.O\.B|Date of Birth|birth)[:\s]*(\d{2}[/-]\d{2}[/-]\d{4})/i;
  const dobMatch = rawText.match(dobRegex);
  if (dobMatch) {
    dob = dobMatch[1];
  } else {
    const genericDateMatch = rawText.match(/\b(\d{2}[/-]\d{2}[/-]\d{4})\b/);
    if (genericDateMatch) {
      dob = genericDateMatch[1];
    } else {
      const yobRegex = /(?:Year of Birth|YOB)[:\s]*(\d{4})/i;
      const yobMatch = rawText.match(yobRegex);
      if (yobMatch) {
        dob = yobMatch[1];
      }
    }
  }

  let gender = null;
  if (/female|महिला|fem/i.test(rawText)) {
    gender = 'Female';
  } else if (/male|पुरुष/i.test(rawText)) {
    gender = 'Male';
  }

  let name = null;
  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const skipKeywords = [
    'government', 'india', 'government of india', 'भारत', 'सरकार', 'भारत सरकार',
    'unique', 'identification', 'authority', 'authority of india',
    'enrollment', 'enrolment', 'male', 'female', 'dob', 'date', 'birth',
    'year', 'yob', 'aadhaar', 'address', 'signature', 'thumb', 'father',
    'phone', 'email', 'card', 'valid', 'identity'
  ];

  // Find the DOB line index
  let dobIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/(?:D[O0]B|D\.O\.B|Date of Birth|birth|Year of Birth|YOB)/i.test(lines[i])) {
      dobIndex = i;
      break;
    }
  }

  // If DOB found, search upwards for name
  if (dobIndex > 0) {
    for (let i = dobIndex - 1; i >= Math.max(0, dobIndex - 4); i--) {
      const line = lines[i];
      const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
      const words = cleanLine.split(/\s+/);
      if (words.length >= 2 && words.length <= 5 && /^[a-zA-Z\s]+$/.test(cleanLine)) {
        const lowerLine = cleanLine.toLowerCase();
        const shouldSkip = skipKeywords.some(keyword => lowerLine.includes(keyword));
        if (!shouldSkip) {
          // Remove stray 1-2 lowercase letters at the beginning of the name (e.g. "pc ")
          name = cleanLine.replace(/^[a-z]{1,2}\s+/g, '').trim();
          break;
        }
      }
    }
  }

  // Removed top-down search fallback for Name to strictly require DOB.

  let address = null;
  const addressIndex = rawText.search(/(?:Address|पता|S\/O|D\/O|W\/O|C\/O)[:\s]/i);
  if (addressIndex !== -1) {
    let rawAddress = rawText.substring(addressIndex);
    rawAddress = rawAddress.replace(/^(?:Address|पता|S\/O|D\/O|W\/O|C\/O)[:\s,-]+/i, '').trim();
    rawAddress = rawAddress.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(', ');
    const pinMatch = rawAddress.match(/([\s\S]*?\b\d{6}\b)/);
    if (pinMatch) {
      address = pinMatch[1];
    } else {
      address = rawAddress.substring(0, 150).trim();
    }
  } else {
    // Fallback: Find the line with the PIN code (6 digits) and grab the 4 lines before it
    let pinLineIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/\b\d{6}\b/.test(lines[i])) {
        pinLineIndex = i;
        break;
      }
    }
    
    if (pinLineIndex !== -1) {
      const startIndex = Math.max(0, pinLineIndex - 4);
      let addressLines = lines.slice(startIndex, pinLineIndex + 1);
      let joined = addressLines.join(', ');
      
      const pinMatch = joined.match(/([\s\S]*?\b\d{6}\b)/);
      if (pinMatch) {
        address = pinMatch[1];
      } else {
        address = joined.substring(0, 150).trim();
      }
    }
  }

  return {
    name,
    aadhaarNumber,
    dob,
    gender,
    address,
    rawText
  };
};
