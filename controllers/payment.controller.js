import Stripe from "stripe";
import Command from "../models/command.model.js";
import CommandLine from "../models/commandLine.model.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -----------------------------------------------------------
// 1️⃣ CRÉATION SESSION CHECKOUT
// -----------------------------------------------------------
export const createCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;

    const command = await Command.findById(id).populate("user");
    if (!command) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    const commandLines = await CommandLine.find({ command: id }).populate(
      "ref",
      "prix titre"
    );

    if (!commandLines.length) {
      return res.status(400).json({ message: "Panier vide" });
    }

    const items = commandLines.map((line) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: line.ref.titre,
        },
        unit_amount: Math.round(line.ref.prix * 100),
      },
      quantity: line.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items,

      customer_email: command.user?.email,

      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,

      metadata: {
        commandId: command._id.toString(),
        userId: command.user?._id?.toString(),
      },
    });

    command.stripeSessionId = session.id;
    await command.save();

    res.json({
      checkout_url: session.url,
    });
  } catch (error) {
    console.error("❌ Stripe checkout error :", error);
    res.status(500).json({ message: "Erreur Stripe" });
  }
};
// -----------------------------------------------------------
// 2️⃣ WEBHOOK STRIPE
// -----------------------------------------------------------
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Signature invalide :", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const commandId = session.metadata.commandId;

    try {
      await Command.findByIdAndUpdate(commandId, {
        status: "paid",
        stripeInvoiceId: session.invoice,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
      });

      // 🧹 vider le panier
      await CommandLine.deleteMany({ command: commandId });

      console.log("✅ Paiement confirmé & facture liée :", commandId);
    } catch (err) {
      console.error("❌ Erreur MAJ commande :", err);
    }
  }

  res.json({ received: true });
};

