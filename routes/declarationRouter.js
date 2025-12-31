import express from "express";
import { createDeclaration, getDeclaration, editDeclaration, deleteDeclaration  } from "../controllers/declarationController.js";
import upload from "../middlewares/upload.js";
const declarationRouter = express.Router();

declarationRouter.post("/create-declarationlist",  upload.any(), createDeclaration);
declarationRouter.get("/view-declarationlist", getDeclaration);
declarationRouter.put("/edit-declarationlist/:id",upload.any(), editDeclaration);
declarationRouter.delete("/delete-declarationlist/:id", deleteDeclaration);

export default declarationRouter;