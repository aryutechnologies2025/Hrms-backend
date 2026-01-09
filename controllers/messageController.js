// // import mongoose from "mongoose";
// // import Message from "../models/messageModel.js";

// // /**
// //  * GET DM HISTORY
// //  */
// // const getDMHistory = async (req, res) => {
// //   try {
// //     const { userId, otherUserId } = req.params;

// //     const messages = await Message.find({
// //       channelId: null,
// //       $or: [
// //         { senderId: userId, receiverId: otherUserId },
// //         { senderId: otherUserId, receiverId: userId },
// //       ],
// //     }).sort({ createdAt: 1 });
// //     console.log("message,",messages);
// //     res.status(200).json({ success: true, data: messages });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /**
// //  * GET UNREAD COUNTS (SIDEBAR)
// //  */
// //  const getUnreadCounts = async (req, res) => {
// //   try {
// //     const { userId } = req.params;

// //     const unread = await Message.aggregate([
// //       {
// //         $match: {
// //           receiverId: new mongoose.Types.ObjectId(userId),
// //           seenBy: { $ne: new mongoose.Types.ObjectId(userId) },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: "$senderId",
// //           count: { $sum: 1 },
// //         },
// //       },
// //     ]);

// //     res.json({ success: true, data: unread });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /**
// //  * MARK MESSAGES AS SEEN
// //  */
// //  const markMessagesSeen = async (req, res) => {
// //   try {
// //     const { senderId, receiverId } = req.body;

// //     await Message.updateMany(
// //       {
// //         senderId,
// //         receiverId,
// //         seenBy: { $ne: receiverId },
// //       },
// //       { $addToSet: { seenBy: receiverId } }
// //     );

// //     res.json({ success: true });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // export{
// //   getDMHistory,
// //   getUnreadCounts,
// //   markMessagesSeen

// // }

// // controllers/messageController.js
// import mongoose from "mongoose";
// import Message from "../models/messageModel.js";

//  const getDMHistory = async (req, res) => {
//   const { userId, otherUserId } = req.params;

//   const messages = await Message.find({
//     $or: [
//       { senderId: userId, receiverId: otherUserId },
//       { senderId: otherUserId, receiverId: userId },
//     ],
//   }).sort({ createdAt: 1 });

//   res.json({ success: true, data: messages });
// };

//  const getUnreadCounts = async (req, res) => {
//   const { userId } = req.params;

//   const unread = await Message.aggregate([
//     {
//       $match: {
//         receiverId: new mongoose.Types.ObjectId(userId),
//         seenAt: null,
//       },
//     },
//     { $group: { _id: "$senderId", count: { $sum: 1 } } },
//   ]);

//   res.json({ success: true, data: unread });
// };

//  const markMessagesSeen = async (req, res) => {
//   const { senderId, receiverId } = req.body;

//   await Message.updateMany(
//     { senderId, receiverId, seenAt: null },
//     {
//       $set: { seenAt: new Date() },
//       $addToSet: { seenBy: receiverId },
//     }
//   );

//   res.json({ success: true });
// };

// export{
//   getDMHistory,
//   getUnreadCounts,
//   markMessagesSeen

// }
// controllers/messageController.js
import mongoose from "mongoose";
import Message from "../models/messageModel.js";

import { getIO, onlineUsers } from "../socket.js";
import Channel from "../models/channelModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* CHAT HISTORY */
export const getDMHistory = async (req, res) => {
  const { userId, otherUserId } = req.params;

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  }).sort({ createdAt: 1 });

  res.json({ success: true, data: messages });
};

