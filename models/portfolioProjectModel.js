import mongoose from "mongoose";

const portfolioProjectSchema = new mongoose.Schema({
  technologyPortfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TechnologyPortfolio",
  },
  title:{type:String},
  link:{type:String},
  documents: [
      {
        filepath: String,
        originalName: String,
      },
    ],
  status: { type: String, default: "1" },
}, {
  timestamps: true
});

const portfolioProject = mongoose.model("PortfolioProject", portfolioProjectSchema);
export default portfolioProject;
