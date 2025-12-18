
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

export default async function startSocketServer(httpServer) {
  // --- Init Redis ---
  const { pubClient, subClient } = await initRedis();

  // --- Create IO Server ---
  // const io = new Server(httpServer, {
  //   cors: {
  //     origin: process.env.CLIENT_URL || "http://localhost:5173",
    
  //   },
  // });

  console.log("coming 1")
  const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});
 console.log("coming 2")

  // --- Attach Redis Adapter ---
  io.adapter(getRedisAdapter());

  // --- Socket Connections ---
  // io.on("connection", async (socket) => {
  //   console.log("Socket Connected:", socket.id);

  //   // Validate JWT
  //   const token =
  //     socket.handshake.auth?.token || socket.handshake.query?.token;
  //   const payload = verifyToken(token);
  //   console.log("payload",payload);

  //   if (!payload) {
  //     socket.disconnect(true);
  //     return;
  //   }

  //   const userId = payload.userId;
  //   socket.join(`user_${userId}`);

  //   // Auto join user channels
  //   try {
  //     const channels = await Channel.find({ members: userId }).select("_id");
  //     channels.forEach((c) => socket.join(`channel_${c._id}`));
  //   } catch (err) {
  //     console.error("Auto-join channels error:", err.message);
  //   }

  //   // Notify connected
  //   io.to(socket.id).emit("connected", {
  //     socketId: socket.id,
  //     userId,
  //   });

  //   // Broadcast presence
  //   io.emit("presence:update", { userId, online: true });

  //   // Join channel manually
  //   socket.on("joinChannel", (channelId) => {
  //     socket.join(`channel_${channelId}`);
  //   });

  //   // Leave channel
  //   socket.on("leaveChannel", (channelId) => {
  //     socket.leave(`channel_${channelId}`);
  //   });

  //   // Typing indicator
  //   socket.on("typing", ({ channelId, receiverId, typing }) => {
  //     if (channelId) {
  //       socket
  //         .to(`channel_${channelId}`)
  //         .emit("typing", { userId, typing });
  //     }

  //     if (receiverId) {
  //       socket.to(`user_${receiverId}`).emit("typing", { userId, typing });
  //     }
  //   });

  //   // Send Message
  //   socket.on("sendMessage", async (payload) => {
  //     try {
  //       const newMsg = await Message.create({
  //         senderId: userId,
  //         channelId: payload.channelId || null,
  //         receiverId: payload.receiverId || null,
  //         text: payload.text || "",
  //         files: payload.files || [],
  //       });

  //       if (payload.channelId) {
  //         io.to(`channel_${payload.channelId}`).emit("receiveMessage", newMsg);
  //       } else if (payload.receiverId) {
  //         io.to(`user_${payload.receiverId}`).emit("receiveMessage", newMsg);
  //         io.to(`user_${userId}`).emit("receiveMessage", newMsg);
  //       }
  //     } catch (err) {
  //       console.error("sendMessage error:", err.message);
  //       socket.emit("error", { message: "Failed to send message" });
  //     }
  //   });

  //   // Message Seen
  //   socket.on("messageSeen", async ({ messageId }) => {
  //     try {
  //       await Message.findByIdAndUpdate(messageId, {
  //         $addToSet: { seenBy: userId },
  //       });
  //     } catch (err) {
  //       console.error("messageSeen error:", err.message);
  //     }
  //   });

  //   // Disconnect
  //   socket.on("disconnect", () => {
  //     io.emit("presence:update", { userId, online: false });
  //   });
  // });
  //   io.on("connection", (socket) => {
  //   console.log("Socket Connected:", socket.id);

  //   // Join room for DM
  //   socket.on("join_dm", ({ senderId, receiverId }) => {
  //     const roomId = [senderId, receiverId].sort().join("_");
  //     socket.join(roomId);
  //   });

  //   // Send DM
  //   socket.on("send_dm", async ({ senderId, receiverId, text, files }) => {
  //     const msg = await Message.create({
  //       senderId,
  //       receiverId,
  //       text,
  //       files,
  //     });
  //     console.log("send_dm",msg);

  //     const roomId = [senderId, receiverId].sort().join("_");

  //     io.to(roomId).emit("receive_dm", msg);
  //   });
  // });
//    io.on("connection", (socket) => {
//     console.log("Socket Connected:", socket.id);

//     // JOIN DM ROOM
//     socket.on("join_dm", ({ senderId, receiverId }) => {
//       const roomId = [senderId, receiverId].sort().join("_");
//       socket.join(roomId);
//     });

//     // TYPING INDICATOR
//     socket.on("typing", ({ senderId, receiverId, typing }) => {
//       const roomId = [senderId, receiverId].sort().join("_");
//       socket.to(roomId).emit("typing", {
//         senderId,
//         typing,
//       });
//     });

//     // SEND DM (NO ROLE CHECK)
//     // socket.on("send_dm", async ({ senderId, receiverId, text, files }) => {
//     //   try {
//     //     const msg = await Message.create({
//     //       senderId,
//     //       receiverId,
//     //       text,
//     //       files,
//     //     });
//     //     console.log("send ",msg)

