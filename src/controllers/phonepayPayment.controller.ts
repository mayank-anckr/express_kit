import { Request, Response } from "express";
import {
  initiatePayment,
  handlePaymentCallback,
} from "../helper/phonepeService";
// phone pay
const merchantId = "PGTESTPAYUAT";
const secretKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";

export const initiatePaymentHandler = async (req: Request, res: Response) => {
  const { amount } = req.body;

  try {
    const paymentResponse = await initiatePayment(
      amount,
      merchantId,
      secretKey
    );
    res.json(paymentResponse);
  } catch (error) {
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

export const paymentCallbackHandler = (req: Request, res: Response) => {
  handlePaymentCallback(req, res);
};
