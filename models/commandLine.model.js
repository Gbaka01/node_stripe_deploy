import mongoose from 'mongoose';

const commandLineSchema = new mongoose.Schema({
    ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manga",
      required: true
    },
    command: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Command",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
}, { timestamps: true });

export default mongoose.model('CommandLine', commandLineSchema);
