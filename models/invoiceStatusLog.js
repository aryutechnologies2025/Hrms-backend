import mongoose from "mongoose";
const invoiceStatusLogSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "ClientDetails" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    paymentType: {
      type: String,
      required: [false, "Please provide a payment type"],
    },
    status: { type: String, required: [false, "Please provide a status"] },
    amount: {
      type: String,
      required: [false, "Please provide a payment amount"],
    },
    paidDate: {
      type: Date,
      required: [false, "Please provide a payment date"],
    },
  },
  { timestamps: true }
);
const InvoiceStatusLog = mongoose.model(
  "InvoiceStatusLog",
  invoiceStatusLogSchema
);
export default InvoiceStatusLog;
