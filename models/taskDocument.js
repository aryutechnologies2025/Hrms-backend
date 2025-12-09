// models/documentModel.js
import mongoose from "mongoose";

const TaskDocumentSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,   // TASK-101
      required: true,
      index: true
    },
    document: [
      {
        type: Object, // Can be enhanced with detailed structure if needed
      },
    ],

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const TaskDocument = mongoose.model("taskDocument", TaskDocumentSchema);
export default TaskDocument;
