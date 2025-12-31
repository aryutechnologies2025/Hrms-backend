// import mongoose from "mongoose";

// /* ---------------- FILE SCHEMA ---------------- */
// const FileSchema = new mongoose.Schema(
//   {
//     filepath: String,
//     originalName: String,
//     size: Number,
//   },
//   { _id: false }
// );

// /* ---------------- MESSAGE SCHEMA ---------------- */
// const MessageSchema = new mongoose.Schema(
//   {
//     /* 🔹 WHO SENT */
//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },

//     /* 🔹 WHO RECEIVES (DM) */
//     receiverId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       default: null,
//     },

//     /* 🔹 CHANNEL (GROUP / SLACK STYLE) */
//     channelId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Channel",
//       default: null,
//     },

//     /* 🔹 MESSAGE CONTENT */
//     text: {
//       type: String,
//       default: "",
//     },

//     files: [FileSchema],

//     /* =================================================
//        DELIVERY + SEEN (VERY IMPORTANT)
//        ================================================= */

//     /**
//      * deliveredAt
//      * ✔ single tick  -> null
//      * ✔✔ double tick -> date exists
//      */
//     deliveredAt: {
//       type: Date,
//       default: null,
//     },

//     /**
//      * seenAt
//      * ✔✔ blue tick -> date exists
//      */
//     seenAt: {
//       type: Date,
//       default: null,
//     },

//     /* =================================================
//        OPTIONAL (FUTURE / GROUP CHAT SAFE)
//        ================================================= */

//     /**
//      * For group chat / advanced tracking
//      * NOT used for tick logic
//      */
//     seenBy: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Employee",
//       },
//     ],

//     /* 🔹 MESSAGE EDIT */
//     edited: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true, // createdAt, updatedAt
//   }
// );

// /* ---------------- MODEL ---------------- */
// const Message = mongoose.model("Message", MessageSchema);
// export default Message;

// models/messageModel.js
import mongoose from "mongoose";


const fileSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    type: String,
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
      // required: true,
      default: null,
    },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", default: null },
    text: String,
    // files: [
    //   {
    //     name: String,
    //     url: String,
    //     type: String,
    //     size: Number,
    //   },
    // ],
    files: {
      type: [fileSchema],
      default: [],
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    seenAt: {
      type: Date,
      default: null,
    },

    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
