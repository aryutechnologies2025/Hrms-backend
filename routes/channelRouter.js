import express from "express";
import { createChannel, listChannels } from "../controllers/chennalController.js";


const channelRouter = express.Router();

channelRouter.post("/create-channel", createChannel);
channelRouter.get("/channel-list", listChannels);

export default channelRouter;