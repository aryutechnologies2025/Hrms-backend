import express from "express";
import { createDigitalMarketing, getDigitalMarketing, editDigitalMarketing, digitalMarketingsDelete  } from "../controllers/digitalMarketingController.js";
import upload from "../middlewares/upload.js";
const digitalMarketingRouter = express.Router();

digitalMarketingRouter.post("/create-digitalMarketing",upload.any(),createDigitalMarketing);
digitalMarketingRouter.get("/view-digitalMarketing", getDigitalMarketing);
digitalMarketingRouter.put("/edit-digitalMarketing/:id",upload.any(),editDigitalMarketing);
digitalMarketingRouter.delete("/delete-digitalMarketing/:id", digitalMarketingsDelete);

export default digitalMarketingRouter;