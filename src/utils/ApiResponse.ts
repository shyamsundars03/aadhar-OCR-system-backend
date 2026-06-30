import { Response } from 'express';
import { HTTP_MESSAGE } from '../constants/httpMessage.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ApiResponse<T = unknown> {
  public status: string;
  public data?: T;
  public message?: string;

  constructor(status: string, data: T | null = null, message: string | null = null) {
    this.status = status;
    if (data !== null) {
      this.data = data;
    }
    if (message !== null) {
      this.message = message;
    }
  }

  static success<T = unknown>(
    res: Response,
    data: T,
    message: string | null = null,
    statusCode: number = HTTP_STATUS.OK
  ): Response {
    return res.status(statusCode).json(new ApiResponse(HTTP_MESSAGE.SUCCESS, data, message));
  }

  static fail(
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.BAD_REQUEST
  ): Response {
    return res.status(statusCode).json(new ApiResponse(HTTP_MESSAGE.FAIL, null, message));
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ): Response {
    return res.status(statusCode).json(new ApiResponse(HTTP_MESSAGE.ERROR, null, message));
  }
}

export default ApiResponse;
