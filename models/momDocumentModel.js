
import mongoose, { Schema } from "mongoose";
const momDocumentSchema = new mongoose.Schema(
  {
    date: {
      type: String,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientDetails",
      required: [true, "Please provide the client Name"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Please provide the Project"],
    },

    title: {
      type: String,
      required: [true, "Please provide the Project"],
    },
    description: {
      type: String,
      required: [true, "Please provide the Project"],
    },
    documents: [
      {
        type: Object,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // createdByModel: {
    //   type: String,
    //   required: true,
    //   enum: ["Employee", "ClientDetails"],
    // },

    updatedBy: {
      type: String,
    },

    deleteBy: {
      type: String,
    },
     isDeleted: {
      type: String,
      default: "0",
    },
    status: {
      type: String,
      default: "1",
    },
  },
  {
    timestamps: true,
  }
);

const MomDocument = mongoose.model("MomDocument", momDocumentSchema);
export default MomDocument;
