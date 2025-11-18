import Asset from "../models/assetModel.js";
const createAsset = async (req, res) => {
  try {
   
    const {
      assetName,
      serialNumber,
      count,
      purchasedDate,    
      eachCost,
      totalCost,
      warrantyYear,
      disposedDate,
    } = req.body;

    const newAsset = new Asset({
      assetName,
      serialNumber,
      count,
      purchasedDate,    
      eachCost,
      totalCost,
      warrantyYear,
      disposedDate,
    });

    const savedAsset = await newAsset.save();

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
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

const getAssetDetails = async (req, res) => {
    try{
        const assetDetails = await Asset.find();
        res.status(200).json({ success: true, data: assetDetails });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    
};

const assetDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const assetDetails = await Asset.findByIdAndDelete(id);
    if (!assetDetails) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }
    res.status(200).json({ success: true, message: "Asset deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


const editAssetDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Asset.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "AssetName not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "uploaded successfully Asset details" });
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
    createAsset,
    getAssetDetails,
    assetDelete,
    editAssetDetails,
    
}

