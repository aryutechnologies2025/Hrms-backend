import Asset from "../models/assetModel.js";
const createAsset = async (req, res) => {


  try {
   
    // const {
    //   invoiceNumber,
    //   purchasedDate,
    //   ledger,   
    //   assetCategory,
    //   assetSubCategory,
    //   depreciationPercentage,
    //   quantity,
    //   eachCost,
    //   totalCost,
    //   gstRate,
    //   taxable,
    //   cgst,
    //   sgst,
    //   igst,
    //   invoiceValue,
    //   warrantyYear,
    //   disposedDate,
    //   fileUpload,
    // } = req.body;

    let fileName = null;

if (req.file) {
  fileName = req.file.filename;          // single upload
} else if (req.files && req.files.fileUpload) {
  fileName = req.files.fileUpload[0].filename;   // multiple files
}

const data = req.body;

// Convert numeric values
    const quantity = Number(data.quantity);
    const rate = Number(data.rate);
    const gstRate = Number(data.gstRate || 18);

    // ---- Financial Calculations ---
    const taxable = quantity * rate;
    const gstHalf = (taxable * gstRate) / 200;

    const cgst = gstHalf;
    const sgst = gstHalf;
    const invoiceValue = taxable + cgst + sgst;


    const newAsset = await Asset.create({
      invoiceNumber:data.invoiceNumber,
      purchasedDate:data.purchasedDate,
      ledger:data.ledger,   
      assetCategory:data.assetCategory,
      assetSubCategory:data.assetSubCategory,
      title:data.title,
      depreciationPercentage:data.depreciationPercentage,
      quantity,
      rate,
      gstRate,
      taxable,
      cgst,
      sgst,
      igst:data.igst || 0,
      invoiceValue,
      warrantyYear:data.warrantyYear,
      disposedDate:data.disposedDate,
      fileUpload : fileName
    });

      
  
 // ---- Format dates for response ----
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

//get all assets
const getAssetDetails = async (req, res) => {
    try{
        const assetDetails = await Asset.find()
        .populate("assetCategory")    // populate the assetCategory field
        .populate("assetSubCategory");  // populate the assetSubCategory field
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

    const data = req.body;

    // Recalculate financials if quantity or rate changes
    if (data.quantity || data.rate) {
      const quantity = Number(data.quantity);
      const rate = Number(data.rate);
      const gstRate = Number(data.gstRate || 18);

      const taxable = quantity * rate;
      const gstHalf = (taxable * gstRate) / 200;

      data.taxable = taxable;
      data.cgst = gstHalf;
      data.sgst = gstHalf;
      data.invoiceValue = taxable + gstHalf * 2;
    }


    const updated = await Asset.findByIdAndUpdate(id, data, {
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

