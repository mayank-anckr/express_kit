import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { createCustomError } from "../utils/customError";
import asyncHandeler from "../utils/asyncHandeler";
import { createSuccessResponse } from "../utils/createSuccessResponse";

export const demo = asyncHandeler(async (req: Request, res: Response) => {
    const data = "abcasde";
    return createSuccessResponse(res, "VJVJHV");

});
