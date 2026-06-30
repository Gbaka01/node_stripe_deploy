
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
  console.log("BODY :", req.body);
  console.log("FILE :", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier reçu" });
  }

  res.json({
    message: "Image reçue",
    file: req.file,
    alt: req.body.alt,
  });
});

export default router;
