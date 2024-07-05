import logger from "../utils/logger";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password is required")
  .max(15, "Password must be at most 15 characters")
  .refine(
    (value) => /^[a-zA-Z0-9!@#$%^&*()_+~`|}{[\]:;?><,./-=]{1,15}$/.test(value),
    {
      message: "Password must be alphanumeric",
    }
  )
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must contain at least one capital letter",
  })
  .refine((value) => /[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(value), {
    message: "Password must contain at least one special character",
  });

const emailSchema = z.string().email("Invalid email address");
const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters long")
  .max(25, "Name must be at most 25 characters long");

function validateAttributes(value: unknown, checkType: string): boolean {
  try {
    switch (checkType) {
      case "emailcheck":
        emailSchema.parse(value);
        break;
      case "passwordcheck":
        passwordSchema.parse(value);
        break;
      case "namecheck":
        nameSchema.parse(value);
        break;
      default:
        throw new Error("Invalid check type");
    }
    return true;
  } catch (e) {
    logger.error("error occurs", { error: e });
    return false;
  }
}

export default validateAttributes;
