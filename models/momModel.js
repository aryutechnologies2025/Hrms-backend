import mongoose, { Schema } from "mongoose";
const Mom = new mongoose.Schema(
  {
    date: {
      type: String,
    },
    clientName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientDetails",
      required: [true, "Please provide the client Name"],
    },
    projectName: {
       type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Please provide the Project"],
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: [true, "Please provide the Employee"],
      },
    ],
    employee: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: [true, "Please provide the Employee"],
      },
    
    description: {
      type: String,
      required: [true, "Please provide the description"],
    },
    documents: [
      {
        type: Object,
      },
    ],
  },
  { timestamps: true }
);

const MomModel = mongoose.model("Mom", Mom);
export default MomModel;
