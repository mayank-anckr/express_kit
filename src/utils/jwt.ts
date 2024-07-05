import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const accessSecretKey = process.env.JWT_SECRET_KEY_ACCESS;
const refreshSecretKey = process.env.JWT_SECRET_KEY_REFRESH;

export async function generateAccessToken(payload: object, expiresIn: string = "1h") {
  return jwt.sign(payload, accessSecretKey, { expiresIn });
}
export async function generateRefreshToken(payload: object, expiresIn: string = "5h") {
  return jwt.sign(payload, refreshSecretKey, { expiresIn });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, accessSecretKey);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, refreshSecretKey);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

