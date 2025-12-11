
// socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Channel from "./models/channelModel.js";
import Message from "./models/messageModel.js";
import { initRedis, getRedisAdapter } from "./redis.js";

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
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  // --- Attach Redis Adapter ---
  io.adapter(getRedisAdapter());

  // --- Socket Connections ---
  io.on("connection", async (socket) => {
    console.log("Socket Connected:", socket.id);

    // Validate JWT
    const token =
      socket.handshake.auth?.token || socket.handshake.query?.token;
    const payload = verifyToken(token);

    if (!payload) {
      socket.disconnect(true);
      return;
    }

    const userId = payload.userId;
    socket.join(`user_${userId}`);

    // Auto join user channels
    try {
      const channels = await Channel.find({ members: userId }).select("_id");
      channels.forEach((c) => socket.join(`channel_${c._id}`));
    } catch (err) {
      console.error("Auto-join channels error:", err.message);
    }

    // Notify connected
    io.to(socket.id).emit("connected", {
      socketId: socket.id,
      userId,
    });

    // Broadcast presence
    io.emit("presence:update", { userId, online: true });

    // Join channel manually
    socket.on("joinChannel", (channelId) => {
      socket.join(`channel_${channelId}`);
    });

    // Leave channel
    socket.on("leaveChannel", (channelId) => {
      socket.leave(`channel_${channelId}`);
    });

    // Typing indicator
    socket.on("typing", ({ channelId, receiverId, typing }) => {
      if (channelId) {
        socket
          .to(`channel_${channelId}`)
          .emit("typing", { userId, typing });
      }

      if (receiverId) {
        socket.to(`user_${receiverId}`).emit("typing", { userId, typing });
      }
    });

    // Send Message
    socket.on("sendMessage", async (payload) => {
      try {
        const newMsg = await Message.create({
          senderId: userId,
          channelId: payload.channelId || null,
          receiverId: payload.receiverId || null,
          text: payload.text || "",
          files: payload.files || [],
        });

        if (payload.channelId) {
          io.to(`channel_${payload.channelId}`).emit("receiveMessage", newMsg);
        } else if (payload.receiverId) {
          io.to(`user_${payload.receiverId}`).emit("receiveMessage", newMsg);
          io.to(`user_${userId}`).emit("receiveMessage", newMsg);
        }
      } catch (err) {
        console.error("sendMessage error:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Message Seen
    socket.on("messageSeen", async ({ messageId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { seenBy: userId },
        });
      } catch (err) {
        console.error("messageSeen error:", err.message);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      io.emit("presence:update", { userId, online: false });
    });
  });

  return io;
}
