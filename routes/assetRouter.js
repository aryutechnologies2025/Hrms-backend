import express from "express";
import { assetDelete,
     createAsset, 
     editAssetDetails,
      getAssetDetails,
      getAssetDetailsById 
    } from "../controllers/assetController.js";
import upload from "../middlewares/upload.js";

const assetRouter = express.Router();

// assetRouter.post("/create-asset",upload.single("fileUpload"),createAsset);
// assetRouter.post("/create-asset",
//      (req, res, next) => {
//         upload.any()(req, res, function (error) {
//           if (error) {
//             if (error.code === "LIMIT_FILE_SIZE") {
//               return res.status(400).json({
//                 success: false,
//                 errors: { error: "File too large. Max 3MB allowed." },
//               });
//             }
//             return res.status(500).json({
//               success: false,
//               errors: { error: "File upload failed", detail: error.message },
//             });
//           }
//           next();
//         });
//       },
//       createAsset
// );
assetRouter.post(
  "/create-asset",
  upload.fields([
    { name: "fileUpload", maxCount: 1 },
    { name: "documents", maxCount: 10 }
]),
  
  createAsset
);


assetRouter.get("/view-asset",getAssetDetails);
// assetRouter.get("/view-asset/:id",getAssetDetailsById);
// assetRouter.put("/edit-assetdetails/:id",editAssetDetails); 
assetRouter.put("/edit-assetdetails/:id",
     (req, res, next) => {
        upload.any()(req, res, function (error) {
          if (error) {
            if (error.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                success: false,
                errors: { error: "File too large. Max 3MB allowed." },
              });
            }
            return res.status(500).json({
              success: false,
              errors: { error: "File upload failed", detail: error.message },
            });
          }
          next();
        });
      },editAssetDetails); 
assetRouter.delete("/delete-asset/:id",assetDelete); 

export default assetRouter;