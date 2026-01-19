import mongoose from "mongoose";
const digitalMarketingSchema = new mongoose.Schema({
    taskId:{
        type:String,
    },
    task:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Task",
        required:[false,"Please provide a task ID"]
    },
    projectId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:[false,"Please provide a project ID"]
    },
    title:{
        type:String,
    },
    description:{
        type:String,
    },
    postType:{
        type:String,
    },
    postUrl:{
        type:String,
    },
    postDate:{
        type:Date,
        default:Date.now
    },
    documents: [
          {
            filepath: String,
            originalName: String,
          },
        ],
    status:{
        type:String,
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        required:[false,"Please provide a  ID"]
    }
},{
    timestamps: true
});

const DigitalMarketing = mongoose.model("DigitalMarketing", digitalMarketingSchema);
export default DigitalMarketing;