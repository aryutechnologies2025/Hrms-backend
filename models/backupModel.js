import mongoose from "mongoose";
const backupSchema = new mongoose.Schema({
    date:{type:String,required:[true,"Please provide a Date and Time"]},
    projectList:{type:String,required:[true,"Please provide a Project List"]},
    type:{type:String,required:[true,"Please provide a Type"]},
   documents: [
      {
        filepath: String,
        originalName: String,
      },
    ],
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: [true, "Please provide the Employee"],
    }
},{
    timestamps: true
});

const Backup = mongoose.model("Backup",backupSchema);
export default Backup;