import DeclarationModel from "../models/declarationModel.js";
const createDeclaration = async (req, res) => {
  try {
    const {
      employeeName,
      designation,
      empId,
      employeeId,
      certificateName,
      certificateNo,
    } = req.body;
    console.log("Files received:", req.body);
    const documentArray = [];
    const originalDocumentsArray = [];
    // if (Array.isArray(req.files)) {
    //   req.files.forEach((file) => {
    //     if (file.fieldname === "document[]") {
    //       documentArray.push({
    //         filepath: file.filename,
    //         originalName: file.originalname,
    //       });
    //     }
    //   });
    // }
     if (Array.isArray(req.files)) {
      req.files.forEach((file) => {
        if (file.fieldname === "document") {
          documentsArray.push({
            filepath: file.filename,
            originalName: file.originalname,
          });
        } else if (file.fieldname === "originalDocument") {
          originalDocumentsArray.push({
            filepath: file.filename,
            originalName: file.originalname,
          });
        }
      });
    }
    const newDeclaration = new DeclarationModel({
      employeeName,
      designation,
      employeeId,
      empId,
      certificateName,
      certificateNo,
      documents: documentArray,
      originalDocuments: originalDocumentsArray,
    });

    const savedDeclaration = await newDeclaration.save();
    res.status(201).json(savedDeclaration);
  } catch (error) {
    console.error("Error creating declaration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDeclaration = async (req, res) => {
  try {
    const declarationDetails = await DeclarationModel.find().sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: declarationDetails });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const editDeclaration = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing declaration
    const existingDeclaration = await DeclarationModel.findById(id);
    if (!existingDeclaration) {
      return res.status(404).json({
        success: false,
        message: "Declaration not found",
      });
    }

    // Handle uploaded new documents
    const newDocuments = [];
    const newOriginalDocuments = [];
    // if (req.files && req.files.length > 0) {
    //   req.files.forEach((file) => {
    //     if (file.fieldname === "document[]") {
    //       newDocuments.push({
    //         filepath: file.filename,
    //         originalName: file.originalname,
    //       });
    //     }
    //   });
    // }
      if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.fieldname === "document[]") {
          newDocuments.push({
            filepath: file.filename,
            originalName: file.originalname,
          });
        } else if (file.fieldname === "originalDocument") {
          newOriginalDocuments.push({
            filepath: file.filename,
            originalName: file.originalname,
          });
        }
      });
    }

    // Spread other fields
    const updatedData = { ...req.body };

    // If new documents uploaded
    if (newDocuments.length > 0) {
      if (req.body.appendDocuments === "true") {
        // Append new docs to old docs
        updatedData.documents = [
          ...(existingDeclaration.documents || []),
          ...newDocuments
        ];
      } else {
        // Replace all old docs
        updatedData.documents = newDocuments;
      }
    }

    if (newOriginalDocuments.length > 0) {
      if (req.body.appendOriginalDocuments === "true") {
        updatedData.originalDocuments = [
          ...(existingDeclaration.originalDocuments || []),
          ...newOriginalDocuments
        ];
      } else {
        updatedData.originalDocuments = newOriginalDocuments;
      }
    }

    // Update declaration
    const updated = await DeclarationModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    console.log("Updated Declaration:", updated);

    res.status(200).json({
      success: true,
      message: "Declaration updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("Error updating declaration:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteDeclaration = async (req, res) => {
  const { id } = req.params;
  try {
    const joiningDetails = await DeclarationModel.findByIdAndDelete(id);
    if (!joiningDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Declaration not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Declaration deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  createDeclaration,
  getDeclaration,
  editDeclaration,
  deleteDeclaration,
};
