// import mongoose from "mongoose";

// const ChannelSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   isPrivate: { type: Boolean, default: false },
//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
// }, { timestamps: true });

// const Channel = mongoose.model("Channel", ChannelSchema);
// export default Channel;


import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
  {
    name: String,
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Channel", ChannelSchema);
