import mongoose, { model } from "mongoose";
import ClientDetails from "../models/clientModals.js";
import ClientSubUser from "../models/clientSubUserModel.js";
import User from "../models/userModel.js";

//  Create new sub-user
const createClientSubUser = async (req, res) => {
  console.log(req.body);
  try {
    const {
      name,
      email,
      password,
      projectId,
      status,
      clientId,
      type,
      // subType,
    } = req.body;

    const user = new ClientSubUser({
      name,
      email,
      password,
      projectId,
      status,
      clientId,
      type,
      // subType,
    });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errors: { email: "Email already exists in users" },
      });
    }

    const existingSubUser = await ClientSubUser.findOne({ email });
    if (existingSubUser) {
      return res.status(400).json({
        success: false,
        errors: { email: "Email already exists in sub-users" },
      });
    }
    //  Check if email exists in ClientDetails
    const existingClient = await ClientDetails.findOne({ email });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        errors: { email: "Email already exists in uclients" },
      });
    }

    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get all sub-users
// const getAllClientSubUsers = async (req, res) => {
//   try{
//     const {
//       page = 1,
//       limit = 10,
//       search,
//       status,
//       clientId,
//       projectId,
//       type,
//       from,
//       to,
//     } = req.query;

//     const query = { is_deleted: false,clientId:req.params.clientId };

//     // Filter by search (name or email)
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Filter by status, clientId, projectId, type
//     if (status) query.status = status;
//     if (clientId) query.clientId = clientId;
//     if (projectId) query.projectId = projectId;
//     if (type) query.type = type;

//     // Filter by date range
//     if (from || to) {
//       query.createdAt = {};
//       if (from) query.createdAt.$gte = new Date(from);
//       if (to) query.createdAt.$lte = new Date(to);
//     }

//     // Pagination
//     const skip = (page - 1) * limit;

//     // Fetch data with populate
//     const users = await ClientSubUser.find(query)
//       .populate("projectId", "name _id")
//       .populate("clientId", "client_name _id company_name")
//       .skip(Number(skip))
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });

//     // Total count
//     const totalUers = await ClientSubUser.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: users,
//       pagination: {
//         totalUers,
//         totalPages: Math.ceil(totalUers / limit),
//         currentPage: Number(page),
//         limit: Number(limit),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


const getAllClientSubUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      clientId,
      projectId,
      type,
      from,
      to,
    } = req.query;

    // Convert params clientId to ObjectId safely
    const query = { is_deleted: false };

    if (req.params.clientId) {
      query.clientId = new mongoose.Types.ObjectId(req.params.clientId);
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Additional filters
    if (status) query.status = status;
    if (clientId) query.clientId = new mongoose.Types.ObjectId(clientId);
    if (projectId) query.projectId = new mongoose.Types.ObjectId(projectId);
    if (type) query.type = type;

    // Date range
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // Pagination
    const skip = (page - 1) * limit;

    const users = await ClientSubUser.find(query)
      .populate("projectId", "name _id")
      .populate("clientId", "client_name _id company_name")
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalUsers = await ClientSubUser.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.log("Error fetching sub-users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


//  Get single sub-user by ID
const getClientSubUserById = async (req, res) => {
  try {
    const user = await ClientSubUser.findOne({
      _id: req.params.id,
      is_deleted: false,
    })
      .populate("projectId", "name _id")
      .populate("clientId", "client_name _id company_name");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Update sub-user
// const updateClientSubUser = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       projectId,
//       status,
//       clientId,
//       is_deleted,
//       type,
//       subType
//     } = req.body;

//     const updatedFields = {
//       name,
//       email,
//       password,
//       projectId,
//       status,
//       clientId,
//       is_deleted,
//       type,
//       subType
//     };

//     Object.keys(updatedFields).forEach(
//       (key) => updatedFields[key] === undefined && delete updatedFields[key]
//     );

//     const user = await ClientSubUser.findOneAndUpdate(
//       { _id: req.params.id, is_deleted: false },
//       updatedFields,
//       { new: true, runValidators: true }
//     )
//       .populate("projectId", "name _id")
//       .populate("clientId", "client_name _id company_name");

//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });

//     res.status(200).json({ success: true, data: user });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email already exists" });
//     }
//     if (error.name === "ValidationError") {
//       const errors = {};
//       for (let field in error.errors) {
//         errors[field] = error.errors[field].message;
//       }
//       return res.status(400).json({ success: false, errors });
//     }
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const updateClientSubUser = async (req, res) => {
  try {
    const {
      name,
      email,
      projectId,
      status,
      type = "client",
      subType,
    } = req.body;

    console.log("Incoming update body:", req.body);

    const errors = {};

    // ========== VALIDATION ==========
    if (name !== undefined) {
      if (name.trim() === "" || name.length > 40) {
        errors.name = "Name is required and must not exceed 40 characters";
      }
    }

    if (email !== undefined) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        errors.email = "Please provide a valid email address";
      }
    }

    // projectId is an ARRAY now
    if (projectId !== undefined) {
      if (!Array.isArray(projectId)) {
        errors.projectId = "Project ID must be an array";
      } else {
        const invalidIds = projectId.filter(
          (id) => !id.match(/^[0-9a-fA-F]{24}$/)
        );
        if (invalidIds.length > 0) {
          errors.projectId = "One or more project IDs are invalid";
        }
      }
    }

    if (status !== undefined && status.trim() === "") {
      errors.status = "Please select a status";
    }

    // if (subType !== undefined && subType.trim() === "") {
    //   errors.subType = "SubType cannot be empty";
    // }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // ========== SANITIZING PROJECT IDS ==========
    const parsedProjectIds =
      typeof projectId === "string" ? JSON.parse(projectId) : projectId;

    // ========== PREPARE UPDATE FIELDS ==========
    const updatedFields = {
      name,
      email,
      projectId: parsedProjectIds,
      status,
      type,
      subType,
    };

    // Remove undefined / empty values
    Object.keys(updatedFields).forEach((key) => {
      if (
        updatedFields[key] === undefined ||
        updatedFields[key] === "" ||
        updatedFields[key] === null
      ) {
        delete updatedFields[key];
      }
    });

    // ========== EMAIL UNIQUENESS CHECK ==========
    if (email) {
      const emailChecks = [
        { model: User, label: "Employee" },
        { model: ClientDetails, label: "Client" },
        { model: ClientSubUser, label: "Sub-User" },
      ];

      for (const check of emailChecks) {
        const existing = await check.model.findOne({
          email,
          _id: { $ne: req.params.id },
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            errors: { email: `Email already exists as ${check.label}` },
          });
        }
      }
    }

    // ========== UPDATE USER ==========
    const user = await ClientSubUser.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      updatedFields,
      { new: true, runValidators: true }
    )
      .populate("projectId", "name _id")
      .populate("clientId", "client_name _id company_name");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log("Server Error:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }

    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};


//  Soft delete sub-user
const deleteClientSubUser = async (req, res) => {
  try {
    const user = await ClientSubUser.findByIdAndUpdate(
      req.params.id,
      { is_deleted: true },
      { new: true }
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getparticularClientSubUserDetrails = async (req, res) => {
  try {
    const user = await ClientSubUser.findOne({
      _id: req.params.id,
      is_deleted: false,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createClientSubUser,
  getAllClientSubUsers,
  getClientSubUserById,
  updateClientSubUser,
  deleteClientSubUser,
  getparticularClientSubUserDetrails,
};
