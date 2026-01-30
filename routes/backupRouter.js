import express from "express";
import {createBackup,getBackup,getBackupById,editBackupById,deleteBackup} from "../controllers/backupController.js";
const router = express.Router();
import upload from "../middlewares/upload.js";

router.post("/create-backup",upload.any(),createBackup);
router.get("/get-backup",getBackup);
router.get("/get-backup-by-id",getBackupById);
router.put("/update-backup/:id",upload.any(), editBackupById);
router.delete("/delete-backup/:id", deleteBackup);
export default router;