import Channel from "../models/channelModel.js";

 const createChannel = async (req, res) => {
  const { name, description, isPrivate, members } = req.body;
  const channel = await Channel.create({
    name, description, isPrivate, members, createdBy: req.user.userId
  });
  res.status(201).json(channel);
};

 const listChannels = async (req, res) => {
  const channels = await Channel.find({}).populate("members", "employeeName photo email");
  res.json(channels);
};
export {
    createChannel,
    listChannels,  
}