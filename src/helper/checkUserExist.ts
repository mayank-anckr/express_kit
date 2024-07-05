import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import validateAttributes from "../helper/validation";
import Auth from "../models/auth";
import asyncHandeler from "../utils/asyncHandeler";
import { createCustomError } from "../utils/customError";
import { createSuccessResponse } from "../utils/createSuccessResponse";
export async function checkUser(username: string) {
  const user = await Auth.findOne({ where: { username } });
  if (!user) {
    return false;
  }
  return true;
}

export async function checkUserData(username: string) {
  const user = await Auth.findOne({ where: { username } });
  if (!user) {
    return null;
  }
  return user;
}
