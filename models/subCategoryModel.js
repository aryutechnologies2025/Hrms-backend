import mongoose from "mongoose";
const subCategorySchema = new mongoose.Schema({
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
subCategorySchema.index({ name: 1 }); // 1 = ascending

const SubCategory = mongoose.model("SubCategory",subCategorySchema);
 export default SubCategory; 