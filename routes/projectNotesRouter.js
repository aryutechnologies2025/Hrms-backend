import express from "express";
import { createProjectNotes, 
    editProjectNotesDetails,
     getProjectNotesDetails, 
     getProjectNotesDetailsById, 
     projectNotesDelete } from "../controllers/projectNotesController.js";
import upload from "../middlewares/upload.js";
const projectNotesRouter = express.Router();

projectNotesRouter.get("/projectNotes",getProjectNotesDetails);
projectNotesRouter.get("/projectNotes-details",getProjectNotesDetailsById);
projectNotesRouter.post("/create-projectNotes",upload.any(),createProjectNotes);
projectNotesRouter.put("/edit-projectNotesdetails/:id",upload.any(),editProjectNotesDetails); 
projectNotesRouter.delete("/delete-projectNotesDelete/:id",projectNotesDelete);

export default projectNotesRouter;
