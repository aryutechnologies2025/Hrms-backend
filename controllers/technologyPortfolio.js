import TechnologyPortfolio from "../models/portfolioTechnologiesModel.js";
import PortfolioProject from "../models/portfolioProjectModel.js";

const createTechnologyPortfolio = async (req, res) => {
  try {
    const { name } = req.body;
    const newTechnologyPortfolio = new TechnologyPortfolio({ name });
    const savedTechnologyPortfolio = await newTechnologyPortfolio.save();
    res.status(201).json({ success: true, data: savedTechnologyPortfolio });
  } catch (error) {
    // console.error(" Error creating project:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getTechnologyPortfolio= async (req, res) => {
  try {
    const TechnologyPortfolioDetails = await TechnologyPortfolio.find();
    res.status(200).json({ success: true, data: TechnologyPortfolioDetails });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const editTechnologyPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
     const updated = await TechnologyPortfolio.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Technology Portfolio not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteTechnologyPortfolio = async (req, res) => {
  const {id} = req.params;
  try {
    const deleted = await TechnologyPortfolio.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Technology Portfolio not found" });
    }
    res.status(200).json({ success: true, message: "Technology Portfolio deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}


//portfo project list
const createPortfolioProject = async (req, res) => {
  try {
    const { technologyPortfolio,title,link,documents,status } = req.body;
     const documentArray = [];
        if (Array.isArray(req.files)) {
            req.files.forEach((file) => {
                if (file.fieldname === "portfolioDocuments") {
                    documentArray.push({
                        filepath: file.filename,
                        originalName: file.originalname,
                    });
                }

            });
        }
    const newTechnologyProject = new PortfolioProject({  technologyPortfolio,title,link,documents:documentArray,status });
    const savedTechnologyProject = await newTechnologyProject.save();
    res.status(201).json({ success: true, data: savedTechnologyProject });
  } catch (error) {
    // console.error(" Error creating project:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getTechnologyProject= async (req, res) => {
  try {
    const TechnologyProjectDetails = await PortfolioProject.find().populate("technologyPortfolio", "name")
    .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: TechnologyProjectDetails });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const editTechnologyProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { technologyPortfolio,title,link,documents,status } = req.body;
    const newDocuments = [];

    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            if (file.fieldname === "portfolioDocuments") {
                newDocuments.push({
                    filepath: file.filename,
                    originalName: file.originalname,
                });
            }
        });
    }
     const updated = await PortfolioProject.findByIdAndUpdate(  id,
            {technologyPortfolio,title,link,documents : newDocuments,status},
            { new: true }
        );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Portfolio Project not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteTechnologyProject = async (req, res) => {
  const {id} = req.params;
  try {
    const deleted = await PortfolioProject.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Technology Project not found" });
    }
    res.status(200).json({ success: true, message: "Technology Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export {
    createTechnologyPortfolio,
    getTechnologyPortfolio,
    editTechnologyPortfolio,
    deleteTechnologyPortfolio,
    createPortfolioProject,
    getTechnologyProject,
    editTechnologyProject,
    deleteTechnologyProject
}