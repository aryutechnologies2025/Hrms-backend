import express from "express";
const momRouter = express.Router();
import {
    createMom,getMom,editMom,momDelete,getMomById
} from "../controllers/momController.js"
import upload from "../middlewares/upload.js";
momRouter.post("/create-mom", upload.any(),createMom );
momRouter.get("/get-mom",getMom);
momRouter.get("/get-mom/:id",getMomById);
momRouter.put("/update-mom/:id",upload.any(), editMom);
momRouter.delete("/delete-mom/:id", momDelete);

export default momRouter;