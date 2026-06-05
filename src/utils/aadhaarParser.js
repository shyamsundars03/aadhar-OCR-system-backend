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
  const dobRegex = /(?:DOB|D\.O\.B|Date of Birth|birth|जन्म तिथि|तिथि)[:\s]+(\d{2}[/-]\d{2}[/-]\d{4})/i;
  const dobMatch = rawText.match(dobRegex);
  if (dobMatch) {
    dob = dobMatch[1];
  } else {
    const genericDateMatch = rawText.match(/\b(\d{2}[/-]\d{2}[/-]\d{4})\b/);
    if (genericDateMatch) {
      dob = genericDateMatch[1];
    } else {
      const yobRegex = /(?:Year of Birth|YOB|जन्म वर्ष)[:\s]+(\d{4})/i;
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

  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i];
    const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
    const words = cleanLine.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && /^[a-zA-Z\s]+$/.test(cleanLine)) {
      const lowerLine = cleanLine.toLowerCase();
      const shouldSkip = skipKeywords.some(keyword => lowerLine.includes(keyword));
      if (!shouldSkip) {
        name = cleanLine;
        break;
      }
    }
  }

  let address = null;
  const addressIndex = rawText.search(/(?:Address|पता|S\/O|D\/O|W\/O|C\/O)[:\s]/i);
  if (addressIndex !== -1) {
    let rawAddress = rawText.substring(addressIndex);
    rawAddress = rawAddress.replace(/^(?:Address|पता|S\/O|D\/O|W\/O|C\/O)[:\s,\-]+/i, '').trim();
    rawAddress = rawAddress.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(', ');
    const pinMatch = rawAddress.match(/(.*?\b\d{6}\b)/);
    if (pinMatch) {
      address = pinMatch[1];
    } else {
      address = rawAddress.substring(0, 150).trim();
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
