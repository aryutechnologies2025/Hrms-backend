import Favorites from "../models/favoritiesModel.js";

/* ---------------- TOGGLE DM FAVORITE ---------------- */
export const toggleDMFavorite = async (req, res) => {
  try {
    const { userId, dmId } = req.body;

    let fav = await Favorites.findOne({ userId });

    if (!fav) {
      fav = await Favorites.create({
        userId,
        dm: [dmId],
        channels: [],
      });
    } else {
      const exists = fav.dm.some(id => id.toString() === dmId);

      exists ? fav.dm.pull(dmId) : fav.dm.push(dmId);
      await fav.save();
    }

    res.json({ success: true, data: fav });
  } catch (err) {
    console.error("toggleDMFavorite error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------- TOGGLE CHANNEL FAVORITE ---------------- */
export const toggleChannelFavorite = async (req, res) => {
  try {
    const { userId, channelId } = req.body;

    let fav = await Favorites.findOne({ userId });

    if (!fav) {
      fav = await Favorites.create({
        userId,
        dm: [],
        channels: [channelId],
      });
    } else {
      const exists = fav.channels.some(id => id.toString() === channelId);

      exists
        ? fav.channels.pull(channelId)
        : fav.channels.push(channelId);

      await fav.save();
    }

    res.json({ success: true, data: fav });
  } catch (err) {
    console.error("toggleChannelFavorite error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------- GET FAVORITES ---------------- */
export const getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;

    const fav = await Favorites.findOne({ userId })
      .populate("dm", "employeeName name email photo")
      .populate("channels", "name");

    res.json({
      success: true,
      data: fav || { dm: [], channels: [] },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
