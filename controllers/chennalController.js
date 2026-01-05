import Channel from "../models/channelModel.js";

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
    let channels;

    if (isSuperAdmin === "true") {
      channels = await Channel.find({})
        .populate("createdBy", "name email")
        .populate("members", "name email photo");
    } else {
      channels = await Channel.find({
        $or: [
          { type: "general" },   // public
          { members: userId },   // member
          { senderId: userId },  // creator
        ],
      })
        .populate("createdBy", "name email")
        .populate("members", "name email photo");
    }

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
