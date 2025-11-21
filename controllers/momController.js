import ClientSubUser from "../models/clientSubUserModel.js";
import MomModel from "../models/momModel.js"; 
import MomDocument from "../models/momDocumentModel.js";
import User from "../models/userModel.js";
import ClientDetails from "../models/clientModals.js";
import Employee from "../models/employeeModel.js";
const createMom = async (req, res) => {
  const { date, clientName, projectName, attendees, description, employee } =
    req.body;

  const documentArray = [];

  if (Array.isArray(req.files)) {
    req.files.forEach((file) => {
      if (file.fieldname === "document[]") {
        documentArray.push({
          filepath: file.filename,
          originalName: file.originalname,
        });
      }
    });
  }

  try {
    const newMom = new MomModel({
      date,
      clientName,
      projectName,
      attendees,
      description,
      employee,
      documents: documentArray,
    });

    const savedMom = await newMom.save();

    return res.status(201).json({
      success: true,
      message: "MOM created successfully",
      mom: savedMom,
    });
  } catch (error) {
    console.error("Error creating MOM:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getMom = async (req, res) => {
  try {
   
    const { clientId, subUserId } = req.query;
    console.log("Client ID:", clientId);
    console.log("Sub-User ID:", subUserId);
    let baseFilter = {};

    // If subuser → Filter by project IDs
    if (subUserId) {
      const subUser = await ClientSubUser.findById(subUserId);

      if (!subUser) {
        return res.status(404).json({
          success: false,
          message: "Sub-user not found",
        });
      }

      const projectIds = Array.isArray(subUser.projectId)
        ? subUser.projectId
        : [];

      baseFilter.projectName = { $in: projectIds };
    }

    // If client → Filter by clientId
    else if (clientId) {
      baseFilter.clientName = clientId;
    }

    // Fetch MOMs
    const moms = await MomModel.find(baseFilter)
      .populate([
        { path: "clientName", select: "client_name" },
        { path: "attendees", select: "employeeName" },
        { path: "employee", select: "employeeName" },
        { path: "projectName", select: "name" },
      ])
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "MOMs fetched successfully",
      data: moms,
    });

  } catch (error) {
    console.error("Error fetching MOMs:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getMomById = async (req, res) => {
  const { id } = req.params;
  try {
    const moms = await MomModel.find({ employee: id })
      .populate([
        { path: "clientName", select: "client_name" },
        { path: "attendees", select: "employeeName" },
        { path: "employee", select: "employeeName" },
        { path: "projectName", select: "name" },
      ])
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "MOMs fetched successfully",
      data: moms,
    });
  } catch (error) {
    console.error("Error fetching MOMs:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const editMom = async (req, res) => {
  const { id } = req.params;

  try {
    const existingMom = await MomModel.findById(id);
    if (!existingMom) {
      return res.status(404).json({
        success: false,
        message: "MOM not found",
      });
    }

    const newDocuments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.fieldname === "document[]") {
          newDocuments.push({
            filepath: file.filename,
            originalName: file.originalname,
          });
        }
      });
    }

    const updatedData = { ...req.body };

    // If files uploaded
    if (newDocuments.length > 0) {
      if (req.body.appendDocuments === "true") {
        // Append to existing
        updatedData.documents = [
          ...(existingMom.documents || []),
          ...newDocuments,
        ];
      } else {
        // Replace existing
        updatedData.documents = newDocuments;
      }
    }

    const updatedMom = await MomModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "MOM updated successfully",
      data: updatedMom,
    });
  } catch (error) {
    console.error("Error updating MOM:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const momDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const linkDetails = await MomModel.findByIdAndDelete(id);
    if (!linkDetails) {
      return res.status(404).json({ success: false, message: "Mom not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Mom deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createMomDocument = async (req, res) => {
  const {project,title,description,createdBy,status} = req.body;
  const documentArray = [];

  if (Array.isArray(req.files)) {
    req.files.forEach((file) => {
      if (file.fieldname === "document[]") {
        documentArray.push({
          filepath: file.filename,
          originalName: file.originalname,
        });
      }
    });
  }
  try {
    const newMomDocument = new MomDocument({
      project,
      title,
      description,
      documents: documentArray,
      createdBy,
      status
      
    });

    const savedMomDocument = await newMomDocument.save();
return res.status(201).json({
      success: true,
      message: "MOM created successfully",
      mom: savedMomDocument,
    });
  } catch (error) {
    console.error("Error creating MOM:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getCreatorDetails = async (creatorId) => {
  console.log("🔍 Checking ID:", creatorId);

  const emp = await Employee.findById(creatorId).catch(err => {
    console.log("Employee lookup error:", err.message);
    return null;
  });

  console.log("Employee found:", emp);

  if (emp) return { id: creatorId, name: emp.employeeName, type: "Employee" };

  const user = await User.findById(creatorId);
  console.log("User found:", user);

  const client = await ClientDetails.findById(creatorId);
  console.log("Client found:", client);

  return { id: creatorId, name: "Unknown", type: null };
};







const getMomDocument = async (req, res) => {
  try {
    const momDocuments = await MomDocument.find().sort({ createdAt: -1 });

    const populatedMom = await Promise.all(
      momDocuments.map(async (mom) => {
        const creatorDetails = await getCreatorDetails(mom.createdBy);

        return {
          ...mom.toObject(),
          createdBy: creatorDetails,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "MOMs fetched successfully",
      data: populatedMom,
    });

  } catch (error) {
    console.error("FINAL ERROR:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const getMomDocumentById = async (req, res) => {
  const { id } = req.params;
  try {
    const momDocument = await MomDocument.find({createdBy:id}).sort({ createdAt: -1 });
    const populatedMom = await Promise.all(
      momDocument.map(async (mom) => {
        const creatorDetails = await getCreatorDetails(mom.createdBy);

        return {
          ...mom.toObject(),
          createdBy: creatorDetails,
        };
      })
    );
    return res.status(200).json({
      success: true,
      message: "MOM fetched successfully",
      data: populatedMom,
    });
  } catch (error) {
    console.error("Error fetching MOM:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

const editDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const existingMom = await MomDocument.findById(id);
    if (!existingMom) {
      return res.status(404).json({
        success: false,
        message: "MOM not found",
      });
    }

    const newDocuments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.fieldname === "document[]") {
          newDocuments.push({
            filepath: file.filename,
            originalName: file.originalname,
          });
        }
      });
    }

    const updatedData = { ...req.body };

    // If files uploaded
    if (newDocuments.length > 0) {
      if (req.body.appendDocuments === "true") {
        // Append to existing
        updatedData.documents = [
          ...(existingMom.documents || []),
          ...newDocuments,
        ];
      } else {
        // Replace existing
        updatedData.documents = newDocuments;
      }
    }

    const updatedMom = await MomDocument.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "MOM updated successfully",
      data: updatedMom,
    });
  } catch (error) {
    console.error("Error updating MOM:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};






export { createMom, getMom, editMom, momDelete, getMomById,createMomDocument,getMomDocument,getMomDocumentById,editDocument };
