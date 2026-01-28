import mongoose from "mongoose";

const portfolioTechnologyBidderSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please provide a name"] },
  status: { type: String, default: "1" },
}, {
  timestamps: true
});

const TechnologyPortfolio = mongoose.model("TechnologyPortfolio", portfolioTechnologyBidderSchema);
export default TechnologyPortfolio;