//     //     const roomId = [senderId, receiverId].sort().join("_");
//     //     io.to(roomId).emit("receive_dm", msg);
//     //   } catch (err) {
//     //     console.error("send_dm error:", err.message);
//     //   }
//     // });
//     socket.on("send_dm", async ({ clientId, senderId, receiverId, text,files }) => {
      
//       const msg = await Message.create({
//         senderId,
//         receiverId,
//         text,
//         files
//       });

//       const room = [senderId, receiverId].sort().join("_");

//       io.to(room).emit("receive_dm", {
//         ...msg.toObject(),
//         clientId, // 🔑 important
//       });
//     });
  

//     // MARK MESSAGES AS SEEN
//     // socket.on("mark_seen", async ({ senderId, receiverId }) => {
//     //   await Message.updateMany(
//     //     {
//     //       senderId,
//     //       receiverId,
//     //       seenBy: { $ne: receiverId },
//     //     },
//     //     { $addToSet: { seenBy: receiverId } }
//     //   );

//     //   const roomId = [senderId, receiverId].sort().join("_");
//     //   io.to(roomId).emit("messages_seen", { senderId });
//     // });
//     socket.on("mark_seen", async ({ senderId, receiverId }) => {
//   await Message.updateMany(
//     {
//       senderId,
//       receiverId,
//       seenBy: { $ne: receiverId },
//     },
//     { $addToSet: { seenBy: receiverId } }
//   );

//   const roomId = [senderId, receiverId].sort().join("_");

//   io.to(roomId).emit("messages_seen", {
//     senderId,
//     receiverId, // IMPORTANT
//   });
// });

//   });
const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    /* ---------------- USER ONLINE ---------------- */
    // socket.on("user_online", (userId) => {
    //   onlineUsers.set(userId.toString(), socket.id);
    //   socket.userId = userId.toString();
    // });
    /* ---------------- USER ONLINE ---------------- */
socket.on("user_online", (userId) => {
  onlineUsers.set(userId.toString(), socket.id);
  socket.userId = userId.toString();

  // 🔥 send updated list to all clients
  io.emit("online_users", Array.from(onlineUsers.keys()));
});

// socket.on("user_online", async (userId) => {
//   onlineUsers.set(userId.toString(), socket.id);
//   socket.userId = userId.toString();

//   io.emit("online_users", Array.from(onlineUsers.keys()));

//   // 🔥 NEW: notify senders that messages are delivered
//   const undeliveredMessages = await Message.find({
//     receiverId: userId,
//     seenBy: { $ne: userId },
//   });

//   undeliveredMessages.forEach((msg) => {
//     const roomId = [msg.senderId, msg.receiverId].sort().join("_");

//     io.to(roomId).emit("message_delivered", {
//       senderId: msg.senderId,
//       receiverId: msg.receiverId,
//     });
//   });
// });



    /* ---------------- JOIN DM ROOM ---------------- */
    socket.on("join_dm", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.join(roomId);
    });

    /* ---------------- SEND DM ---------------- */
    // socket.on("send_dm", async ({ clientId, senderId, receiverId, text,file }) => {
    //   try {
    //     const msg = await Message.create({
    //       senderId,
    //       receiverId,
    //       text,
    //       file
          
    //     });

    //     const receiverOnline = onlineUsers.has(receiverId.toString());

    //     const roomId = [senderId, receiverId].sort().join("_");

    //     io.to(roomId).emit("receive_dm", {
    //       ...msg.toObject(),
    //       clientId,
    //       delivered: receiverOnline, // 🔑 key
    //     });
    //   } catch (err) {
    //     console.error("send_dm error:", err.message);
    //   }
    // });
 socket.on("send_dm", async ({ clientId, senderId, receiverId, text, file }) => {
  try {
    const msg = await Message.create({
      senderId,
      receiverId,
      text,
      file,
    });

    const receiverOnline = onlineUsers.has(receiverId.toString());
    const roomId = [senderId, receiverId].sort().join("_");

    io.to(roomId).emit("receive_dm", {
      ...msg.toObject(),
      clientId,
      receiverOnline,   // ✅ IMPORTANT
    });
  } catch (err) {
    console.error("send_dm error:", err.message);
  }
});


    /* ---------------- MARK SEEN ---------------- */
    socket.on("mark_seen", async ({ senderId, receiverId }) => {
      try {
        await Message.updateMany(
          {
            senderId,
            receiverId,
            seenBy: { $ne: receiverId },
          },
          { $addToSet: { seenBy: receiverId } }
        );

        const roomId = [senderId, receiverId].sort().join("_");

        io.to(roomId).emit("messages_seen", {
          senderId,
          receiverId,
        });
      } catch (err) {
        console.error("mark_seen error:", err.message);
      }
    });

    /* ---------------- DISCONNECT ---------------- */
    // socket.on("disconnect", () => {
    //   if (socket.userId) {
    //     onlineUsers.delete(socket.userId);
    //   }
    //   console.log("Disconnected:", socket.id);
    // });
    socket.on("disconnect", () => {
  if (socket.userId) {
    onlineUsers.delete(socket.userId);

    //  update everyone
    io.emit("online_users", Array.from(onlineUsers.keys()));
  }
});



  });

  return io;
}
