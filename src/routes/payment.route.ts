import { Router } from "express";
import { PaymentWebhook } from "../controllers/payment.controller";
import express from "express";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentWebhook
);

export default router;
