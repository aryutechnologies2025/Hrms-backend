import express from "express";
import { assetDelete, createAsset, editAssetDetails, getAssetDetails } from "../controllers/assetController.js";

const assetRouter = express.Router();

assetRouter.post("/create-createAsset",createAsset);
assetRouter.get("/view-asset",getAssetDetails);
// assetRouter.get("/view-asset/:id",getAssetDetails);
assetRouter.put("/edit-assetdetails/:id",editAssetDetails); 
assetRouter.post("/delete-assetDelete/:id",assetDelete); 

export default assetRouter;