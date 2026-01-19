// import mongoose from "mongoose";

// const favoritesSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
//   favorites: {
//     dm: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
//     channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
//   },
// }, { timestamps: true });

// const Favorites = mongoose.model("Favorites", favoritesSchema);

// export default Favorites;

// import mongoose from "mongoose";

// const favoritesSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//       unique: true,
//     },

//     dm: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Employee",
//         default: [],
//       },
//     ],

//     channels: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Channel",
//         default: [],
//       },
//     ],
//   },
//   { timestamps: true }
// );

//  const Favorites = mongoose.model("Favorites", favoritesSchema);

// export default Favorites;

import mongoose from "mongoose";

const favoritesSchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "user.model",
      },
      model: {
        type: String,
        required: true,
        enum: ["AdminUser", "Employee", "ClientDetails","ClientSubUser"], // MUST match model names
      },
    },

    dm: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "dm.model",
        },
        model: {
          type: String,
          required: true,
          enum: ["AdminUser", "Employee", "ClientDetails","ClientSubUser"],
        },
      },
    ],

    channels: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Channel", // channel is single model → no refPath needed
        },
      },
    ],
  },
  { timestamps: true }
);

 const Favorites = mongoose.model("Favorites", favoritesSchema);

export default Favorites;


