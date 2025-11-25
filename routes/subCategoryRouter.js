import express from "express";


import { createSubCategory,
     editSubCategoryDetails, 
     getSubCategoryDetails, 
     getSubCategoryDetailsById, 
     subCategoryDelete 
    } from "../controllers/subCategoryContoller.js";


const subCategoryRouter = express.Router();

subCategoryRouter.post("/create-subCategory",createSubCategory);
subCategoryRouter.get("/subCategory",getSubCategoryDetails);
// subCategoryRouter.get("/subCatagory/:id",getSubCategoryDetailsById);
subCategoryRouter.put("/edit-subCategory/:id",editSubCategoryDetails); 
subCategoryRouter.delete("/delete-subCategory/:id",subCategoryDelete); 


 

export default subCategoryRouter;