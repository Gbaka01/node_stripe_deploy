import mongoose from "mongoose";

const commandSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  cartId: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "canceled"],
    default: "pending",
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommandLine",
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

export default mongoose.model("Command", commandSchema);

