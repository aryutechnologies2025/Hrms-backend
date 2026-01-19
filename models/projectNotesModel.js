import mongoose from "mongoose";

const projectNotesSchema = new mongoose.Schema({
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:[true,"Please provide a project ID"]
    },
    title:{
        type:String,
        required:[false,"Please provide a title"]
    },
    description:{
        type:String,
        required:[true,"Please provide a description"]    
    },
    documents: [
      {
        filepath: String,
        originalName: String,
      },
    ],
    reporter:{
        type:String,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
       
       required: true,
    }
},{
    timestamps:true,
});
projectNotesSchema.index({ title: 1 }); 

const ProjectNotes = mongoose.model("ProjectNotes",projectNotesSchema);
 export default ProjectNotes;
