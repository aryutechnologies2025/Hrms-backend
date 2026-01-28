import express from "express";
import {  createTechnologyPortfolio,
    getTechnologyPortfolio,
    editTechnologyPortfolio,
    deleteTechnologyPortfolio,createPortfolioProject,
        getTechnologyProject,
        editTechnologyProject,
        deleteTechnologyProject} from "../controllers/technologyPortfolio.js";
const TechnologyPortfolioRouter = express.Router();

TechnologyPortfolioRouter.post("/create-technology-portfolio", createTechnologyPortfolio);
TechnologyPortfolioRouter.get("/view-technology-portfolio", getTechnologyPortfolio);
TechnologyPortfolioRouter.put("/edit-technology-portfolio/:id", editTechnologyPortfolio);
TechnologyPortfolioRouter.delete("/delete-technology-portfolio/:id", deleteTechnologyPortfolio);



TechnologyPortfolioRouter.post("/create-technology-portfolio-project", createPortfolioProject);
TechnologyPortfolioRouter.get("/view-technology-portfolio-project", getTechnologyProject);
TechnologyPortfolioRouter.put("/edit-technology-portfolio-project/:id", editTechnologyProject);
TechnologyPortfolioRouter.delete("/delete-technology-portfolio-project/:id", deleteTechnologyProject);

export default TechnologyPortfolioRouter;