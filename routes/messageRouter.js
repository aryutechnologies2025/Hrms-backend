// import express from "express";
// import useAuth from "../middlewares/userAuth";
// import { fetchChannelMessages, fetchDmMessages } from "../controllers/messageController";
// const messageRouter = express.Router();

// messageRouter.get("/channel/:channelId",useAuth, fetchChannelMessages);
// messageRouter.get("/dm/:userId/:otherId", useAuth, fetchDmMessages);

// export default messageRouter;
// routes/message.js
import express from "express";
import { fetchChannelMessages, fetchDmMessages, uploadFiles, deleteUploadedFile } from "../controllers/messageController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import useAuth from "../middlewares/userAuth.js";

const router = express.Router();

// ensure upload folder exists
const uploadDir = path.resolve(process.cwd(), "uploads", "others");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get("/channel/:channelId", useAuth, fetchChannelMessages);
router.get("/dm/:userId/:otherId", useAuth, fetchDmMessages);

// upload files for messages
router.post("/upload", useAuth, upload.array("files", 6), uploadFiles);
router.post("/upload/delete", useAuth, deleteUploadedFile);

export default router;
