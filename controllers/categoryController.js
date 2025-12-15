import CategoryDetails from "../models/categoryModel.js";
const createCategory = async (req, res) => {
  try {
   
    const {
      title,
      status,
      orders
    } = req.body;

      // Check duplicate order
    const existingOrder = await CategoryDetails.findOne({ orders });
     if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: `Order number ${orders} already exists. Please choose another order.`
      });
    }

    const newCategory = new CategoryDetails({
      title,
      status,
      orders
    });

    const savedIncome = await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: savedIncome,
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

const getCategoryDetails = async (req, res) => {
    try{
      const {orders} = req.query;
      // const {minOrders,maxOrders} = req.query;
      let filter = {};
      if(orders){
        filter.orders = Number(orders);
      }

    //   if (minOrders || maxOrders) {
    //   filter.orders = {};
    //   if (minOrders) filter.orders.$gte = Number(minOrders);
    //   if (maxOrders) filter.orders.$lte = Number(maxOrders);
    // }
        const categoryDetails = await CategoryDetails.find(filter);
        // const categoryDetails = await CategoryDetails.find(filter).sort({ orders: 1 });
        res.status(200).json({ success: true, data: categoryDetails });
        }catch(error){
          console.log("Error",error)
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    
};

const categoryDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const categoryDetails = await CategoryDetails.findByIdAndDelete(id);
    if (!categoryDetails) {
      return res.status(404).json({ success: false, message: "CategoryDetails not found" });
    }
    res.status(200).json({ success: true, message: "CategoryDetails deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// const editCategoryDetails = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updated = await CategoryDetails.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!updated) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Client not found" });
//     }
//     res
//       .status(200)
//       .json({ success: true, message: "uploaded successfully client details" });
//   } catch (error) {
//     if (error.name === "ValidationError") {
//       const errors = {};
//       for (let field in error.errors) {
//         errors[field] = error.errors[field].message;
//       }
//       return res.status(400).json({ success: false, errors });
//     }
//     console.error("Error:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };


const editCategoryDetails = async (req, res) => {
  const { id } = req.params;
  const { title, status, orders } = req.body;

  try {
    // 🔹 1. Check duplicate order EXCEPT current category
    const existingOrder = await CategoryDetails.findOne({
      orders,
      _id: { $ne: id }
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: `Order number ${orders} already exists. Please choose another order.`
      });
    }

    // 🔹 2. Update category
    const updated = await CategoryDetails.findByIdAndUpdate(
      id,
      { title, status, orders },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updated
    });

  } catch (error) {
    // 🔹 Validation error
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }

    console.error("Update category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

const categoryStatusUpdate = async (req, res) => {
    const { id } = req.params;
    try {
        const updateStatus = await CategoryDetails.findByIdAndUpdate(id, {status:true}, { new: true });
        if (!updateStatus) {
            return res.status(404).json({ success: false, message: "Link not found" });
        }
        res.status(200).json({ success: true, message: "Link status updated successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export{
    createCategory,
    getCategoryDetails,
    categoryDelete,
    editCategoryDetails,
    categoryStatusUpdate
}

