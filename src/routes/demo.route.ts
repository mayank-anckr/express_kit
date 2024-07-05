import { Router } from "express";
import { demo } from "../controllers/demo.controller";
import authenticateToken from "../middleware/authTokenCheck";

const router = Router();

router.get("/demo",authenticateToken, demo);

export default router;
