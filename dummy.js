// socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Channel from "./models/channelModel.js";
import Message from "./models/messageModel.js";
import { initRedis, getRedisAdapter } from "./redis.js";
import User from "./models/userModel.js";

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

  // --- Create IO Server ---
  // const io = new Server(httpServer, {
  //   cors: {
  //     origin: process.env.CLIENT_URL || "http://localhost:5173",

  //   },
  // });

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

  // const onlineUsers = new Map();

  //   io.on("connection", (socket) => {
  //     console.log("Connected:", socket.id);

  //     /* ---------------- USER ONLINE ---------------- */
  // // socket.on("user_online", (userId) => {
  // //   onlineUsers.set(userId.toString(), socket.id);
  // //   socket.userId = userId.toString();

  // //   // 🔥 send updated list to all clients
  // //   io.emit("online_users", Array.from(onlineUsers.keys()));
  // // });
  // socket.on("user_online", async (userId) => {
  //   onlineUsers.set(userId.toString(), socket.id);
  //   socket.userId = userId.toString();

  //   // 🔥 mark old messages as delivered
  //   await Message.updateMany(
  //     {
  //       receiverId: userId,
  //       deliveredAt: null,
  //     },
  //     { deliveredAt: new Date() }
  //   );

  //   io.emit("online_users", Array.from(onlineUsers.keys()));
  // });

  //     /* ---------------- JOIN DM ROOM ---------------- */
  //     socket.on("join_dm", ({ senderId, receiverId }) => {
  //       const roomId = [senderId, receiverId].sort().join("_");
  //       socket.join(roomId);
  //     });

  //     /* ---------------- SEND DM ---------------- */

  // //  socket.on("send_dm", async ({ clientId, senderId, receiverId, text, file }) => {
  // //   try {
  // //     const msg = await Message.create({
  // //       senderId,
  // //       receiverId,
  // //       text,
  // //       file,
  // //     });

  // //     const receiverOnline = onlineUsers.has(receiverId.toString());
  // //     const roomId = [senderId, receiverId].sort().join("_");

  // //     io.to(roomId).emit("receive_dm", {
  // //       ...msg.toObject(),
  // //       clientId,
  // //       receiverOnline,   // ✅ IMPORTANT
  // //     });
  // //   } catch (err) {
  // //     console.error("send_dm error:", err.message);
  // //   }
  // // });
  // socket.on("send_dm", async ({ clientId, senderId, receiverId, text }) => {
  //   const isOnline = onlineUsers.has(receiverId.toString());

  //   const msg = await Message.create({
  //     senderId,
  //     receiverId,
  //     text,
  //     deliveredAt: isOnline ? new Date() : null,
  //   });

  //   const roomId = [senderId, receiverId].sort().join("_");

  //   io.to(roomId).emit("receive_dm", {
  //     ...msg.toObject(),
  //     clientId,
  //   });
  // });

  //     /* ---------------- MARK SEEN ---------------- */
  //     // socket.on("mark_seen", async ({ senderId, receiverId }) => {
  //     //   try {
  //     //     await Message.updateMany(
  //     //       {
  //     //         senderId,
  //     //         receiverId,
  //     //         seenBy: { $ne: receiverId },
  //     //       },
  //     //       { $addToSet: { seenBy: receiverId } }
  //     //     );

  //     //     const roomId = [senderId, receiverId].sort().join("_");

  //     //     io.to(roomId).emit("messages_seen", {
  //     //       senderId,
  //     //       receiverId,
  //     //     });
  //     //   } catch (err) {
  //     //     console.error("mark_seen error:", err.message);
  //     //   }
  //     // });
  // socket.on("mark_seen", async ({ senderId, receiverId }) => {
  //   await Message.updateMany(
  //     {
  //       senderId,
  //       receiverId,
  //       seenAt: null,
  //     },
  //     { seenAt: new Date() }
  //   );

  //   const roomId = [senderId, receiverId].sort().join("_");

  //   io.to(roomId).emit("messages_seen", {
  //     senderId,
  //     receiverId,
  //   });
  // });

  //     /* ---------------- DISCONNECT ---------------- */
  //     // socket.on("disconnect", () => {
  //     //   if (socket.userId) {
  //     //     onlineUsers.delete(socket.userId);
  //     //   }
  //     //   console.log("Disconnected:", socket.id);
  //     // });
  //     socket.on("disconnect", () => {
  //   if (socket.userId) {
  //     onlineUsers.delete(socket.userId);

  //     //  update everyone
  //     io.emit("online_users", Array.from(onlineUsers.keys()));
  //   }
  // });

  //   });
  //  io.on("connection", (socket) => {
  //     console.log("Connected:", socket.id);

  //     /* USER ONLINE */
  //     socket.on("user_online", async (userId) => {
  //       socket.userId = userId.toString();
  //       onlineUsers.set(socket.userId, socket.id);

  //       // mark undelivered messages as delivered
  //       await Message.updateMany(
  //         { receiverId: userId, deliveredAt: null },
  //         { deliveredAt: new Date() }
  //       );

  //       io.emit("online_users", [...onlineUsers.keys()]);
  //     });

  //     /* JOIN DM */
  //     socket.on("join_dm", ({ senderId, receiverId }) => {
  //       const room = [senderId, receiverId].sort().join("_");
  //       socket.join(room);
  //     });

  //     /* SEND MESSAGE */
  //     socket.on("send_dm", async ({ clientId, senderId, receiverId, text }) => {
  //       const isOnline = onlineUsers.has(receiverId.toString());

  //       const msg = await Message.create({
  //         senderId,
  //         receiverId,
  //         text,
  //         deliveredAt: isOnline ? new Date() : null,
  //       });

  //       const room = [senderId, receiverId].sort().join("_");

  //       io.to(room).emit("receive_dm", {
  //         ...msg.toObject(),
  //         clientId,
  //       });
  //     });

  //     /* MARK SEEN */
  //     socket.on("mark_seen", async ({ senderId, receiverId }) => {
  //       await Message.updateMany(
  //         { senderId, receiverId, seenAt: null },
  //         {
  //           $set: { seenAt: new Date() },
  //           $addToSet: { seenBy: receiverId },
  //         }
  //       );

  //       const room = [senderId, receiverId].sort().join("_");
  //       io.to(room).emit("messages_seen", { senderId, receiverId });
  //     });

  //     /* DISCONNECT */
  //     socket.on("disconnect", () => {
  //       if (socket.userId) {
  //         onlineUsers.delete(socket.userId);
  //         io.emit("online_users", [...onlineUsers.keys()]);
  //       }
  //     });
  //   });
  /**
   * Map<userId, Set<socketId>>
   * Supports multi-tabs / multi-devices
   */
  // const onlineUsers = new Map();

  // io.on("connection", (socket) => {
  //   console.log("Connected:", socket.id);

  //   /* USER ONLINE */
  //   socket.on("user_online", async (userId) => {
  //     socket.userId = userId.toString();

  //     await Message.updateMany(
  //       { receiverId: userId, deliveredAt: null },
  //       { $set: { deliveredAt: new Date() } }
  //     );

  //     io.emit("online_users", userId);
  //   });

  //   /* JOIN DM */
  //   socket.on("join_dm", ({ senderId, receiverId }) => {
  //     const room = [senderId, receiverId].sort().join("_");
  //     socket.join(room);
  //     console.log("Joined room:", room);
  //   });

  //   /* SEND MESSAGE */
  //   socket.on("send_dm", async ({ clientId, senderId, receiverId, text }) => {
  //     const msg = await Message.create({
  //       senderId,
  //       receiverId,
  //       text,
  //       deliveredAt: new Date(), // receiver online handled earlier
  //     });

  //     const room = [senderId, receiverId].sort().join("_");

  //     io.to(room).emit("receive_dm", {
  //       ...msg.toObject(),
  //       clientId,
  //     });
  //   });

  //   /* MARK SEEN — THE MOST IMPORTANT PART */
  //   socket.on("mark_seen", async ({ senderId, receiverId }) => {
  //     const now = new Date();

  //     const result = await Message.updateMany(
  //       { senderId, receiverId, seenAt: null },
  //       { $set: { seenAt: now } }
  //     );

  //     if (!result.modifiedCount) return;

  //     const room = [senderId, receiverId].sort().join("_");

  //     io.to(room).emit("messages_seen", {
  //       senderId,   // who sent the messages
  //       receiverId, // who saw them
  //       seenAt: now,
  //     });

  //     console.log("✅ Seen emitted to room:", room);
  //   });

  //   socket.on("disconnect", () => {
  //     console.log("Disconnected:", socket.id);
  //   });
  // });

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
      if(!channelId) return;
      console.log("channelId", channelId);
      socket.join(channelId.toString());
      console.log("Joined channel:", channelId);
    });

    // send_channel_message
    socket.on("new_channel_message", async ( msg ) => {
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
    socket.on("channel_seen", async ({ channelId, userId }) => {
      if(!channelId || !userId) return;
      await Message.updateMany(
        {
          channelId,
          senderId: { $ne: userId },
          seenBy: { $ne: userId },
        },
        { $addToSet: { seenBy: userId } }
      );

      io.to(channelId.toString()).emit("channel_seen_update", {
        channelId,
        userId,
      });
    });
  });

  return io;
}
