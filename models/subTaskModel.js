import mongoose from "mongoose";

const SubTaskSchema = new mongoose.Schema(
  {
    mainTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      
    },
   taskId: { type: String, unique: true }, // Auto-increment field
    title: {
      type: String,
      required: [true, "Please provide subtask title"],
      trim: true,
    },
   createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "in-review", "blocked", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },

    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },

    pauseComments: [
      {
        note: { type: String, default: "" },
        pauseCondition: { type: String, default: "" },
        time: { type: Date, default: Date.now },
      },
    ],
     projectManagerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
          required: [false, "Please provide a project manager id"],
        },
    testerStatus: { type: String, default: "0" },
    projectDescription: { type: String, default: "" ,required:false},
  },
  { timestamps: true }
);

const SubTask = mongoose.model("SubTask", SubTaskSchema);
export default SubTask;
