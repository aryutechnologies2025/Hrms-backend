import express from "express";
import xlUpload from "../middlewares/xlUpload.js";

import  { 
    deleteStatementDetails, 
    editStatementDetails, 
    getAllStatementDetails, 
    getStatementDetailsById, 
    importExcel 
} from "../controllers/statementsController.js";

const statementsRouter = express.Router();

statementsRouter.post("/import", xlUpload.single("file"),importExcel);
statementsRouter.get("/getAllStatementDetails", getAllStatementDetails);
statementsRouter.get("/getAllStatementDetailsById/:id", getStatementDetailsById);
statementsRouter.put("/editStatementDetails/:id", editStatementDetails);
statementsRouter.delete("/deleteStatementDetails/:id", deleteStatementDetails); 
 

export default statementsRouter;
