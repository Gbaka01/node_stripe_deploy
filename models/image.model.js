import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true }, // nom du fichier physique
    alt: { 
      type: String, 
      required: true },
    url: { type: String }, // URL publique générée automatiquement
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);

