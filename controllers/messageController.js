// import Message from "../models/messageModel.js";

// const fetchChannelMessages = async (req, res) => {
//   const { channelId } = req.params;
//   const messages = await Message.find({ channelId })
//     .sort({ createdAt: 1 })
//     .limit(500);
//   res.json(messages);
// };

// const fetchDmMessages = async (req, res) => {
//   const { userId, otherId } = req.params;
//   const messages = await Message.find({
//     $or: [
//       { senderId: userId, receiverId: otherId },
//       { senderId: otherId, receiverId: userId },
//     ],
//   })
//     .sort({ createdAt: 1 })
//     .limit(500);
//   res.json(messages);
// };
// export { fetchChannelMessages, fetchDmMessages };


// controllers/messageController.js

import path from "path";
import fs from "fs";
import Message from "../models/messageModel";

export const fetchChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const msgs = await Message.find({ channelId }).sort({ createdAt: 1 }).limit(500);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const fetchDmMessages = async (req, res) => {
  try {
    const { userId, otherId } = req.params;
    const msgs = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 }).limit(500);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// file upload uses multer in route; req.files present
export const uploadFiles = async (req, res) => {
  try {
    const files = (req.files || []).map(f => ({
      filepath: f.filename,
      originalName: f.originalname,
      size: f.size,
    }));
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete uploaded file (local)
export const deleteUploadedFile = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ message: "filename required" });

    const filePath = path.resolve(process.cwd(), "uploads", "others", filename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return res.json({ message: "Deleted" });
    } else {
      return res.status(404).json({ message: "File not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

