import Channel from "../models/channelModel.js";


 const createChannel = async(req, res) => {
  try {
    const { name, createdBy } = req.body;
    const members = req.body.members || [];

    const channel = await Channel.create({
      name,
      createdBy,
      members: [createdBy, ...members], // creator auto-joined
    });

    res.json({ success: true, data: channel });
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const listChannels = async (req, res) => {
  try{
    const channels = await Channel.find({ })
  .populate("createdBy", "name email")
  .populate("members", "name email photo");

     res.status(200).json({ success: true, data: channels });

  }catch(err){
    console.error("Error listing channels:", err);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
 
};


export { createChannel, listChannels };
