import AssetCategory from "../models/assetCategoryModel.js";

const createAssetCategory = async (req, res) => {
  try {
   
    const {
      title,
      status
    } = req.body;

    const newAssetCategory = new AssetCategory({
      title,
      status
    });

    const savedAsset = await newAssetCategory.save();

    res.status(201).json({
      success: true,
      message: "Asset Category created successfully",
      data: savedAsset,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAssetCategoryDetails = async (req, res) => {
    try{
        const assetCategoryDetails = await AssetCategory.find();
        res.status(200).json({ success: true, data: assetCategoryDetails });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    
};

const assetCategoryDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const assetCategoryDetails = await AssetCategory.findByIdAndDelete(id);
    if (!assetCategoryDetails) {
      return res.status(404).json({ success: false, message: "Asset CategoryDetails not found" });
    }
    res.status(200).json({ success: true, message: "Asset CategoryDetails deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


const editAssetCategoryDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await AssetCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "AssetCategory Details not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "uploaded successfully AssetCategory Details" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



export{
    createAssetCategory,
    getAssetCategoryDetails,
    assetCategoryDelete,
    editAssetCategoryDetails,
    
}

