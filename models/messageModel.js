import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    filepath: String,
    originalName: String,
    size: Number,
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },
    text: { type: String, default: "" },
    files: [FileSchema],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
