import mongoose from "mongoose";

const biddingTransactionReportsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    accountName: { type: mongoose.Schema.Types.ObjectId, ref: "AccountBidder" },
    transactionId: String,
    transactionType: String,
    transactionSummary: String,
    transactionSummaryDetails: String,

    description1: String,
    description2: String,
    description3: String,
    enteredDescription: String,

    agencyTeam: String,
    freelancer: String,
    clientTeam: String,
    referenceId: String,

    amountDollar: Number,
    amountINR: Number,

    currency: String,
    currentBalance: Number,
    paymentMethod: String
  },
  { timestamps: true }
);
biddingTransactionReportsSchema.index(
  { transactionId: 1, date: 1, accountName: 1 },
  { unique: true }
);

export default mongoose.model(
  "BiddingTransactionReports",
  biddingTransactionReportsSchema
);
