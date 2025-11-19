import express from "express";
import { assetDelete, createAsset, editAssetDetails, getAssetDetails, getAssetDetailsById } from "../controllers/assetController.js";

const assetRouter = express.Router();

assetRouter.post("/create-asset",createAsset);
assetRouter.get("/view-asset",getAssetDetails);
// assetRouter.get("/view-asset/:id",getAssetDetailsById);
assetRouter.put("/edit-assetdetails/:id",editAssetDetails); 
assetRouter.delete("/delete-asset/:id",assetDelete); 

export default assetRouter;