import express from "express";
import {  createTechnologyPortfolio,
    getTechnologyPortfolio,
    editTechnologyPortfolio,
    deleteTechnologyPortfolio,getTechnologyPortfolioActive,createPortfolioProject,
        getTechnologyProject,
        editTechnologyProject,
        deleteTechnologyProject,getSelectedTechnologyProject} from "../controllers/technologyPortfolio.js";
const TechnologyPortfolioRouter = express.Router();
import upload from "../middlewares/upload.js";

TechnologyPortfolioRouter.post("/create-technology-portfolio", createTechnologyPortfolio);
TechnologyPortfolioRouter.get("/view-technology-portfolio", getTechnologyPortfolio);
TechnologyPortfolioRouter.get("/view-technology-portfolio-active", getTechnologyPortfolioActive);
TechnologyPortfolioRouter.put("/edit-technology-portfolio/:id", editTechnologyPortfolio);
TechnologyPortfolioRouter.delete("/delete-technology-portfolio/:id", deleteTechnologyPortfolio);



TechnologyPortfolioRouter.post("/create-technology-portfolio-project",upload.any(), createPortfolioProject);
TechnologyPortfolioRouter.get("/view-technology-portfolio-project", getTechnologyProject);
TechnologyPortfolioRouter.get("/view-selected-technology-portfolio-project", getSelectedTechnologyProject);
TechnologyPortfolioRouter.put("/edit-technology-portfolio-project/:id",upload.any(), editTechnologyProject);
TechnologyPortfolioRouter.delete("/delete-technology-portfolio-project/:id", deleteTechnologyProject);

export default TechnologyPortfolioRouter;