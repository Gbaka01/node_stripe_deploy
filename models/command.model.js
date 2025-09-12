import mongoose from 'mongoose';

const commandSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: Boolean,
      required: true,
      default: true
    },
    factureUrl: {
      type: String
    }
}, { timestamps: true });

export default mongoose.model('Command', commandSchema);
