import { Request, Response } from "express";
import { Stripe } from "stripe";
import logger from "../utils/logger";
import asyncHandeler from "../utils/asyncHandeler";
import { createCustomError } from "../utils/customError";

//stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
});

const webhookSecretKey = process.env.STRIPE_WEBHOOK_SECRET as string | "";

export const PaymentWebhook = asyncHandeler(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      throw createCustomError("invalid signature", 400);
    }
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecretKey
    );

    logger.info("stripe event", { event: event });
    switch (event.type) {
      case "checkout.session.completed": {
        break;
      }
      case "payment_intent.succeeded": {
        logger.info(`PaymentIntent was successful!`);
        break;
      }

      case "customer.subscription.deleted": {
        break;
      }
      case "customer.subscription.updated": {
        break;
      }
      case "charge.succeeded": {
        break;
      }
      default:
        logger.error("unhandled event type", { event: event.type });
        break;
    }
  }
);
