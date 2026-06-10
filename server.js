import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db/db.js";

// 🔹 Import des routes
import imageRoutes from "./routes/image.route.js";
import userRoutes from "./routes/user.route.js";
import mangaRoutes from "./routes/manga.route.js";
import commandRoutes from "./routes/command.route.js";
import commandLineRoutes from "./routes/commandLine.route.js";
import paymentRoutes from "./routes/payment.route.js";
import chatbotRouter from "./routes/chatbot.route.js";


dotenv.config();

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Node utils
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App
const app = express();

/* -------------------------------------------------------
   ⚠️ WEBHOOK STRIPE — doit être AVANT express.json() !
-------------------------------------------------------- */
app.post(
  "/payment/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("⚠️ Signature webhook Stripe invalide !");
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 🔔 Paiement validé
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const commandId = session.metadata.commandId;
      console.log("💰 Paiement validé pour commande :", commandId);

      // 👉 Mise à jour du statut à PAID (à compléter)
      // await Command.findByIdAndUpdate(commandId, { status: "paid" });
      // await CommandLine.deleteMany({ command: commandId })
    }

    res.status(200).end();
  }
);

/* -------------------------------------------------------
   Middleware global
-------------------------------------------------------- */
app.use(express.json());
app.use(cors());

/* -------------------------------------------------------
   Connexion DB
-------------------------------------------------------- */
db();




/* -------------------------------------------------------
   Dossier statique (images)
-------------------------------------------------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------------------------------------------
   Routes principales
-------------------------------------------------------- */
app.use("/chatbot", chatbotRouter);
app.use("/image", imageRoutes);
app.use("/user", userRoutes);
app.use("/command", commandRoutes);
app.use("/commandLine", commandLineRoutes);
app.use("/manga", mangaRoutes);
app.use("/payment", paymentRoutes);

/* -------------------------------------------------------
   Test
-------------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 API Node.js opérationnelle !");
});

/* -------------------------------------------------------
   Gestion des erreurs globales
-------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Erreur serveur :", err.message);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

/* -------------------------------------------------------
   Démarrage du serveur
-------------------------------------------------------- */
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Serveur démarré sur le port ${port}`);
  console.log("Stripe key:", process.env.STRIPE_SECRET_KEY);
});


