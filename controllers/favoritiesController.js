

/* ---------------- TOGGLE CHANNEL FAVORITE ---------------- */
// export const toggleChannelFavorite = async (req, res) => {
//   try {
//     const { userId, channelId } = req.body;

//     let fav = await Favorites.findOne({ userId });

//     if (!fav) {
//       fav = await Favorites.create({
//         userId,
//         dm: [],
//         channels: [channelId],
//       });
//     } else {
//       const exists = fav.channels.some(id => id.toString() === channelId);
//       exists ? fav.channels.pull(channelId) : fav.channels.push(channelId);
//       await fav.save();
//     }

//     // 🔥 IMPORTANT
//     fav = await Favorites.findOne({ userId })
//       .populate("dm", "employeeName email photo")
//       .populate("channels", "name");

//     res.json({ success: true, data: fav });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


/* ---------------- GET FAVORITES ---------------- */
// export const getFavorites = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const fav = await Favorites.findOne({ userId })
//       .populate("dm", "employeeName name email photo")
//       .populate("channels", "name");

//     res.json({
//       success: true,
//       data: fav || { dm: [], channels: [] },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };





import { populateFavorites } from "../utils/populateFavorites.js";

import Favorites from "../models/favoritiesModel.js";
/* =========================
   TOGGLE DM FAVORITE
========================= */
export const toggleDMFavorite = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { userId, userModel, dmId, dmModel } = req.body;

    if (!userId || !userModel || !dmId || !dmModel) {
      return res.status(400).json({
        success: false,
        message: "userId, userModel, dmId, dmModel required",
      });
    }

    let fav = await Favorites.findOne({
      "user.id": userId,
      "user.model": userModel,
    });

    if (!fav) {
      fav = await Favorites.create({
        user: { id: userId, model: userModel },
        dm: [{ id: dmId, model: dmModel }],
        channels: [],
      });
    } else {
      const index = fav.dm.findIndex(
        (d) => d.id.toString() === dmId && d.model === dmModel
      );

      index > -1
        ? fav.dm.splice(index, 1)
        : fav.dm.push({ id: dmId, model: dmModel });

      await fav.save();
    }
    res.json({
      success: true,
      data: await populateFavorites(fav),
    });
  } catch(err) {
    console.log("err", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   TOGGLE CHANNEL FAVORITE
========================= */
export const toggleChannelFavorite = async (req, res) => {
  try {
    const { userId, userModel, channelId } = req.body;

    if (!userId || !userModel || !channelId) {
      return res.status(400).json({
        success: false,
        message: "userId, userModel, channelId required",
      });
    }

    let fav = await Favorites.findOne({
      "user.id": userId,
      "user.model": userModel,
    });

    if (!fav) {
      fav = await Favorites.create({
        user: { id: userId, model: userModel },
        dm: [],
        channels: [{ id: channelId }],
      });
    } else {
      const index = fav.channels.findIndex(
        (c) => c.id.toString() === channelId
      );

      index > -1
        ? fav.channels.splice(index, 1)
        : fav.channels.push({ id: channelId });

      await fav.save();
    }

    res.json({
      success: true,
      data: await populateFavorites(fav),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   GET FAVORITES
========================= */

export const getFavorites = async (req, res) =>{
  try {
    const { userId } = req.params;

    const fav = await Favorites.findOne({
      "user.id": userId,
    });

    if (!fav) {
      return res.json({
        success: true,
        data: { dm: [], channels: [] },
      });
    }

    const populated = await populateFavorites(fav);

    res.json({
      success: true,
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


