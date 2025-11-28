import express from "express";
const momRouter = express.Router();
import {
    createMom,getMom,editMom,momDelete,getMomById,createMomDocument,getMomDocument,getMomDocumentById,editDocument,
    documentDelete
} from "../controllers/momController.js"
import upload from "../middlewares/upload.js";
momRouter.post("/create-mom", upload.any(),createMom );
momRouter.post("/create-document",upload.any(), createMomDocument );
momRouter.get("/get-mom",getMom);
momRouter.get("/get-document",getMomDocument);
momRouter.get("/get-document/:id",getMomDocumentById);
momRouter.get("/get-mom/:id",getMomById);
momRouter.put("/update-mom/:id",upload.any(), editMom);
momRouter.put("/update-document/:id",upload.any(), editDocument);
momRouter.delete("/delete-mom/:id", momDelete);
momRouter.delete("/delete-Document/:id", documentDelete);
export default momRouter;