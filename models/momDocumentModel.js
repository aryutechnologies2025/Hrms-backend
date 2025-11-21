import mongoose, { Schema } from "mongoose";
const momDocumentSchema = new mongoose.Schema(
  {
    project:{
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

    editBy: {
      type: String,
    },

    deleteBy: {
      type: String,
    },
    status:{
      type:String,default:"1"
    }
  },
  {
    timestamps: true,
  }
);

const MomDocument = mongoose.model("MomDocument", momDocumentSchema);
export default MomDocument;
