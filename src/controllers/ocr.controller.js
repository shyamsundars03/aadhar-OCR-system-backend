import AppError from '../utils/AppError.js';

const processAadhaar = async (req, res, next) => {
  try {
    // 1. Validate files presence
    if (!req.files || !req.files.frontImage || !req.files.backImage) {
      throw new AppError('Both frontImage and backImage are required.', 400);
    }

    const frontFile = req.files.frontImage[0];
    const backFile = req.files.backImage[0];

    // Dummy response for Stage 1 / Stage 2 integration testing
    const dummyResult = {
      name: "SHYAM SUNDAR S",
      aadhaarNumber: "9087 6543 2109",
      dob: "15/08/1998",
      gender: "Male",
      address: "123, Gandhi Road, Chennai, Tamil Nadu - 600001",
      rawText: `[Dummy front OCR text for ${frontFile.originalname}]\n[Dummy back OCR text for ${backFile.originalname}]`
    };

    return res.status(200).json({
      status: 'success',
      data: dummyResult
    });

  } catch (err) {
    next(err);
  }
};

export default {
  processAadhaar
};
