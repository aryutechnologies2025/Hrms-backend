// import mongoose from "mongoose";


// const assetSchema = new mongoose.Schema({
//      invoiceNumber: { 
//     type: String, 
//     required: [true, "Please provide a serial number"] 
//   },
//    purchasedDate: 
//   {
//      type: Date, 
//     // type:String,
//     default: Date.now, 
//     required: [true, "Please provide a date"] 
//   }, // stores date + time by default
//   Ledger: {
//     type: String, 
//     required: [true, "Please provide a name"]
//   },
 
//   assetCategory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "AssetCategory",
//     required: [true, "Please provide a category"],  
//   },
//   assetSubCategory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "SubCategory",
//     required: [true, "Please provide a subCategory"],  
//   },
//   depricationPercentage: {
//       type: Number,
//        required: [
//           true,
//           "Please provide a deprication percentage",
//       ]
//   },
  
//   quantity: { 
//     type: Number,
//      required: [true, "Please provide a count"] 
//     },
 
// //   rate: {
// //      type: Number,
// //       required: [
// //         function () {
// //           return this.count > 1;
// //         },
// //         "Please provide a cost",
// //       ] 
// //     },

//     eachCost: {
//         type: Number,
//          required: [
//            function () {
//              return this.count > 1;
//            },
//            "Please provide a cost",
//          ] 
//        },
//     totalCost: {
//         type: Number,
//          required: [
//            true,
//            "Please provide a cost",
//          ] 
//        },   

//     gstRate: {
//         type: Number,
//         default: 18
//     },

//   taxable: { 
//     type: Number, 
//     required: [true, "Please provide a cost"] 
//   },
//   cgst: {
//     type: Number,
//   },
//   sgst: {
//     type: Number,
//   },
//   igst: {
//     type: Number,
//   },
//   invoiceValue: {
//      type: Number,
//       required: [
//         true,
//         "Please provide a invoice value",
//       ]
//    },
//   warrantyYear: { 
//     type: Number, 
//     required: [true, "Please provide a year"]
//    },
   
//   disposedDate: { 
//     type: Date,
//     // type:String,
//      default: Date.now, 

//   }, // stores date + time by default
// fileUpload: {
//   type: String,
//    required: [true, "Please upload an asset file (image/pdf)"]
// }
// },
//  {
//   timestamps: true // adds createdAt and updatedAt fields
// }

// );


// assetSchema.index({ assetName: 1 });
// assetSchema.index({ serialNumber: 1 }, { unique: true });

// assetSchema.pre("save", function (next) {
//   this.totalCost = this.eachCost * this.count;
//   next();
// })

// assetSchema.pre("findOneAndUpdate", function (next) {
//   const update=this.getUpdate();
  
//   this.totalCost = this.eachCost * this.count;
//   next();
// })
// const Asset = mongoose.model("Asset", assetSchema);
// export default Asset;




import mongoose from "mongoose";


const assetSchema = new mongoose.Schema({
  assetCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssetCategory",
    required: [true, "Please provide a category"],  
  },
  assetName: {
    type: String, 
    required: [true, "Please provide a name"]
  },
  serialNumber: { 
    type: Number, 
    required: [true, "Please provide a serial number"] 
  },
  count: { 
    type: Number,
     required: [true, "Please provide a count"] 
    },
  purchasedDate: 
  {
     type: Date, 
    // type:String,
    default: Date.now, 
    required: [true, "Please provide a date"] 
  }, // stores date + time by default
  eachCost: {
     type: Number,
      required: [
        function () {
          return this.count > 1;
        },
        "Please provide a cost",
      ] 
    },
  totalCost: { 
    type: Number, 
    required: [true, "Please provide a cost"] 
  },
  warrantyYear: { 
    type: Number, 
    required: [true, "Please provide a year"]
   },
  disposedDate: { 
    type: Date,
    // type:String,
     default: Date.now, 
    required: [true, "Please provide a date"] 
  }, // stores date + time by default
fileUpload: {
  type: String,
   required: [true, "Please upload an asset file (image/pdf)"]
}
},
 {
  timestamps: true // adds createdAt and updatedAt fields
}
// {
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


assetSchema.index({ assetName: 1 });
assetSchema.index({ serialNumber: 1 }, { unique: true });

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




const createAsset = async (req, res) => {


  try {
   
    const {
      assetCategory,
      assetName,
      serialNumber,
      count,
      purchasedDate,    
      eachCost,
      totalCost,
      warrantyYear,
      disposedDate,
      fileUpload,
    } = req.body;

    let fileName = null;

if (req.file) {
  fileName = req.file.filename;          // single upload
} else if (req.files && req.files.fileUpload) {
  fileName = req.files.fileUpload[0].filename;   // multiple files
}


    const newAsset = new Asset({
      assetCategory,
      assetName,
      serialNumber,
      count,
      purchasedDate,    
      eachCost,
      totalCost,
      warrantyYear,
      disposedDate,
      fileUpload : fileName
    });

    const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

    const savedAsset = await newAsset.save();
    const obj = savedAsset.toObject();

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: {  ...obj,
    purchasedDate: formatDate(obj.purchasedDate),
    disposedDate: formatDate(obj.disposedDate)}
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      // message: "Internal server error",
      message: error.message,
      errors: error.errors,
      // error: error.message,
    });
  }
};
