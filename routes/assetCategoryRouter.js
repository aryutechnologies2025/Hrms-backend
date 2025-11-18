import express from "express";

import { assetCategoryDelete, createAssetCategory, editAssetCategoryDetails, getAssetCategoryDetails } from "../controllers/assetCategoryController.js";


const assetCategoryRouter = express.Router();

assetCategoryRouter.post("/create-assetCategory",createAssetCategory);
assetCategoryRouter.get("/assetCatagory",getAssetCategoryDetails);
// assetCategoryRouter.get("/assetCatagory/:id",getAssetCategoryDetails);
assetCategoryRouter.put("/edit-assetCategorydetails/:id",editAssetCategoryDetails); 
assetCategoryRouter.delete("/delete-assetCategoryDelete/:id",assetCategoryDelete); 


 

export default assetCategoryRouter;