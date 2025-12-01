import Counter from "../models/counterModel.js";
import SubTask from "../models/subTaskModel.js";
import TaskLogsModel from "../models/taskLogsModel.js";
import Task from "../models/taskModal.js";




const generateTaskId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { id: "taskId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = counter.seq.toString().padStart(3, "0"); // AY001, AY002
  return `AY${paddedSeq}`;
};

//  Create Subtask
const createSubTask = async (req, res) => {
  try {
    const {
      taskId,
      projectId,
      title,
      assignTo,
      status,
      priority,
      startDate,
      dueDate,
      createdById,
      projectManagerId,
      projectDescription
    } = req.body;

    // Check if task exists
    const taskExists = await Task.findById(taskId);
    if (!taskExists) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskExists.status !== "todo" && taskExists.status !== "in-progress") {
      return res
        .status(400)
        .json({ message: "Cannot add subtask to a completed task" });
    }
     // Generate taskId
    const taskIdNumber = await generateTaskId();

    const subtask = await SubTask.create({
      taskId:taskIdNumber,
      mainTaskId: taskId,
      title,
      assignedTo: assignTo,
      status,
      priority,
      startDate,
      dueDate,
      createdById,
      projectId,
      projectManagerId,
      projectDescription
    });

    const taskLog = {
      taskId: taskId,
      startTime: new Date(),
      status: "todo",
      updatedBy: createdById,
    };
    const taskLogEntry = new TaskLogsModel(taskLog);
    await taskLogEntry.save();

    res.status(201).json({ message: "Subtask created successfully", subtask });
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
      message: error.message,
    });
  }
};
//  Get all subtasks of a task
const getSubTasksByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const subtasks = await SubTask.find({_id: taskId }).populate(
      "assignedTo",
      "name email"
    );


    res.status(200).json({ count: subtasks.length, subtasks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching subtasks", error });
  }
};

//  Update subtask (status or any field)
const updateSubTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log("Updating subtask with ID:",  req.params, "with updates:", updates);

    const updatedSubTask = await SubTask.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedSubTask) {
      return res.status(404).json({ message: "Subtask not found" });
    }
     const taskLog = {
      taskId: id,
      startTime: new Date(),
      status: updates.status || updatedSubTask.status,
      updatedBy: updates.updatedBy,
    };
    const taskLogEntry = new TaskLogsModel(taskLog);
    await taskLogEntry.save();
    
    res.status(200).json({ message: "Subtask updated", subTask: updatedSubTask });
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

//  Delete Subtask
const deleteSubTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SubTask.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    res.status(200).json({ message: "Subtask deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subtask", error });
  }
};
export { createSubTask, getSubTasksByTask, updateSubTask, deleteSubTask };
