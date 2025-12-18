
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

  
const onlineUsers = new Map();

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
 io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    /* USER ONLINE */
    socket.on("user_online", async (userId) => {
      socket.userId = userId.toString();
      onlineUsers.set(socket.userId, socket.id);

      // mark delivered
      await Message.updateMany(
        { receiverId: userId, deliveredAt: null },
        { deliveredAt: new Date() }
      );

      io.emit("online_users", [...onlineUsers.keys()]);
    });

    /* JOIN ROOM */
    socket.on("join_dm", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");
      socket.join(room);
    });

    /* SEND MESSAGE */
    socket.on("send_dm", async ({ clientId, senderId, receiverId, text }) => {
      const isOnline = onlineUsers.has(receiverId.toString());

      const msg = await Message.create({
        senderId,
        receiverId,
        text,
        deliveredAt: isOnline ? new Date() : null,
      });

      const room = [senderId, receiverId].sort().join("_");

      io.to(room).emit("receive_dm", {
        ...msg.toObject(),
        clientId,
      });
    });

    /* SEEN */
    // socket.on("mark_seen", async ({ senderId, receiverId }) => {
    //   const now = new Date();

    //   const result = await Message.updateMany(
    //     { senderId, receiverId, seenAt: null },
    //     {
    //       $set: { seenAt: now },
    //       $addToSet: { seenBy: receiverId },
    //     }
    //   );

    //   if (result.modifiedCount > 0) {
    //     const room = [senderId, receiverId].sort().join("_");
    //     io.to(room).emit("messages_seen", {
    //       senderId,
    //       receiverId,
    //       seenAt: now,
    //     });
    //   }
    // });
socket.on("mark_seen", async ({ senderId, receiverId }) => {
  const now = new Date();

  const result = await Message.updateMany(
    { senderId, receiverId, seenAt: null },
    {
      $set: { seenAt: now },
      $addToSet: { seenBy: receiverId },
    }
  );

  if (result.modifiedCount > 0) {
    // 🔥 SEND DIRECTLY TO SENDER SOCKET
    const senderSocketId = onlineUsers.get(senderId.toString());

    if (senderSocketId) {
      io.to(senderSocketId).emit("messages_seen", {
        senderId,
        receiverId,
        seenAt: now,
      });
    }
  }
});

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("online_users", [...onlineUsers.keys()]);
      }
    });
  });
  return io;
}
