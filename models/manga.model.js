import mongoose from 'mongoose';

const mangaSchema = new mongoose.Schema({
    titre: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    prix: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    tome: {
      type: Number
    },
    isbn: {
      type: Number
    },
    images: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image"
    }]
}, { timestamps: true });

export default mongoose.model('Manga', mangaSchema);
