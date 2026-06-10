import Image from "../models/image.model.js";
import imageValidation from "../validations/image.validation.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const { alt } = req.body;
    if (!alt) {
      return res.status(400).json({ message: "Le champ alt est requis" });
    }

    // ✅ Construire l'objet validé
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");

    const body = {
      name: req.file.filename,
      alt,
      url: `${protocol}://${host}/uploads/${req.file.filename}`,
      author: req.user ? req.user.id : null,
    };

    const { error } = imageValidation(body).imageCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const newImage = await Image.create(body);
    res.status(201).json({
      message: "Image enregistrée avec succès ✅",
      image: newImage,
    });
  } catch (error) {
    console.error("❌ Erreur createImage :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getAllImages = async (req, res) => {
  try {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");

    const images = await Image.find().populate("author", "nom");

    // Ajouter l’URL complète avant de renvoyer
    const formattedImages = images.map((img) => ({
      ...img._doc,
      url: `${protocol}://${host}/uploads/${img.name}`,
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error("❌ Erreur getAllImages :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image inexistante" });
    }

    const oldPath = path.join(__dirname, "../uploads/", image.name);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    await image.deleteOne();
    res.status(200).json({ message: "Image supprimée ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};






