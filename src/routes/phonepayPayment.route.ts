import { Router } from "express";
import {
  initiatePaymentHandler,
  paymentCallbackHandler,
} from "../controllers/phonepayPayment.controller";

const router = Router();

router.post("/initiate-payment", initiatePaymentHandler);
router.post("/payment-callback", paymentCallbackHandler);

export default router;
