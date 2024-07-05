import { checkUser, checkUserData } from "../helper/checkUserExist";
import { createCustomError } from "../utils/customError";
import { verifyRefreshToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

interface MyJwtPayload extends JwtPayload {
  username: string;
}
function isMyJwtPayload(payload: string | JwtPayload): payload is MyJwtPayload {
  return (payload as MyJwtPayload).username !== undefined;
}

const authenticateRefreshToken = async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const user = verifyRefreshToken(incomingRefreshToken);
  if (!user || !isMyJwtPayload(user)) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const checkResult = await checkUserData(user.username);
  if (incomingRefreshToken !== checkResult.dataValues.refreshToken) {
    throw createCustomError("Refresh token is expired or used", 401);
  }
  req.checkResult = checkResult;
  next(); // Proceed to the next middleware or route handler
};

export default authenticateRefreshToken;
