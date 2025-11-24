import Asset from "../models/assetModel.js";
const createAsset = async (req, res) => {


  try {
   
    const {
      assetCategory,
      assetName,
      serialNumber,
      count,
      purchasedDate,    
      eachCost,
      totalCost,
      warrantyYear,
      disposedDate,
      fileUpload
    } = req.body;

    const newAsset = new Asset({
      assetCategory,
      assetName,
      serialNumber,
      count,
      purchasedDate,    
      eachCost,
      totalCost,
      warrantyYear,
      disposedDate,
      fileUpload
    });

    const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

    const savedAsset = await newAsset.save();
    const obj = savedAsset.toObject();

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: {  ...obj,
    purchasedDate: formatDate(obj.purchasedDate),
    disposedDate: formatDate(obj.disposedDate)}
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      // message: "Internal server error",
      message: error.message,
      errors: error.errors,
      // error: error.message,
    });
  }
};

const getAssetDetails = async (req, res) => {
    try{
        const assetDetails = await Asset.find().populate("assetCategory");
         const formatted = assetDetails.map(asset => {
      const obj = asset.toObject();
      return {
        ...obj,
        purchasedDate: obj.purchasedDate.toISOString().split("T")[0],
        disposedDate: obj.disposedDate.toISOString().split("T")[0],
      };
    });
        res.status(200).json({ success: true, data: formatted });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    
};


const getAssetDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const assetDetails = await Asset.findById(id);

    if (!assetDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Asset not found" });
    }

    const obj = assetDetails.toObject();

    const formatDate = (date) => {
      return new Date(date).toISOString().split("T")[0];
    };

    const formatted = {
      ...obj,
      purchasedDate: formatDate(obj.purchasedDate),
      disposedDate: formatDate(obj.disposedDate),
    };

    res.status(200).json({ success: true, data: formatted });

  } catch (error) {
    console.error(error);
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
        .json({ success: false, message: "Asset not found" });
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
    getAssetDetailsById,
    assetDelete,
    editAssetDetails,
    
}

