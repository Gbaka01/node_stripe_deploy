import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db/db.js";

import imageRoutes from "./routes/image.route.js";
import userRoutes from "./routes/user.route.js";
import mangaRoutes from "./routes/manga.route.js";
import commandRoutes from "./routes/command.route.js";
import commandLineRoutes from "./routes/commandLine.route.js";
import paymentRoutes from "./routes/payment.route.js";
import chatbotRouter from "./routes/chatbot.route.js";

dotenv.config();

const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: [
    "https://www.dessinsgore.fr",
    "https://dessinsgore.fr",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.post(
  "/payment/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const commandId = session.metadata?.commandId;

        console.log("Paiement validé pour commande :", commandId);
      }

      return res.status(200).end();
    } catch (err) {
      console.log("Signature webhook Stripe invalide :", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

app.use(express.json());

db();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API Node.js opérationnelle !");
});

app.use("/chatbot", chatbotRouter);
app.use("/user", userRoutes);
app.use("/image", imageRoutes);
app.use("/command", commandRoutes);
app.use("/commandLine", commandLineRoutes);
app.use("/manga", mangaRoutes);
app.use("/payment", paymentRoutes);

app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.message);

  res.status(500).json({
    message: "Erreur interne du serveur",
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});