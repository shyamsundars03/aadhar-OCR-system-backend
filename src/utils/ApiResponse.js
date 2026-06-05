import { HTTP_MESSAGE, HTTP_STATUS } from '../constants/index.js';

class ApiResponse {
  constructor(status, data = null, message = null) {
    this.status = status;
    if (data !== null) {
      this.data = data;
    }
    if (message !== null) {
      this.message = message;
    }
  }

  static success(res, data, message = null, statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json(new ApiResponse(HTTP_MESSAGE.SUCCESS, data, message));
  }

  static fail(res, message, statusCode = HTTP_STATUS.BAD_REQUEST) {
    return res.status(statusCode).json(new ApiResponse(HTTP_MESSAGE.FAIL, null, message));
  }

  static error(res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return res.status(statusCode).json(new ApiResponse(HTTP_MESSAGE.ERROR, null, message));
  }
}

export default ApiResponse;
