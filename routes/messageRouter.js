// import express from "express";
// import useAuth from "../middlewares/userAuth";
// import { fetchChannelMessages, fetchDmMessages } from "../controllers/messageController";
// const messageRouter = express.Router();

// messageRouter.get("/channel/:channelId",useAuth, fetchChannelMessages);
// messageRouter.get("/dm/:userId/:otherId", useAuth, fetchDmMessages);

// export default messageRouter;
// routes/message.js
// import express from "express";
// import { fetchChannelMessages, fetchDmMessages, uploadFiles, deleteUploadedFile } from "../controllers/messageController.js";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import useAuth from "../middlewares/userAuth.js";

// const router = express.Router();

// // ensure upload folder exists
// const uploadDir = path.resolve(process.cwd(), "uploads", "others");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
// });
// const upload = multer({ storage });

// router.get("/channel/:channelId", useAuth, fetchChannelMessages);
// router.get("/dm/:userId/:otherId", useAuth, fetchDmMessages);

// // upload files for messages
// router.post("/upload", useAuth, upload.array("files", 6), uploadFiles);
// router.post("/upload/delete", useAuth, deleteUploadedFile);

// export default router;


// 2. GET DM CHAT between two users
//  import express from "express";
// import { sendMessage } from "../controllers/messageController";
//  const messageRouter = express.Router();
 
// messageRouter.get("/messages",getMeassage);

// /**
//  * 🟦 3. SEND a DM
//  */
// messageRouter.post("/send",sendMessage);


// export default messageRouter;



// import express from "express";
// import { getDMHistory, getUnreadCounts, markMessagesSeen } from "../controllers/messageController.js";

// const messageRouter = express.Router();

// messageRouter.get("/dm/:userId/:otherUserId", getDMHistory);
// messageRouter.get("/unread/:userId", getUnreadCounts);
// messageRouter.post("/seen", markMessagesSeen);

// export default messageRouter;
// routes/messageRoutes.js
import express from "express";
import {
  deleteMessage,
  deleteMessageFile,
  editMessageFiles,
  getChannelHistory,
  getChannelUnreadCounts,
  getDMHistory,
  getSeenMessage,
  getThreadReplies,
  getUnreadCounts,
  markChannelMessagesSeen,
  markMessagesSeen,
  sendChatMessage,
} from "../controllers/messageController.js";
import chatUpload from "../middlewares/chatUploads.js";

const router = express.Router();

router.get("/dm/:userId/:otherUserId", getDMHistory);
router.get("/unread/:userId", getUnreadCounts);
router.post("/seen", markMessagesSeen);

router.post(
  "/send",
  chatUpload.any(), // ⭐ MULTI FILE SUPPORT
  sendChatMessage
);
router.get("/channel/:channelId", getChannelHistory);
router.post("/channel-seen", markChannelMessagesSeen);
router.get("/channels/unread/:userId", getChannelUnreadCounts);
// routes/messageRoutes.js
// message Actions
router.patch("/messages/:id/delete", deleteMessage);
router.delete("/messages/delete-file", deleteMessageFile);
router.patch("/messages/edit",chatUpload.any(), editMessageFiles);
router.get("/messages/thread/:parentId",getThreadReplies);
router.get("/messages/seen-by/:messageId",getSeenMessage);



export default router;



