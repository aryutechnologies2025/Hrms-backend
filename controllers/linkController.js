import CategoryDetails from "../models/categoryModel.js";
import LinkDetails from "../models/linkModel.js";
const createLinks = async (req, res) => {
  try {
    const { title, url, category } = req.body;

    const newLink = new LinkDetails({
      title,
      url,
      category,
    });

    const savedLink = await newLink.save();

    res.status(201).json({
      success: true,
      message: "Link created successfully",
      data: savedLink,
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

const getLinkDetails = async (req, res) => {
 try{
        const LinkDetail = await LinkDetails.find();
        res.status(200).json({ success: true, data: LinkDetail });
        }catch(error){
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
};

const linkDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const linkDetails = await LinkDetails.findByIdAndDelete(id);
    if (!linkDetails) {
      return res.status(404).json({ success: false, message: "linkDetails not found" });
    }
    res.status(200).json({ success: true, message: "linkDetails deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const linkStatusUpdate = async (req, res) => {
    const { id } = req.params;
    try {
        const updateStatus = await LinkDetails.findByIdAndUpdate(id, {status:true}, { new: true });
        if (!updateStatus) {
            return res.status(404).json({ success: false, message: "Link not found" });
        }
        res.status(200).json({ success: true, message: "Link status updated successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const editLinkDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await LinkDetails.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Link not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "uploaded successfully Link details" });
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

const getTitleFromCategory = async (req, res) => {
    const getTitle = await CategoryDetails.find({status: '1'}).select('title');
    if (!getTitle || getTitle.length === 0) {
        return res.status(404).json({ success: false, message: "No titles found" });
    }
    res.status(200).json({ success: true, data: getTitle });
}

const getLinkByCategory = async (req, res) => {
  try {
    const data = await LinkDetails.aggregate([
      // Join category details
      {
        $lookup: {
          from: "categorydetails", // collection name (IMPORTANT)
          localField: "category",
          foreignField: "title",
          as: "categoryInfo"
        }
      },

      { $unwind: "$categoryInfo" },

      // Sort by category order + link order (if exists)
      {
        $sort: {
          "categoryInfo.orders": 1,
          orders: 1
        }
      },

      // Group by category
      {
        $group: {
          _id: "$category",
          categoryOrder: { $first: "$categoryInfo.orders" },
          links: {
            $push: {
              _id: "$_id",
              title: "$title",
              url: "$url"
            }
          }
        }
      },

      // Final projection
      {
        $project: {
          _id: 0,
          category: "$_id",
          orders: "$categoryOrder",
          links: 1
        }
      },

      // Final sort by category order
      {
        $sort: { orders: 1 }
      }
    ]);

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "No link details found"
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};






export {
    createLinks,
    getLinkDetails,
    linkDelete,
    editLinkDetails,
    getTitleFromCategory,
    linkStatusUpdate,
    getLinkByCategory
}