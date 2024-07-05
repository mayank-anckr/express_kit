// middleware/auth.ts
import { JwtPayload } from "jsonwebtoken";
import { checkUser } from "../helper/checkUserExist";
import { createCustomError } from "../utils/customError";
import { verifyToken } from "../utils/jwt";

interface MyJwtPayload extends JwtPayload {
  username: string;
}

// Type guard to check if the payload is of type MyJwtPayload
function isMyJwtPayload(payload: string | JwtPayload): payload is MyJwtPayload {
  return (payload as MyJwtPayload).username !== undefined;
}

export function getUserFromToken(token: string) {
  try {
    const user = verifyToken(token);
    if (isMyJwtPayload(user)) {
      const checkResult = checkUser(user.username);
      if (!checkResult) {
        throw new Error("user not find");
      }
      return user;
    } else {
      throw createCustomError("username is undefined");
    }
  } catch (error) {
    return null;
  }
}
