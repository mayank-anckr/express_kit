import { Router } from "express";
import authenticateToken from "../middleware/authTokenCheck";
import {
  deleteUserDetails,
  downloadFile,
  profileDetails,
  profileDetailsByUserId,
  updateUserDetails,
  uploadFile,
  uploadImageBase64,
  userNotification,
} from "../controllers/user.controller";
import multer from "multer";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

router.put("/profile-detail/:id", authenticateToken, updateUserDetails);
router.delete("/profile-delete/:id", authenticateToken, deleteUserDetails);
router.get("/profile-details", authenticateToken, profileDetails);
router.get("/profile-detail/:id", authenticateToken, profileDetailsByUserId);
router.post("/uploadFile", authenticateToken, upload, uploadFile);
router.get("/downloadFile", authenticateToken, downloadFile);
router.post("/userNotification", authenticateToken, userNotification);
router.post("/uploadFileBase64", authenticateToken, uploadImageBase64);

export default router;
