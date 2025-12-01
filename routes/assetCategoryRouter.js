import express from "express";

import { assetCategoryDelete, createAssetCategory, editAssetCategoryDetails, getAssetCategoryDetails, getAssetCategoryDetailsById } from "../controllers/assetCategoryController.js";


const assetCategoryRouter = express.Router();

assetCategoryRouter.post("/create-assetCategory",createAssetCategory);
assetCategoryRouter.get("/assetCategory",getAssetCategoryDetails);
// assetCategoryRouter.get("/assetCatagory/:id",getAssetCategoryDetailsById);
assetCategoryRouter.put("/edit-assetCategorydetails/:id",editAssetCategoryDetails); 
assetCategoryRouter.delete("/delete-assetCategoryDelete/:id",assetCategoryDelete); 


 

export default assetCategoryRouter;