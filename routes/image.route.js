
import { Router } from "express";
import cloudinary from "../config/cloudinary.js";
import {
  createImage,
  getAllImages,
  deleteImage,
} from "../controllers/image.controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();
router.post("/new", upload.single("name"), createImage);
router.get("/all", getAllImages);
router.delete("/:id", deleteImage);




router.post("/upload", upload.single("name"), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    // upload Cloudinary ou sauvegarde MongoDB ici

    res.status(201).json({
      message: "Image enregistrée avec succès",
      file: req.file,
      alt: req.body.alt,
    });
  } catch (error) {
    console.error("Erreur serveur upload :", error);
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
});

export default router;
