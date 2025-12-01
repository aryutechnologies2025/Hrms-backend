import mongoose from "mongoose";


const assetSchema = new mongoose.Schema({
     invoiceNumber: { 
    type: String, 
    required: [true, "Please provide a invoice number"] 
  },
   purchasedDate: 
  {
     type: Date, 
    // type:String,
    default: Date.now, 
    required: [true, "Please provide a date"] 
  }, // stores date + time by default
  ledger: {
    type: String, 
    required: [true, "Please provide a name"]
  },
 
  assetCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssetCategory",
    required: [true, "Please provide a category"],  
  },
  assetSubCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: [true, "Please provide a subCategory"],  
  },
  title: {
    type: String, 
    required: [true, "Please provide a title"]
  },
  depreciationPercentage: {
      type: Number,
       required: [
          true,
          "Please provide a deprication percentage",
      ]
  },
  
  quantity: { 
    type: Number,
     required: [true, "Please provide a count"] 
    },
 
  rate: {
     type: Number,
      required: [
    true,
        "Please provide a rate",
      ] 
    },

    // eachCost: {
    //     type: Number,
    //      required: [
    //        function () {
    //          return this.count > 1;
    //        },
    //        "Please provide a cost",
    //      ] 
    //    },
    // totalCost: {
    //     type: Number,
    //      required: [
    //        true,
    //        "Please provide a cost",
    //      ] 
    //    },   

    gstRate: {
        type: Number,
        
    },

  taxable: { 
    type: Number, 
    required: [true, "Please provide a cost"] 
  },
  cgst: {
    type: Number,
  },
  sgst: {
    type: Number,
  },
  igst: {
    type: Number,
  },
  invoiceValue: {
     type: Number,
      required: [
        true,
        "Please provide a invoice value",
      ]
   },
  warrantyYear: { 
    type: Number, 
    required: [true, "Please provide a year"]
   },
   
  disposedDate: { 
    type: Date,
    // type:String,
     default: Date.now, 

  }, // stores date + time by default
fileUpload: [{
  type: String,
   required: [true, "Please upload an asset file (image/pdf)"]
}]
},
 {
  timestamps: true // adds createdAt and updatedAt fields
}
// {    //date split
//   timestamps: true,
//   toJSON: {
//     transform(doc, ret) {
//       if (ret.purchasedDate)
//         ret.purchasedDate = new Date(ret.purchasedDate).toISOString().split("T")[0];

//       if (ret.disposedDate)
//         ret.disposedDate = new Date(ret.disposedDate).toISOString().split("T")[0];

//       return ret;
//     }
//   }}
);


// assetSchema.index({ assetName: 1 });
// assetSchema.index({ invoiceNumber: 1 }, { unique: true });

assetSchema.pre("save", function (next) {
  this.totalCost = this.eachCost * this.count;
  next();
})

assetSchema.pre("findOneAndUpdate", function (next) {
  const update=this.getUpdate();
  
  this.totalCost = this.eachCost * this.count;
  next();
})
const Asset = mongoose.model("Asset", assetSchema);
export default Asset;
