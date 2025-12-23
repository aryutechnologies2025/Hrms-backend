import mongoose from "mongoose";
const biddingStatusLogSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "AccountBidder" },
    client: { type: String, required: [true, "Please provide a client"] },
    technology: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechnologyBidder",
    },
    status: { type: String },
    date: { type: Date },
  },
  { timestamps: true }
);
const BiddingStatusLog = mongoose.model(
  "BiddingStatusLog",
  biddingStatusLogSchema
);
export default BiddingStatusLog;
