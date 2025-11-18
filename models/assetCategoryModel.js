import mongoose from "mongoose";
const assetCategoryDetails = new mongoose.Schema({
    title:{type:String,required:[true,"Please provide a title"]},
    status:{type:String, required: [true, "Please provide a status"]},

   
} ,{
    timestamps:true,
});
assetCategoryDetails.index({ title: 1 }); // 1 = ascending

const AssetCategory = mongoose.model("AssetCategory",assetCategoryDetails);
 export default AssetCategory; 