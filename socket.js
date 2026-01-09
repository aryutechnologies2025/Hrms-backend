// socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Channel from "./models/channelModel.js";
import Message from "./models/messageModel.js";
import { initRedis, getRedisAdapter } from "./redis.js";
import User from "./models/userModel.js";
import mongoose from "mongoose";
let ioInstance;


const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};
// socket/onlineUsers.js
export const onlineUsers = new Set();

export default async function startSocketServer(httpServer) {
  // --- Init Redis ---
  const { pubClient, subClient } = await initRedis();

  

  console.log("coming 1");
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  console.log("coming 2");

  // --- Attach Redis Adapter ---
  io.adapter(getRedisAdapter());
   

  // 🔥 ADD THIS
   ioInstance = io;

  // const onlineUsers = new Set();
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    /* USER ONLINE */

    socket.on("user_online", async (userId) => {
      socket.userId = userId.toString();
      onlineUsers.add(socket.userId);
      console.log("onlineUsers", onlineUsers);

      const now = new Date();

      // dm messages delivery

      // 1️⃣ Find messages that will be delivered now
      const messages = await Message.find({
        receiverId: socket.userId,
        deliveredAt: null,
      }).select("_id senderId receiverId");

      if (messages.length) {
        // 2️⃣ Update deliveredAt
        await Message.updateMany(
          { _id: { $in: messages.map((m) => m._id) } },
          { $set: { deliveredAt: now } }
        );

        // 3️⃣ Notify EACH sender 🔥
        messages.forEach((m) => {
          const room = [m.senderId.toString(), m.receiverId.toString()]
            .sort()
            .join("_");

          io.to(room).emit("messages_delivered", {
            senderId: m.senderId,
            receiverId: m.receiverId,
            deliveredAt: now,
          });
        });
      }

      // chaneel messages delivery

      const pending = await Message.find({
        channelId: { $ne: null },
        deliveredAt: null,
        senderId: { $ne: userId },
      }).select("_id channelId");

      if (pending.length) {
        await Message.updateMany(
          { _id: { $in: pending.map((m) => m._id) } },
          { $set: { deliveredAt: now } }
        );

        pending.forEach((m) => {
          io.to(m.channelId.toString()).emit("channel_delivered", {
            channelId: m.channelId,
            userId,
            deliveredAt: now,
          });
        });
      }

      io.emit("online_users", [...onlineUsers]);
    });

    /* DISCONNECT */
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("online_users", [...onlineUsers]);
      }
    });

    /* JOIN ROOM */
    socket.on("join_dm", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");
      socket.join(room);
    });
    /* TYPING START */
    socket.on("typing", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");

      socket.to(room).emit("typing", {
        senderId,
      });
    });

    /* TYPING STOP */
    socket.on("stop_typing", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");

      socket.to(room).emit("stop_typing", {
        senderId,
      });
    });

    socket.on("new_message", (msg) => {
      const room = [msg.senderId.toString(), msg.receiverId.toString()]
        .sort()
        .join("_");

      io.to(room).emit("receive_dm", msg);
    });

    // socket.on("send_channel_message", async ({ senderId, channelId, text }) => {
    //   const msg = await Message.create({
    //     senderId,
    //     channelId,
    //     text,
    //     deliveredAt: new Date(), // channel is live
    //   });

    /* MARK SEEN */
    socket.on("mark_seen", async ({ senderId, receiverId }) => {
      const now = new Date();

      const result = await Message.updateMany(
        { senderId, receiverId, seenAt: null },
        {
          $set: { seenAt: now },
          $addToSet: { seenBy: receiverId },
        }
      );
      console.log("result", result);

      if (!result.modifiedCount) return;

      const room = [senderId, receiverId].sort().join("_");

      io.to(room).emit("messages_seen", {
        senderId,
        receiverId,
        seenAt: now,
        seenBy: [receiverId],
      });
    });

    // channel join_channel
    socket.on("join_channel", ({ channelId }) => {
      if (!channelId) return;
      console.log("channelId", channelId);
      socket.join(channelId.toString());
      console.log("Joined channel:", channelId);
    });

    // send_channel_message
    socket.on("new_channel_message", async (msg) => {
      if (!msg.channelId) return;
      // const msg = await Message.create({
      //   senderId,
      //   channelId,
      //   text,
      //   deliveredAt: new Date(), // channel is live
      // });
      console.log("msg in socket send_channel_message", msg);

      io.to(msg.channelId.toString()).emit("receive_channel_message", msg);
    });

    // socket.on("channel_typing", ({ channelId, senderId }) => {
    //   socket.to(channelId.toString()).emit("channel_typing", {
    //     channelId,
    //     senderId,
    //   });
    // });

    socket.on("channel_stop_typing", ({ channelId, senderId }) => {
      socket.to(channelId.toString()).emit("channel_stop_typing", {
        channelId,
        senderId,
      });
    });

    // mark_channel_seen
    // socket.on("mark_channel_seen", async ({ channelId, userId }) => {
    //   const now = new Date();

    //   const result = await Message.updateMany(
    //     {
    //       channelId,
    //       senderId: { $ne: userId },
    //       seenBy: { $ne: userId },
    //     },
    //     {
    //       $addToSet: { seenBy: userId },
    //       $set: { seenAt: now },
    //     }
    //   );

    //   if (!result.modifiedCount) return;

    //   io.to(channelId.toString()).emit("channel_seen", {
    //     channelId,
    //     userId,
    //     seenAt: now,
    //   });
    // });

    //     socket.on("channel_seen", async ({ channelId, userId }) => {
    //       if(!channelId || !userId) return;
    //       await Message.updateMany(
    //         {
    //           channelId,
    //           senderId: { $ne: userId },
    //           seenBy: { $ne: userId },
    //         },
    //         { $addToSet: { seenBy: userId } }
    //       );

    //       const channel = await Channel.findById(channelId).select("members");

    //   const messages = await Message.find({ channelId })
    //     .sort({ createdAt: 1 })
    //     .lean();

    //   const memberCount = channel.members.length;

    //   const updated = messages.map((msg) => {
    //     const requiredSeen = memberCount - 1;

    //     return {
    //       ...msg,
    //       isSeenByAll:
    //         msg.seenBy.length >= requiredSeen &&
    //         !msg.seenBy.includes(msg.senderId.toString()),
    //     };
    //   });
    //   console.log("updated messages", updated);

    //       // io.to(channelId.toString()).emit("channel_seen_update",{
    //       //   updated,
    //       // });
    //       io.to(channelId.toString()).emit("channel_seen_update", {
    //   channelId,
    //   updatedMessages: updated,
    // });

    //     });
    // socket.on("channel_seen", async ({ channelId, userId }) => {
    //   if (!channelId || !userId) return;

    //   // 1️ Update unseen messages
    //   await Message.updateMany(
    //     {
    //       channelId,
    //       senderId: { $ne: userId },
    //       seenBy: { $ne: userId },
    //     },
    //     {
    //       $addToSet: { seenBy: userId },
    //       $set: { updatedAt: new Date() },
    //     }
    //   );

    //   // 2️⃣ Get channel members count
    //   const channel = await Channel.findById(channelId).select("members");
    //   const memberCount = channel.members.length;

    //   // 3️⃣ Get ONLY last message
    //   const lastMessage = await Message.findOne({ channelId })
    //     .sort({ createdAt: -1 })
    //     .lean();

    //   if (!lastMessage) return;

    //   // 4️⃣ Compute isSeenByAll ONLY for last message
    //   const requiredSeen = memberCount - 1;

    //   const isSeenByAll =
    //     lastMessage.seenBy.length >= requiredSeen &&
    //     !lastMessage.seenBy.includes(lastMessage.senderId.toString());

    //   // 5️⃣ Emit minimal payload
    //   io.to(channelId.toString()).emit("channel_seen_update", {
    //     channelId,
    //     messageId: lastMessage._id,
    //     isSeenByAll,
    //   });
    // });

    socket.on("channel_seen", async ({ channelId, userId }) => {
      if (!channelId || !userId) return;

      const uid = new mongoose.Types.ObjectId(userId);

      // 1️⃣ Update unseen messages
      await Message.updateMany(
        {
          channelId: new mongoose.Types.ObjectId(channelId),
          senderId: { $ne: uid },
          seenBy: { $ne: uid },
        },
        {
          $addToSet: { seenBy: uid },
          $set: { updatedAt: new Date() },
        }
      );

      //  2️⃣ EMIT UNREAD CLEAR (THIS WAS MISSING)
      // io.to(channelId.toString()).emit("channel_unread_clear", {
      //   channelId,
      //   userId,
      // });
      //       io.to(socket.id).emit("channel_unread_clear", {
      //   channelId,userId
      // });
      io.to(socket.id).emit("channel_unread_clear", {
        channelId,
        userId,
      });

      // 3️⃣ Get channel members
      const channel = await Channel.findById(channelId).select("members");
      if (!channel || !channel.members?.length) return;

      // 4️⃣ Get last message
      const lastMessage = await Message.findOne({ channelId })
        .sort({ createdAt: -1 })
        .lean();

      if (!lastMessage) return;

      // 5️⃣ Compute isSeenByAll
      const requiredSeen = channel.members.length - 1;

      const isSeenByAll =
        lastMessage.seenBy.length >= requiredSeen &&
        !lastMessage.seenBy.map(String).includes(String(lastMessage.senderId));

      // 6️⃣ Emit blue-tick update
      io.to(channelId.toString()).emit("channel_seen_update", {
        channelId,
        messageId: lastMessage._id,
        isSeenByAll,
      });
    });

   

    // actionable message delete
    socket.on("message_deleted", ({ messageId }) => {
      socket.broadcast.emit("message_deleted", { messageId });
    });
    // delete_message_file
     socket.on("delete_message_file", async ({ messageId, fileId }) => {
      if (!messageId || !fileId) return;
      console.log("delete_message_file event received", messageId, fileId);

      const message = await Message.findById(messageId);
      if (!message) return;

      // remove file
      message.files = message.files.filter((f) => f._id.toString() !== fileId);
      console.log("message after file removal", message);

      await message.save();

      io.to(message.channelId || message.receiverId.toString()).emit(
        "message_file_deleted",
        { messageId, fileId }
      );
    });
    // thread 
//     socket.on("thread_reply", (msg) => {
//   io.to(msg.channelId || msg.receiverId.toString())
//     .emit("thread_reply", msg);
// });
socket.on("thread_reply", (msg) => {
  // CHANNEL THREAD
  if (msg.channelId) {
    io.to(msg.channelId.toString()).emit("thread_reply", msg);
    return;
  }

  // DM THREAD
  if (msg.senderId && msg.receiverId) {
    const room = [msg.senderId.toString(), msg.receiverId.toString()]
      .sort()
      .join("_");

    io.to(room).emit("thread_reply", msg);
  }
});



  });

  return io;
}

export const getIO = () => ioInstance;
