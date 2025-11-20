import mongoose from "mongoose";

const statementSchema = new mongoose.Schema(
  {
    date: {
         type: Date, 
         default: Date.now, 
         required: false 
        },
    narration: { type: String },
    ledger: { type: String },
    reason: { type: String },
    amount: { type: Number },
    type: {
         type: String,
        enum: ["credit", "debit"] 
    },
    createdBy:
     { type: String , default: "Admin" },
    dateTime:
     { type: Date },
  },
  { timestamps: true }
);

const Statement = mongoose.model("Statement", statementSchema);
export default Statement;
