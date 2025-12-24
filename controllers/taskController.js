import mongoose from "mongoose";
import Counter from "../models/counterModel.js";
import Employee from "../models/employeeModel.js";
import NotificationSchema from "../models/notificationModel.js";
import ProjectModel from "../models/projectModel.js";
import TaskComments from "../models/taskComment.js";
import TaskLogsModel from "../models/taskLogsModel.js";
import Task from "../models/taskModal.js";
import userModel from "../models/userModel.js";
import User from "../models/userModel.js";
import SubTask from "../models/subTaskModel.js";
import UpcomingHoliday from "../models/upcomingHolidayModal.js";
import Attendance from "../models/attendanceModal.js";
import Leave from "../models/leaveModel.js";
import ClientDetails from "../models/clientModals.js";
import ClientSubUser from "../models/clientSubUserModel.js";
import { create } from "domain";
import TaskDocument from "../models/taskDocument.js";

import fs from "fs";
import path from "path";

const generateTaskId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { id: "taskId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = counter.seq.toString().padStart(3, "0"); // AY001, AY002
  return `AY${paddedSeq}`;
};

// const createTask = async (req, res) => {
//   try {
//     // console.log("Incoming body:", req.body);
//     const {
//       projectName,
//       title,
//       description,
//       assignedTo,
//       priority,
//       status,
//       startDate,
//       dueDate,
//       projectId,
//       projectManagerId,

//       createdById,
//     } = req.body;

//     // Optional: Enable this block for validation

//     const errors = {};

//     if (!projectName) errors.projectName = "Project name is required.";
//     if (!title) errors.title = "Title is required.";
//     if (!description) errors.description = "Description is required.";
//     // if (!assignedTo) errors.assignedTo = "Assigned user is required.";
//     if (!priority) errors.priority = "Priority is required.";
//     if (!status) errors.status = "Status is required.";
//     // if (!dueDate) errors.dueDate = "Due date is required.";
//     if (!projectId) errors.projectId = "Project ID is required.";
//     if (!createdById) errors.createdById = "CreatedBy ID is required.";
//     if (!projectManagerId)
//       errors.projectManagerId = "Project Manager ID is required.";
//     if (!startDate) errors.startDate = "Start date is required.";

//     if (Object.keys(errors).length > 0) {
//       return res.status(404).json({
//         success: false,
//         errors: errors,
//       });
//     }

//     // Handle uploaded documents
//     const documentArray = [];
//     if (Array.isArray(req.files)) {
//       req.files.forEach((file) => {
//         if (file.fieldname === "document[]") {
//           documentArray.push({
//             filepath: file.filename,
//             originalName: file.originalname,
//           });
//         }
//       });
//     }
//     // const getEmployee = await Employee.findOne({
//     //   _id: assignedTo,
//     // });
//     const reporter = await Employee.findOne({
//       _id: projectManagerId,
//     });
//     //match the email get the employeeName
//     // console.log(getEmployee, reporter);
//     // const getEmployeeName = getEmployee?.employeeName;
//     // const getEmployeeId = getEmployee?._id;
//     // console.log("reporter", reporter);
//     // const getReporterName = reporter?.employeeName;
//     // const getReporterId = reporter?._id;

//     const taskId = await generateTaskId();

//     const newTask = new Task({
//       taskId,
//       projectName,
//       title,
//       description,
//       assignedTo: assignedTo || null,
//       // employeeName: getEmployeeName,
//       // employeeId: getEmployeeId,
//       priority,
//       status,
//       startDate,
//       dueDate,
//       projectId,
//       document: documentArray,
//       // createdBy,
//       // projectManager,
//       // projectmanagerName: getReporterName,
//       projectManagerId,
//       // createdByName,
//       createdById,
//     });

//     const savedTask = await newTask.save();

//     //  Define taskLog outside the if block
//     const taskLog = {
//       taskId: savedTask.taskId,
//       startTime: new Date(),
//       status: "todo",
//       updatedBy: createdById,
//     };
//     const projectNameemail = await ProjectModel.findById(projectId);
//     console.log("projectNameemail", projectNameemail.name);
//     // Save task log
//     const taskLogEntry = new TaskLogsModel(taskLog);
//     await taskLogEntry.save();

//     // const notification = new NotificationSchema({
//     //   to: getEmployee.email,
//     //   subject: "New Task Created",
//     //   message: `Task "${projectNameemail.name}" assigned to ${getEmployeeName}`,
//     //   name: getEmployeeName,
//     //   template: "taskCreated",
//     // });
//     // console.log("notification", notification);
//     // await notification.save();

//     res.status(201).json({
//       success: true,
//       message: "Task created successfully",
//       task: savedTask,
//     });
//   } catch (error) {
//     console.error("Error creating task:", error);

//     if (error.name === "ValidationError") {
//       const errors = {};
//       for (let field in error.errors) {
//         errors[field] = error.errors[field].message;
//       }
//       return res.status(400).json({ success: false, errors });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// export default createTask;

