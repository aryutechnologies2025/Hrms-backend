import express from "express";
import xlUpload from "../middlewares/xlUpload.js";

import importExcel from "../controllers/statementsController.js";

const statementsRouter = express.Router();

statementsRouter.post("/import", xlUpload.single("file"),importExcel);
 

export default statementsRouter;