/* SIDEBAR UNREAD */
export const getUnreadCounts = async (req, res) => {
  const { userId } = req.params;

  const unread = await Message.aggregate([
    {
      $match: {
        receiverId: new mongoose.Types.ObjectId(userId),
        seenAt: null,
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
};

/* MARK SEEN (CLICK CHAT) */
export const markMessagesSeen = async (req, res) => {
  const { senderId, receiverId } = req.body;

  const updated = await Message.updateMany(
    { senderId, receiverId, seenAt: null },
    { $set: { seenAt: new Date() } },
    { $addToSet: { seenBy: receiverId } }
  );
  // const updated = Message.updateMany(
  //   { senderId, receiverId, seenBy: { $ne: receiverId } },
  //   {
  //     $set: { seenAt: new Date() },
  //     $addToSet: { seenBy: receiverId },
  //   }
  // );

  res.json({ success: true, data: updated });
};

// export const sendChatMessage = async (req, res) => {
//   console.log("req.body", req.body);
//   try {
//     const { senderId, receiverId, text } = req.body;

//     const files = (req.files || []).map((file) => ({
//       name: file.originalname,
//       url: `/uploads/chat/${file.filename}`,
//       type: file.mimetype,
//       size: file.size,
//     }));
//     console.log("req.body 111", files);
//     const isReceiverOnline = onlineUsers.has(receiverId);
//     console.log("isReceiverOnline", isReceiverOnline,"onlineUsers",onlineUsers);
//     const msg = await Message.create({
//       senderId,
//       receiverId,
//       text,
//       files,
//       deliveredAt: isReceiverOnline ? new Date() : null,
//     });
//     console.log("result", msg);
//     res.json({ success: true, data: msg });
//   } catch (err) {
//     console.log("err", err);
//     res.status(500).json({ success: false, message: err.message});
//   }
// };

/* CHANNEL HISTORY */
// export const getChannelHistory = async (req, res) => {
//   try {
//     const { channelId } = req.params;

//     if (!channelId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "channelId is required" });
//     }

//     const messages = await Message.find({
//       channelId: channelId,
//     })
//       .sort({ createdAt: 1 }); // optional but recommended

//     return res.json({
//       success: true,
//       data: messages || [],
//     });
//   } catch (err) {
//     console.error("getChannelHistory error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

export const getChannelHistory = async (req, res) => {
  const { channelId, type } = req.params;
  try {
    const channel = await Channel.findById(channelId).select("members");

    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }

    let updated = [];
    // if (channel.type === "general") {
      // public channel
      const messages = await Message.find({ channelId })
        .sort({ createdAt: 1 })
        .lean();

      const memberCount = channel.members.length;

      updated = messages.map((msg) => {
        const requiredSeen = memberCount - 1;

        return {
          ...msg,
          isSeenByAll:
            msg.seenBy.length >= requiredSeen &&
            !msg.seenBy.includes(msg.senderId.toString()),
        };
      });
    // }
    // else {
    //   // private channel
    //   updated = await Message.find({ channelId }).sort({ createdAt: 1 });

    // }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    let { senderId, receiverId, channelId, text,isForwarded,parentMessageId} = req.body;

    // 🔥 FIX: handle "null" string
    if (channelId === "null" || channelId === undefined) {
      channelId = null;
    }

    if (receiverId === "null" || receiverId === undefined) {
      receiverId = null;
    }

    const files = (req.files || []).map((file) => ({
      name: file.originalname,
      url: `/uploads/chat/${file.filename}`,
      type: file.mimetype,
      size: file.size,
    }));
    const isReceiverOnline = onlineUsers.has(receiverId);

    const msg = await Message.create({
      senderId,
      receiverId: receiverId || null,
      channelId: channelId || null,
      text,
      files,
      type: channelId ? "channel" : "dm",
      isForwarded,
      deliveredAt: channelId
        ? new Date()
        : isReceiverOnline
        ? new Date()
        : null, // 🔥 socket will update
      parentMessageId: parentMessageId || null,

    });
    if (parentMessageId) {
      await Message.findByIdAndUpdate(parentMessageId, {
        $inc: { threadReplyCount: 1 },
        lastThreadReplyAt: new Date(),
      });
    }

    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/messageController.js

// export const markChannelMessagesSeen = async (req, res) => {
//   try {
//     const { channelId, userId } = req.body;

//     if (!channelId || !userId) {
//       return res.status(400).json({
//         success: false,
//         message: "channelId and userId are required",
//       });
//     }

//     const result = await Message.updateMany(
//       {
//         channelId: new mongoose.Types.ObjectId(channelId),
//         senderId: { $ne: userId },     // 🔥 don't mark own messages
//         seenBy: { $ne: userId },       // 🔥 not already seen
//       },
//       {
//         $addToSet: { seenBy: userId }, // 🔥 Slack-style
//       }
//     );

//     return res.json({
//       success: true,
//       updatedCount: result.modifiedCount,
//     });
//   } catch (err) {
//     console.error("channel-seen error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// controllers/messageController.js
export const markChannelMessagesSeen = async (req, res) => {
  try {
    const { channelId, userId } = req.body;

    if (!channelId || !userId) {
      return res.status(400).json({ success: false });
    }

    await Message.updateMany(
      {
        channelId,
        senderId: { $ne: userId },
        seenBy: { $ne: userId },
      },
      {
        $addToSet: { seenBy: userId },
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/channelController.js
export const getChannelUnreadCounts = async (req, res) => {
  const { userId } = req.params;

  const unread = await Message.aggregate([
    {
      $match: {
        channelId: { $ne: null },
        senderId: { $ne: new mongoose.Types.ObjectId(userId) },
        seenBy: { $ne: new mongoose.Types.ObjectId(userId) },
      },
    },
    {
      $group: {
        _id: "$channelId",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {};
  unread.forEach((u) => {
    result[u._id.toString()] = u.count;
  });

  res.json({ success: true, data: result });
};


export const deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);

    if(!msg) {
      return res.status(404).json({ success: false });
    }

    msg.isDelete = true;
    msg.text = "";
    msg.files = [];

    await msg.save();

    res.json({ success: true, messageId: msg._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// messageController.js
// export const deleteMessageFile = async (req, res) => {
//   const { messageId, fileId } = req.body;
//   const message = await Message.findById(messageId);
//   if (!message) {
//     return res.status(404).json({ success: false });
//   }

//   message.files = message.files.filter(
//     (f) => f._id.toString() !== fileId
//   );

//   await message.save();

//   // 🔥 SOCKET BROADCAST
//   const room = message.channelId || message.receiverId;

//   req.io.to(room).emit("file_deleted", {
//     messageId,
//     fileId,
//   });

//   res.json({ success: true });
// };


// POST /messages/delete-file



// export const deleteMessageFile = async (req, res) => {
//   try {
//     const { messageId, fileId } =req.query;

//     const message = await Message.findById(messageId);
//     if (!message) {
//       return res.status(404).json({ success: false });
//     }

//     message.files = message.files.filter(
//       (f) => f._id.toString() !== fileId
//     );

//     await message.save();

//     // 🔥 SOCKET EMIT HERE
//     const io = getIO();

//     let room;
//     if (message.channelId) {
//       room = message.channelId.toString();
//     } else {
//       room = [message.senderId.toString(), message.receiverId.toString()]
//         .sort()
//         .join("_");
//     }

//     io.to(room).emit("message_file_deleted", {
//       messageId,
//       fileId,
//     });

//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// };

export const deleteMessageFile = async (req, res) => {
  try {
    const { messageId, fileId } = req.query;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const file = message.files.id(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // 🔥 PHYSICAL FILE PATH
    const filePath = path.join(__dirname, "..", "..", file.url);
    // example file.url => /uploads/chat/abc.png
    console.log("filePath", filePath);
    // 🔥 REMOVE FILE FROM DISK
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("File delete failed:", err.message);
      }
    });

    // 🔥 SOFT DELETE IN DB
    file.isDeleteFile = true;
    await message.save();

    // 🔥 SOCKET EMIT
    const io = getIO();

    let room;
    if (message.channelId) {
      room = message.channelId.toString();
    } else {
      room = [message.senderId.toString(), message.receiverId.toString()]
        .sort()
        .join("_");
    }

    io.to(room).emit("message_file_deleted", {
      messageId,
      fileId,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


// controllers/messageController.js
export const editMessageFiles = async (req, res) => {
  try {
    const { messageId,text } = req.body;
    console.log("messageId",messageId,"text",text,"req.files",req.files,req.query);
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if(text){
      message.text = text;
    }
    // Only add new files
    if (req.files?.length) {
      message.files.push(
        ...req.files.map(f => ({
          name: f.originalname,
          url: `/uploads/chat/${f.filename}`,
          type: f.mimetype,
          size: f.size,
        }))
      );
    }

    // Save updated message
    await message.save();
     // 🔥 SOCKET EMIT
    const io = getIO();

    // Emit socket event
    io.to(message.channelId || `${message.senderId}-${message.receiverId}`).emit("message_edited", message);

    return res.json({ success: true, data: message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getThreadReplies = async (req, res) => {

  try{
    const replies = await Message.find({
    parentMessageId: req.params.parentId,
  }).sort({ createdAt: 1 });

  res.json({ success: true, data: replies});

  }
  catch(error)
  {
    res.status(500).json({success:false,error:error})
  }
  
};
