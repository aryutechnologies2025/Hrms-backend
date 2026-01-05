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

import mongoose from "mongoose";

const favoritesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },

    dm: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: [],
      },
    ],

    channels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

 const Favorites = mongoose.model("Favorites", favoritesSchema);

export default Favorites;