const createTask = async (req, res) => {
  try {
    const {
      projectName,
      title,
      description,
      assignedTo,
      priority,
      status,
      startDate,
      dueDate,
      projectId,
      projectManagerId,
      createdById,
      taskType,
    } = req.body;
    //  console.log()
    // Validation
    const errors = {};
    if (!projectName) errors.projectName = "Project name is required.";
    if (!title) errors.title = "Title is required.";
    if (!description) errors.description = "Description is required.";
    // assignedTo and dueDate are optional as per your original code comments
    if (!priority) errors.priority = "Priority is required.";
    if (!status) errors.status = "Status is required.";
    if (!projectId) errors.projectId = "Project ID is required.";
    if (!createdById) errors.createdById = "CreatedBy ID is required.";
    if (!projectManagerId)
      errors.projectManagerId = "Project Manager ID is required.";
    if (!startDate) errors.startDate = "Start date is required.";
    // if (!taskType) errors.taskType = "taskType date is required.";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // Handle uploaded documents
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

    // Fetch reporter (project manager)
    const reporter = await Employee.findById(projectManagerId);
    if (!reporter) {
      return res.status(404).json({
        success: false,
        message: "Project manager not found.",
      });
    }

    // Generate taskId
    const taskId = await generateTaskId();

    // Create new task object
    const newTask = new Task({
      taskId,
      projectName,
      title,
      description,
      assignedTo: assignedTo || null,
      priority,
      status,
      startDate,
      dueDate,
      projectId,
      // document: documentArray,
      projectManagerId,
      createdById,
      taskType,
    });

    const savedTask = await newTask.save();

    const taskDocumentSave = new TaskDocument({
      taskId: newTask.taskId,
      document: documentArray,
    });
    await taskDocumentSave.save();
    console.log("taskDocumentSave", taskDocumentSave);

    // Create and save task log
    const taskLog = {
      taskId: savedTask.taskId,
      startTime: new Date(),
      status: "todo",
      updatedBy: createdById,
    };
    const taskLogEntry = new TaskLogsModel(taskLog);
    await taskLogEntry.save();

    // Fetch project details including team members
    const projectDetails = await ProjectModel.findById(projectId);
    if (!projectDetails) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Prepare notification variables
    let getEmployeeName = null;
    let getEmployeeEmail = null;

    if (assignedTo) {
      // Fetch assigned employee details
      const assignedEmployee = await Employee.findById(assignedTo);
      if (assignedEmployee) {
        getEmployeeName = assignedEmployee.employeeName;
        getEmployeeEmail = assignedEmployee.email;
      }
    }

    // Function to send notification
    const sendNotification = async (toEmail, subject, message, name) => {
      if (!toEmail) return; // Skip if no email

      const notification = new NotificationSchema({
        to: toEmail,
        subject,
        message,
        name,
        template: "taskCreated",
      });
      await notification.save();
    };

    if (assignedTo && getEmployeeEmail) {
      // Notify assigned employee
      await sendNotification(
        getEmployeeEmail,
        "New Task Created",
        `Task "${projectDetails.name}" assigned to ${getEmployeeName}`,
        getEmployeeName
      );
    } else {
      // Notify all team members if no assigned employee
      const teamMemberIds = projectDetails.teamMembers || [];
      const teamMembers = await Employee.find({ _id: { $in: teamMemberIds } });

      for (const member of teamMembers) {
        await sendNotification(
          member.email,
          "New Task Created",
          `Task "${projectDetails.name}" has been created.`,
          member.employeeName
        );
      }
    }
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: savedTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// const allTaskList = async (req, res) => {
//   const type = req.query.type;
//   try {
//     let taskList;

//     if (type === "completed") {
//       taskList = await Task.find({ status: "completed" })
//         .populate([
//           { path: "projectId", select: "name" },
//           { path: "assignedTo", select: "employeeName" },
//         ])
//         .sort({
//           createdAt: -1,
//         });
//     } else {
//       taskList = await Task.find({ status: { $ne: "completed" } })
//         .populate([
//           { path: "projectId", select: "name" },
//           { path: "assignedTo", select: "employeeName" },
//         ])
//         .sort({
//           createdAt: -1,
//         });
//     }
//     if (!taskList || taskList.length === 0) {
//       return res
//         .status(200)
//         .json({ success: false, message: "No tasks found" });
//     }
//     // const addEmployeeDetails = await Promise.all(
//     //   taskList.map(async (taskDoc) => {
//     //     // Convert Mongoose document to plain JS object
//     //     const task = taskDoc.toObject();
//     //     const employeeDetails = await Employee.findOne({
//     //       email: task.assignedTo,
//     //     });
//     //     if (employeeDetails) {
//     //       task.name = employeeDetails.employeeName;
//     //       task.Email = employeeDetails.email;
//     //       task.Id = employeeDetails._id;
//     //       task.photo = employeeDetails.photo;
//     //     } else {
//     //       task.name = "Unknown";
//     //       task.Email = "";
//     //       task.Id = null;
//     //       task.photo = null;
//     //     }
//     //     return task;
//     //   })
//     // );
//     return res.status(200).json({
//       success: true,
//       message: "Task list retrieved",
//       data: taskList,
//     });
//   } catch (error) {
//     // console.error("Error in AllTaskList:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
// const allTaskList = async (req, res) => {
//   const type = req.query.type;
//   const page = parseInt(req.query.page) || 1; // default: page 1
//   const limit = parseInt(req.query.limit) || 10; // default: 10 tasks per page

//   try {
//     let filter = {};

//     // Apply filter based on type
//     if (type === "completed") {
//       filter.status = "completed";
//     } else {
//       filter.status = { $ne: "completed" };
//     }

//     // Count total documents
//     const totalTasks = await Task.countDocuments(filter);

//     // Fetch paginated tasks
//     const taskList = await Task.find(filter)
//       .populate([
//         { path: "projectId", select: "name" },
//         { path: "assignedTo", select: "employeeName" },
//       ])
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit) // skip previous pages
//       .limit(limit); // limit per page

//     if (!taskList || taskList.length === 0) {
//       return res
//         .status(200)
//         .json({ success: false, message: "No tasks found" });
//     }

//     //  Pagination metadata
//     const totalPages = Math.ceil(totalTasks / limit);

//     return res.status(200).json({
//       success: true,
//       message: "Task list retrieved",
//       data: taskList,
//       pagination: {
//         totalTasks,
//         totalPages,
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// const allTaskList = async (req, res) => {
//   try {
//     const {
//       employeeId,
//       projectId,
//       day,
//       toDate,
//       taskId,
//       searchTerm,
//       todayTaskDate,
//       status,
//       priority,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const matchStage = { $match: {} };

//     // 🎯 Basic filters
//     if (employeeId)
//       matchStage.$match.assignedTo = new mongoose.Types.ObjectId(employeeId);
//     if (projectId)
//       matchStage.$match.projectId = new mongoose.Types.ObjectId(projectId);

//     if (taskId) {
//       matchStage.$match.taskId = { $regex: taskId, $options: "i" };
//     }

//     if (status) matchStage.$match.status = status;
//     if (priority) matchStage.$match.priority = priority;

//     // 🗓 UTC-safe Date Filter
//     if (day || toDate) {
//       matchStage.$match.dueDate = {};

//       if (day) {
//         const [year, month, date] = day.split("-");
//         matchStage.$match.createdAt.$gte = new Date(
//           Date.UTC(year, month - 1, date, 0, 0, 0)
//         );
//       }

//       if (toDate) {
//         const [year, month, date] = toDate.split("-");
//         matchStage.$match.createdAt.$lte = new Date(
//           Date.UTC(year, month - 1, date, 23, 59, 59, 999)
//         );
//       }
//     }

//     // 📅 Today Task Filter (if no from/to date)
//     else if (todayTaskDate) {
//       const [year, month, date] = todayTaskDate.split("-");
//       const startOfDay = new Date(Date.UTC(year, month - 1, date, 0, 0, 0));
//       const endOfDay = new Date(Date.UTC(year, month - 1, date, 23, 59, 59, 999));
//       matchStage.$match.createdAt = { $gte: startOfDay, $lte: endOfDay };
//     }

//     // 🧩 Aggregation pipeline
//     const pipeline = [
//       matchStage,
//       // Populate assignedTo
//       {
//         $lookup: {
//           from: "employees",
//           localField: "assignedTo",
//           foreignField: "_id",
//           as: "assignedTo",
//         },
//       },
//       { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
//       // Populate projectId
//       {
//         $lookup: {
//           from: "projects",
//           localField: "projectId",
//           foreignField: "_id",
//           as: "projectId",
//         },
//       },
//       { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },
//     ];

//     // 🔍 Search after populate
//     if (searchTerm) {
//       pipeline.push({
//         $match: {
//           $or: [
//             { title: { $regex: searchTerm, $options: "i" } },
//             { description: { $regex: searchTerm, $options: "i" } },
//             { taskId: { $regex: searchTerm, $options: "i" } },
//             { "assignedTo.employeeName": { $regex: searchTerm, $options: "i" } },
//             { "projectId.name": { $regex: searchTerm, $options: "i" } },
//             { status: { $regex: searchTerm, $options: "i" } },
//             { priority: { $regex: searchTerm, $options: "i" } },
//           ],
//         },
//       });
//     }

//     // 📊 Count total docs
//     const countPipeline = [...pipeline, { $count: "total" }];
//     const countResult = await Task.aggregate(countPipeline);
//     const totalTasks = countResult[0] ? countResult[0].total : 0;
//     const totalPages = Math.ceil(totalTasks / limit);

//     // 📄 Pagination + Sort
//     pipeline.push({ $sort: { createdAt: -1 } });
//     pipeline.push({ $skip: (page - 1) * limit });
//     pipeline.push({ $limit: parseInt(limit) });

//     const taskList = await Task.aggregate(pipeline);

//     return res.status(200).json({
//       success: true,
//       message: "Task list retrieved successfully",
//       data: taskList,
//       pagination: {
//         totalTasks,
//         totalPages,
//         currentPage: parseInt(page),
//         limit: parseInt(limit),
//       },
//     });
//   } catch (error) {
//     console.error("❌ allTaskList Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// const allTaskList = async (req, res) => {
//   try {
//     const {
//       employeeId,
//       projectId,
//       day,
//       toDate,
//       taskId,
//       searchTerm,
//       todayTaskDate,
//       status,
//       priority,
//       page = 1,
//       limit = 10,
//     } = req.query;
//     console.log("test",req.query)

//     const matchStage = { $match: {} };

//     //  Basic filters
//     if (employeeId)
//       matchStage.$match.assignedTo = new mongoose.Types.ObjectId(employeeId);
//     if (projectId)
//       matchStage.$match.projectId = new mongoose.Types.ObjectId(projectId);

//     if (taskId) {
//       matchStage.$match.taskId = { $regex: taskId, $options: "i" };
//     }

//     if (status) matchStage.$match.status = status;
//     if (priority) matchStage.$match.priority = priority;

//     // 🗓 UTC-safe CreatedAt Filter
//     if (day || toDate) {
//       matchStage.$match.createdAt = {};

//       if (day) {
//         const [year, month, date] = day.split("-");
//         matchStage.$match.createdAt.$gte = new Date(
//           Date.UTC(year, month - 1, date, 0, 0, 0)
//         );
//       }

//       if (toDate) {
//         const [year, month, date] = toDate.split("-");
//         matchStage.$match.createdAt.$lte = new Date(
//           Date.UTC(year, month - 1, date, 23, 59, 59, 999)
//         );
//       }
//     }

//     //  Today Task Filter (if no from/to date)
//     else if (todayTaskDate) {
//       const [year, month, date] = todayTaskDate.split("-");
//       const startOfDay = new Date(Date.UTC(year, month - 1, date, 0, 0, 0));
//       const endOfDay = new Date(
//         Date.UTC(year, month - 1, date, 23, 59, 59, 999)
//       );
//       matchStage.$match.createdAt = { $gte: startOfDay, $lte: endOfDay };
//     }

//     //  Aggregation pipeline
//     const pipeline = [
//       matchStage,
//       // Populate assignedTo
//       {
//         $lookup: {
//           from: "employees",
//           localField: "assignedTo",
//           foreignField: "_id",
//           as: "assignedTo",
//         },
//       },
//       { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
//       // Populate projectId
//       {
//         $lookup: {
//           from: "projects",
//           localField: "projectId",
//           foreignField: "_id",
//           as: "projectId",
//         },
//       },
//       { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },
//     ];

//     //  Search after populate
//     if (searchTerm) {
//       pipeline.push({
//         $match: {
//           $or: [
//             { title: { $regex: searchTerm, $options: "i" } },
//             // { description: { $regex: searchTerm, $options: "i" } },
//             { taskId: { $regex: searchTerm, $options: "i" } },
//             {
//               "assignedTo.employeeName": { $regex: searchTerm, $options: "i" },
//             },
//             { "projectId.name": { $regex: searchTerm, $options: "i" } },
//             { status: { $regex: searchTerm, $options: "i" } },
//             { priority: { $regex: searchTerm, $options: "i" } },
//           ],
//         },
//       });
//     }

//     //  Count total docs
//     const countPipeline = [...pipeline, { $count: "total" }];
//     const countResult = await Task.aggregate(countPipeline);
//     const totalTasks = countResult[0] ? countResult[0].total : 0;
//     const totalPages = Math.ceil(totalTasks / limit);

//     //  Pagination + Sort
//     pipeline.push({ $sort: { createdAt: -1 } });
//     pipeline.push({ $skip: (page - 1) * limit });
//     pipeline.push({ $limit: parseInt(limit) });

//     const taskList = await Task.aggregate(pipeline);

//     return res.status(200).json({
//       success: true,
//       message: "Task list retrieved successfully",
//       data: taskList,
//       pagination: {
//         totalTasks,
//         totalPages,
//         currentPage: parseInt(page),
//         limit: parseInt(limit),
//       },
//     });
//   } catch (error) {
//     console.error(" allTaskList Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

const allTaskList = async (req, res) => {
  try {
    const {
      employeeId,
      projectId,
      day,
      toDate,
      taskId,
      searchTerm,
      todayTaskDate,
      status,
      priority,
      type, // "completed" filter
      page = 1,
      limit = 10,
    } = req.query;

    console.log("Query params:", req.query);

    const matchStage = { $match: {} };

    // ----- Basic filters -----
    if (employeeId)
      matchStage.$match.assignedTo = new mongoose.Types.ObjectId(employeeId);
    if (projectId)
      matchStage.$match.projectId = new mongoose.Types.ObjectId(projectId);
    if (taskId) matchStage.$match.taskId = { $regex: taskId, $options: "i" };
    if (priority) matchStage.$match.priority = priority;

    // ----- Status / Type filter -----
    if (type === "completed") {
      matchStage.$match.status = "completed";
    } else if (status) {
      matchStage.$match.status = status;
    }

    // ----- Date filters -----
    if (day || toDate) {
      matchStage.$match.createdAt = {};
      if (day) {
        const [year, month, date] = day.split("-");
        matchStage.$match.createdAt.$gte = new Date(
          Date.UTC(year, month - 1, date, 0, 0, 0)
        );
      }
      if (toDate) {
        const [year, month, date] = toDate.split("-");
        matchStage.$match.createdAt.$lte = new Date(
          Date.UTC(year, month - 1, date, 23, 59, 59, 999)
        );
      }
    } else if (todayTaskDate) {
      const [year, month, date] = todayTaskDate.split("-");
      const startOfDay = new Date(Date.UTC(year, month - 1, date, 0, 0, 0));
      const endOfDay = new Date(
        Date.UTC(year, month - 1, date, 23, 59, 59, 999)
      );
      matchStage.$match.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // ----- Aggregation pipeline -----
    const pipeline = [
      matchStage,
      // Lookup assignedTo
      {
        $lookup: {
          from: "employees",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedTo",
        },
      },
      { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
      // Lookup projectId
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "projectId",
        },
      },
      { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },
    ];

    // ----- Search filter -----
    if (searchTerm) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { taskId: { $regex: searchTerm, $options: "i" } },
            {
              "assignedTo.employeeName": { $regex: searchTerm, $options: "i" },
            },
            { "projectId.name": { $regex: searchTerm, $options: "i" } },
            { status: { $regex: searchTerm, $options: "i" } },
            { priority: { $regex: searchTerm, $options: "i" } },
          ],
        },
      });
    }

    // ----- Count total documents -----
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Task.aggregate(countPipeline);
    const totalTasks = countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalTasks / limit);

    // ----- Pagination + Sorting -----
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: (page - 1) * parseInt(limit) });
    pipeline.push({ $limit: parseInt(limit) });

    let taskList = await Task.aggregate(pipeline);

    const getUserName = async (userId) => {
      console.log("Fetching user name for ID:", userId);
      if (!userId) return null;

      const [employee, admin, client, clientUser] = await Promise.all([
        Employee.findById(userId).select("employeeName").lean(),
        User.findById(userId).select("name").lean(),
        ClientDetails.findById(userId).select("client_name").lean(),
        ClientSubUser.findById(userId).select("name").lean(),
      ]);

      if (employee?.employeeName) return employee.employeeName;

      if (admin?.name) return admin.name;

      if (client?.client_name) return `${client.client_name} (Client)`;

      if (clientUser?.name) return `${clientUser.name} (Client User)`;

      return null;
    };

  
    taskList = await Promise.all(
      taskList.map(async (task) => {
        const [docRecord, createdByName] = await Promise.all([
          TaskDocument.findOne({ taskId: task.taskId }).lean(),
          getUserName(task.createdById),
         
        ]);
        

        return {
          ...task,
          document: docRecord?.document || [],
          createdByName, // 👈 added
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Task list retrieved successfully",
      data: taskList,
      pagination: {
        totalTasks,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("allTaskList Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// const allTaskListById = async (req, res) => {
//   try {
//     const { type, clientId } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(clientId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid clientId format",
//       });
//     }
//     let projectDetails = await ProjectModel.find({
//       clientName: clientId,
//     }).select("_id name");

//     let projectIds = projectDetails.map((p) => p._id);
//     console.log("projectIds", projectIds);
//     // if (clientId) {
//     //   console.log("projectId", clientId);
//     //   const projectObjectId = new mongoose.Types.ObjectId(clientId);
//     //   const filteredProjectIds = projectIds.filter((p) =>
//     //     p.equals(projectObjectId)
//     //   );
//     // projectIds = filteredProjectIds;
//     console.log("projectIds after filter", projectIds);
//     // }
//     const filter = {
//       projectId: { $in: projectIds },
//     };
//     console.log("filter before type", filter);

//     if (type === "completed") {
//       filter.status = "completed";
//     } else {
//       filter.status = { $ne: "completed" };
//     }

//     const taskList = await Task.find(filter)
//       .sort({ createdAt: -1 })
//       .populate([
//         { path: "projectId", select: "name" },
//         { path: "assignedTo", select: "employeeName" },
//       ])
//       .sort({ createdAt: -1 });

//     if (!taskList || taskList.length === 0) {
//       return res.status(200).json({
//         success: false,
//         message: "No tasks found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Task list retrieved successfully",
//       data: taskList,
//     });
//   } catch (error) {
//     console.error("Error in allTaskListById:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// const allTaskListById = async (req, res) => {
//   try {
//     const {
//       type,
//       clientId,
//       employeeId,
//       projectId,
//       day,
//       toDate,
//       taskId,
//       searchTerm,
//       todayTaskDate,
//       status,
//       priority,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(clientId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid clientId format",
//       });
//     }

//     // Get all project IDs for the client
//     const projectDetails = await ProjectModel.find({ clientName: clientId }).select("_id name");
//     const projectIds = projectDetails.map((p) => p._id);

//     if (projectIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No projects found for this client",
//         data: [],
//         pagination: { totalTasks: 0, totalPages: 0, currentPage: parseInt(page), limit: parseInt(limit) },
//       });
//     }

//     // Build aggregation pipeline
//     const pipeline = [
//       { $match: { projectId: { $in: projectIds } } },
//     ];

//     // Type/status filters
//     if (type === "completed") pipeline[0].$match.status = "completed";
//     else if (status) pipeline[0].$match.status = status;

//     if (employeeId) pipeline[0].$match.assignedTo = new mongoose.Types.ObjectId(employeeId);
//     if (projectId) pipeline[0].$match.projectId = new mongoose.Types.ObjectId(projectId);
//     if (priority) pipeline[0].$match.priority = priority;
//     if (taskId) pipeline[0].$match.taskId = { $regex: taskId, $options: "i" };

//     // Date filters
//     if (day || toDate) {
//       pipeline[0].$match.createdAt = {};
//       if (day) {
//         const [year, month, date] = day.split("-");
//         pipeline[0].$match.createdAt.$gte = new Date(Date.UTC(year, month - 1, date, 0, 0, 0));
//       }
//       if (toDate) {
//         const [year, month, date] = toDate.split("-");
//         pipeline[0].$match.createdAt.$lte = new Date(Date.UTC(year, month - 1, date, 23, 59, 59, 999));
//       }
//     } else if (todayTaskDate) {
//       const [year, month, date] = todayTaskDate.split("-");
//       pipeline[0].$match.createdAt = {
//         $gte: new Date(Date.UTC(year, month - 1, date, 0, 0, 0)),
//         $lte: new Date(Date.UTC(year, month - 1, date, 23, 59, 59, 999)),
//       };
//     }

//     // Search term
//     if (searchTerm) {
//       pipeline.push({
//         $match: {
//           $or: [
//             { title: { $regex: searchTerm, $options: "i" } },
//             { taskId: { $regex: searchTerm, $options: "i" } },
//             { "assignedTo.employeeName": { $regex: searchTerm, $options: "i" } },
//             { "projectId.name": { $regex: searchTerm, $options: "i" } },
//             { status: { $regex: searchTerm, $options: "i" } },
//             { priority: { $regex: searchTerm, $options: "i" } },
//           ],
//         },
//       });
//     }

//     // Populate assignedTo
//     pipeline.push({
//       $lookup: {
//         from: "employees",
//         localField: "assignedTo",
//         foreignField: "_id",
//         as: "assignedTo",
//       },
//     });
//     pipeline.push({ $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } });

//     // Populate projectId
//     pipeline.push({
//       $lookup: {
//         from: "projects",
//         localField: "projectId",
//         foreignField: "_id",
//         as: "projectId",
//       },
//     });
//     pipeline.push({ $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } });

//     // Count total documents before pagination
//     const countPipeline = [...pipeline, { $count: "total" }];
//     const countResult = await Task.aggregate(countPipeline);
//     const totalTasks = countResult[0] ? countResult[0].total : 0;
//     const totalPages = Math.ceil(totalTasks / limit);

//     // Sort, skip, and limit for pagination
//     pipeline.push({ $sort: { createdAt: -1 } });
//     pipeline.push({ $skip: (page - 1) * limit });
//     pipeline.push({ $limit: parseInt(limit) });

//     const taskList = await Task.aggregate(pipeline);

//     return res.status(200).json({
//       success: true,
//       message: "Task list retrieved successfully",
//       data: taskList,
//       pagination: { totalTasks, totalPages, currentPage: parseInt(page), limit: parseInt(limit) },
//     });
//   } catch (error) {
//     console.error("Error in allTaskListByIdAggregation:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
const allTaskListById = async (req, res) => {
  try {
    const {
      type,
      clientId,
      employeeId,
      projectId,
      day,
      toDate,
      taskId,
      searchTerm,
      todayTaskDate,
      status,
      priority,
      page = 1,
      limit = 10,
    } = req.query;

    // ----- Get all project IDs for the client -----
    const projectDetails = await ProjectModel.find({
      clientName: clientId,
    }).select("_id name");
    const projectIds = projectDetails.map((p) => p._id);

    if (projectIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No projects found for this client",
        data: [],
        pagination: {
          totalTasks: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    }

    // ----- Build aggregation pipeline -----
    const pipeline = [{ $match: { projectId: { $in: projectIds } } }];

    // Type / Status filter
    if (type === "completed") pipeline[0].$match.status = "completed";
    else if (status) pipeline[0].$match.status = status;

    if (employeeId)
      pipeline[0].$match.assignedTo = new mongoose.Types.ObjectId(employeeId);
    if (projectId)
      pipeline[0].$match.projectId = new mongoose.Types.ObjectId(projectId);
    if (priority) pipeline[0].$match.priority = priority;
    if (taskId) pipeline[0].$match.taskId = { $regex: taskId, $options: "i" };

    // Date filters
    if (day || toDate) {
      pipeline[0].$match.createdAt = {};
      if (day) {
        const [year, month, date] = day.split("-");
        pipeline[0].$match.createdAt.$gte = new Date(
          Date.UTC(year, month - 1, date, 0, 0, 0)
        );
      }
      if (toDate) {
        const [year, month, date] = toDate.split("-");
        pipeline[0].$match.createdAt.$lte = new Date(
          Date.UTC(year, month - 1, date, 23, 59, 59, 999)
        );
      }
    } else if (todayTaskDate) {
      const [year, month, date] = todayTaskDate.split("-");
      pipeline[0].$match.createdAt = {
        $gte: new Date(Date.UTC(year, month - 1, date, 0, 0, 0)),
        $lte: new Date(Date.UTC(year, month - 1, date, 23, 59, 59, 999)),
      };
    }

    // ----- Lookup assignedTo -----
    pipeline.push({
      $lookup: {
        from: "employees",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
      },
    });
    pipeline.push({
      $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true },
    });

    // ----- Lookup projectId -----
    pipeline.push({
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "projectId",
      },
    });
    pipeline.push({
      $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true },
    });

    // ----- Search filter (after lookups) -----
    if (searchTerm) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { taskId: { $regex: searchTerm, $options: "i" } },
            {
              "assignedTo.employeeName": { $regex: searchTerm, $options: "i" },
            },
            { "projectId.name": { $regex: searchTerm, $options: "i" } },
            { status: { $regex: searchTerm, $options: "i" } },
            { priority: { $regex: searchTerm, $options: "i" } },
          ],
        },
      });
    }

    // ----- Count total documents -----
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Task.aggregate(countPipeline);
    const totalTasks = countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalTasks / limit);

    // ----- Pagination and sorting -----
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: (page - 1) * parseInt(limit) });
    pipeline.push({ $limit: parseInt(limit) });

    const taskList = await Task.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      message: "Task list retrieved successfully",
      data: taskList,
      pagination: {
        totalTasks,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error in allTaskListByIdAggregation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const allTaskCompletedList = async (req, res) => {
  try {
    const taskList = await Task.find({ status: "completed" })
      .populate([
        { path: "projectId", select: "name" },
        { path: "assignedTo", select: "employeeName" },
      ])
      .sort({
        createdAt: -1,
      });
    if (!taskList || taskList.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No tasks found" });
    }
    // const addEmployeeDetails = await Promise.all(
    //   taskList.map(async (taskDoc) => {
    //     // Convert Mongoose document to plain JS object
    //     const task = taskDoc.toObject();
    //     const employeeDetails = await Employee.findOne({
    //       email: task.assignedTo,
    //     });
    //     if (employeeDetails) {
    //       task.name = employeeDetails.employeeName;
    //       task.Email = employeeDetails.email;
    //       task.Id = employeeDetails._id;
    //       task.photo = employeeDetails.photo;
    //     } else {
    //       task.name = "Unknown";
    //       task.Email = "";
    //       task.Id = null;
    //       task.photo = null;
    //     }
    //     return task;
    //   })
    // );
    return res.status(200).json({
      success: true,
      message: "Task list retrieved",
      data: taskList,
    });
  } catch (error) {
    // console.error("Error in AllTaskList:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// //  GET ALL TASKS with Pagination
const getAllTasks = async (req, res) => {
  try {
    const { projectId, assignedTo } = req.query;
    // console.log("req.query", req.query);
    // Build dynamic filter
    const baseFilter = {};
    if (projectId) baseFilter.projectId = projectId;
    if (assignedTo) baseFilter.assignedTo = assignedTo;
    // find project id and get teamMembers one for todo

    // Fetch all task status groups with filter
    const [taskToDo, taskInProcess, taskInReview, taskDone] = await Promise.all(
      [
        Task.find({ ...baseFilter, status: "todo" }).populate([
          { path: "assignedTo", select: "employeeName" },
          { path: "createdById", select: "employeeName" },
          { path: "projectManagerId", select: "employeeName" },
          { path: "projectId", select: "name" },
        ]),
        Task.find({ ...baseFilter, status: "in-progress" }).populate([
          { path: "assignedTo", select: "employeeName " },
          { path: "createdById", select: "employeeName " },
          { path: "projectManagerId", select: "employeeName" },
          { path: "projectId", select: "name" },
        ]),
        Task.find({ ...baseFilter, status: "in-review" }).populate([
          { path: "assignedTo", select: "employeeName " },
          { path: "createdById", select: "employeeName " },
          { path: "projectManagerId", select: "employeeName" },
          { path: "projectId", select: "name" },
        ]),
        Task.find({ ...baseFilter, status: "done" }).populate([
          { path: "assignedTo", select: "employeeName " },
          { path: "createdById", select: "employeeName " },
          { path: "projectManagerId", select: "employeeName" },
          { path: "projectId", select: "name" },
        ]),
      ]
    );

    res.status(200).json({
      success: true,
      message: "Filtered tasks fetched successfully",
      counts: {
        taskToDo: taskToDo.length,
        taskInProcess: taskInProcess.length,
        taskInReview: taskInReview.length,
        taskDone: taskDone.length,
      },
      data: {
        taskToDo,
        taskInProcess,
        taskInReview,
        taskDone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

//  GET TASK BY ID
// const getTaskById = async (req, res) => {
//   console.log("id task");
//   const { taskId } = req.params;
//   // console.log("id task", taskId, req.params);
//   try {
//     const task = await Task.find({ taskId: taskId }).populate([
//       { path: "assignedTo", select: "employeeName " },
//       { path: "createdById", select: "employeeName " },
//       { path: "projectManagerId", select: "employeeName" },
//       { path: "projectId", select: "name" },
//     ]);
//     if (!task || !task.length > 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "project not found" });
//     }
//     res.status(200).json({ success: true, data: task });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching task", error: error.message });
//   }
// };

const getTaskById = async (req, res) => {
  const { taskId } = req.params;
  console.log("Fetching task with ID:", taskId);

  try {
    const task = await Task.findOne({ taskId }).lean(); // use findOne and lean()

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Helper function to fetch user name from Employee or Admin
    // const getUserName = async (userId) => {
    //   console.log("Fetching user name for ID:", userId);
    //   if (!userId) return null;
    //   const [employee, admin, client, clientUser] = await Promise.all([
    //     Employee.findById(userId).select("employeeName").lean(),
    //     User.findById(userId).select("name").lean(),
    //     ClientDetails.findById(userId).select("client_name").lean(),
    //     ClientSubUser.findById(userId).select("name").lean(),
    //   ]);
    //   return (
    //     employee?.employeeName ||
    //     admin?.name ||
    //     client?.client_name + " (Client)" ||
    //     clientUser?.name + " (Client User)" ||
    //     null
    //   );
    // };

    const getUserName = async (userId) => {
      console.log("Fetching user name for ID:", userId);
      if (!userId) return null;

      const [employee, admin, client, clientUser] = await Promise.all([
        Employee.findById(userId).select("employeeName").lean(),
        User.findById(userId).select("name").lean(),
        ClientDetails.findById(userId).select("client_name").lean(),
        ClientSubUser.findById(userId).select("name").lean(),
      ]);

      if (employee?.employeeName) return employee.employeeName;

      if (admin?.name) return admin.name;

      if (client?.client_name) return `${client.client_name} (Client)`;

      if (clientUser?.name) return `${clientUser.name} (Client User)`;

      return null;
    };

    const [assignedToName, createdByName, projectManagerName, project] =
      await Promise.all([
        getUserName(task.assignedTo),
        getUserName(task.createdById),
        getUserName(task.projectManagerId),
        ProjectModel.findById(task.projectId).select("name ").lean(),
      ]);

    const subtasks = await SubTask.find({ mainTaskId: task._id }).populate([
      { path: "assignedTo", select: "employeeName " },
    ]);

    const comments = await TaskComments.find({ taskId: taskId }).populate([
      { path: "createdBy", select: "employeeName " },
    ]);

    // taskDocument
    const docRecord = await TaskDocument.findOne({ taskId });

    const taskWithNames = {
      ...task,
      document: docRecord?.document || [],
      subtasks,
      assignedTo: { _id: task.assignedTo, employeeName: assignedToName },
      projectId: { name: project?.name || null },
      createdById: { employeeName: createdByName },
      projectManagerId: { _id: task.projectManagerId, projectManagerName },
      projectIdFilter: project?._id,
      comments,
      // assignedToName:{},
      // createdByName,
      // projectManagerName,
    };

    console.log("taskWithNames", taskWithNames);
    res.status(200).json({ success: true, data: taskWithNames });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error.message,
    });
  }
};

//  Fix missing assignedTo manually
const fixAssignedTo = async (tasks) => {
  for (const task of tasks) {
    const assignedToId = task.assignedTo?._id || task._doc?.assignedTo;
    if (!assignedToId) continue;

    if (!task.assignedTo || Object.keys(task.assignedTo).length === 0) {
      // If Employee not found, try Admin
      const admin = await User.findById(assignedToId).select("name");
      if (admin) {
        task.assignedTo = {
          _id: admin._id,
          employeeName: admin.name,
          type: "Admin",
        };
      }
    } else if (task.assignedTo.employeeName) {
      task.assignedTo = {
        _id: task.assignedTo._id,
        employeeName: task.assignedTo.employeeName,
        type: "Employee",
      };
    }
  }
};

// const particularTask = async (req, res) => {
//   try {
//     //  Extract query parameters
//     const {
//       employeeId,
//       projectId,
//       day,
//       searchTerm,
//       page = 1,
//       limit = 10,
//     } = req.query;
//     const pageInt = parseInt(page);
//     const limitInt = parseInt(limit);
//     console.log(employeeId, projectId, day);

//     //  Base filter
//     const baseFilter = {};

//     // Date filter
//     if (day) {
//       const [year, month, date] = day.split("-");
//       const startOfDay = new Date(Date.UTC(year, month - 1, date, 0, 0, 0));
//       const endOfDay = new Date(
//         Date.UTC(year, month - 1, date, 23, 59, 59, 999)
//       );
//       baseFilter.createdAt = { $gte: startOfDay, $lte: endOfDay };
//     }

//     // Project filter
//     if (projectId) {
//       baseFilter.projectId = new mongoose.Types.ObjectId(projectId);
//     }

//     // Employee filter for assigned tasks
//     const todoFilter = { ...baseFilter, status: "todo" };
//     const otherBaseFilter = { ...baseFilter };

//     if (employeeId) {
//       const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

//       const employeeProjects = await ProjectModel.find({
//         $or: [
//           { projectManagerId: employeeId },
//           { teamMembers: { $in: [employeeId] } },
//         ],
//       }).select("_id");

//       const projectIds = employeeProjects.map((p) => p._id);

//       todoFilter.$or = [
//         { assignedTo: employeeObjectId },
//         { assignedTo: { $exists: false }, projectId: { $in: projectIds } },
//         { assignedTo: null, projectId: { $in: projectIds } },
//         { projectManagerId: employeeObjectId },
//       ];

//       otherBaseFilter.$or = [
//         { assignedTo: employeeObjectId },
//         { projectManagerId: employeeObjectId },
//       ];
//     }
//     //  Fetch tasks with pagination
//     const taskToDo = await Task.find(todoFilter)
//       .populate([
//         { path: "assignedTo", select: "employeeName" },
//         { path: "projectId", select: "name" },
//       ])
//       .sort({ createdAt: -1 })
//       .skip((pageInt - 1) * limitInt)
//       .limit(limitInt);

//     console.log("taskToDo", taskToDo);
//     const taskByStatus = {};
//     const todoCount = await Task.countDocuments(todoFilter);

//     taskByStatus["todo"] = { taskToDo, todoCount };

//     const statusList = [
//       "in-progress",
//       "in-review",
//       "done",
//       "block",
//       "completed",
//     ];

//     await Promise.all(
//       statusList.map(async (status) => {
//         const tasks = await Task.find({ ...otherBaseFilter, status })
//           .populate([
//             { path: "assignedTo", select: "employeeName" },
//             { path: "projectId", select: "name" },
//           ])
//           .sort({ createdAt: -1 })
//           .skip((pageInt - 1) * limitInt)
//           .limit(limitInt);

//         const count = await Task.countDocuments({ ...otherBaseFilter, status });

//         taskByStatus[status] = { tasks, count };
//       })
//     );

//     //  Today tasks
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const todayTasks = await Task.find({
//       ...otherBaseFilter,
//       createdAt: { $gte: todayStart, $lte: todayEnd },
//     }).populate([
//       { path: "assignedTo", select: "employeeName" },
//       { path: "projectId", select: "name" },
//     ]);

//     //  Fix missing assignedTo manually
//     await Promise.all([
//       fixAssignedTo(taskToDo),
//       ...statusList.map((s) => fixAssignedTo(taskByStatus[s].tasks)),
//       fixAssignedTo(todayTasks),
//     ]);

//     //  Total projects and user tasks
//     const totalProjectCount = employeeId
//       ? await ProjectModel.countDocuments({
//           $or: [
//             { projectManager: employeeId },
//             { teamMembers: { $in: [employeeId] } },
//           ],
//         })
//       : await ProjectModel.countDocuments();

//     const totalUserTasks = await Task.countDocuments(otherBaseFilter);

//     const statusCounts = {
//       todo: todoCount,
//       ...Object.fromEntries(statusList.map((s) => [s, taskByStatus[s].count])),
//     };
//     const findMaxValue = Math.max(...Object.values(statusCounts));
//     //  Response
//     res.status(200).json({
//       success: true,
//       message: "Tasks fetched successfully",
//       pagination: {
//         currentPage: pageInt,
//         limit: limitInt,
//         totalTodoTasks: findMaxValue,
//         totalPages: Math.ceil(findMaxValue / limitInt),
//       },
//       counts: {
//         totalProjectCount,
//         totalUserTasks,
//         todayTasks: todayTasks.length,
//       },
//       data: {
//         taskToDo,
//         taskInProcess: taskByStatus["in-progress"].tasks,
//         taskInReview: taskByStatus["in-review"].tasks,
//         taskDone: taskByStatus["done"].tasks,
//         taskBlock: taskByStatus["block"].tasks,
//         taskCompleted: taskByStatus["completed"].tasks,
//         todayTasks,
//         statusCounts,
//       },
//     });
//   } catch (error) {
//     // console.error("Fetch error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching tasks",
//       error: error.message,
//     });
//   }
// };

// const particularTask = async (req, res) => {
//   try {
//     // Extract query parameters
//     const {
//       employeeId,
//       projectId,
//       day,
//       fromDate,
//       toDate,
//       taskId,
//       searchTerm,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const pageInt = parseInt(page);
//     const limitInt = parseInt(limit);

//     // Base filter
//     const baseFilter = {};

//     // Day filter (specific day)
//     // if (day) {
//     //   const [year, month, date] = day.split("-");
//     //   const startOfDay = new Date(Date.UTC(year, month - 1, date, 0, 0, 0));
//     //   const endOfDay = new Date(Date.UTC(year, month - 1, date, 23, 59, 59, 999));
//     //   baseFilter.createdAt = { $gte: startOfDay, $lte: endOfDay };
//     // }

//     // From/To Date range filter
//     // From/To Date range filter

//     if (day || toDate) {
//       baseFilter.createdAt = baseFilter.createdAt || {};

//       if (day) {
//         const [year, month, date] = day.split("-");
//         baseFilter.createdAt.$gte = new Date(
//           Date.UTC(year, month - 1, date, 0, 0, 0)
//         );
//       }

//       if (toDate) {
//         const [year, month, date] = toDate.split("-");
//         baseFilter.createdAt.$lte = new Date(
//           Date.UTC(year, month - 1, date, 23, 59, 59, 999)
//         );
//       }
//     }

//     // Project filter
//     if (projectId) {
//       baseFilter.projectId = new mongoose.Types.ObjectId(projectId);
//     }

//     // Task ID filter (regex)
//     if (taskId) {
//       baseFilter.taskId = { $regex: taskId, $options: "i" }; // case-insensitive partial match
//     }

//     // Employee filter for assigned tasks
//     const todoFilter = { ...baseFilter, status: "todo" };
//     const otherBaseFilter = { ...baseFilter };

//     if (employeeId) {
//       const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

//       const employeeProjects = await ProjectModel.find({
//         $or: [
//           { projectManagerId: employeeId },
//           { teamMembers: { $in: [employeeId] } },
//         ],
//       }).select("_id");

//       const projectIds = employeeProjects.map((p) => p._id);

//       todoFilter.$or = [
//         { assignedTo: employeeObjectId },
//         { assignedTo: { $exists: false }, projectId: { $in: projectIds } },
//         { assignedTo: null, projectId: { $in: projectIds } },
//         { projectManagerId: employeeObjectId },
//       ];

//       otherBaseFilter.$or = [
//         { assignedTo: employeeObjectId },
//         { projectManagerId: employeeObjectId },
//       ];
//     }

//     // Fetch tasks with pagination
//     const taskToDo = await Task.find(todoFilter)
//       .populate([
//         { path: "assignedTo", select: "employeeName" },
//         { path: "projectId", select: "name" },
//       ])
//       .sort({ createdAt: -1 })
//       .skip((pageInt - 1) * limitInt)
//       .limit(limitInt);

//     const taskByStatus = {};
//     const todoCount = await Task.countDocuments(todoFilter);
//     taskByStatus["todo"] = { taskToDo, todoCount };

//     const statusList = [
//       "in-progress",
//       "in-review",
//       "done",
//       "block",
//       "completed",
//     ];

//     await Promise.all(
//       statusList.map(async (status) => {
//         const tasks = await Task.find({ ...otherBaseFilter, status })
//           .populate([
//             { path: "assignedTo", select: "employeeName" },
//             { path: "projectId", select: "name" },
//           ])
//           .sort({ createdAt: -1 })
//           .skip((pageInt - 1) * limitInt)
//           .limit(limitInt);

//         const count = await Task.countDocuments({ ...otherBaseFilter, status });
//         taskByStatus[status] = { tasks, count };
//       })
//     );

//     // Today tasks
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const todayTasks = await Task.find({
//       ...otherBaseFilter,
//       createdAt: { $gte: todayStart, $lte: todayEnd },
//     }).populate([
//       { path: "assignedTo", select: "employeeName" },
//       { path: "projectId", select: "name" },
//     ]);

//     // Fix missing assignedTo
//     await Promise.all([
//       fixAssignedTo(taskToDo),
//       ...statusList.map((s) => fixAssignedTo(taskByStatus[s].tasks)),
//       fixAssignedTo(todayTasks),
//     ]);

//     // Total projects and user tasks
//     const totalProjectCount = employeeId
//       ? await ProjectModel.countDocuments({
//           $or: [
//             { projectManagerId: employeeId },
//             { teamMembers: { $in: [employeeId] } },
//           ],
//         })
//       : await ProjectModel.countDocuments();

//     const totalUserTasks = await Task.countDocuments(otherBaseFilter);

//     const statusCounts = {
//       todo: todoCount,
//       ...Object.fromEntries(statusList.map((s) => [s, taskByStatus[s].count])),
//     };
//     const findMaxValue = Math.max(...Object.values(statusCounts));

//     // Response
//     res.status(200).json({
//       success: true,
//       message: "Tasks fetched successfully",
//       pagination: {
//         currentPage: pageInt,
//         limit: limitInt,
//         totalTodoTasks: findMaxValue,
//         totalPages: Math.ceil(findMaxValue / limitInt),
//       },
//       counts: {
//         totalProjectCount,
//         totalUserTasks,
//         todayTasks: todayTasks.length,
//       },
//       data: {
//         taskToDo,
//         taskInProcess: taskByStatus["in-progress"].tasks,
//         taskInReview: taskByStatus["in-review"].tasks,
//         taskDone: taskByStatus["done"].tasks,
//         taskBlock: taskByStatus["block"].tasks,
//         taskCompleted: taskByStatus["completed"].tasks,
//         todayTasks,
//         statusCounts,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching tasks",
//       error: error.message,
//     });
//   }
// };

const particularTask = async (req, res) => {
  try {
    const {
      employeeId,
      projectId,
      day,
      toDate,
      taskId,
      todayTaskDate,
      searchTerm,
      page = 1,
      limit = 10,
    } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // Base filter
    const baseFilter = {};
    // Date filter
    if (todayTaskDate) {
      const [year, month, date] = todayTaskDate.split("-");
      const startOfDay = new Date(Date.UTC(year, month - 1, date, 0, 0, 0));
      const endOfDay = new Date(
        Date.UTC(year, month - 1, date, 23, 59, 59, 999)
      );
      baseFilter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    //  Date filter
    if (day || toDate) {
      baseFilter.createdAt = {};
      if (day) {
        const [year, month, date] = day.split("-");
        baseFilter.createdAt.$gte = new Date(
          Date.UTC(year, month - 1, date, 0, 0, 0)
        );
      }
      if (toDate) {
        const [year, month, date] = toDate.split("-");
        baseFilter.createdAt.$lte = new Date(
          Date.UTC(year, month - 1, date, 23, 59, 59, 999)
        );
      }
    }

    //  Project filter
    if (projectId) {
      baseFilter.projectId = new mongoose.Types.ObjectId(projectId);
    }

    //  Task ID filter
    if (taskId) {
      baseFilter.taskId = { $regex: taskId, $options: "i" };
    }

    //  Employee filter
    let employeeProjects = [];
    let projectIds = [];
    let employeeObjectId;

    if (employeeId) {
      employeeObjectId = new mongoose.Types.ObjectId(employeeId);

      employeeProjects = await ProjectModel.find({
        $or: [
          { projectManagerId: employeeId },
          { teamMembers: { $in: [employeeId] } },
        ],
      }).select("_id");

      projectIds = employeeProjects.map((p) => p._id);
    }

    //  Search conditions (including populated fields)
    const searchConditions = searchTerm
      ? [
          { title: { $regex: searchTerm, $options: "i" } },
          // { description: { $regex: searchTerm, $options: "i" } },
          { taskId: { $regex: searchTerm, $options: "i" } },
          { "assignedTo.employeeName": { $regex: searchTerm, $options: "i" } },
          { "projectId.name": { $regex: searchTerm, $options: "i" } },
        ]
      : [];

    //  Helper: Aggregation pipeline builder
    const buildPipeline = (
      statusFilter,
      extraMatch = {},
      countOnly = false
    ) => {
      const pipeline = [
        { $match: { ...baseFilter, ...extraMatch } },
        {
          $lookup: {
            from: "employees",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedTo",
          },
        },
        { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "projectId",
          },
        },
        { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },
      ];

      if (statusFilter) pipeline.push({ $match: { status: statusFilter } });
      if (searchConditions.length > 0)
        pipeline.push({ $match: { $or: searchConditions } });

      if (countOnly) {
        pipeline.push({ $count: "count" });
        return pipeline;
      }

      pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: (pageInt - 1) * limitInt },
        { $limit: limitInt }
      );

      return pipeline;
    };

    //  Employee-based filters
    const todoExtraMatch = {};
    const otherExtraMatch = {};

    if (employeeId) {
      todoExtraMatch.$or = [
        { assignedTo: employeeObjectId },
        { assignedTo: { $exists: false }, projectId: { $in: projectIds } },
        { assignedTo: null, projectId: { $in: projectIds } },
        { projectManagerId: employeeObjectId },
      ];

      otherExtraMatch.$or = [
        { assignedTo: employeeObjectId },
        { projectManagerId: employeeObjectId },
      ];
    }

    //  Fetch tasks by status (with search-aware counts)
    const taskByStatus = {};

    // --- ToDo ---
    const [taskToDo, todoCountResult] = await Promise.all([
      Task.aggregate(buildPipeline("todo", todoExtraMatch)),
      Task.aggregate(buildPipeline("todo", todoExtraMatch, true)),
    ]);
    const todoCount = todoCountResult[0]?.count || 0;
    taskByStatus["todo"] = { tasks: taskToDo, count: todoCount };

    // --- Other statuses ---
    const statusList = [
      "in-progress",
      "in-review",
      "done",
      "block",
      "completed",
    ];

    for (const status of statusList) {
      const [tasks, countResult] = await Promise.all([
        Task.aggregate(buildPipeline(status, otherExtraMatch)),
        Task.aggregate(buildPipeline(status, otherExtraMatch, true)),
      ]);
      const count = countResult[0]?.count || 0;
      taskByStatus[status] = { tasks, count };
    }

    //  Today's tasks
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPipeline = [
      {
        $match: {
          ...baseFilter,
          ...otherExtraMatch,
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedTo",
        },
      },
      { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "projectId",
        },
      },
      { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },
    ];

    if (searchConditions.length > 0) {
      todayPipeline.push({ $match: { $or: searchConditions } });
    }

    const todayTasks = await Task.aggregate(todayPipeline);

    //  Counts and pagination info
    const totalProjectCount = employeeId
      ? await ProjectModel.countDocuments({
          $or: [
            { projectManagerId: employeeId },
            { teamMembers: { $in: [employeeId] } },
          ],
        })
      : await ProjectModel.countDocuments();

    const totalUserTasks = await Task.countDocuments({
      ...baseFilter,
      ...otherExtraMatch,
    });

    const statusCounts = {
      todo: todoCount,
      ...Object.fromEntries(statusList.map((s) => [s, taskByStatus[s].count])),
    };

    const findMaxValue = Math.max(...Object.values(statusCounts));

    //  Final response
    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      pagination: {
        currentPage: pageInt,
        limit: limitInt,
        totalTodoTasks: findMaxValue,
        totalPages: Math.ceil(findMaxValue / limitInt),
      },
      counts: {
        totalProjectCount,
        totalUserTasks,
        todayTasks: todayTasks.length,
      },
      data: {
        taskToDo,
        taskInProcess: taskByStatus["in-progress"].tasks,
        taskInReview: taskByStatus["in-review"].tasks,
        taskDone: taskByStatus["done"].tasks,
        taskBlock: taskByStatus["block"].tasks,
        taskCompleted: taskByStatus["completed"].tasks,
        todayTasks,
        statusCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

const particularTaskById = async (req, res) => {
  try {
    let {
      employeeId,
      subUserId,
      projectId,
      day,
      toDate,
      taskId,
      searchTerm,
      page = 1,
      limit = 10,
    } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    let projectIds = [];
    let projectDetails = [];

    // 1 CASE: Employee
    if (subUserId) {
      const subUser = await ClientSubUser.findOne({ _id: subUserId });

      if (!subUser) {
        return res.status(404).json({
          success: false,
          message: "Sub-user not found",
        });
      }

      projectIds = Array.isArray(subUser.projectId) ? subUser.projectId : [];

      // Fetch projects assigned to subUser
      projectDetails = await ProjectModel.find({
        clientName: employeeId,
        _id: { $in: projectIds },
      }).select("_id name");
    } else if (employeeId) {
      projectDetails = await ProjectModel.find({
        clientName: employeeId,
      }).select("_id name");

      projectIds = projectDetails.map((p) => p._id);
    }

    // Filter by projectId if provided
    if (projectId) {
      const projectObjectId = new mongoose.Types.ObjectId(projectId);
      projectIds = projectIds.filter((id) => id.equals(projectObjectId));
    }

    if (!projectIds.length) {
      return res.status(200).json({
        success: true,
        message: "No projects found",
        projectDetails,
        data: emptyTaskResponse(),
      });
    }

    // 3️⃣ Build match filter
    const matchFilter = {
      projectId: { $in: projectIds },
    };

    // Date range
    if (day || toDate) {
      matchFilter.createdAt = {};
      if (day) {
        const d = new Date(day);
        matchFilter.createdAt.$gte = new Date(
          Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
        );
      }
      if (toDate) {
        const d = new Date(toDate);
        matchFilter.createdAt.$lte = new Date(
          Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
        );
      }
    }

    if (taskId) {
      matchFilter.taskId = { $regex: taskId, $options: "i" };
    }

    // 4️⃣ Aggregation Pipeline
    const pipeline = [
      { $match: matchFilter },

      // Assigned employee
      {
        $lookup: {
          from: "employees",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedTo",
        },
      },
      { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },

      // Project
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "projectId",
        },
      },
      { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },
    ];

    // Search filter
    if (searchTerm) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { taskId: { $regex: searchTerm, $options: "i" } },
            {
              "assignedTo.employeeName": { $regex: searchTerm, $options: "i" },
            },
            { "projectId.name": { $regex: searchTerm, $options: "i" } },
          ],
        },
      });
    }

    // 5️⃣ Status handling
    const statuses = [
      "todo",
      "in-progress",
      "in-review",
      "done",
      "block",
      "completed",
    ];
    const taskByStatus = {};

    for (const status of statuses) {
      const tasks = await Task.aggregate([
        ...pipeline,
        { $match: { status } },
        { $sort: { createdAt: -1 } },
        { $skip: (pageInt - 1) * limitInt },
        { $limit: limitInt },
      ]);

      const count = await Task.countDocuments({
        ...matchFilter,
        status,
      });

      taskByStatus[status] = { tasks, count };
    }

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      projectDetails,
      pagination: {
        currentPage: pageInt,
        limit: limitInt,
        totalTasks: Object.values(taskByStatus).reduce(
          (a, b) => a + b.count,
          0
        ),
        totalPages: Math.max(
          ...Object.values(taskByStatus).map((s) =>
            Math.ceil(s.count / limitInt)
          )
        ),
      },
      data: {
        taskToDo: taskByStatus["todo"].tasks,
        taskInProcess: taskByStatus["in-progress"].tasks,
        taskInReview: taskByStatus["in-review"].tasks,
        taskDone: taskByStatus["done"].tasks,
        taskBlock: taskByStatus["block"].tasks,
        taskCompleted: taskByStatus["completed"].tasks,
        statusCounts: Object.fromEntries(
          statuses.map((s) => [s, taskByStatus[s].count])
        ),
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

// Helper for empty response

function emptyTaskResponse() {
  return {
    taskToDo: [],
    taskInProcess: [],
    taskInReview: [],
    taskDone: [],
    taskBlock: [],
    taskCompleted: [],
    statusCounts: {},
  };
}

const updateTask = async (req, res) => {
  // console.log("Update task request body:", req.params.id, req.body);

  try {
    const { id } = req.params;

    // Find the task first
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Destructure fields from body
    const {
      projectName,
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      startDate,
      projectId,
      createdById,
      status,
      projectManagerId,
      taskType,
    } = req.body;

    // Update only if values are provided
    if (projectName) task.projectName = projectName;
    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;
    if (dueDate != "undefined") task.dueDate = dueDate;
    if (startDate) task.startDate = startDate;
    if (projectId) task.projectId = projectId || task.projectId;
    if (taskType) task.taskType = taskType || task.taskType;
    // if (createdById) task.createdById = createdById || task.createdById;
    // if(projectManagerId) task.projectManagerId=projectManagerId || task.projectManagerId;
    //  if (status) task.status = status || task.status;

    // Handle file upload (if any)
    // if (Array.isArray(req.files) && req.files.length > 0) {
    //   const documentArray = req.files
    //     .filter((file) => file.fieldname === "document[]")
    //     .map((file) => ({
    //       filepath: file.filename,
    //       originalName: file.originalname,
    //     }));
    //   task.document = documentArray;
    // }
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
    // task.document = task.document.concat(newDocuments);
    // edit Task adding
    // find TaskDocument
    // Find existing task document
    let taskDoc = await TaskDocument.findOne({ taskId: task.taskId });

    if (taskDoc) {
      // Merge previous + new documents
      taskDoc.document = [...taskDoc.document, ...newDocuments];
    } else {
      // If no document exists → create new
      taskDoc = new TaskDocument({
        taskId: task.taskId,
        document: newDocuments,
      });
    }

    // Save updated document
    await taskDoc.save();

    /////////////////////

    // Save updated task
    const updatedTask = await task.save();

    const notification = new NotificationSchema({
      to: assignedTo,
      subject: "New Task Created",
      message: `Task "${projectName}" assigned to ${assignedTo}`,
      name: assignedTo,
      template: "taskCreated",
    });

    await notification.save();

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    // console.error("Error updating task:", error);
    res.status(500).json({
      message: "Error updating task",
      error: error.message,
    });
  }
};

// PATCH /api/tasks/:id/status
// const updateTaskStatus = async (req, res) => {
//   try {
//     const { status, startTime, endTime, updatedBy } = req.body;
//     console.log(req.params.id);
//     // Validate status input
//     const allowedStatuses = ["todo", "in-progress", "in-review", "done"];
//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid status value" });
//     }
//     const findTask = await Task.findOne({ taskId: req.params.id });
//     if (!findTask) {
//       res.status(404).json({ success: false, message: "data not found" });
//     }
//     if (
//       status === "done" &&
//       (findTask.projectManager !== updatedBy ||
//         updatedBy !== "hrmsaryutechnologies@gmail.com")
//     ) {
//       res
//         .status(403)
//         .json({
//           sucess: false,
//           message: "Only Admin and ProjectManger move to done",
//         });
//     }

//     const updatedTask = await Task.findOneAndUpdate(
//       { taskId: req.params.id },
//       { $set: { status: status, startTime: startTime, endTime: endTime } },
//       { new: true, runValidators: true } // ensures only updating fields are validated,
//     );

//     if (!updatedTask) {
//       return res.status(404).json({ message: "Task not found" });
//     }
//     // update task logs
//     const taskLog = {
//       taskId: updatedTask.taskId,
//       startTime: new Date(),
//       // endTime: endTime || new Date(),
//       status: status,
//       updatedBy: updatedBy , // Assuming updatedBy is passed in the request body
//     };
//     // Save task log
//     const taskLogEntry = new TaskLogsModel(taskLog);
//     await taskLogEntry.save();
//     res.status(200).json({
//       success: true,
//       message: "Task status updated",
//       task: updatedTask,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error updating task status",
//       error: error.message,
//     });
//   }
// };
// const updateTaskStatus = async (req, res) => {
//   try {
//     const { status, startTime, endTime, updatedBy } = req.body;
//     console.log("1", req.body);
//     const { id } = req.params;

//     const allowedStatuses = [
//       "todo",
//       "in-progress",
//       "in-review",
//       "done",
//       "block",
//       "completed",
//     ];
//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid status value" });
//     }

//     const findTask = await Task.findOne({ taskId: id });
//     if (!findTask) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Task not found" });
//     }

//     const lastStatusLog = await TaskLogsModel.findOne({ taskId: id }).sort({
//       createdAt: -1,
//     }); // Sort by latest

//     if (lastStatusLog && lastStatusLog.status === "hold") {
//       return res
//         .status(404)
//         .json({ success: false, message: "Restart the Task" });
//     }

//     if (
//       (status === "done" || status === "completed") &&
//       updatedBy !== String(findTask.projectManager) && // ensure string comparison
//       updatedBy !== "hrmsaryutechnologies@gmail.com"
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "Only Admin and Project Manager can move task to 'done'",
//       });
//     }

//     const findByAssignnedTo = await Task.findOne({
//       taskId: id,
//     });
//     let updatedTask;
//     if (findByAssignnedTo.assignedTo) {
//       updatedTask = await Task.findOneAndUpdate(
//         { taskId: id },
//         {
//           $set: {
//             status,
//             startTime,
//             endTime,
//           },
//         },
//         { new: true, runValidators: true }
//       );
//     } else {
//       updatedTask = await Task.findOneAndUpdate(
//         { taskId: id },
//         {
//           $set: {
//             status,
//             startTime,
//             endTime,
//             assignedTo: updatedBy,
//           },
//         },
//         { new: true, runValidators: true }
//       );
//     }

//     if (!updatedTask) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Task not found during update" });
//     }
//     // Save task log
//     console.log("2", updatedBy);
//     const taskLogEntry = new TaskLogsModel({
//       taskId: updatedTask.taskId,
//       status,
//       updatedBy,
//       startTime: new Date(),
//     });
//     await taskLogEntry.save();
//     res.status(200).json({
//       success: true,
//       message: "Task status updated",
//       task: updatedTask,
//     });
//   } catch (error) {
//     if (error.name === "ValidationError") {
//       const errors = {};
//       for (let field in error.errors) {
//         errors[field] = error.errors[field].message;
//       }
//       return res.status(400).json({ errors });
//     } else {
//       res.status(500).json({ success: false, error: "Internal Server Error" });
//     }
//     res.status(500).json({
//       success: false,
//       message: "Error updating task status",
//       error: error.message,
//     });
//   }
// };
const updateTaskStatus = async (req, res) => {
  try {
    const { status, startTime, endTime, updatedBy, assignedTo, taskType } =
      req.body;
    const { id } = req.params;

    console.log("Request Body:", req.body);

    // Step 1: Validate status
    const allowedStatuses = [
      "todo",
      "in-progress",
      "in-review",
      "done",
      "block",
      "completed",
    ];
    const task = await Task.findOne({ taskId: id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskType && task.taskType !== taskType) {
      const updatedTask = await Task.findOneAndUpdate(
        { taskId: id },
        { $set: { taskType } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Task type updated successfully",
        task: updatedTask,
      });
    }

    if (assignedTo) {
      const updatedTask = await Task.findOneAndUpdate(
        { taskId: id },
        { $set: { assignedTo } },
        { new: true, runValidators: true }
      );
      // Step 7: Save task log
      // const taskLogEntry = new TaskLogsModel({
      //   taskId: updatedTask.taskId,
      //   status,
      //   updatedBy,
      //   startTime: new Date(), // You could also use startTime from req.body
      // });
      return res.status(200).json({
        success: true,
        message: "Task assigned to updated updated successfully",
        task: updatedTask,
      });
    }

    if (status === "block") {
      // find the task for id

      const updatedTask = await Task.findOneAndUpdate(
        { taskId: id },
        { $set: { status } },
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          message: "Task not found during update",
        });
      }

      // Step 7: Save task log
      const taskLogEntry = new TaskLogsModel({
        taskId: updatedTask.taskId,
        status,
        updatedBy,
        taskType,
        startTime: new Date(), // You could also use startTime from req.body
      });

      await taskLogEntry.save();

      return res.status(200).json({
        success: true,
        message: "Task status updated successfully",
        task: updatedTask,
      });
    } else {
      //check already tast is in-progress
      const findInprocessTask = await Task.find({
        status: "in-progress",
        assignedTo: new mongoose.Types.ObjectId(updatedBy),
      });

      // console.log("findInprocessTask", findInprocessTask);
      if (status === "in-progress") {
        for (let task of findInprocessTask) {
          if (
            status == "in-progress" &&
            task &&
            task.pauseComments &&
            task.pauseComments.length == 0
          ) {
            return res.status(404).json({
              success: false,
              message:
                "Please hold or complete the previous task before starting a new one.",
            });
          }
          if (task && task.pauseComments && task.pauseComments.length > 0) {
            const latestPause = [...task.pauseComments].reverse()[0];
            // console.log("latestPause", latestPause.pauseCondition);
            if (latestPause.pauseCondition !== "hold") {
              return res.status(404).json({
                success: false,
                message:
                  "Please hold or complete the previous task before starting a new one.",
              });
            }
          }
        }
      }

      // if (!allowedStatuses.includes(status)) {
      //   return res.status(400).json({ message: "Invalid status value" });
      // }

      // Step 2: Find the task
      const findTask = await Task.findOne({ taskId: id });

      if (!findTask) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (findTask && findTask.status === "todo" && status !== "in-progress") {
        return res.status(403).json({
          success: false,
          message: "Task is on todo,Please  move on Inprogress.",
        });
      }
      console.log("findTask", findTask);
      const findSubTask = await SubTask.find({ taskId: findTask._id });
      console.log("findSubTask", findSubTask);
      // if (status !== "todo" && status !== "in-progress") {
      // if (findSubTask && findSubTask.length > 0) {
      //   findSubTask.forEach((subtask) => {
      //     if (subtask.status !== "done") {
      //       return res.status(403).json({
      //         success: false,
      //         message:
      //           "Please complete all subtasks before moving the main task to done.",
      //       });
      //     }
      //   });
      // }
      // }
      if (status !== "todo" && status !== "in-progress") {
        if (findSubTask.length > 0) {
          for (let subtask of findSubTask) {
            if (subtask.status !== "done") {
              return res.status(403).json({
                success: false,
                message:
                  "Please complete all subtasks before moving the main task to done.",
              });
            }
          }
        }
      }

      // Step 3: Check if task is on hold
      const lastStatusLog = await TaskLogsModel.findOne({ taskId: id }).sort({
        createdAt: -1,
      });

      if (lastStatusLog && lastStatusLog.status === "hold") {
        return res.status(403).json({
          success: false,
          message: "Task is on hold. Please restart the task first.",
        });
      }
      // check tester start the task befour moving down,
      const findtesterStartTheTask = await TaskLogsModel.find({
        taskId: id,
        status: "start",
        updatedBy: new mongoose.Types.ObjectId(updatedBy),
      });

      if (status === "done" && findtesterStartTheTask.length == 0) {
        return res.status(403).json({
          success: false,
          message: "Task has not been started. Please start the task first.",
        });
      }

      // Step 4: Authorization - Only PM or admin can mark "done"/"completed"
      // console.log(
      //   updatedBy == findTask.projectManagerId,
      //   updatedBy == superAdmin._id,
      //   superAdmin._id,
      //   updatedBy,
      //   findTask.projectManagerId
      // );
      //  only project manager and super admin and client and subUser client can mark as done/completed
      const userDetails = await User.findOne({ _id: updatedBy });

        if (!userDetails) {
          // no _id match → skip or check superAdmin
          const superAdmin = await User.findOne({
            _id: updatedBy,
            superUser: true
          });
        }

      // console.log(
      //   updatedBy,
      //   superAdmin._id,
      //   findTask.projectManagerId,
      //   findTask.projectManagerId.toString(),
      //   updatedBy == superAdmin._id.toString()
      // );

      // if (
      //   (status === "done" || status === "completed") &&
      //   updatedBy !== findTask.projectManagerId.toString() &&
      //   updatedBy !== superAdmin._id.toString()
      // ) {
      //   return res.status(403).json({
      //     success: false,
      //     message:
      //       "Only Project Manager or Admin can mark task as done/completed",
      //   });
      // }
      // --- Find Client ---
      const client = await ClientDetails.findById(updatedBy);

      let clientIdAllowed = null;

      if (client) {
        const projectMatch = await ProjectModel.findOne({
          _id: findTask.projectId, // PROJECTS
          clientName: client._id,
        });

        if (projectMatch) clientIdAllowed = client._id.toString();
      }

      // --- Find Client Sub User ---
      const clientSubUser = await ClientSubUser.findOne({
        _id: updatedBy,
        projectId: { $in: findTask.projectId }, // PROJECTS ARRAY
      });

      let clientSubUserAllowed = clientSubUser
        ? clientSubUser._id.toString()
        : null;

      // --- Permission Logic ---
      const allowedUsers = [
        findTask.projectManagerId?.toString(),
        superAdmin._id?.toString(),
        clientIdAllowed,
        clientSubUserAllowed,
      ].filter(Boolean);

      if (
        (status === "done" || status === "completed") &&
        !allowedUsers.includes(updatedBy.toString())
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only Project Manager, Admin, Client or Sub-Client can mark task as done/completed",
        });
      }

      // Step 5: Prepare update fields
      const updateFields = {
        status,
        startTime,
        endTime,
        taskType
      };

      // If task not assigned yet, assign it to updatedBy

      if (!findTask.assignedTo && status == "in-progress") {
        updateFields.assignedTo = updatedBy;
      }

      // Step 6: Update the task
      const updatedTask = await Task.findOneAndUpdate(
        { taskId: id },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          message: "Task not found during update",
        });
      }

      // Step 7: Save task log
      const taskLogEntry = new TaskLogsModel({
        taskId: updatedTask.taskId,
        status,
        updatedBy,
        startTime: new Date(), // You could also use startTime from req.body
      });

      await taskLogEntry.save();

      return res.status(200).json({
        success: true,
        message: "Task status updated successfully",
        task: updatedTask,
      });
    }
  } catch (error) {
    console.error("Error updating task:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// const tasklogsList = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const tasklogList = await TaskLogsModel.find({ taskId: taskId }).populate(
//       "updatedBy",
//       "employeeName"
//     );
//     if (!tasklogList) {
//       return res.status(404).json({ message: "Data is not found" });
//     }
//     res.status(200).json({ success: true, data: tasklogList });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server eroor" });
//   }
// };
const tasklogsList = async (req, res) => {
  try {
    const { taskId } = req.params;

    const tasklogList = await TaskLogsModel.find({ taskId }).lean(); // Use lean()

    if (!tasklogList || tasklogList.length === 0) {
      return res.status(404).json({ success: false, message: "No logs found" });
    }

    // Helper to get user name from either collection
    const getUserName = async (userId) => {
      if (!userId) return null;

      const [employee, admin] = await Promise.all([
        Employee.findById(userId).select("employeeName").lean(),
        User.findById(userId).select("name").lean(),
      ]);

      return employee?.employeeName || admin?.name || "Unknown User";
    };

    // Map logs and add updatedByName
    const enrichedLogs = await Promise.all(
      tasklogList.map(async (log) => {
        const updatedByName = await getUserName(log.updatedBy);
        return {
          ...log,
          updatedBy: { employeeName: updatedByName },
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enrichedLogs,
    });
  } catch (error) {
    // console.error("Error fetching task logs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//  DELETE TASK
const deleteTask = async (req, res) => {
  try {
    // console.log("Delete task request body:", req.params.id);
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting task", error: error.message });
  }
};

// task comments
const particularTaskComments = async (req, res) => {
  const { comment, document, taskId, createdBy } = req.body;
  // console.log("hello", req.body);
  try {
    if (!comment || !taskId || !createdBy) {
      return res
        .status(400)
        .json({ success: true, message: "Require all details" });
    }
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
    const userCommments = new TaskComments({
      comment,
      document: documentArray,
      taskId,
      createdBy,
    });

    // console.log("dddddd gggggg", req.body);
    await userCommments.save();
    res.status(200).json({
      success: true,
      message: "Successfully Created",
      data: userCommments,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};

// get particular comment

const getParticularTaskComments = async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await TaskComments.find({ taskId: id });
    console.log("comments", comments);
    if (!comments || comments.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No comments found for this task" });
    }

    const addEmployeeDetails = await Promise.all(
      comments.map(async (commentDoc) => {
        // Convert Mongoose document to plain JS object
        const comment = commentDoc.toObject();

        const employeeDetails = await Employee.findOne({
          _id: new mongoose.Types.ObjectId(comment.createdBy),
        });

        const AdminDetails = await User.findOne({
          _id: new mongoose.Types.ObjectId(comment.createdBy),
        });
        const ClientDetail = await ClientDetails.findOne({
          _id: new mongoose.Types.ObjectId(comment.createdBy),
        });

        const ClientSubUserDetails = await ClientSubUser.findOne({
          _id: new mongoose.Types.ObjectId(comment.createdBy),
        });

        // const HrDetails = await userModel.findOne({
        //   name: "HR",
        // });
        if (employeeDetails) {
          comment.name = employeeDetails?.employeeName;
          comment.Email = employeeDetails?.email;
          comment.Id = employeeDetails._id;
          comment.photo = employeeDetails?.photo;
        } else if (AdminDetails) {
          comment.name = AdminDetails?.name;
          comment.Email = AdminDetails?.email;
          comment.Id = AdminDetails?._id;
          comment.photo = null;
        } else if (ClientDetail) {
          comment.name = ClientDetail?.client_name;
          comment.Email = ClientDetail?.email;
          comment.Id = ClientDetail?._id;
          comment.photo = null;
        } else if (ClientSubUserDetails) {
          comment.name = ClientSubUserDetails?.name;
          comment.Email = ClientSubUserDetails?.email;
          comment.Id = ClientSubUserDetails?._id;
          comment.photo = null;
        } else {
          comment.name = "Unknown";
          comment.Email = "";
          comment.Id = null;
          comment.photo = null;
        }
        return comment;
      })
    );

    return res.status(200).json({
      success: true,
      message: "User comments list retrieved",
      data: addEmployeeDetails,
    });
  } catch (error) {
    console.error("Error in getParticularTaskComments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// const taskHold = async (req, res) => {
//   const { id } = req.params;
//   const { pauseProject, note,updatedBy } = req.body;

//   try {

//     if (!pauseProject || !note?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Both 'pauseProject' and 'note' are required",
//       });
//     }

//     const pauseEntry = {
//       note: note.trim(),
//       pauseCondition: pauseProject,
//       time: new Date(),
//       updatedBy:updatedBy
//     };

//     const updatedTask = await Task.findOneAndUpdate(
//       { taskId: id },
//       {
//         // $set: { pauseProject: pauseProject.trim() },
//         $push: { pauseComments: pauseEntry },
//       },
//       { new: true } // return the updated document
//     );

//     if (!updatedTask) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Task not found" });
//     }
//     const taskHoldLogs=await new TaskLogsModel(pauseEntry
//     );
//     await taskHoldLogs.save();

//     res.status(200).json({
//       success: true,
//       message: `Task ${
//         pauseProject === "hold" ? "paused" : "resumed"
//       } successfully`,
//       data: updatedTask,
//     });
//   } catch (error) {
//     console.error("Error updating task hold status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// const taskHold = async (req, res) => {
//   const { id } = req.params;
//   const { pauseProject, note, updatedBy } = req.body;

//   try {
//     if (!pauseProject?.trim() || !note?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Both 'pauseProject' and 'note' are required",
//       });
//     }

//     // If resuming, make sure no other task is already active

//     // Find all in-progress tasks for the user
//     const inProgressTasks = await Task.find({
//       status: "in-progress",
//       assignedTo: new mongoose.Types.ObjectId(updatedBy),
//     });

//     let activeTaskCount = 0;
//     let otherActiveTaskExists = false;

//     if (pauseProject === "restart") {
//       for (const task of inProgressTasks) {
//         if (task.pauseComments?.length > 0) {
//           const lastComment = task.pauseComments[task.pauseComments.length - 1];

//           // Count task as active if it's NOT on hold
//           if (lastComment.pauseCondition !== "hold") {
//             activeTaskCount++;

//             // Check if this is a different task from the current one being restarted
//             if (task.taskId !== id) {
//               otherActiveTaskExists = true;
//             }
//           }
//         }
//       }

//       //  Case: One task in progress, but it's not the current task
//       if (activeTaskCount === 1 && otherActiveTaskExists) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Another task is already in progress. Please hold it before resuming this task.",
//         });
//       }

//       //  Case: Two or more tasks active (shouldn't happen)
//       if (activeTaskCount > 1) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Multiple tasks are already in progress. Please hold all other tasks before resuming this one.",
//         });
//       }

//     }
//      //  Case: No task in progress, or only this task is active — allow restart
//     const pauseEntry = {
//       note: note.trim(),
//       pauseCondition: pauseProject.trim(),
//       time: new Date().toISOString(),
//       updatedBy,
//     };

//     const updatedTask = await Task.findOneAndUpdate(
//       { taskId: id },
//       {
//         $push: { pauseComments: pauseEntry },
//       },
//       { new: true }
//     );

//     if (!updatedTask) {
//       return res.status(404).json({
//         success: false,
//         message: "Task not found",
//       });
//     }

//     const taskHoldLogs = new TaskLogsModel({
//       taskId: id,
//       startTime: new Date().toISOString(),
//       status: pauseProject,
//       note: note.trim(),
//       updatedBy,
//     });

//     await taskHoldLogs.save();

//     res.status(200).json({
//       success: true,
//       message: `Task ${
//         pauseProject === "hold" ? "paused" : "resumed"
//       } successfully`,
//       data: updatedTask,
//     });
//   } catch (error) {
//     console.error("Error updating task hold status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

const taskHold = async (req, res) => {
  const { id } = req.params;
  const { pauseProject, note, updatedBy } = req.body;

  try {
    // Validate input
    if (!pauseProject?.trim() || !note?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Both 'pauseProject' and 'note' are required",
      });
    }

    // Check for conflicting active tasks when restarting
    if (pauseProject === "restart") {
      const inProgressTasks = await Task.find({
        status: "in-progress",
        assignedTo: new mongoose.Types.ObjectId(updatedBy),
      });

      let activeTasks = [];

      for (const task of inProgressTasks) {
        const lastComment = task.pauseComments?.[task.pauseComments.length - 1];

        if (lastComment && lastComment.pauseCondition !== "hold") {
          activeTasks.push(task);
        }
      }

      // Block if another task (not the current one) is already active
      if (
        activeTasks.length === 1 &&
        String(activeTasks[0].taskId) !== String(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Another task is already in progress. Please hold it before resuming this task.",
        });
      }

      if (activeTasks.length > 1) {
        return res.status(400).json({
          success: false,
          message:
            "Multiple tasks are already in progress. Please hold all other tasks before resuming this one.",
        });
      }
    }

    // Proceed to pause or resume the task
    const pauseEntry = {
      note: note.trim(),
      pauseCondition: pauseProject.trim(),
      time: new Date().toISOString(),
      updatedBy,
    };

    const updatedTask = await Task.findOneAndUpdate(
      { taskId: id },
      {
        $push: { pauseComments: pauseEntry },
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Save log
    const taskHoldLogs = new TaskLogsModel({
      taskId: id,
      startTime: new Date().toISOString(),
      status: pauseProject,
      note: note.trim(),
      updatedBy,
    });

    await taskHoldLogs.save();

    return res.status(200).json({
      success: true,
      message: `Task ${
        pauseProject === "hold" ? "paused" : "resumed"
      } successfully`,
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task hold status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const testerStatus = async (req, res) => {
  try {
    const { taskId, testerStatus, updatedBy } = req.body;
    console.log("req.body", req.body);

    if (!taskId || !testerStatus || !updatedBy) {
      return res.status(400).json({
        success: false,
        message: "taskId, tasterStatus, and updatedBy are required",
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { taskId: taskId },
      { $set: { testerStatus: testerStatus } },
      { new: true }
    );
    // console.log("update", updatedTask);

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const taskLogEntry = new TaskLogsModel({
      taskId: taskId,
      status: testerStatus !== "1" ? "yet to start" : "start",
      updatedBy,
      startTime: new Date(),
    });

    await taskLogEntry.save();

    res.status(200).json({
      success: true,
      message: "Tester status updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating tester status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// const particularMonthlyReport = async (req, res) => {
//   const { employeeEmail, month } = req.query;

//   try {
//     const [monthNum, year] = month.toString().split("-").map(Number);
//     const daysInMonth = new Date(year, monthNum, 0).getDate();
//     const results = [];

//     for (let day = 1; day <= daysInMonth; day++) {
//       const currentDate = new Date(Date.UTC(year, monthNum - 1, day));
//       const dayStart = new Date(currentDate);
//       const dayEnd = new Date(currentDate);
//       dayEnd.setUTCHours(23, 59, 59, 999);

//       const taskLogsList = await TaskLogsModel.find({
//         status: "in-review",
//         updatedAt: { $gte: dayStart, $lte: dayEnd },
//       });

//       const taskIds = taskLogsList.map((log) => log.taskId);

//       const tasks = await Task.find({
//         taskId: { $in: taskIds },
//         assignedTo: employeeEmail,
//         endTime: { $gte: dayStart, $lte: dayEnd },
//       });

//       const logsMap = await TaskLogsModel.find({ taskId: { $in: taskIds } });

//       const taskWithLogs = tasks.map((task) => ({
//         ...task.toObject(),
//         logs: logsMap.filter((log) => log.taskId === task.taskId),
//       }));

//       results.push({
//         date: dayStart.toISOString().split("T")[0],
//         tasks: taskWithLogs,
//       });
//     }

//     return res.status(200).json({ success: true, data: results });
//   } catch (error) {
//     console.error("Error in particularMonthlyReport:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
const particularMonthlyReport = async (req, res) => {
  const { employeeId, month } = req.query;
  // console.log(employeeId,month)

  try {
    const [monthNum, year] = month.toString().split("-").map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const results = [];
    const today = new Date();
    const todaydate = today.getDate();
    //Attendance functionality
    // const [monthNum, year] = month.toString().split("-").map(Number);

    const start = new Date(Date.UTC(year, monthNum - 1, 1));
    const end = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
    // work time calculation function
    const calculateTime = (entries) => {
      let workTime = 0;
      let breakTime = 0;
      let lastInTime = null;
      let lastBreakOutTime = null;

      entries.sort((a, b) => new Date(a.time) - new Date(b.time));
      let totalBreakInCount = 0;
      for (let i = 0; i < entries.length; i++) {
        const { reason, time } = entries[i];
        const entryTime = new Date(time);

        if (reason === "Break In" || reason === "Login") {
          if (lastBreakOutTime) {
            totalBreakInCount++;
            breakTime += entryTime - lastBreakOutTime;
            lastBreakOutTime = null;
          }
          lastInTime = entryTime;
        }
        if (reason === "Break Out") {
          if (lastInTime) {
            workTime += entryTime - lastInTime;
            lastInTime = null;
          }
          lastBreakOutTime = entryTime;
        }

        if (reason === "Logout") {
          if (lastInTime) {
            workTime += entryTime - lastInTime;
            lastInTime = null;
          }
          if (lastBreakOutTime) {
            breakTime += entryTime - lastBreakOutTime;
            lastBreakOutTime = null;
          }
        }
      }

      const format = (ms) => {
        if (!ms || isNaN(ms)) return { hours: 0, minutes: 0, seconds: 0 };
        return {
          hours: Math.floor(ms / (1000 * 60 * 60)),
          minutes: Math.floor((ms / (1000 * 60)) % 60),
          seconds: Math.floor((ms / 1000) % 60),
        };
      };

      const totalWorkTime = workTime + breakTime;

      return {
        payableTime: format(workTime),
        breakTime: format(breakTime),
        totalWorkTime: format(totalWorkTime),
        totalBreakInCount: totalBreakInCount,
      };
    };

    // ////////
    const user = await Employee.findOne({
      _id: new mongoose.Types.ObjectId(employeeId),
      employeeStatus: "1",
    });
    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const holidaysList = await UpcomingHoliday.find({});
    const attendanceList = await Attendance.find({
      employeeId: user._id,
      date: { $gte: start, $lte: end },
    }).populate(
      "employeeId",
      "_id photo employeeName phoneNumber email employeeType employeeId"
    );
    // console.log("login",attendanceList);
    const leaveList = await Leave.find({
      employeeId: user._id,
      leaveType: "Leave",
      status: "approved",
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    console.log("attendanceList", attendanceList);

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(Date.UTC(year, monthNum - 1, day));
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setUTCHours(23, 59, 59, 999);
      ///////////////////////
      //  Attendance code
      // //////////////////////////
      const attendanceResult = [];
      //  const currentDate = new Date(Date.UTC(year, monthNum - 1, day));
      const currentDateStr = currentDate.toISOString().split("T")[0];
      const options = { weekday: "long", timeZone: "Asia/Kolkata" };
      const dayName = currentDate.toLocaleDateString("en-IN", options);
      const attendance = attendanceList.find((att) => {
        const attDate = new Date(att.date).toISOString().split("T")[0];
        return attDate === currentDateStr;
      });

      const holiday = holidaysList.find(
        (h) => new Date(h.date).toISOString().split("T")[0] === currentDateStr
      );

      if (holiday || (dayName === "Sunday" && !attendance)) {
        //  Case 1: Holiday or Sunday
        attendanceResult.push({
          date: currentDateStr,
          status: "Holiday",
          reason: holiday?.reason || "Sunday",
        });
      } else if (attendance) {
        //  Case 2: Attendance Found
        const attData = attendance.toObject();

        if (attData.entries.length > 0) {
          // Calculate time data (ensure it's an object, not array)
          const timeData = calculateTime(attData.entries);
          console.log("Time data entries:", timeData);

          // Find login and logout entries
          const loginEntry = attData.entries.find((e) => e.reason === "Login");
          const logoutEntry = [...attData.entries]
            .reverse()
            .find((e) => e.reason === "Logout");

          // Format login and logout times
          const loginTime = loginEntry
            ? new Date(loginEntry.time).toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })
            : "-";

          const logout = logoutEntry
            ? new Date(logoutEntry.time).toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })
            : "-";

          // Push one clean object instead of multiple pushes
          attendanceResult.push({
            date: currentDateStr,
            status: "Present",
            loginTime,
            logout,
            ...timeData, // merge calculated values like totalHours, etc.
          });
        } else {
          // If attendance exists but no entries
          attendanceResult.push({
            date: currentDateStr,
            status: "Present",
            loginTime: "-",
            logout: "-",
          });
        }
      } else {
        //  Case 3: No Attendance (check for Leave or Absent)
        const leave = leaveList.find((leave) => {
          const leaveStartStr = new Date(leave.startDate)
            .toISOString()
            .split("T")[0];
          const leaveEndStr = new Date(leave.endDate)
            .toISOString()
            .split("T")[0];

          return (
            leaveStartStr <= currentDateStr && leaveEndStr >= currentDateStr
          );
        });

        if (leave) {
          // Leave found
          attendanceResult.push({
            date: currentDateStr,
            status: "Leave",
            leaveType: leave.leaveType,
            reason: leave.reason,
          });
        } else {
          // Check if date is before joining
          const joiningDate = new Date(user.dateOfJoining);
          const current = new Date(currentDateStr);

          if (current < joiningDate) {
            attendanceResult.push({
              date: currentDateStr,
              status: "-",
              loginTime: "-",
              logout: "-",
            });
          } else {
            attendanceResult.push({
              date: currentDateStr,
              status: "Absent",
              loginTime: "-",
              logout: "-",
            });
          }
        }
      }

      //////////////////////////////////////////

      // Step 1: Get all logs where a task was moved to 'in-review' today
      const taskLogsList = await TaskLogsModel.find({
        status: "in-review",
        updatedAt: { $gte: dayStart, $lte: dayEnd },
      });

      const taskIds = taskLogsList.map((log) => log.taskId);

      // Step 2: Get tasks assigned to this employee & ended today
      const tasks = await Task.find({
        taskId: { $in: taskIds },
        $or: [
          { assignedTo: new mongoose.Types.ObjectId(employeeId) },
          { projectManagerId: new mongoose.Types.ObjectId(employeeId) },
        ],
        endTime: { $gte: dayStart, $lte: dayEnd },
      }).populate({ path: "projectId", select: "name" });

      const taskWithLogs = [];

      for (const task of tasks) {
        const Alllogs = await TaskLogsModel.find({ taskId: task.taskId }).sort({
          startTime: 1,
        });

        // const logs = await TaskLogsModel.find({
        //   taskId: task.taskId,
        //   updatedBy: new mongoose.Types.ObjectId(employeeId),
        // }).sort({
        //   startTime: 1,
        // });

        const logsWithUpdatedBy = [];

        for (const log of Alllogs) {
          let updatedByName = "";

          // Try finding in Employee

          let emp = await Employee.findOne({
            _id: new mongoose.Types.ObjectId(log.updatedBy),
          }).select("employeeName");

          if (emp) {
            updatedByName = emp.employeeName;
          } else {
            // If not in Employee, try User model
            let user = await userModel
              .findOne({ _id: log.updatedBy })
              .select("name");
            updatedByName = user ? user.name : "Unknown";
          }

          logsWithUpdatedBy.push({
            ...log.toObject(),
            updatedByName,
          });
        }

        let findEmployeeName = await Employee.find({
          _id: new mongoose.Types.ObjectId(task.assignedTo),
        }).select("employeeName");

        let taskAssignedName =
          findEmployeeName.length > 0 ? findEmployeeName[0].employeeName : "";
        if (!(findEmployeeName.length > 0)) {
          findEmployeeName = await userModel
            .find({ _id: task.assignedTo })
            .select("name");
          taskAssignedName =
            findEmployeeName.length > 0 ? findEmployeeName[0].name : "";
        }
        // console.log(taskAssignedName);

        // const matchStatus = [
        //   "in-progress",
        //   "hold",
        //   "restart",
        //   "in-review",
        //   "start",
        //   "done",
        // ];

        // new code

        // const allLogs = await TaskLogsModel.find({ taskId: task.taskId }).sort({
        //   createdAt: 1,
        // });
        // console.log("Alllogs", Alllogs);

        // const developerFlow = allLogs.filter((log) =>
        //   devStatuses.includes(log.status)
        // );
        // const testerFlow = allLogs.filter((log) =>
        //   testerStatuses.includes(log.status)
        // );
        // console.log("developerFlow", developerFlow, "testerFlow", testerFlow);

        function splitFlows(logs) {
          const developerFlow = [];
          const testerFlow = [];

          let devStarted = false;
          let testerStarted = false;

          for (const log of logs) {
            // Developer flow: from first "todo" to first "in-review"
            if (!devStarted && log.status === "in-progress") {
              devStarted = true;
            }

            if (devStarted && !testerStarted) {
              developerFlow.push(log);
              if (log.status === "in-review") devStarted = false;
              continue;
            }

            // Tester flow: from first "start" to first "done"
            if (!testerStarted && log.status === "start") {
              testerStarted = true;
            }
            if (testerStarted) {
              testerFlow.push(log);
              if (log.status === "done") testerStarted = false;
            }
          }

          return { developerFlow, testerFlow };
        }

        const { developerFlow, testerFlow } = splitFlows(Alllogs);
        // console.log("developerFlow", developerFlow, "testerFlow", testerFlow);
        // Duration calc (developer flow only)
        let totalDuration = 0;
        let previousTime = null;

        developerFlow.forEach((log) => {
          if (previousTime) {
            // add duration to total BEFORE checking hold
            totalDuration += new Date(log.createdAt) - new Date(previousTime);
          }
          // reset timer if hold → restart
          if (log.status === "hold") {
            previousTime = null;
          } else {
            previousTime = log.createdAt;
          }
        });

        // Convert milliseconds to hours, minutes, seconds
        const totalMinutes = Math.floor(totalDuration / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const seconds = Math.floor(totalDuration / 1000) % 60;

        // console.log({ hours, minutes, seconds });

        // console.log(`Total Duration: ${hours} hours and ${minutes} minutes`);
        //  tester calculation
        let totalDurationTester = 0;
        let previousTimeTester = null;

        testerFlow.forEach((log) => {
          if (previousTimeTester) {
            totalDurationTester +=
              new Date(log.createdAt) - new Date(previousTimeTester);
          }

          // reset timer on hold
          if (log.status === "hold") {
            previousTimeTester = null;
          } else {
            previousTimeTester = log.createdAt;
          }
        });

        // Convert milliseconds to hours, minutes, seconds
        const totalMinutesTester = Math.floor(totalDurationTester / 60000);
        const hoursTester = Math.floor(totalMinutesTester / 60);
        const minutesTester = totalMinutesTester % 60;
        const secondsTester = Math.floor(totalDurationTester / 1000) % 60;

        // console.log(" Tester Time:", {
        //   hours: hoursTester,
        //   minutes: minutesTester,
        //   seconds: secondsTester,
        // });

        // console.log(
        //   `Total Duration: ${hoursTester} hours and ${minutesTester} minutes`
        // );

        taskWithLogs.push({
          taskAssignedName,
          ...task.toObject(),
          logs: logsWithUpdatedBy,

          totalDuration: {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
          },

          totalDurationTester: {
            hours: hoursTester,
            minutes: minutesTester,
            seconds: secondsTester,
          },
          // dayDifference,
          // time: `${hours}h ${minutes}m ${seconds}s`,
        });
      }
      // const date = new Date(); // or use your own date like: new Date("2025-08-07")

      // Convert to Indian time (IST = UTC+5:30)
      // const options = { weekday: "long", timeZone: "Asia/Kolkata" };

      const dayNameTask = dayStart.toLocaleDateString("en-IN", options);
      // const tasksWithAttendance = taskWithLogs.map((task) => ({
      //   ...task,
      //   attendanceResult, // attach it inside each task
      // }));
      // results.push({
      //   dayName: dayNameTask,
      //   date: dayStart.toISOString().split("T")[0],
      //   tasks: tasksWithAttendance,
      // });

      // results.push({
      //   dayName: dayNameTask,
      //   date: dayStart.toISOString().split("T")[0],
      //   attendanceResult: attendanceResult,
      //   tasks:taskWithLogs ,
      // });
      if (taskWithLogs.length > 0) {
        // If tasks exist, add attendance inside each
        const tasksWithAttendance = taskWithLogs.map((task) => ({
          ...task,
          attendanceResult,
        }));

        results.push({
          dayName: dayNameTask,
          date: dayStart.toISOString().split("T")[0],
          tasks: tasksWithAttendance,
        });
      } else {
        // If no tasks, still push attendance info
        results.push({
          dayName: dayNameTask,
          date: dayStart.toISOString().split("T")[0],
          tasks: [
            {
              taskId: null,
              title: "No Tasks",
              attendanceResult,
            },
          ],
        });
      }
    }

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    // console.error("Error in particularMonthlyReport:", error);
    console.error("Error creating task:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// const deleteTaskFileByIndex = async (req, res) => {
//   const { id, index } = req.params;
//   // console.log("Deleting file from project:", id, "at index:", index);
//   // console.log("employeeId", id, "fileIndex", index);
//   try {
//     // console.log("Fetching project with ID:", id);
//     const task = await Task.findById({ _id: id });

//     if (!task) {
//       return res.status(404).json({ message: "TaskModel not found" });
//     }
//     // console.log("employee", task.document);

//     // Search all documents to find the index
//     if (Array.isArray(task.document) && task.document.length > index) {
//       // Optional: Delete all files inside the document (from disk)
//       //   const targetDoc = employee.document[index];

//       //  if (targetDoc.files && Array.isArray(targetDoc.files)) {
//       //   targetDoc.files.forEach(file => {
//       //     const fs = require("fs");
//       //     const path = require("path");
//       //     const filePath = path.join("uploads", file.fileName); // adjust path if needed
//       //     if (fs.existsSync(filePath)) {
//       //       fs.unlinkSync(filePath); // delete file from disk
//       //     }
//       //   });
//       // }

//       //  Delete the document object at index
//       task.document.splice(index, 1);

//       // Save changes to DB
//       await task.save();

//       res.status(200).json({
//         message: `Document at index ${index} deleted successfully.`,
//         updatedDocuments: task.document,
//       });
//     } else {
//       res.status(404).json({
//         message: `Document not found at index ${index}.`,
//       });
//     }

//     // return res.status(404).json({ message: "File index not found in any document" });
//   } catch (error) {
//     // console.error("Delete error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// const deleteTaskFileByIndex = async (req, res) => {
//   try {
//     const { id, index } = req.params; // id = taskId

//     // 1️ Fetch task document record
//     const docRecord = await TaskDocument.findOne({ taskId: id });

//     if (!docRecord) {
//       return res.status(404).json({ message: "TaskDocument not found" });
//     }

//     // 2️ Validate document index
//     if (!Array.isArray(docRecord.document) || index >= docRecord.document.length) {
//       return res.status(404).json({
//         message: `Document not found at index ${index}.`,
//       });
//     }

//     // 3️ Get file information before deletion
//     const targetDoc = docRecord.document[index];

//     const filePath = path.join("uploads", "others", targetDoc.filepath);
//     // Example: /uploads/others/1754040299799-Validation.png
//     console.log("filePath",filePath);
//     // 4️ Delete the file from disk
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//       console.log("Deleted file:", filePath);
//     } else {
//       console.log("File not found on disk:", filePath);
//     }

//     // 5️ Remove the document entry from array
//     docRecord.document.splice(index, 1);

//     // 6 Save update
//     await docRecord.save();

//     return res.status(200).json({
//       message: "File deleted successfully",
//       updatedDocuments: docRecord.document,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// test
const deleteTaskFileByIndex = async (req, res) => {
  try {
    const { id, index } = req.params; // id = taskId (or TaskDocument._id depending on your routing)

    // 1) Fetch the TaskDocument record (use findOne for single-record-per-task)
    const docRecord = await TaskDocument.findOne({ taskId: id });
    if (!docRecord) {
      return res.status(404).json({ message: "TaskDocument not found" });
    }

    // 2) Validate index
    if (
      !Array.isArray(docRecord.document) ||
      index < 0 ||
      index >= docRecord.document.length
    ) {
      return res
        .status(404)
        .json({ message: `Document not found at index ${index}.` });
    }

    // 3) Target document entry
    const targetDoc = docRecord.document[index];
    const storedPath = targetDoc.filepath || targetDoc.path || "";

    // 4) Build absolute path robustly
    // If storedPath already includes 'uploads' assume it's relative to project root (or absolute)
    // Otherwise assume it's just filename and placed in uploads/others/
    let absolutePath;
    if (!storedPath) {
      // No filepath stored — just remove DB entry
      docRecord.document.splice(index, 1);
      await docRecord.save();
      return res.status(200).json({
        message: "Document entry removed (no file path stored).",
        updatedDocuments: docRecord.document,
      });
    }

    // Normalize separators and handle absolute/relative
    const normalized = storedPath.replace(/\\/g, "/"); // unify
    if (normalized.includes("uploads/")) {
      // e.g. 'uploads/others/name.png' or '/uploads/others/name.png'
      absolutePath = path.resolve(process.cwd(), normalized);
    } else {
      // fallback: assume file is in uploads/others/<filename>
      absolutePath = path.resolve(
        process.cwd(),
        "uploads",
        "others",
        path.basename(normalized)
      );
    }

    // 5) Attempt deletion with better logging
    try {
      const exists = fs.existsSync(absolutePath);
      console.log("delete: checking path:", absolutePath, "exists:", exists);

      if (exists) {
        // use promise-based unlink
        await fs.promises.unlink(absolutePath);
        console.log("Deleted file:", absolutePath);
      } else {
        console.log("File not found on disk (no delete):", absolutePath);
      }
    } catch (fsErr) {
      // Log detailed fs error but continue to remove DB entry if that's desired
      console.error("File deletion error:", fsErr);
      // you can choose to return error here; I prefer to continue and remove DB entry to avoid stale refs:
      // return res.status(500).json({ message: "Failed to delete file from disk", error: fsErr.message });
    }
    // 6) Remove DB entry from documents array and save
    docRecord.document.splice(index, 1);
    await docRecord.save();

    return res.status(200).json({
      message: "File entry removed successfully (and file deleted if present).",
      updatedDocuments: docRecord.document,
    });
  } catch (error) {
    console.error("deleteTaskFileByIndex error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  particularTask,
  particularTaskComments,
  getParticularTaskComments,
  taskHold,
  allTaskList,
  tasklogsList,
  testerStatus,
  particularMonthlyReport,
  deleteTaskFileByIndex,
  allTaskCompletedList,
  allTaskListById,
  particularTaskById,
};
