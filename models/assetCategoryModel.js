import mongoose from "mongoose";
const assetCategoryDetails = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide a name"]
    },
    status:{type:String, 
        required: [true, "Please provide a status"]
    },

   
} ,{
    timestamps:true,
});
assetCategoryDetails.index({ name: 1 }); // 1 = ascending

const AssetCategory = mongoose.model("AssetCategory",assetCategoryDetails);
 export default AssetCategory; 