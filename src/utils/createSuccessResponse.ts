import { Response } from "express";

interface SuccessResponse {
  message: string;
  data?: any;
  statusCode?: number;
}

export function createSuccessResponse(res: Response, data?: any , statusCode?: number) {
  if (typeof data === "string") {
    data = data.toLocaleLowerCase();
  }
  const response: SuccessResponse = { message: "SUCCESS", data };
  const statuscode = statusCode || 200;
  res.status(statuscode).json(response);
}
