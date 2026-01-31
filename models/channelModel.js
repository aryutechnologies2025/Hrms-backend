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
    name: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser", // ✅ model name
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee", // ✅ model name
      },
    ],
    channelType: {
  type: String,
  // enum: ["public", "private", "dm"],
  default: "private",
},

  },
 
  { timestamps: true }
);

const Channel= mongoose.model("Channel", ChannelSchema);
export default Channel;