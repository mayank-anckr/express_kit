import { Router } from "express";
import {
  forgotPassword,
  getAllUserData,
  refreshAccessToken,
  resetPassword,
  signIn,
  signUp,
  signout,
} from "../controllers/auth.controller";
import authenticateToken from "../middleware/authTokenCheck";
import authenticateRefreshToken from "../middleware/refreshTokenCheck";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/allUser", authenticateToken, getAllUserData);
router.get("/signout", authenticateToken, signout);
router.get("/refreshAccessToken", authenticateRefreshToken, refreshAccessToken);

export default router;
