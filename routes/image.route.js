
import { Router } from "express";
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

export default router;
