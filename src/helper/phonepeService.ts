import axios from "axios";
import crypto from "crypto";
import sha256 from "sha256";
import uniqid from "uniqid";
const baseURL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

const generateChecksum = (requestBody: object, secretKey: string): string => {
  const data = JSON.stringify(requestBody);
  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(data)
    .digest("hex");
  return hash;
};

export const initiatePayment = async (
  amount: number,
  merchantId: string,
  secretKey: string
) => {
  let merchantTransactionId = uniqid();

  const requestBody = {
    merchantId: merchantId,
    transactionId: merchantTransactionId,
    amount: amount * 100, // Convert to paise
    redirectUrl: "http://localhost:3000", // Callback URL after payment
    callbackUrl: "http://localhost:3000/api/payment-callback", // Webhook URL for payment status
  };

  const checksum = generateChecksum(requestBody, secretKey);

  try {
    const response = await axios.post(`${baseURL}`, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": `${checksum}###${secretKey}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Payment initiation failed:", error);
    throw error;
  }
};

export const handlePaymentCallback = async (req: any, res: any) => {
  const requestBody = req.body;
  // Validate checksum
  const receivedChecksum = req.headers["x-verify"]?.split("###")[0];
  const secretKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
  const checksum = generateChecksum(requestBody, secretKey);

  if (receivedChecksum !== checksum) {
    return res.status(400).json({ error: "Invalid checksum" });
  }

  // Process payment callback data
  // Save to database or update payment status accordingly

  res.status(200).send("Payment callback received");
};
