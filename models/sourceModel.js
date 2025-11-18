import mongoose from "mongoose";
const sourceSchema = new mongoose.Schema({
    name:{type:String, required:[true, "Please provide a name"]},
    status:{type:String, default:"1", required:[true, "Please provide a status"]},
},{
    timestamps: true
});

const Source = mongoose.model("Source", sourceSchema);
export default Source;