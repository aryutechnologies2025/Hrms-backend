
import mongoose from "mongoose";
import Message from "../models/messageModel.js";


/**
 * GET DM HISTORY
 */
const getDMHistory = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    const messages = await Message.find({
      channelId: null,
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });
    console.log("message,",messages);
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET UNREAD COUNTS (SIDEBAR)
 */
 const getUnreadCounts = async (req, res) => {
  try {
    const { userId } = req.params;

    const unread = await Message.aggregate([
      {
        $match: {
          receiverId: new mongoose.Types.ObjectId(userId),
          seenBy: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data: unread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * MARK MESSAGES AS SEEN
 */
 const markMessagesSeen = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    await Message.updateMany(
      {
        senderId,
        receiverId,
        seenBy: { $ne: receiverId },
      },
      { $addToSet: { seenBy: receiverId } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export{
  getDMHistory,
  getUnreadCounts,
  markMessagesSeen

}