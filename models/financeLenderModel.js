import mongoose from "mongoose";
const financeLenderSchema = new mongoose.Schema({
    name:{type:String,required:[true,"Please provide a name"]},
    status:{type:String, default:"1", required:[true,"Please provide a status"]},
},{
    timestamps: true
});

const FinanceLender = mongoose.model("FinanceLender",financeLenderSchema);
export default FinanceLender;