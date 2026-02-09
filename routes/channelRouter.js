import express from "express";
import { createChannel, deleteChannel, listChannels, updateChannel, viewChannelMembers } from "../controllers/chennalController.js";



const channelRouter = express.Router();

channelRouter.post("/create-channel", createChannel);
channelRouter.get("/channel-list", listChannels);
channelRouter.put("/update-channel/:id",updateChannel);
channelRouter.delete("/:id",deleteChannel);
channelRouter.get("/channel-members/:channelId",viewChannelMembers);

export default channelRouter;