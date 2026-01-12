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

statementsRouter.post("/import",xlUpload.single('file'), (req, res,next) => {
    console.log("Uploaded File:", req.file);     
    console.log("Body:", req.body);         
    
   next();
},importExcel);
// router.js
// statementsRouter.post("/import", xlUpload.single('file'), (req, res, next) => {
//     console.log("===== REQUEST DETAILS =====");
//     console.log("Uploaded File:", req.file);
//     console.log("Request Body:", req.body);
//     console.log("===========================");
//     next();
// }, importExcel);
statementsRouter.get("/getAllStatementDetails", getAllStatementDetails);
statementsRouter.get("/getAllStatementDetailsById/:id", getStatementDetailsById);
statementsRouter.put("/editStatementDetails/:id", editStatementDetails);
statementsRouter.delete("/deleteStatementDetails/:id", deleteStatementDetails); 
 

export default statementsRouter;
