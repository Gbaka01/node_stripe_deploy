import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/payment.controller.js";
import bodyParser from "body-parser";

const router = express.Router();

// ⛔ IMPORTANT : Stripe exige le "body brut" pour valider la signature du webhook
router.post("/webhook", bodyParser.raw({ type: "application/json" }), stripeWebhook);

// Création de session Stripe Checkout
router.post("/checkout/:id", createCheckoutSession);

export default router;
