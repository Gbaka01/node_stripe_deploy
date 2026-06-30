
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




router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "dessinsgore",
    });

    res.json({
      message: "Image uploadée avec succès",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur upload Cloudinary", error });
  }
});


export default router;
