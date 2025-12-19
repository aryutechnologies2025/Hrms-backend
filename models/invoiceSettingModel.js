import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const settingsInvoiceSchema = new mongoose.Schema(
  {

    invoiceAddress: { type: String, required: [false, "Please provide a invoiceAddress"] },
    invoiceState: {
      type: String,
      required: [false, "Please provide a invoice state"],
    },
    invoiceCity: {
      type: String,
      required: [false, "Please provide a invoice city"],
    },
    invoiceGstin: {
      type: String,
      required: [false, "Please provide a invoice GstIn"],
    },
    invoiceEmail: {
      type: String,
      required: [false, "Please provide a invoice Email"],
    },
    invoicePhone: {
      type: String,
      required: [false, "Please provide a  invoice Phone"],
    },
    accountName: {
      type: String,
      required: [false, "Please provide a account Name"],
    },
    bankName: {
      type: String,
      required: [false, "Please provide a bank Name"],
    },
    accountNumber: {
      type: String,
      required: [false, "Please provide a account Number"],
    },
    ifscCode: {
      type: String,
      required: [false, "Please provide a Ifsc Code"],
    },
    branchName: {
      type: String,
      required: [false, "Please provide a branch Name"],
    },
    invoiceTerms: {
      type: String,
      required: [false, "Please provide a invoice Terms"],
    },
    cgst : {
      type: String,
      required: [false, "Please provide a CGST "],
    },
    sgst : {
      type: String,
      required: [false, "Please provide a SGST "],
    },
    isgt : {
      type: String,
      required: [false, "Please provide a ISGT "],
    },
    igst : {
      type: String,
      required: [false, "Please provide a IGST "],
    },


  },
  {
    timestamps: true,
  }
);


const SettingInvoices = mongoose.model("InvoiceSettings", settingsInvoiceSchema);
export default SettingInvoices;
