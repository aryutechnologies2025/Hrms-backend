import Channel from "../models/channelModel.js";
import ClientDetails from "../models/clientModals.js";
import ClientSubUser from "../models/clientSubUserModel.js";
import Employee from "../models/employeeModel.js";
import User from "../models/userModel.js";
import { getIO } from "../socket.js";

const createChannel = async (req, res) => {
  try {
    const { name, createdBy, type } = req.body;
    const members = req.body.members || [];

    const channel = await Channel.create({
      name,
      createdBy,
      type,
      members: [createdBy, ...members], // creator auto-joined
    });
   // Notify members about the new channel

    const io = getIO();

    io.to(members.map(m => m._id)).emit("channel_created", channel);

    res.json({ success: true, data: channel });
    
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// const listChannels = async (req, res) => {
//   const { userType, userId } = req.query;
//   console.log("userType", userType, "userId", userId);
//   try {
//     let channels;
//     if (userType && userType === "SuperAdmin") {
//       channels = await Channel.find({})
//         .populate("createdBy", "name email")
//         .populate("members", "name email photo");
//     } else {
//       channels = await Channel.find({
//         $or: [
//           { type: "general" }, // public channels
//           { members: userId }, // array contains userId
//           { senderId: userId }, // creator
//         ],
//       }).populate("createdBy", "name email")
//         .populate("members", "name email photo");;
//       res.status(200).json({ success: true, data: channels });
//     }
//   } catch (err) {
//     console.error("Error listing channels:", err);
//     res.status(500).json({ success: false, message: err.message });
//     return;
//   }
// };

const listChannels = async (req, res) => {
  const { userId, isSuperAdmin } = req.query;

  try {
    /* ---------------- FETCH CHANNELS ---------------- */
    let channels;

    if (isSuperAdmin === "true") {
      channels = await Channel.find({})
        .populate("createdBy", "email")
        .populate("members", "email photo")
        .lean();
    } else {
      channels = await Channel.find({
        $or: [
          { channelType: "public" },
          { members: userId },
          { createdBy: userId },
        ],
      })
        .populate("createdBy", "email")
        .populate("members", "email photo")
        .lean();
    }

    /* ---------------- COLLECT ALL USER IDS ---------------- */
    const userIds = new Set();

    channels.forEach((ch) => {
      if (ch.createdBy?._id) {
        userIds.add(ch.createdBy._id.toString());
      }

      ch.members?.forEach((m) => {
        if (m?._id) userIds.add(m._id.toString());
      });
    });

    const idsArray = [...userIds];

    /* ---------------- FETCH FROM ALL COLLECTIONS ---------------- */
    const [admins, employees, clients, subUsers] = await Promise.all([
      User.find({ _id: { $in: idsArray } })
        .select("_id name email")
        .lean(),

      Employee.find({ _id: { $in: idsArray } })
        .select("_id employeeName email photo")
        .lean(),

      ClientDetails.find({ _id: { $in: idsArray } })
        .select("_id client_name email")
        .lean(),

      ClientSubUser.find({ _id: { $in: idsArray } })
        .select("_id name email")
        .lean(),
    ]);

    /* ---------------- BUILD ID → USER MAP ---------------- */
    const userMap = {};

    admins.forEach((u) => {
      userMap[u._id.toString()] = {
        name: u.name,
        email: u.email,
        type: "admin",
      };
    });

    employees.forEach((u) => {
      userMap[u._id.toString()] = {
        name: u.employeeName,
        email: u.email,
        photo: u.photo,
        type: "employee",
      };
    });

    clients.forEach((u) => {
      userMap[u._id.toString()] = {
        name: u.client_name,
        email: u.email,
        type: "client",
      };
    });

    subUsers.forEach((u) => {
      userMap[u._id.toString()] = {
        name: u.name,
        email: u.email,
        type: "clientSubUser",
      };
    });

    /* ---------------- ATTACH NAME TO CHANNEL DATA ---------------- */
    channels.forEach((ch) => {
      // createdBy name
      if (ch.createdBy?._id) {
        const info = userMap[ch.createdBy._id.toString()];
        if (info) ch.createdBy.name = info.name;
      }

      // members name
      ch.members = ch.members.map((m) => {
        const info = userMap[m._id.toString()];
        return {
          ...m,
          name: info?.name || "Unknown",
          userType: info?.type,
        };
      });
    });

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      data: channels,
    });
  } catch (err) {
    console.error("Error listing channels:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export { createChannel, listChannels };
