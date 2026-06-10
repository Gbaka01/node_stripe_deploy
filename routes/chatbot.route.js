import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        reply: "Message vide.",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: `
Tu es l'assistant du site de Goli Gore Gbaka.
Réponds en français, simplement.
Tu peux parler de dessins, œuvres, contact, site web et parcours.

Question utilisateur :
${message}
      `,
    });

    return res.status(200).json({
      reply: response.output_text || "Je n'ai pas compris votre message.",
    });
  } catch (error) {
    console.error("Erreur OpenAI :", error.message);

    return res.status(500).json({
      reply: "Erreur du serveur IA.",
      message: error.message,
    });
  }
});

export default router;