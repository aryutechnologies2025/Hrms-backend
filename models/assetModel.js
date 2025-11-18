import mongoose from "mongoose";


const assetSchema = new mongoose.Schema({
    assetName:{type:String},
    serialNumber:{type:Number},
    count:{type:Number},
  purchasedDate: { type: Date , default: Date.now }, // stores date + time by default
  eachCost: { type: Number },
  totalCost: { type: Number },
  warrantyYear: { type: Number },
  disposedDate: { type: Date , default: Date.now },
  
}, {
  timestamps: true // adds createdAt and updatedAt fields
});


assetSchema.index({ assetName:1});
assetSchema.index({ serialNumber: 1 }, { unique: true });

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;




