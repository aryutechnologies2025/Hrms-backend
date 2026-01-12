import mongoose from "mongoose";

const invoice = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "ClientDetails" },
    invoice_number: {
      type: String,
      required: [true, "Please provide a invoice number"],
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    invoice_date: {
      type: Date,
      required: [false, "Please provide a invoice date"],
    },
    due_date:{type:Date,required:[true,"Please provide a due date"]},
    currency: { type: String, required: [false, "Please provide a currency"] },
    items: [
      {
        hsnCode: { type: String, required: [false, "Please provide a hsnCode"] },
        description: {
          type: String,
          required: [false, "Please provide a description"],
        },
        quantity: {
          type: Number,
          required: [false, "Please provide a quantity"],
        },
        rate: { type: Number, required: [false, "Please provide a rate"] },
        amount: { type: Number, required: [false, "Please provide a amount"] },
      },
    ],

    tax: { type: String, required: [false, "please provide a tax"] },
    total_amount: {
      type: String,
      required: [false, "please provide a total amount"],
    },
    subTotal: {
      type: String,
      required: [false, "please provide a sub total"],
    },
    igst: { type: String, required: [false, "please provide a igst"] },
    cgst: { type: String, required: [false, "please provide a cgst"] },
    sgst: { type: String, required: [false, "please provide a sgst"] },
    notes:{type:String,required:[false,"Please provide a notes"]},
    invoice_type:{type:String,required:[false,"Please provide a invoice type"]},
      paymentType:{type:String,required:[false,"Please provide a payment type"]},
      amount:{type:String,required:[false,"Please provide a payment amount"]},
      // paidDate:{type:Date,required:[false,"Please provide a payment date"]},
    status: { type: String, required: [false, "Please select a status"] },
    paid_date:{type:String},
    documents: [
         {
      fieldname: String,
      originalName: String,
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      invoice_document_type: String,
      select: {
      type: Boolean,
      default: false,
    },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
    is_deleted: { type: Boolean, default: '0' },
  },
  {
    timestamps: true,
  }
);
invoice.index({ clientId: 1, status: 1 });
const Invoice = mongoose.model("Invoice", invoice);
export default Invoice;

