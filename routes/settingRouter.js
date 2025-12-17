import express from "express";
import { createSetting, getSettingDetails, createInvoiceSetting,getSettingInvoiceDetails } from "../controllers/settingController.js";
const settingRouter = express.Router();

settingRouter.post("/create-setting", createSetting);
settingRouter.get("/view-setting", getSettingDetails);
settingRouter.post("/create-invoice-setting", createInvoiceSetting);
settingRouter.get("/view-invoice-setting", getSettingInvoiceDetails);
export default settingRouter;