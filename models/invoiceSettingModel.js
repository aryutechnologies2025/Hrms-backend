import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const settingsInvoiceSchema = new mongoose.Schema(
  {

    invoiceAddress: { type: Number, required: [false, "Please provide a invoiceAddress"] },
    invoiceState: {
      type: Number,
      required: [false, "Please provide a invoice state"],
    },
    invoiceCity: {
      type: Number,
      required: [false, "Please provide a invoice city"],
    },
    invoiceGstin: {
      type: Number,
      required: [false, "Please provide a invoice GstIn"],
    },
    invoiceEmail: {
      type: Number,
      required: [false, "Please provide a invoice Email"],
    },
    invoicePhone: {
      type: Number,
      required: [false, "Please provide a  invoice Phone"],
    },
    accountName: {
      type: Number,
      required: [false, "Please provide a account Name"],
    },
    bankName: {
      type: Number,
      required: [false, "Please provide a bank Name"],
    },
    accountNumber: {
      type: Number,
      required: [false, "Please provide a account Number"],
    },
    ifscCode: {
      type: Number,
      required: [false, "Please provide a Ifsc Code"],
    },
    branchName: {
      type: Number,
      required: [false, "Please provide a branch Name"],
    },
    invoiceTerms: {
      type: Number,
      required: [false, "Please provide a invoice Terms"],
    },
    cgst : {
      type: Number,
      required: [false, "Please provide a CGST "],
    },
    sgst : {
      type: Number,
      required: [false, "Please provide a SGST "],
    },
    isgt : {
      type: Number,
      required: [false, "Please provide a ISGT "],
    },
    igst : {
      type: Number,
      required: [false, "Please provide a IGST "],
    },


  },
  {
    timestamps: true,
  }
);


const SettingInvoices = mongoose.model("InvoiceSettings", settingsInvoiceSchema);
export default SettingInvoices;
