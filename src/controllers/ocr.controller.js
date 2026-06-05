import { processAadhaar as processOcr } from '../services/ocr.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';
import { HTTP_MESSAGE } from '../constants/httpMessage.js';
import { catchAsync } from '../utils/catchAsync.js';

const processAadhaar = catchAsync(async (req, res) => {
  const frontFile = req.files.frontImage[0];
  const backFile = req.files.backImage[0];

  const result = await processOcr(frontFile, backFile);

  return ApiResponse.success(res, result, HTTP_MESSAGE.AADHAAR_PROCESSED_SUCCESS, HTTP_STATUS.OK);
});

export default {
  processAadhaar
};
