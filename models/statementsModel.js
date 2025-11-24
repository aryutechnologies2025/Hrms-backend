import mongoose from "mongoose";

const statementSchema = new mongoose.Schema(
  {
    date: {
         type: String
        },
    narration: { type: String ,
      required: [true, "Please provide a narration"] 
    },
    ledger: { 
      type: String,
      required: [true, "Please provide a ledger"]
    },
    reason: { 
      type: String,
      
     },
    amount: { 
      type: Number ,
      required: [true, "Please provide an amount"]
    },
    type: {
         type: String,
        enum: ["credit", "debit"] ,
        required: [true, "Please provide a type"]
    },
    createdBy:
     { type: String , 
      default: "Admin" 
    },
    dateTime:
     { type: Date },
      
     account: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "FinanceCompany",
         required: [true, "Please provide a category"],  
       },
       notes: { type: String,  },
     
  },
  { timestamps: true }
);

const Statement = mongoose.model("Statement", statementSchema);
export default Statement;
