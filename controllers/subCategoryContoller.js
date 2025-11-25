
import SubCategory from "../models/subCategoryModel.js";

const createSubCategory = async (req, res) => {
  try {
   
    const {
      name,
      status
    } = req.body;

    const newSubCategory = new SubCategory({
      name,
      status
    });

    const savedSubCategory = await newSubCategory.save();

    res.status(201).json({
      success: true,
      message: "Sub Category created successfully",
      data: savedSubCategory,
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

const getSubCategoryDetails = async (req, res) => {
    try{
        const subCategoryDetails = await SubCategory.find();
        res.status(200).json({ success: true, data: subCategoryDetails });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    
};


const getSubCategoryDetailsById = async (req, res) => {
  const { id } = req.params;
    try{
        const subCategoryDetails = await SubCategory.findById(id);
        res.status(200).json({ success: true, data: subCategoryDetails });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    
};
const subCategoryDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const subCategoryDetails = await SubCategory.findByIdAndDelete(id);
    if (!subCategoryDetails) {
      return res.status(404).json({ success: false, message: "SubCategory Details not found" });
    }
    res.status(200).json({ success: true, message: "SubCategory Details deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


const editSubCategoryDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await SubCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory Details not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "uploaded successfully SubCategory Details" });
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
    createSubCategory,
    getSubCategoryDetails,
    getSubCategoryDetailsById,
    subCategoryDelete,
    editSubCategoryDetails,
    
}

